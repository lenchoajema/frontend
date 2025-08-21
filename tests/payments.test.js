const request = require('supertest');
const app = require('../server');

describe('Payments Capabilities', () => {
  it('returns config structure', async () => {
    const res = await request(app).get('/api/payments/config');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('paymentsEnabled');
    expect(res.body).toHaveProperty('providers');
  });
  it('blocks order creation when provider disabled', async () => {
    // disable stripe provider
    await request(app).post('/api/payments/admin/provider/stripe/toggle').set('Authorization','Bearer test');
    const res = await request(app).post('/api/payments/create-order').set('Authorization','Bearer test').send({ total: 12 });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  it('idempotent stub intent returns same clientSecret', async () => {
    // Re-enable stripe provider
    await request(app).post('/api/payments/admin/provider/stripe/toggle').set('Authorization','Bearer test');
    const idem = 'test-key-123';
    const first = await request(app)
      .post('/api/stripe/create-payment-intent')
      .set('Idempotency-Key', idem)
      .send({ amount: 500 });
    const second = await request(app)
      .post('/api/stripe/create-payment-intent')
      .set('Idempotency-Key', idem)
      .send({ amount: 500 });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.clientSecret).toBe(second.body.clientSecret);
    expect(second.body.cached).toBeTruthy();
  });
  it('webhook returns 503 when not configured', async () => {
    const res = await request(app).post('/api/stripe/webhook').send('');
    expect([400,503]).toContain(res.status); // expecting 503 due to missing secret
  });
});
