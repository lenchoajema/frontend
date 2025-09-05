// Tests Stripe webhook handler branches when Stripe + webhook secret are configured.
// We avoid network calls by NOT invoking payment intent creation.

const path = require('path');

describe('Stripe Webhook Configured Branches', () => {
  let handleWebhook;
  beforeAll(() => {
    // Set fake secrets before (re)requiring controller
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy1234567890';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy1234567890';
    // Purge module cache to force re-init with env vars
    const ctrlPath = require.resolve('../controllers/stripeController');
    delete require.cache[ctrlPath];
    ({ handleWebhook } = require('../controllers/stripeController'));
  });

  function run(reqInit) {
    return new Promise((resolve) => {
      const req = { rawBody: Buffer.from('{}'), headers: {}, ...reqInit };
      const res = {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(obj) { this.body = obj; resolve({ status: this.statusCode, body: obj }); }
      };
      handleWebhook(req, res);
    });
  }

  test('missing stripe-signature header returns 400', async () => {
    const out = await run({ headers: {} });
    expect(out.status).toBe(400);
    expect(out.body.message).toMatch(/Missing stripe-signature/i);
  });

  test('invalid signature returns 400 with error field', async () => {
    const out = await run({ headers: { 'stripe-signature': 'bogus.sig' } });
    expect(out.status).toBe(400);
    expect(out.body.message).toMatch(/Invalid signature/i);
  });
});
