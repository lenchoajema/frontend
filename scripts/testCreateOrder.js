/*
  Usage: node scripts/testCreateOrder.js <backendBase> <jwtToken> [total]
  - backendBase: e.g., http://localhost:5000 or https://<codespaces>-5000.app.github.dev
  - jwtToken: a valid Bearer token for a test user
  - total: optional order total (default 12.34)
*/

const http = require('http');
const https = require('https');
const { URL } = require('url');

async function main() {
  const backendBase = process.argv[2] || 'http://localhost:5000';
  const token = process.argv[3] || process.env.JWT;
  const total = parseFloat(process.argv[4] || '12.34');
  if (!token) {
    console.error('Missing JWT token. Pass as arg #2 or set JWT env var.');
    process.exit(1);
  }
  const url = new URL('/api/payments/create-order', backendBase);
  const payload = JSON.stringify({ total, items: [] });
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': 'test-' + Date.now(),
    },
  };
  const lib = url.protocol === 'https:' ? https : http;
  await new Promise((resolve) => {
    const req = lib.request(url, opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
          console.log('Body:', JSON.parse(data));
        } catch (_) {
          console.log('Body:', data);
        }
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error('Request error:', err.message);
      resolve();
    });
    req.write(payload);
    req.end();
  });
}

main();
