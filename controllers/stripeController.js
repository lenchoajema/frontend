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

// Track mapping from paymentIntent -> order (in-memory + optional Redis persistence)
// In production you'd persist this on the Order itself (store paymentIntentId inside Order) and query by it.
// Here we keep a lightweight cache plus Redis (if available) so webhook handlers in other processes can resolve it.
const intentOrderMap = new Map(); // paymentIntentId -> { orderId }
const INTENT_ORDER_REDIS_PREFIX = 'pi:map:'; // key => JSON { orderId }

const { withSpan, record } = (() => { try { return require('../utils/telemetry'); } catch(_) { return { withSpan: async (_n, fn)=> fn({ setAttribute:()=>{} }), record: ()=>{} }; } })();

const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  const idemKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'.toLowerCase()];
  const orderId = req.body.orderId; // optional client-provided order id for linkage

  if (!stripe) {
    // Stub / fallback mode: simulate idempotent clientSecret generation
    if (!idemKey) {
  return res.status(503).json({ code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe not configured. Provide STRIPE_SECRET_KEY for real processing.', configured: false });
    }
    if (req.headers['x-simulate-payment-failure'] === '1' || req.body.simulateFailure) {
      // Provide deterministic pseudo error for stub mode to allow negative path tests
  record('payments.intent.failed');
      return res.status(500).json({ code: 'PAYMENT_INTENT_SIMULATED_FAILURE', message: 'Simulated payment failure (stub mode)', configured: false, stub: true });
    }
    const cacheKey = idemKey + ':' + amount;
    const redisKey = `pi:idem:${cacheKey}`;
    if (redisClient) {
      try {
        const existingRaw = await redisClient.get(redisKey);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw);
      return res.status(200).json({ clientSecret: existing.clientSecret, configured: false, stub: true, cached: true, persisted: true, orderId });
        }
        const hash = crypto.createHash('sha256').update(cacheKey).digest('hex').slice(0, 24);
        const clientSecret = 'stub_cs_' + hash;
        await redisClient.set(redisKey, JSON.stringify({ clientSecret, amount, ts: Date.now() }), { EX: 60 * 60 });
  return res.status(200).json({ clientSecret, configured: false, stub: true, cached: false, persisted: true, orderId });
      } catch (_) { /* fall back to memory */ }
    }
    if (idempotencyCache.has(cacheKey)) {
      const cached = idempotencyCache.get(cacheKey);
  return res.status(200).json({ clientSecret: cached.clientSecret, configured: false, stub: true, cached: true, orderId });
    }
    const hash = crypto.createHash('sha256').update(cacheKey).digest('hex').slice(0, 24);
    const clientSecret = 'stub_cs_' + hash;
    idempotencyCache.set(cacheKey, { clientSecret, amount, ts: Date.now() });
  return res.status(200).json({ clientSecret, configured: false, stub: true, cached: false, orderId });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    console.error('Invalid amount provided:', amount);
  return res.status(400).json({ code: 'PAYMENT_INVALID_AMOUNT', message: 'Invalid amount provided.' });
  }

  try {
    console.log('Creating payment intent with amount:', amount);
    // Optional failure simulation for tests / chaos (header or body simulateFailure=true)
    if (req.headers['x-simulate-payment-failure'] === '1' || req.body.simulateFailure) {
      console.error('Simulated payment intent failure triggered');
  record('payments.intent.failed');
      return res.status(500).json({ code: 'PAYMENT_INTENT_SIMULATED_FAILURE', message: 'Simulated payment failure' });
    }
    const paymentIntent = await withSpan('payments.stripe.create_intent', async (span) => {
      try { span.setAttribute('payments.amount', amount); if (orderId) span.setAttribute('order.id', orderId); if (idemKey) span.setAttribute('idempotency.key', idemKey); } catch(_) {}
      return await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: orderId ? { orderId } : undefined,
    }, idemKey ? { idempotencyKey: idemKey } : undefined);
    });

    if (orderId) {
      intentOrderMap.set(paymentIntent.id, { orderId });
      if (redisClient) {
        // Persist mapping so other instances / later webhooks can resolve it (24h TTL)
        redisClient.set(INTENT_ORDER_REDIS_PREFIX + paymentIntent.id, JSON.stringify({ orderId }), { EX: 60 * 60 * 24 }).catch(()=>{});
      }
    }

  console.log('Payment intent created successfully:', paymentIntent.id);
  record('payments.intent.created');
  return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      configured: true,
      orderId: orderId || null,
      paymentIntentId: paymentIntent.id,
    });
    // Append payment_intent_created timeline event if we have an order link
    if (orderId) {
      try {
        const Order = require('../models/Order');
        await Order.findByIdAndUpdate(orderId, { $push: { timeline: { type: 'payment_intent_created', meta: { paymentIntentId: paymentIntent.id, amount } } } });
      } catch(_) {}
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
  if (orderId) {
      try {
        const Order = require('../models/Order');
        await Order.findByIdAndUpdate(orderId, { status: 'Failed', $push: { timeline: { type: 'payment_failed', meta: { error: error.message } } } });
      } catch(_) {}
    }
  record('payments.intent.failed');
    return res.status(500).json({ code: 'PAYMENT_INTENT_ERROR', message: 'Failed to create payment intent.', error: error.message });
  }
};

// Basic webhook handler placeholder (signature verification TBD)
const handleWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !endpointSecret) {
    return res.status(503).json({ code: 'WEBHOOK_NOT_CONFIGURED', message: 'Webhook not fully configured' });
  }
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ code: 'WEBHOOK_SIG_MISSING', message: 'Missing stripe-signature header' });
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    // Minimal event type handling (expand as needed)
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const metaOrderId = intent.metadata && intent.metadata.orderId;
        let mapping = intentOrderMap.get(intent.id) || (metaOrderId ? { orderId: metaOrderId } : null);
        if (!mapping && redisClient) {
          try {
            const raw = await redisClient.get(INTENT_ORDER_REDIS_PREFIX + intent.id);
            if (raw) {
              mapping = JSON.parse(raw);
              // Warm local cache to avoid repeated Redis lookups
              if (mapping && mapping.orderId) intentOrderMap.set(intent.id, mapping);
            }
          } catch (_) { /* ignore redis errors */ }
        }
        if (mapping && mapping.orderId) {
          try {
            const Order = require('../models/Order');
            // Update status and append timeline event atomically
            await Order.findByIdAndUpdate(mapping.orderId, {
              status: 'Completed',
              $push: { timeline: { type: 'payment_succeeded', meta: { paymentIntentId: intent.id } } }
            });
          } catch (_) { /* swallow webhook errors to avoid repeated retries noise */ }
        }
        break; }
      default: break;
    }
    return res.status(200).json({ received: true, type: event.type });
  } catch (err) {
  return res.status(400).json({ code: 'WEBHOOK_INVALID_SIGNATURE', message: 'Invalid signature', error: err.message });
  }
};

module.exports = { createPaymentIntent, handleWebhook, attachRedis };
