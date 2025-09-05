describe('Smoke', () => {
  it('basic math works', () => {
    console.log('SMOKE TEST RUNNING');
    expect(2 + 2).toBe(4);
  });
});
const request = require('supertest');
const app = require('../server');

describe('404 handler', () => {
  it('returns JSON 404 for unknown route', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});
