import React from "react";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Order #{order._id}</h2>
        <p>Date: {new Date(order.date).toLocaleDateString()}</p>
        <p>Status: {order.status}</p>
        <h3>Items:</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item._id}>
              {item.name} x {item.quantity} - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <h3>Shipping Address:</h3>
        <p>{order.shippingDetails.address}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
