// Stripe controller with safe fallback if STRIPE_SECRET_KEY is not provided
let stripe = null;
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (stripeKey && stripeKey.trim() !== '') {
  try {
    const StripeLib = require('stripe');
    stripe = new StripeLib(stripeKey);
  } catch (err) {
    console.warn('⚠️  Failed to initialize Stripe SDK:', err.message);
  }
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Payment intent endpoint will return 503.');
}

const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  if (!stripe) {
    return res.status(503).json({
      message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable payments.',
      configured: false
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount provided.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      configured: true
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: 'Failed to create payment intent.', error: error.message });
  }
};

module.exports = { createPaymentIntent };
