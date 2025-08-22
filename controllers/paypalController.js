// Simple PayPal stub controller with capture / refund simulation
const { getCapabilities } = require('../utils/paymentCapabilities');
const { withSpan } = (() => { try { return require('../utils/telemetry'); } catch(_) { return { withSpan: async (_n, fn)=> fn({ setAttribute:()=>{} }) }; } })();

function ensureEnabled(res) {
  const caps = getCapabilities();
  if (!caps.enabled) return res.status(503).json({ code: 'PAYMENTS_DISABLED', message: 'Payments disabled' });
  if (!caps.providers.paypal) return res.status(503).json({ code: 'PAYMENT_PROVIDER_DISABLED', message: 'PayPal provider disabled' });
  return caps;
}

async function createPaypalOrder(req, res) {
  const caps = ensureEnabled(res); if (!caps.providers) return; // early exit if disabled
  const { total } = req.body || {};
  if (typeof total !== 'number' || total <= 0) return res.status(400).json({ code: 'PAYMENT_INVALID_TOTAL', message: 'Invalid total' });
  if (req.headers['x-simulate-payment-failure'] === '1') {
    return res.status(500).json({ code: 'PAYPAL_SIMULATED_FAILURE', message: 'Simulated PayPal order failure', provider: 'paypal', stub: true });
  }
  return withSpan('payments.paypal.create_order', async (span) => {
    try { span.setAttribute('paypal.total', total); } catch(_) {}
    const orderId = 'pp_' + Date.now().toString(36);
    return res.status(200).json({ provider: 'paypal', orderId, approveUrl: `https://example.test/paypal/approve/${orderId}`, status: 'CREATED', stub: true });
  });
}

async function capturePaypalOrder(req, res) {
  const caps = ensureEnabled(res); if (!caps.providers) return; // disabled
  const { orderId } = req.params;
  if (!orderId) return res.status(400).json({ code: 'PAYPAL_ORDER_ID_REQUIRED', message: 'orderId required' });
  if (req.headers['x-simulate-payment-failure'] === '1') {
    return res.status(500).json({ code: 'PAYPAL_CAPTURE_SIMULATED_FAILURE', message: 'Simulated PayPal capture failure', provider: 'paypal', stub: true });
  }
  return withSpan('payments.paypal.capture', async (span) => {
    try { span.setAttribute('paypal.order_id', orderId); } catch(_) {}
    return res.status(200).json({ provider: 'paypal', orderId, intent: 'CAPTURE', status: 'COMPLETED', stub: true });
  });
}

async function refundPaypalOrder(req, res) {
  const caps = ensureEnabled(res); if (!caps.providers) return; // disabled
  const { orderId } = req.params;
  if (!orderId) return res.status(400).json({ code: 'PAYPAL_ORDER_ID_REQUIRED', message: 'orderId required' });
  if (req.headers['x-simulate-payment-failure'] === '1') {
    return res.status(500).json({ code: 'PAYPAL_REFUND_SIMULATED_FAILURE', message: 'Simulated PayPal refund failure', provider: 'paypal', stub: true });
  }
  return withSpan('payments.paypal.refund', async (span) => {
    try { span.setAttribute('paypal.order_id', orderId); } catch(_) {}
    return res.status(200).json({ provider: 'paypal', orderId, status: 'REFUNDED', stub: true });
  });
}

module.exports = { createPaypalOrder, capturePaypalOrder, refundPaypalOrder };
