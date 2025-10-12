// Minimal static file server for prebuilt frontend (build/)
// Serves build/index.html and static assets on PORT (default 3000)

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const CANDIDATE_DIRS = [
  // Prefer nested CRA build first (source of truth for UI)
  path.join(__dirname, '..', 'frontend', 'build'),
  // Fallback to a root build if present
  path.join(__dirname, '..', 'build'),
  // As a last resort, a root public dir (for simple static sites)
  path.join(__dirname, '..', 'public'),
];

let baseDir = null;
for (const dir of CANDIDATE_DIRS) {
  try {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
      baseDir = dir;
      break;
    }
  } catch (_) {}
}

if (!baseDir) {
  console.error('No build directory found. Looked for:');
  for (const d of CANDIDATE_DIRS) console.error(' -', d);
  console.error('Please build the frontend (e.g., cd frontend && npm ci && npm run build).');
  process.exit(1);
}

// Same-origin API reverse proxy -> backend 5000
app.use('/api', (req, res) => {
  try {
    const targetPath = req.originalUrl; // already starts with /api
    const options = {
      protocol: 'http:',
      hostname: '127.0.0.1',
      port: 5000,
      path: targetPath,
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:5000' },
    };
    const proxyReq = http.request(options, (proxyRes) => {
      // Pass through status and headers
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxyReq.on('error', (err) => {
      console.error('API proxy error:', err.message);
      if (!res.headersSent) res.statusCode = 502;
      res.end('Bad Gateway');
    });
    // Stream body
    if (req.readable) req.pipe(proxyReq, { end: true }); else proxyReq.end();
  } catch (e) {
    console.error('API proxy exception:', e.message);
    if (!res.headersSent) res.statusCode = 500;
    res.end('Proxy Error');
  }
});

app.use(express.static(baseDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(baseDir, 'index.html'));
});

async function listenWithFallback(ports) {
  for (const p of ports) {
    try {
      await new Promise((resolve, reject) => {
        const server = app
          .listen(p, '0.0.0.0', () => resolve(server))
          .on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') return reject(err);
            // Other errors should crash
            console.error('Static server error:', err);
            process.exit(1);
          });
      });
      console.log(`Static frontend server serving ${baseDir} on http://0.0.0.0:${p}`);
      return;
    } catch (e) {
      console.warn(`Port ${p} in use, trying next...`);
    }
  }
  console.error('No available port found from list. Tried:', ports.join(', '));
  process.exit(1);
}

const first = Number(process.env.PORT || 3000);
listenWithFallback([first, 3001, 3002]);
