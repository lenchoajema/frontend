// Smart backend starter:
// - If another process is already listening on PORT, don't start a duplicate.
// - Otherwise start the local server.js.
// Useful when docker-compose or another instance is already running.

const http = require('http');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '127.0.0.1';

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const req = http.get({ host, port, path: '/health', timeout: 1000 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200 ? 'ready' : 'open');
    });
    req.on('error', () => resolve('open'));
    req.on('timeout', () => { req.destroy(); resolve('open'); });
  });
}

(async () => {
  const status = await checkPort(PORT, HOST);
  if (status === 'ready') {
    console.log(`Backend already running on http://${HOST}:${PORT} (health OK). Not starting another instance.`);
    process.exit(0);
  }
  // Try 0.0.0.0 too (codespaces)
  const statusAll = await checkPort(PORT, '0.0.0.0');
  if (statusAll === 'ready') {
    console.log(`Backend already running on http://0.0.0.0:${PORT} (health OK). Not starting another instance.`);
    process.exit(0);
  }

  console.log(`Starting backend on ${PORT}...`);
  const child = spawn(process.execPath, ['server.js'], {
    cwd: require('path').join(process.cwd(), 'backend'),
    stdio: 'inherit',
    env: { ...process.env, HOST: '0.0.0.0', PORT: String(PORT) },
  });

  child.on('exit', (code) => process.exit(code ?? 1));
})();
