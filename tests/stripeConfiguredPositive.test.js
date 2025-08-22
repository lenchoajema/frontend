// Tests createPaymentIntent and webhook success path with Stripe configured using a mocked Stripe SDK.

// Ensure secrets set before requiring controller
process.env.STRIPE_SECRET_KEY = 'sk_test_mocked_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mocked_123';

let mockCapturedCreateArgs = [];
let mockWebhookConstructCalls = 0;
const MOCK_INTENT_ID = 'pi_mock_123';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn((data, opts) => {
        mockCapturedCreateArgs.push({ data, opts });
        return Promise.resolve({ id: MOCK_INTENT_ID, client_secret: 'pi_cs_mock_123', metadata: data.metadata || {} });
      })
    },
    webhooks: {
      constructEvent: jest.fn((rawBody, sig, secret) => {
        mockWebhookConstructCalls++;
        if (sig === 'bad') {
          throw new Error('Invalid signature');
        }
        return { type: 'payment_intent.succeeded', data: { object: { id: MOCK_INTENT_ID, metadata: { orderId: 'order-xyz' } } } };
      })
    }
  }));
});

const { createPaymentIntent, handleWebhook } = require('../controllers/stripeController');

function run(handler, { body = {}, headers = {} } = {}) {
  return new Promise((resolve) => {
    const req = { body, headers: Object.fromEntries(Object.entries(headers).map(([k,v]) => [k.toLowerCase(), v])), rawBody: JSON.stringify({}) };
    const res = { statusCode: 200, body: null, status(c){ this.statusCode=c; return this; }, json(o){ this.body=o; resolve({ status: this.statusCode, body: o }); } };
    handler(req, res);
  });
}

describe('Stripe configured controller (mocked)', () => {
  test('create payment intent with idempotency + order linkage', async () => {
    const resp = await run(createPaymentIntent, { body: { amount: 500, orderId: 'order-xyz' }, headers: { 'idempotency-key': 'idem-123' } });
    expect(resp.status).toBe(200);
    expect(resp.body.configured).toBe(true);
    expect(resp.body.orderId).toBe('order-xyz');
    expect(resp.body.paymentIntentId).toBe(MOCK_INTENT_ID);
    // ensure Stripe mock called with metadata and idempotency option
  expect(mockCapturedCreateArgs.length).toBe(1);
  expect(mockCapturedCreateArgs[0].data.metadata.orderId).toBe('order-xyz');
  expect(mockCapturedCreateArgs[0].opts).toEqual({ idempotencyKey: 'idem-123' });
  });

  test('invalid amount returns 400 (configured path)', async () => {
    const bad = await run(createPaymentIntent, { body: { amount: -10 } });
    expect(bad.status).toBe(400);
  expect(bad.body.code).toBe('PAYMENT_INVALID_AMOUNT');
  });

  test('webhook success path returns received true', async () => {
    const resp = await run(handleWebhook, { headers: { 'stripe-signature': 'good' } });
    expect(resp.status).toBe(200);
    expect(resp.body.received).toBe(true);
  expect(mockWebhookConstructCalls).toBeGreaterThan(0);
  });

  test('webhook invalid signature returns 400', async () => {
    const bad = await run(handleWebhook, { headers: { 'stripe-signature': 'bad' } });
    expect(bad.status).toBe(400);
  expect(bad.body.code).toBe('WEBHOOK_INVALID_SIGNATURE');
  });
});

afterAll(() => {
  // Cleanup to avoid leaking configured stripe into other tests if order shifts
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  const ctrlPath = require.resolve('../controllers/stripeController');
  delete require.cache[ctrlPath];
});
