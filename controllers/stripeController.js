// Add debugging logs to identify undefined properties
const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  if (!stripe) {
    console.error('Stripe SDK is not initialized. Check STRIPE_SECRET_KEY.');
    return res.status(503).json({
      message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable payments.',
      configured: false
    });
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
    });

    console.log('Payment intent created successfully:', paymentIntent);
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      configured: true
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: 'Failed to create payment intent.', error: error.message });
  }
};