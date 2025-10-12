import React from 'react';
import { useSelector } from 'react-redux';
import Checkout from '../components/Checkout';

export default function CheckoutPage() {
  const total = useSelector((s) => s.cart.total || 0);
  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Checkout</h1>
      <Checkout total={total} />
    </div>
  );
}
