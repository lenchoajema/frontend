/* Simple integration smoke test for backend, DB, and frontend proxy
   - Checks backend /health and /api/health
   - Checks products list via proxied /api/products on frontend origin
   - Checks frontend root loads (status 200)
*/

const http = require('http');
const https = require('https');

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method: 'GET', timeout: 10000, ...opts }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function main() {
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3001';
  let failures = 0;

  function assert(cond, msg) {
    if (!cond) { failures++; console.error('FAIL:', msg); } else { console.log('PASS:', msg); }
  }

  // Backend health
  try {
    const r1 = await fetch(`${BACKEND}/health`);
    assert(r1.status === 200, `Backend /health 200 (got ${r1.status})`);
    const r2 = await fetch(`${BACKEND}/api/health`);
    assert(r2.status === 200, `Backend /api/health 200 (got ${r2.status})`);
  } catch (e) {
    failures++; console.error('FAIL: Backend health error:', e.message);
  }

  // Frontend root
  try {
    const f1 = await fetch(`${FRONTEND}/`);
    assert(f1.status === 200, `Frontend / 200 (got ${f1.status})`);
  } catch (e) {
    failures++; console.error('FAIL: Frontend root error:', e.message);
  }

  // Proxied API via frontend origin
  try {
    const p1 = await fetch(`${FRONTEND}/api/health`);
    assert(p1.status === 200, `Proxied /api/health 200 (got ${p1.status})`);
    const p2 = await fetch(`${FRONTEND}/api/products?limit=3`);
    assert(p2.status === 200, `Proxied /api/products 200 (got ${p2.status})`);
    try {
      const arr = JSON.parse(p2.body);
      assert(Array.isArray(arr), 'Products response is an array');
      assert(arr.length >= 1, 'Products array has at least 1 item');
    } catch (e) {
      failures++; console.error('FAIL: Products response not valid JSON array');
    }
  } catch (e) {
    failures++; console.error('FAIL: Proxied API error:', e.message);
  }

  if (failures > 0) {
    console.error(`\nSmoke test FAILED with ${failures} issue(s).`);
    process.exit(1);
  } else {
    console.log('\nSmoke test PASSED.');
  }
}

main().catch((e) => { console.error('Smoke unexpected error:', e); process.exit(1); });
