/* eslint-env node */
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const authenticateUser = authenticate(true);
const isAdmin = requireRole('admin');
const { createPaymentIntent } = require('../controllers/stripeController');
const audit = require('../utils/auditLogger');
const { getCapabilities, updateCapabilities, toggleProvider } = require('../utils/paymentCapabilities');

function requirePaymentsEnabled(req, res, next) {
  const caps = getCapabilities();
  if (!caps.enabled) {
    return res.status(503).json({ message: 'Payments temporarily disabled by administrator.' });
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
router.post('/create-order', authenticateUser, requirePaymentsEnabled, async (req, res) => {
  const { total, items = [] } = req.body || {};
  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ message: 'Invalid total amount.' });
  }
  const caps = getCapabilities();
  if (!caps.providers.stripe) {
    return res.status(503).json({ message: 'Stripe provider disabled.' });
  }
  try {
    // Create Order placeholder if DB connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        const Order = require('../models/Order');
        const order = await Order.create({ user: req.user.id, items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, pictures: i.pictures||[] })), total, status: 'Pending' });
        req.body.orderId = order._id.toString();
      } catch (_) { /* ignore order create failure for now */ }
    }
    if (!req.body.orderId) {
      req.body.orderId = 'ephemeral-' + Date.now();
    }
    req.body.amount = Math.round(total * 100); // dollars -> cents
    return await createPaymentIntent(req, res);
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// Capture order placeholder
router.post('/capture-order/:id', authenticateUser, requirePaymentsEnabled, async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'Order/intent id required.' });
  return res.json({ message: 'Capture acknowledged (placeholder)', id });
});

module.exports = router;
