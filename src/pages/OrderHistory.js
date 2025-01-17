import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // For pagination
  const [totalPages, setTotalPages] = useState(1); // Total pages from API
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/orders?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages || 1); // Set total pages if provided by the API
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const handleRetry = () => {
    setPage(1); // Reset to the first page
    setError(null);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Order History</h1>

      {loading && <p style={styles.loading}>Loading your orders...</p>}

      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={handleRetry} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <p style={styles.noOrders}>No orders found. Start shopping now!</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <ul style={styles.orderList}>
            {orders.map((order) => (
              <li key={order._id} style={styles.orderItem}>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Total:</strong> ${order.total}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  style={styles.detailsButton}
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>

          <div style={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              style={styles.pageButton}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              style={styles.pageButton}
            >
              Next
            </button>
          </div>
        </>
      )}
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
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noOrders: {
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
  orderList: {
    listStyleType: "none",
    padding: 0,
  },
  orderItem: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9",
  },
  detailsButton: {
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  },
  pageButton: {
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    opacity: "0.8",
  },
};

export default OrderHistory;


/* import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrders } from "../redux/orderSlice";
import OrderCard from "../components/OrderCard";
import "./OrderHistory.css";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.list);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="order-history-page">
      <h1>Order History</h1>
      {orders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
 */