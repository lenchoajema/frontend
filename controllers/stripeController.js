// Stripe controller with safe fallback if STRIPE_SECRET_KEY is not provided
let stripe = null;
// Idempotency storage: in-memory fallback, optional Redis when provided
const idempotencyCache = new Map(); // key -> { clientSecret, amount, ts }
let redisClient = null;
function attachRedis(client) { redisClient = client; }
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (stripeKey && stripeKey.trim() !== '') {
  try {
    const StripeLib = require('stripe');
    stripe = new StripeLib(stripeKey, { apiVersion: '2024-04-10' });
  } catch (err) {
    console.warn('⚠️  Failed to initialize Stripe SDK:', err.message);
  }
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Payment intent endpoint will return 503.');
}
const crypto = require('crypto');

// Track mapping from paymentIntent -> order (in-memory; replace with DB field or Redis later)
const intentOrderMap = new Map(); // paymentIntentId -> { orderId }

const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  const idemKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'.toLowerCase()];
  const orderId = req.body.orderId; // optional client-provided order id for linkage

  if (!stripe) {
    // Stub / fallback mode: simulate idempotent clientSecret generation
    if (!idemKey) {
      return res.status(503).json({ message: 'Stripe not configured. Provide STRIPE_SECRET_KEY for real processing.', configured: false });
    }
    const cacheKey = idemKey + ':' + amount;
    const redisKey = `pi:idem:${cacheKey}`;
    if (redisClient) {
      try {
        const existingRaw = await redisClient.get(redisKey);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw);
          return res.status(200).json({ clientSecret: existing.clientSecret, configured: false, stub: true, cached: true, persisted: true });
        }
        const hash = crypto.createHash('sha256').update(cacheKey).digest('hex').slice(0, 24);
        const clientSecret = 'stub_cs_' + hash;
        await redisClient.set(redisKey, JSON.stringify({ clientSecret, amount, ts: Date.now() }), { EX: 60 * 60 });
        return res.status(200).json({ clientSecret, configured: false, stub: true, cached: false, persisted: true });
      } catch (_) { /* fall back to memory */ }
    }
    if (idempotencyCache.has(cacheKey)) {
      const cached = idempotencyCache.get(cacheKey);
      return res.status(200).json({ clientSecret: cached.clientSecret, configured: false, stub: true, cached: true });
    }
    const hash = crypto.createHash('sha256').update(cacheKey).digest('hex').slice(0, 24);
    const clientSecret = 'stub_cs_' + hash;
    idempotencyCache.set(cacheKey, { clientSecret, amount, ts: Date.now() });
    return res.status(200).json({ clientSecret, configured: false, stub: true, cached: false });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    console.error('Invalid amount provided:', amount);
    return res.status(400).json({ message: 'Invalid amount provided.' });
  }

  try {
    console.log('Creating payment intent with amount:', amount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: orderId ? { orderId } : undefined,
    }, idemKey ? { idempotencyKey: idemKey } : undefined);

    if (orderId) intentOrderMap.set(paymentIntent.id, { orderId });

  console.log('Payment intent created successfully:', paymentIntent.id);
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      configured: true
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: 'Failed to create payment intent.', error: error.message });
  }
};

// Basic webhook handler placeholder (signature verification TBD)
const handleWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !endpointSecret) {
    return res.status(503).json({ message: 'Webhook not fully configured' });
  }
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ message: 'Missing stripe-signature header' });
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    // Minimal event type handling (expand as needed)
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const metaOrderId = intent.metadata && intent.metadata.orderId;
        const mapping = intentOrderMap.get(intent.id) || (metaOrderId ? { orderId: metaOrderId } : null);
        if (mapping && mapping.orderId) {
          try {
            const Order = require('../models/Order');
            await Order.findByIdAndUpdate(mapping.orderId, { status: 'Completed' });
          } catch (_) { /* swallow webhook errors to avoid repeated retries noise */ }
        }
        break; }
      default: break;
    }
    return res.status(200).json({ received: true, type: event.type });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid signature', error: err.message });
  }
};

module.exports = { createPaymentIntent, handleWebhook, attachRedis };
