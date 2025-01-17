import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Order Details Response:", response.data);
       // Update this logic to handle the correct API structure
    if (response.data && response.data.orderId) {
      setOrder(response.data); // Directly set the response as the order
    } else {
      setError("Order details not found.");
    }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleBack = () => {
    navigate("/orders");
  };

  if (loading) {
    return <p style={styles.loading}>Loading order details...</p>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button onClick={handleBack} style={styles.backButton}>
          Back to Order History
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.error}>
        <p>Order not found.</p>
        <button onClick={handleBack} style={styles.backButton}>
          Back to Order History
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Order Details</h1>
      <div style={styles.orderInfo}>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total:</strong> ${order.total}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <h2 style={styles.subHeader}>Items</h2>
      <ul style={styles.itemList}>
        {order.items.map((item) => (
          <li key={item.productId} style={styles.item}>
            <p><strong>Product Name:</strong> {item.name}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Price:</strong> ${item.price}</p>
          </li>
        ))}
      </ul>

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
  header: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
  },
  orderInfo: {
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
  },
  subHeader: {
    fontSize: "20px",
    marginTop: "20px",
    marginBottom: "10px",
  },
  itemList: {
    listStyleType: "none",
    padding: 0,
  },
  item: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
  error: {
    textAlign: "center",
    color: "red",
    marginBottom: "20px",
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

export default OrderDetails;