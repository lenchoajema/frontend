const request = require('supertest');
const app = require('../server');

describe('Health Endpoint', () => {
  it('returns OK with structure', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('payments');
  });
});
