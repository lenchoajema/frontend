const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
// Ensure payments remain enabled & providers on
const app = require('../server');
require('./mongoMemorySetup');

function makeToken(id='64b000000000000000000001', role='user') {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Order timeline persistence (mongodb-memory-server)', () => {
  test('creates order, idempotent replay, and records timeline events', async () => {
  const token = makeToken('64b000000000000000000002');
    const idemKey = 'timeline-reuse-1';
    // First create-order
    const res1 = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', 'Bearer ' + token)
      .set('Idempotency-Key', idemKey)
      .send({ total: 12.34, items: [] });
    expect(res1.status).toBeGreaterThanOrEqual(200);
    expect(res1.status).toBeLessThan(400);
    const orderId = res1.body.orderId || res1.body.paymentIntentId || null;
    expect(orderId).toBeTruthy();

    // Second create-order with same idem key should reuse
    const res2 = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', 'Bearer ' + token)
      .set('Idempotency-Key', idemKey)
      .send({ total: 12.34, items: [] });
    expect(res2.status).toBeGreaterThanOrEqual(200);
    expect(res2.status).toBeLessThan(500);

    // Query DB directly for timeline
    const Order = require('../models/Order');
    const orders = await Order.find({ idemKey });
    expect(orders.length).toBe(1);
    const timelineTypes = orders[0].timeline.map(e => e.type);
    expect(timelineTypes).toContain('created');
    expect(timelineTypes).toContain('idempotent_reuse');
    // We may or may not have payment_intent_created depending on stub/configured; allow optional
  });
});
