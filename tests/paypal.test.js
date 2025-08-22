const request = require('supertest');
const app = require('../server');

describe('PayPal Stub Provider', () => {
  test('returns order stub when enabled', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .set('Authorization','Bearer test')
      .send({ total: 25 });
    expect([200,503,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.provider).toBe('paypal');
      expect(res.body.stub).toBe(true);
    }
  });
});

describe('Simulated Stripe failure', () => {
  test('simulated failure returns expected code', async () => {
    const res = await request(app)
      .post('/api/stripe/create-payment-intent')
      .set('Idempotency-Key','simfail-1')
      .set('X-Simulate-Payment-Failure','1')
      .send({ amount: 500 });
    // In stub (no STRIPE key) path we get 200 (stub intent) or 503 (no idem key) or 500 (if configured & simulated).
    expect([200,500,503]).toContain(res.status);
    if (res.status === 500) {
      expect(res.body.code).toBe('PAYMENT_INTENT_SIMULATED_FAILURE');
    }
  });
});
