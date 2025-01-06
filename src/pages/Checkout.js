import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "../redux/cartSlice";
import OrderSummary from "../components/OrderSummary";
import ShippingForm from "../components/ShippingForm";
import PaymentForm from "../components/PaymentForm";
import api from "../services/api";
import "./Checkout.css";

const Checkout = () => {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);
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
