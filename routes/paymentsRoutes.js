/* eslint-env node */
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const authenticateUser = authenticate(true);
const isAdmin = requireRole('admin');
const { createPaymentIntent } = require('../controllers/stripeController');
const audit = require('../utils/auditLogger');
const { getCapabilities, updateCapabilities, toggleProvider } = require('../utils/paymentCapabilities');
const Cart = require('../models/Cart');

function requirePaymentsEnabled(req, res, next) {
  const caps = getCapabilities();
  if (!caps.enabled) {
  return res.status(503).json({ code: 'PAYMENTS_DISABLED', message: 'Payments temporarily disabled by administrator.' });
  }
  return next();
}

// Public config for frontend consumption
router.get('/config', (req, res) => {
  const caps = getCapabilities();
  return res.json({
    paymentsEnabled: caps.enabled,
    providers: caps.providers,
    testMode: caps.testMode,
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    updatedAt: caps.updatedAt,
  });
});

// Update capabilities (admin)
router.put('/admin/capabilities', authenticateUser, isAdmin, async (req, res) => {
  const updated = await updateCapabilities(req.body || {});
  audit.event('payments.capabilities.update', { userId: req.user.id, changes: Object.keys(req.body||{}) });
  return res.json({ message: 'Updated payment capabilities', capabilities: updated });
});

// Toggle a provider (admin)
router.post('/admin/provider/:name/toggle', authenticateUser, isAdmin, async (req, res) => {
  const name = req.params.name.toLowerCase();
  const caps = getCapabilities();
  if (!(name in caps.providers)) {
    return res.status(404).json({ message: 'Unknown provider' });
  }
  const result = await toggleProvider(name);
  audit.event('payments.provider.toggle', { userId: req.user.id, provider: name, newState: result[name] });
  if (result.error) return res.status(404).json({ message: result.error });
  return res.json({ message: `Provider ${name} toggled`, providers: result });
});

// Create order (Generic) -> create Order (if DB) then Stripe intent
const { withSpan, record } = (() => { try { return require('../utils/telemetry'); } catch(_) { return { withSpan: async (_n, fn)=> fn({ setAttribute:()=>{} }), record: ()=>{} }; } })();

router.post('/create-order', authenticateUser, requirePaymentsEnabled, async (req, res) => {
  let { total, items = [] } = req.body || {};
  const mongoose = require('mongoose');
  const hasDb = mongoose.connection.readyState === 1;
  if (!Array.isArray(items) || items.length === 0 || typeof total !== 'number' || total <= 0) {
    if (!hasDb) return res.status(400).json({ code: 'PAYMENT_INVALID_TOTAL', message: 'Invalid total amount.' });
    const cart = await Cart.findOne({ user: req.user.id }).lean();
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ code: 'CART_EMPTY', message: 'Your cart is empty.' });
    }
    items = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, pictures: i.pictures || [] }));
    total = cart.total;
  }
  const caps = getCapabilities();
  if (!caps.providers.stripe) {
  return res.status(503).json({ code: 'PAYMENT_PROVIDER_DISABLED', message: 'Stripe provider disabled.' });
  }
  const idemKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'.toLowerCase()];
  let orderDoc = null;
  try {
    let earlyResponse = null;
    await withSpan('orders.create', async (span) => {
      try { span.setAttribute('order.total', total); if (idemKey) span.setAttribute('order.idem_key', idemKey); } catch(_) {}
      if (hasDb) {
      const Order = require('../models/Order');
      if (idemKey) {
        orderDoc = await Order.findOne({ idemKey, user: req.user.id });
        if (orderDoc) {
          // Idempotent replay: short-circuit and return existing linkage after refreshing timeline
          await orderDoc.addEvent('idempotent_reuse', { idemKey });
          record('orders.idempotent_reuse');
          req.body.orderId = orderDoc._id.toString();
          req.body.amount = Math.round(orderDoc.total * 100);
          earlyResponse = await createPaymentIntent(req, res); // downstream createPaymentIntent will see existing orderId/idempotency
          return; // stop span work
        }
      }
  orderDoc = await Order.create({ user: req.user.id, items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, pictures: i.pictures||[] })), total, status: 'Pending', idemKey, timeline: [{ type: 'created', meta: { total } }] });
  record('orders.created');
      req.body.orderId = orderDoc._id.toString();
      }
    });
    if (earlyResponse) return earlyResponse;
    if (!req.body.orderId) {
      req.body.orderId = 'ephemeral-' + Date.now();
    }
  req.body.amount = Math.round(total * 100); // dollars -> cents
    const resp = await createPaymentIntent(req, res);
    // If payment controller returns an error (e.g., 503 stub) and we have an order doc, append failure event
    if (orderDoc && resp && resp.statusCode && resp.statusCode >= 400) {
      await orderDoc.addEvent('payment_attempt_failed', { status: resp.statusCode, code: resp.body && resp.body.code });
    } else if (orderDoc) {
      await orderDoc.addEvent('payment_intent_created', { amount: req.body.amount });
    }
    return resp;
  } catch (err) {
    console.error('Error creating order:', err);
    if (orderDoc) {
      try { await orderDoc.addEvent('failed', { error: err.message }); await orderDoc.updateOne({ status: 'Failed' }); } catch (_) {}
    }
    return res.status(500).json({ code: 'ORDER_CREATE_FAILED', message: 'Failed to create order', error: err.message });
  }
});

// Capture order placeholder
router.post('/capture-order/:id', authenticateUser, requirePaymentsEnabled, async (req, res) => {
  const orderId = req.params.id;
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const Order = require('../models/Order');
        const order = await Order.findById(orderId).catch(()=>null);
        if (order) {
          await order.updateOne({ status: 'Completed' });
          if (order.addEvent) await order.addEvent('payment_captured', { provider: 'stub', extId: orderId });
          // Clear user's cart only when status is Completed
          try {
            const Cart = require('../models/Cart');
            if (order && order.user) {
              await Cart.deleteOne({ user: order.user }).catch(()=>{});
            }
          } catch(_) {}
        }
      } catch (_) { /* ignore */ }
    }
  } catch (_) { /* ignore */ }
  return res.json({ captured: true, id: orderId });
});

module.exports = router;
