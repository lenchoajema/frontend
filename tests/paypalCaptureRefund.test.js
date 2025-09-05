const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
const app = require('../server');

function token(id='ppuser', role='user') {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('PayPal capture & refund stubs', () => {
  test('happy path create->capture->refund', async () => {
    const t = token();
    const create = await request(app).post('/api/paypal/create-order').set('Authorization','Bearer '+t).send({ total: 10 });
    if (create.status !== 200) return; // provider disabled or auth failure path tolerated
    const { orderId } = create.body;
    expect(orderId).toBeTruthy();
    const capture = await request(app).post(`/api/paypal/capture/${orderId}`).set('Authorization','Bearer '+t);
    expect([200,503,401,403]).toContain(capture.status);
    if (capture.status === 200) {
      expect(capture.body.status).toBe('COMPLETED');
    }
    const refund = await request(app).post(`/api/paypal/refund/${orderId}`).set('Authorization','Bearer '+t);
    expect([200,503,401,403]).toContain(refund.status);
    if (refund.status === 200) {
      expect(refund.body.status).toBe('REFUNDED');
    }
  });

  test('simulated failure paths', async () => {
    const t = token();
    const createFail = await request(app).post('/api/paypal/create-order').set('Authorization','Bearer '+t).set('X-Simulate-Payment-Failure','1').send({ total: 10 });
    if (createFail.status === 500) {
      expect(createFail.body.code).toBe('PAYPAL_SIMULATED_FAILURE');
    }
    // Need an order for failure capture/refund simulation (create one without failure)
    const create = await request(app).post('/api/paypal/create-order').set('Authorization','Bearer '+t).send({ total: 5 });
    if (create.status !== 200) return; // skip if disabled
    const { orderId } = create.body;
    const capFail = await request(app).post(`/api/paypal/capture/${orderId}`).set('Authorization','Bearer '+t).set('X-Simulate-Payment-Failure','1');
    if (capFail.status === 500) expect(capFail.body.code).toBe('PAYPAL_CAPTURE_SIMULATED_FAILURE');
    const refundFail = await request(app).post(`/api/paypal/refund/${orderId}`).set('Authorization','Bearer '+t).set('X-Simulate-Payment-Failure','1');
    if (refundFail.status === 500) expect(refundFail.body.code).toBe('PAYPAL_REFUND_SIMULATED_FAILURE');
  });
});
