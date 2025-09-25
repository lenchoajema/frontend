// Minimal static file server for prebuilt frontend (build/)
// Serves build/index.html and static assets on PORT (default 3000)

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const CANDIDATE_DIRS = [
  // Prefer Root build first (we can rebuild this reliably)
  path.join(__dirname, '..', 'build'),
  // Nested frontend/build if present
  path.join(__dirname, '..', 'frontend', 'build'),
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
