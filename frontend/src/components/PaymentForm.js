import React, { useState } from "react";

const PaymentForm = ({ onDetailsSubmit }) => {
  const [details, setDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onDetailsSubmit(details);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>Payment Details</h2>
      <input
        type="text"
        name="cardNumber"
        value={details.cardNumber}
        onChange={handleChange}
        placeholder="Card Number"
        required
      />
      <input
        type="text"
        name="expiryDate"
        value={details.expiryDate}
        onChange={handleChange}
        placeholder="Expiry Date (MM/YY)"
        required
      />
      <input
        type="text"
        name="cvv"
        value={details.cvv}
        onChange={handleChange}
        placeholder="CVV"
        required
      />
      <button type="submit">Save Payment Details</button>
    </form>
  );
};

export default PaymentForm;
