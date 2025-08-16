// ./pages/CustomerDashboard.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="customer-dashboard">
      <h1>Customer Dashboard</h1>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              Order #{order._id} - {new Date(order.date).toLocaleDateString()} -
              ${order.total.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerDashboard;
