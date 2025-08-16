import React from "react";

const OrderSummary = ({ items, total }) => (
  <div className="order-summary">
    <h2>Order Summary</h2>
    <ul>
      {items.map((item) => (
        <li key={item._id}>
          {item.name} x {item.quantity}: ${item.price.toFixed(2)}
        </li>
      ))}
    </ul>
    <h3>Total: ${total.toFixed(2)}</h3>
  </div>
);

export default OrderSummary;
