import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

const CheckoutForm = ({ total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again later.');
      setProcessing(false);
      return;
    }

    let clientSecret;
    try {
      const res = await api.post('/stripe/create-payment-intent', { amount: Math.round(total * 100) });
      clientSecret = res.data?.clientSecret;
      if (!clientSecret) throw new Error('No clientSecret returned');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create payment intent');
      setProcessing(false);
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
      return;
    }

    setError(null);
    setProcessing(false);
    setSucceeded(true);
    alert('Payment successful!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={processing || succeeded}>
        {processing ? 'Processing...' : 'Pay'}
      </button>
      {error && <div>{error}</div>}
      {succeeded && <div>Payment successful!</div>}
    </form>
  );
};

export default CheckoutForm;
