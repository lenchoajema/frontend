import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Read publishable key from env at build time, but guard at runtime too.
const PUBLISHABLE_KEY = typeof process !== 'undefined' && process.env && process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  : (typeof window !== 'undefined' && window.REACT_APP_STRIPE_PUBLISHABLE_KEY ? window.REACT_APP_STRIPE_PUBLISHABLE_KEY : null);

const StripeCheckout = ({ total }) => {
  if (!PUBLISHABLE_KEY) {
    // Stripe not configured — render fallback and avoid calling loadStripe which may try to use .match on undefined.
    return (
      <div>
        <p>Payment provider not configured. Please contact the site administrator.</p>
      </div>
    );
  }

  const stripePromise = loadStripe(PUBLISHABLE_KEY);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm total={total} />
    </Elements>
  );
};

export default StripeCheckout;
