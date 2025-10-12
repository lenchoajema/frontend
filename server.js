// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Internal minimal auth stub
const jwt = require('jsonwebtoken');
//const productRoutes = require('./routes/productRoutes'); // Import product routes
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const cartRoutes = require('./routes/user/cartRoutes'); // Uses centralized models
const userRoutes = require("./routes/userRoutes");
//const sellerProductRoutes = require('./routes/seller/productRoute');
const productRoutes = require("./routes/productRoutes");
const path = require('path');
const redis = require('redis');
const fs = require('fs');
const logger = require('./utils/logger');
const paymentCaps = require('./utils/paymentCapabilities');
//const redisClient = require("./utils/redisClient");
const ordersRoutes = require('./routes/ordersRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const { attachRedis: attachStripeRedis } = require('./controllers/stripeController');
const { setRedis: setSharedRedis } = require('./utils/redisClient');
const paymentsRoutes = require('./routes/paymentsRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
// Telemetry (optional)
if (process.env.OTEL_ENABLE === '1') {
  try { require('./utils/telemetry').initTelemetry(); } catch(e) { console.warn('Telemetry init failed:', e.message); }
}

dotenv.config();

// Redis configuration (Optional)
let redisClient = null;

if (process.env.NODE_ENV !== 'test' && process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') {
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

    redisClient.on('connect', async () => {
      logger.info('Redis client connected successfully');
      try {
        await paymentCaps.init(redisClient);
        logger.info('Payment capabilities loaded (Redis-backed)');
      } catch (e) {
        logger.warn({ err: e }, 'Could not initialize payment capabilities from Redis');
      }
      try { attachStripeRedis(redisClient); } catch(_) {}
      try { setSharedRedis(redisClient); } catch(_) {}
    });

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
// Request logging (pino-http) – lightweight, skips in test
let pinoHttp; try { if (process.env.NODE_ENV !== 'test') { pinoHttp = require('pino-http')({ logger }); app.use(pinoHttp); } } catch (_) {}

// Early auth route visibility (before any body parsing/security) TEMPORARY
app.use((req, _res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api/auth/')) {
    console.log('[early-auth]', req.method, req.originalUrl, 'ct=', req.headers['content-type'], 'len=', req.headers['content-length']);
  }
  next();
});

// Behind a reverse proxy (Codespaces / GitHub Dev tunnels) so enable trust proxy
// Resolves express-rate-limit warning about X-Forwarded-For header
app.set('trust proxy', 1);

// --- Security & performance middleware (production hardening) ---
try {
  const helmet = require('helmet');
  const compression = require('compression');
  const mongoSanitize = require('express-mongo-sanitize');
  const xssClean = require('xss-clean');
  app.use(helmet());
  app.use(compression());
  app.use(mongoSanitize());
  app.use(xssClean());
  // Basic security headers override (example: allow content-type & authorization)
  app.use((req, _res, next) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/auth/')) {
      try { console.log('[auth-debug]', req.method, req.originalUrl, 'ctype=', req.headers['content-type'], 'keys=', Object.keys(req.body||{})); } catch(_){}
    }
    next();
  });
} catch (e) {
  console.warn('Security middleware initialization issue:', e.message);
}

// Security / tracing configuration (declare early so middleware can use them)
const REDACT_KEYS = (process.env.TRACE_REDACT_KEYS || 'password,token,authorization').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
const STRICT_JSON = process.env.STRICT_JSON === '1' || process.env.STRICT_JSON === 'true';
const ENABLE_TRACE = process.env.REQUEST_TRACE === '1' || process.env.REQUEST_TRACE === 'true' || !!process.env.REQUEST_TRACE;
const TRACE_FILE = process.env.REQUEST_TRACE_FILE || '/tmp/request-trace.log';

// Middleware
// First, parse JSON bodies normally. This ensures req.body is populated for standard application/json.
app.use(express.json({ limit: '1mb' }));
// Also capture raw body for non-JSON (and for signature verification) without clobbering parsed JSON.
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].toLowerCase().includes('application/json')) {
    // Preserve a raw copy for potential auditing / signature use
    if (req.body && !req.rawBody) {
      try { req.rawBody = JSON.stringify(req.body); } catch (_) {}
    }
    return next();
  }
  // For non-JSON, buffer manually (up to 1mb)
  const chunks = [];
  let total = 0;
  req.on('data', (c) => { total += c.length; if (total <= 1024*1024) chunks.push(c); });
  req.on('end', () => { const buf = Buffer.concat(chunks); req.rawBuf = buf; req.rawBody = buf.toString('utf8'); next(); });
});

// Security hardening
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(mongoSanitize());
// xss-clean expects urlencoded/json parsers; since we use express.raw, avoid touching the Buffer here.
// We'll sanitize later only when req.body is an actual object (post-parse)
app.use((req, res, next) => {
  try {
    if (Buffer.isBuffer(req.body)) return next();
    if (req.body && typeof req.body === 'object') {
      req.body = JSON.parse(xss(JSON.stringify(req.body)));
    }
  } catch (_) {}
  next();
});
app.use(compression());

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
        // Sanitize the now-parsed body using xss-clean
        try { req.body = JSON.parse(xss(JSON.stringify(req.body))); } catch (_) {}
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
  // STRICT_JSON disabled (bypass) to allow auth/register/login while diagnosing body parsing.
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
  return out.replace(/([A-Za-z0-9_-]{8,})/g, (m) => (m.length > 6 ? '******' : m));
  }
}
// --- Request trace middleware (enable with REQUEST_TRACE=1) ---
if (ENABLE_TRACE) {
  logger.info({ traceFile: TRACE_FILE }, 'Request tracing enabled');
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
// (Placed after path normalization middleware so accidental double prefixes are handled first)
// Lightweight normalization: collapse any accidental double /api/api/* to /api/* to avoid 404 spam
app.use((req, _res, next) => {
  if (req.originalUrl.startsWith('/api/api/')) {
    const newUrl = req.originalUrl.replace('/api/api/', '/api/');
    console.warn('[normalize] Rewriting double /api path', req.originalUrl, '->', newUrl);
    req.url = newUrl; // mutate URL for downstream routers
  }
  next();
});
app.use('/api/', apiLimiter);

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  const caps = paymentCaps.getCapabilities ? paymentCaps.getCapabilities() : {};
  const dbState = mongoose.connection?.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  res.status(200).json({
    status: 'OK',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    version: process.env.GIT_SHA || null,
    db: { connected: dbState === 1, state: dbState },
    redis: { enabled: !!redisClient, status: redisClient ? 'connected' : 'disabled' },
    payments: {
      paymentsEnabled: caps.enabled,
      providers: caps.providers,
      testMode: caps.testMode,
      stripeConfigured,
      updatedAt: caps.updatedAt,
    }
  });
});

// API Health check
// Lightweight sanitizer pass for JSON bodies only (already parsed)
app.use((req, _res, next) => {
  try { if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) { req.body = JSON.parse(xss(JSON.stringify(req.body))); } } catch(_){}
  next();
});
// Debug: log auth register/login body shape temporarily
app.use((req, _res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api/auth/')) {
    try { console.log('[auth-debug]', req.method, req.originalUrl, 'ctype=', req.headers['content-type'], 'keys=', Object.keys(req.body||{})); } catch(_){}
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api', (_req, res) => {
  res.send(
    '<html><head><title>API</title></head><body>' +
    '<h1>API</h1>' +
    '<ul>' +
      '<li><a href="/api/health">/api/health</a></li>' +
    '</ul>' +
    '</body></html>'
  );
});

// Root page (for Codespaces base URL)
app.get('/', (_req, res) => {
  res.status(200).send(
    '<!doctype html>\n' +
    '<html><head><meta charset="utf-8"><title>Backend</title></head><body>' +
    '<h1>Backend is running</h1>' +
    '<ul>' +
      '<li><a href="/health">/health</a></li>' +
      '<li><a href="/api/health">/api/health</a></li>' +
    '</ul>' +
    '</body></html>'
  );
});

app.use("/api/products", productRoutes); //Routes for home page
// Routes
app.use('/api/auth', authRoutes); // Authentication routes
//app.use('/api/seller', productRoutes); // seller Product routes
//app.use('/api/seller/products', sellerProductRoutes); // 
// Admin Routes
app.use("/api/admin", adminRoutes); // Uses internal stub during tests
app.use("/api/user", userRoutes);
// Cart Routes (Updated for consistency)
//app.use('/api/cart', cartRoutes);  
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/user/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/paypal', paypalRoutes);

// New feature routes
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const gdprRoutes = require('./routes/gdprRoutes');
const shippingRoutes = require('./routes/shippingRoutes');

app.use('/api/reviews', reviewRoutes); // Review routes
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/shipping', shippingRoutes);
// Use shared refresh token helpers from authRoutes to avoid divergence with route logic
const refreshHelpers = authRoutes._refreshStore || {};
const storeRefresh = refreshHelpers.storeRefresh || (async ()=>{});
const hasRefresh = refreshHelpers.hasRefresh || (async ()=>false);
const revokeRefresh = refreshHelpers.revokeRefresh || (async ()=>{});
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  (async () => {
    if (!refreshToken || !(await hasRefresh(refreshToken))) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'test_jwt_secret');
      const accessToken = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '15m' });
      // Rotation (optional basic): issue new refresh token & revoke old
      if (process.env.REFRESH_ROTATE === '1') {
      const crypto = require('crypto');
      const jti = (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex'));
      const newToken = jwt.sign({ id: payload.id, role: payload.role, jti }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '7d' });
        await storeRefresh(newToken, payload.id);
        await revokeRefresh(refreshToken);
        return res.json({ accessToken, refreshToken: newToken, rotated: true });
      }
      return res.json({ accessToken, rotated: false });
    } catch (e) {
      return res.status(401).json({ message: 'Expired refresh token' });
    }
  })();
});
app.use((req, res, next) => {
  logger.warn({ method: req.method, url: req.originalUrl }, 'Unhandled request');
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler (after all routes & 404)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const payload = {
    message: err.publicMessage || err.message || 'Internal Server Error',
    status,
  };
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    payload.stack = err.stack;
  }
  try { logger.error({ err, path: req.originalUrl, status }, 'Unhandled error'); } catch (_) {}
  res.status(status).json(payload);
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
if (process.env.NODE_ENV !== 'test' && process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '') {
  // Removed deprecated mongoose options (useNewUrlParser / useUnifiedTopology no longer needed in v7+)
  mongoose
    .connect(process.env.MONGO_URI)
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error({ err }, 'Database connection error'));
} else if (process.env.NODE_ENV !== 'test') {
  logger.warn('MongoDB not configured (missing MONGO_URI). Running in degraded mode.');
}

// Server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Allow connections from any IP (required for Codespaces)

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    logger.info({ host: HOST, port: PORT }, 'Server started');
  });
}

module.exports = app;
