const request = require('supertest');
const app = require('../server');

describe('Order idempotency (DB-less fallback)', () => {
  let token;
  beforeAll(async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Order User', email: 'orderidem@example.com', password: 'secret123' });
    token = reg.body.accessToken;
  });

  test('repeated create-order with same idempotency key returns stable clientSecret (stub mode)', async () => {
    // Ensure provider enabled
    const cfg = await request(app).get('/api/payments/config');
    if (!cfg.body.providers.stripe) {
      await request(app).post('/api/payments/admin/provider/stripe/toggle').set('Authorization','Bearer '+token);
    }
    const idem = 'order-idem-1';
    const first = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization','Bearer '+token)
      .set('Idempotency-Key', idem)
      .send({ total: 9.99, items: [] });
    const second = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization','Bearer '+token)
      .set('Idempotency-Key', idem)
      .send({ total: 9.99, items: [] });
    expect([200,503]).toContain(first.status);
    expect(second.status).toBe(first.status);
    if (first.status === 200 && second.status === 200) {
      expect(first.body.clientSecret).toBe(second.body.clientSecret);
    }
  });
});
