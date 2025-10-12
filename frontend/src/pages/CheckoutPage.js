import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import { clearCart } from '../redux/cartSlice';

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

export default function CheckoutPage() {
  const cart = useSelector((state) => state.cart);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // stripe, paypal, cod
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [orderId, setOrderId] = useState(null);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === 'express' ? 15 : shippingMethod === 'standard' ? 10 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      // Create order in backend
      const { data } = await api.post('/payments/create-order', {
        items: cart.items,
        total,
        shippingAddress,
        shippingMethod,
        paymentMethod,
      });
      setOrderId(data.orderId);
      setStep(4);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && step !== 4) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <a href="/" className="btn btn-primary mt-3">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Checkout</h2>

      {/* Progress Steps */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            {['Shipping', 'Payment', 'Review', 'Confirmation'].map((label, idx) => (
              <div key={idx} className="text-center flex-fill">
                <div
                  className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                    step > idx + 1 ? 'bg-success text-white' : step === idx + 1 ? 'bg-primary text-white' : 'bg-light text-muted'
                  }`}
                  style={{ width: '40px', height: '40px' }}
                >
                  {step > idx + 1 ? '✓' : idx + 1}
                </div>
                <div className={`small ${step >= idx + 1 ? 'text-dark' : 'text-muted'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mb-4">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Shipping Address</h5>
                <form onSubmit={handleShippingSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country</label>
                      <select
                        className="form-select"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="mt-4">
                    <h6 className="mb-3">Shipping Method</h6>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="shipping"
                        id="standard"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="standard">
                        <div className="d-flex justify-content-between">
                          <span>Standard Shipping (5-7 days)</span>
                          <strong>$10.00</strong>
                        </div>
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="shipping"
                        id="express"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="express">
                        <div className="d-flex justify-content-between">
                          <span>Express Shipping (2-3 days)</span>
                          <strong>$15.00</strong>
                        </div>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="shipping"
                        id="free"
                        value="free"
                        checked={shippingMethod === 'free'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="free">
                        <div className="d-flex justify-content-between">
                          <span>Free Shipping (7-10 days)</span>
                          <strong>FREE</strong>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-4">
                    Continue to Payment
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Payment Method</h5>

                <div className="mb-4">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      id="stripe"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="stripe">
                      <i className="bi bi-credit-card me-2"></i>
                      Credit / Debit Card
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      id="paypal"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="paypal">
                      <i className="bi bi-paypal me-2"></i>
                      PayPal
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      id="cod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="cod">
                      <i className="bi bi-cash me-2"></i>
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                {paymentMethod === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      total={total}
                      onSuccess={() => setStep(3)}
                      shippingAddress={shippingAddress}
                    />
                  </Elements>
                )}

                {paymentMethod === 'paypal' && (
                  <PayPalScriptProvider options={{ "client-id": "test" }}>
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            amount: { value: total.toFixed(2) }
                          }]
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order.capture().then(() => {
                          setStep(3);
                        });
                      }}
                    />
                  </PayPalScriptProvider>
                )}

                {paymentMethod === 'cod' && (
                  <div>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Pay with cash upon delivery. Additional charges may apply.
                    </div>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setStep(3)}
                    >
                      Continue to Review
                    </button>
                  </div>
                )}

                <button
                  className="btn btn-outline-secondary w-100 mt-3"
                  onClick={() => setStep(1)}
                >
                  Back to Shipping
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Review Your Order</h5>

                {/* Shipping Address Review */}
                <div className="mb-4">
                  <h6 className="mb-2">Shipping Address</h6>
                  <p className="mb-1">{shippingAddress.fullName}</p>
                  <p className="mb-1">{shippingAddress.address}</p>
                  <p className="mb-1">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                  </p>
                  <p className="mb-1">{shippingAddress.country}</p>
                  <p className="mb-0">{shippingAddress.phone}</p>
                  <button className="btn btn-sm btn-link p-0" onClick={() => setStep(1)}>
                    Edit
                  </button>
                </div>

                {/* Items Review */}
                <div className="mb-4">
                  <h6 className="mb-3">Items</h6>
                  {cart.items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between mb-2">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Method Review */}
                <div className="mb-4">
                  <h6 className="mb-2">Payment Method</h6>
                  <p className="mb-0">
                    {paymentMethod === 'stripe' && 'Credit/Debit Card'}
                    {paymentMethod === 'paypal' && 'PayPal'}
                    {paymentMethod === 'cod' && 'Cash on Delivery'}
                  </p>
                  <button className="btn btn-sm btn-link p-0" onClick={() => setStep(2)}>
                    Edit
                  </button>
                </div>

                <button
                  className="btn btn-success w-100"
                  onClick={handlePaymentSubmit}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="mb-3">Order Confirmed!</h3>
                <p className="text-muted mb-4">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <div className="mb-4">
                  <strong>Order ID:</strong> {orderId}
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <a href="/orders" className="btn btn-primary">
                    View Orders
                  </a>
                  <a href="/" className="btn btn-outline-primary">
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
              <h5 className="card-title mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong className="text-primary">${total.toFixed(2)}</strong>
              </div>

              {/* Items List */}
              <div className="border-top pt-3">
                <h6 className="mb-3">Items ({cart.items.length})</h6>
                {cart.items.map((item) => (
                  <div key={item.id} className="d-flex mb-2 small">
                    <div className="flex-grow-1">{item.name}</div>
                    <div>${item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stripe Payment Form Component
function StripePaymentForm({ total, onSuccess, shippingAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/stripe/create-payment-intent', {
        amount: Math.round(total * 100),
        shippingAddress,
      });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Card Details</label>
        <div className="border rounded p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
