// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
//const productRoutes = require('./routes/productRoutes'); // Import product routes
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const cartRoutes = require('./routes/user/cartRoutes');
const userRoutes = require("./routes/userRoutes");
//const sellerProductRoutes = require('./routes/seller/productRoute');
const productRoutes = require("./routes/productRoutes");
const path = require('path');
const redis = require('redis');
const fs = require('fs');
//const redisClient = require("./utils/redisClient");
const ordersRoutes = require('./routes/ordersRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// Redis configuration (Optional)
let redisClient = null;

if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      redisClient = null; // Disable Redis on error
    });

    redisClient.on('connect', () => console.log('✅ Redis client connected successfully'));

    // Connect to Redis
    (async () => {
      try {
        await redisClient.connect();
      } catch (err) {
        console.error("❌ Error connecting to Redis:", err.message);
        console.log("⚠️  Redis disabled. Server will continue without caching.");
        redisClient = null;
      }
    })();
  } catch (err) {
    console.error("❌ Redis setup failed:", err.message);
    console.log("⚠️  Redis disabled. Server will continue without caching.");
    redisClient = null;
  }
} else {
  console.log('⚠️  Redis not configured. Add REDIS_URL to .env file to enable caching.');
}



const app = express();

// Security / tracing configuration (declare early so middleware can use them)
const REDACT_KEYS = (process.env.TRACE_REDACT_KEYS || 'password,token,authorization').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
const STRICT_JSON = process.env.STRICT_JSON === '1' || process.env.STRICT_JSON === 'true';
const ENABLE_TRACE = process.env.REQUEST_TRACE === '1' || process.env.REQUEST_TRACE === 'true' || !!process.env.REQUEST_TRACE;
const TRACE_FILE = process.env.REQUEST_TRACE_FILE || '/tmp/request-trace.log';

// Middleware
// Use a raw parser that always captures the body and never throws on malformed JSON.
// This allows controllers to perform graceful fallback parsing when needed.
app.use(express.raw({ type: '*/*', limit: '1mb' }));

app.use((req, res, next) => {
  try {
    // raw buffer (may be empty)
    const buf = req.body && Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    req.rawBuf = buf;
    req.rawBody = buf.toString('utf8');

    const ctype = (req.headers['content-type'] || '').toLowerCase();
    req.jsonParseFailed = false;
    if (ctype.includes('application/json')) {
      try {
        req.body = req.rawBody ? JSON.parse(req.rawBody) : {};
      } catch (e) {
        // don't throw; mark parse failure and leave req.body empty for fallback parsing
        req.jsonParseFailed = true;
        req.body = {};
      }
    } else if (ctype.includes('application/x-www-form-urlencoded')) {
      // simple urlencoded parse
      const obj = {};
      const pairs = req.rawBody.split('&').filter(Boolean);
      for (const p of pairs) {
        const idx = p.indexOf('=');
        if (idx > -1) {
          const k = decodeURIComponent(p.slice(0, idx));
          const v = decodeURIComponent(p.slice(idx + 1));
          obj[k] = v;
        }
      }
      req.body = obj;
    } else if (req.rawBody && req.rawBody.includes(':')) {
      // attempt to parse simple key:value lines
      const obj = {};
      const lines = req.rawBody.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const idx = line.indexOf(':');
        if (idx > 0) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          obj[k] = v;
        }
      }
      // leave as fallback if controller needs specific keys
      req.body = obj;
    } else {
      req.body = {};
    }
  } catch (err) {
    req.rawBody = undefined;
    req.rawBuf = undefined;
    req.body = {};
    req.jsonParseFailed = true;
  }
  // Enforce strict JSON bodies if configured: reject non-JSON request bodies for mutating methods
  if (STRICT_JSON) {
    const hasBodyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes((req.method || '').toUpperCase());
    const ctype = (req.headers['content-type'] || '').toLowerCase();
    if (hasBodyMethod) {
      // If content type isn't JSON or parsing previously failed for JSON, reject
      if (!ctype.includes('application/json') || req.jsonParseFailed) {
        return res.status(400).json({ message: 'Server requires application/json request bodies' });
      }
    }
  }
  return next();
});

// redact helper (keeps previews safe)
function redactRawBody(raw) {
  if (!raw) return '';
  // Try to mask common JSON keys
  let out = raw;
  try {
    if (out.trim().startsWith('{') || out.trim().startsWith('[')) {
      const parsed = JSON.parse(out);
      const mask = (v) => (typeof v === 'string' && v.length > 0 ? '******' : v);
      function walk(o) {
        if (!o || typeof o !== 'object') return o;
        for (const k of Object.keys(o)) {
          if (REDACT_KEYS.includes(k.toLowerCase())) o[k] = mask(o[k]);
          else o[k] = walk(o[k]);
        }
        return o;
      }
      return JSON.stringify(walk(parsed));
    }
    // fallback: redact key:value or comma-separated key:value patterns
    const kv = out.split(/[,&\n]/).map(s => s.trim()).map(seg => {
      const idx = seg.indexOf(':');
      if (idx > 0) {
        const k = seg.slice(0, idx).trim();
        const v = seg.slice(idx + 1).trim();
        if (REDACT_KEYS.includes(k.toLowerCase())) return `${k}:******`;
      }
      return seg;
    });
    return kv.join(',');
  } catch (e) {
    // on parse error, very defensively mask any token-like strings
    return out.replace(/([A-Za-z0-9_\-]{8,})/g, (m) => (m.length > 6 ? '******' : m));
  }
}
// --- Request trace middleware (enable with REQUEST_TRACE=1) ---
if (ENABLE_TRACE) {
  console.log(`[trace] Request tracing enabled. Writing to ${TRACE_FILE}`);
  // Lightweight rotation if file grows too large (> ~1MB)
  try {
    if (fs.existsSync(TRACE_FILE) && fs.statSync(TRACE_FILE).size > 1024 * 1024) {
      fs.renameSync(TRACE_FILE, TRACE_FILE + '.1');
    }
  } catch (_) {}
  app.use((req, res, next) => {
    const started = Date.now();
    const { method, originalUrl, headers } = req;
    const ip = req.ip || req.connection?.remoteAddress;
    const remotePort = req.connection?.remotePort;
    const localPort = req.connection?.localPort;
  const rawPreview = redactRawBody((req.rawBody || '').slice(0, 200));
    res.on('finish', () => {
      const entry = {
        ts: new Date().toISOString(),
        durMs: Date.now() - started,
        method,
        url: originalUrl,
        status: res.statusCode,
        ip,
        remotePort,
        localPort,
        ua: headers['user-agent'],
        ct: headers['content-type'],
        cl: headers['content-length'],
        parseFailed: !!req.jsonParseFailed,
        keys: Object.keys(req.body || {}),
  rawPreview,
      };
      fs.appendFile(TRACE_FILE, JSON.stringify(entry) + '\n', () => {});
    });
    next();
  });
}

// CORS configuration for GitHub Codespaces
const corsOptions = {
  origin: [
    'https://potential-guide-wv5pxxvwg45cgr75.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3001.app.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3002.app.github.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

app.use("/api/products", productRoutes); //Routes for home page
// Routes
app.use('/api/auth', authRoutes); // Authentication routes
//app.use('/api/seller', productRoutes); // seller Product routes
//app.use('/api/seller/products', sellerProductRoutes); // 
// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
// Cart Routes (Updated for consistency)
//app.use('/api/cart', cartRoutes);  
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/user/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stripe', stripeRoutes);
app.use((req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// JSON parse error handler (must come after routes/middleware)
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    // body-parser / express.json() parsing error
    // Log requester identification to trace malformed payloads
    const requester = {
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      remoteAddress: req.connection?.remoteAddress || 'unknown',
  remotePort: req.connection?.remotePort || req.socket?.remotePort || 'unknown',
  localPort: req.connection?.localPort || req.socket?.localPort || 'unknown',
      userAgent: req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : 'unknown',
      contentType: req.headers && req.headers['content-type'] ? req.headers['content-type'] : 'unknown',
      contentLength: req.headers && req.headers['content-length'] ? req.headers['content-length'] : 'unknown',
    };
    console.warn('JSON parse error for request:', req.method, req.originalUrl, requester);
    if (req) {
  if (req.rawBody) {
        const preview = req.rawBody.length > 200 ? req.rawBody.slice(0, 200) + '...[truncated]' : req.rawBody;
        console.warn('Raw body preview:', preview);
      }
      if (req.rawBuf) {
        const hex = req.rawBuf.slice(0, 200).toString('hex');
        console.warn('Raw body hex (first 200 bytes):', hex);
      }
      if (!req.rawBody && !req.rawBuf) {
        console.warn('No rawBody/rawBuf captured');
      }
    }
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  // pass along other errors
  return next(err);
});

// Database connection
if (process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '') {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection error:', err));
} else {
  console.log('⚠️  MongoDB not configured. Add MONGO_URI to .env file to enable database functionality.');
  console.log('   The server will run but database-dependent features will not work.');
}

// Server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Allow connections from any IP (required for Codespaces)
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Server accessible at https://potential-guide-wv5pxxvwg45cgr75-${PORT}.app.github.dev`);
});
