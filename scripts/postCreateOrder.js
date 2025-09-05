/*
  Usage: node scripts/postCreateOrder.js <backendBase> <jwtToken> [total]
  - backendBase: e.g., http://localhost:5000 or https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev
  - jwtToken: a valid Bearer token for a test user
  - total: optional order total (default 12.34)
*/

const http = require('http');
const https = require('https');
const { URL } = require('url');

async function postCreateOrder(backendBase, token, total = 12.34) {
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
  return await new Promise((resolve) => {
    const req = lib.request(url, opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(payload);
    req.end();
  });
}

(async function main() {
  const backendBase = process.argv[2] || process.env.BACKEND_BASE || 'http://localhost:5000';
  const token = process.argv[3] || process.env.JWT;
  const total = parseFloat(process.argv[4] || '12.34');
  if (!token) {
    console.error('Missing JWT token. Pass as arg #2 or set JWT env var.');
    process.exit(1);
  }
  const result = await postCreateOrder(backendBase, token, total);
  if (result.error) {
    console.error('Request error:', result.error);
    process.exit(1);
  }
  try {
    console.log('Status:', result.status);
    console.log('Body:', JSON.parse(result.body));
  } catch (_) {
    console.log('Status:', result.status);
    console.log('Body:', result.body);
  }
})();

module.exports = { postCreateOrder };
