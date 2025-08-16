import React from "react";

const OrderCard = ({ order }) => {
  const { _id, date, total, status } = order;

  return (
    <div className="order-card">
      <h3>Order #{_id}</h3>
      <p>Date: {new Date(date).toLocaleDateString()}</p>
      <p>Total: ${total.toFixed(2)}</p>
      <p>Status: {status}</p>
      {/* Add a button for a detailed view if needed */}
    </div>
  );
};

export default OrderCard;
