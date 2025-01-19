import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCart } from "../redux/cartSlice";
import OrderSummary from "../components/OrderSummary";
import ShippingForm from "../components/ShippingForm";
import PayPalButton from "../components/PayPalButton"; // New PayPal button component
import api from "../services/api";
import "./Checkout.css";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total } = location.state || {}; // Extract items and total passed from CartPage
  const [shippingDetails, setShippingDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleShippingSubmit = (details) => {
    setShippingDetails(details);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    // Triggered on successful PayPal payment
    setIsSubmitting(true);
    try {
      const response = await api.post("/orders", {
         total,
        shippingDetails,
        paymentDetails,
      });
      alert("Order placed successfully!");
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
      <PayPalButton
      total={total ? total.toFixed(2) : "0.00"}
        onSuccess={handlePaymentSuccess}
        disabled={!shippingDetails}
      />
    </div>
  );
};

export default Checkout;

/* import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchCart } from "../redux/cartSlice";
import OrderSummary from "../components/OrderSummary";
import ShippingForm from "../components/ShippingForm";
import PaymentForm from "../components/PaymentForm";
import api from "../services/api";
import "./Checkout.css";

const Checkout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items, total } = location.state; // this is passed from the CartPage component using the navigate function in the handleCheckout function in the CartPage component (see CartPage.js) 
  const [shippingDetails, setShippingDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handlePlaceOrder = async () => {
    if (!shippingDetails || !paymentDetails) {
      alert("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/orders", {
        items,
        total,
        shippingDetails,
        paymentDetails,
      });
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("There was an error placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <OrderSummary items={items} total={total} />
      <ShippingForm onDetailsSubmit={setShippingDetails} />
      <PaymentForm onDetailsSubmit={setPaymentDetails} />
      <button
        onClick={handlePlaceOrder}
        disabled={isSubmitting}
        className="place-order-btn"
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default Checkout;
 */