import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripeCheckout = ({ total }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm total={total} />
    </Elements>
  );
};

export default StripeCheckout;
