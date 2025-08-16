import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCart } from "../redux/cartSlice";
import OrderSummary from "../components/OrderSummary";
import ShippingForm from "../components/ShippingForm";
import PaymentForm from "../components/PaymentForm";
import PayPalButton from "../components/PayPalButton"; // New PayPal button component
import api from "../services/api";
//import "./Checkout.css";

import StripeCheckout from "../components/StripeCheckout";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total } = location.state || {}; // Extract items and total passed from CartPage
  const [shippingDetails, setShippingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('paypal'); // 'paypal' or 'stripe'
 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleShippingSubmit = (details) => {
    setShippingDetails(details);
  };
  const handleBack = () => {
    navigate("/orders");
  };
  const handlePaymentSuccess = async (paymentDetails) => {
    // Triggered on successful PayPal payment
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token")|| sessionStorage.getItem("token"); // Retrieve token from local storage
      const response = await api.post("/orders", {
        total,
        shippingDetails,
        paymentDetails,
      },{ headers: { Authorization: `Bearer ${token}` } });
      alert("Order placed successfully!");
      console.log("response",response);
      navigate("/orders"); // Redirect to Order History page
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("There was an error placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) {
    return <p>Your cart is empty. Please add items to proceed.</p>;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <OrderSummary items={items} total={total} />
      <ShippingForm onDetailsSubmit={handleShippingSubmit} />
      
      <div>
        <h3>Select Payment Method</h3>
        <button onClick={() => setPaymentMethod('paypal')}>PayPal</button>
        <button onClick={() => setPaymentMethod('stripe')}>Credit Card (Stripe)</button>
      </div>

      {paymentMethod === 'paypal' && (
        <PayPalButton 
          total={total ? total.toFixed(2) : "0.00"}
          onSuccess={handlePaymentSuccess}
          disabled={!shippingDetails}
        />
      )}

      {paymentMethod === 'stripe' && shippingDetails && (
        <StripeCheckout total={total} />
      )}

       <button onClick={handleBack} style={styles.backButton}>
        Back to Order History
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  backButton: {
    marginTop: "20px",
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Checkout;