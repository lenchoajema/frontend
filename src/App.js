import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import ProfilePage from "./components/ProfilePage";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import ResetPassword from "./pages/ResetPassword";


console.log("Home:", Home);
console.log("ProductDetails:", ProductDetails);
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
 
/*import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./redux/authSlice"; // Redux actions
import api from "./services/api"; // Axios instance
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import ProfilePage from "./components/ProfilePage";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import { Link } from "react-router-dom";

function App() {
  const { user } = useSelector((state) => state.auth); // Access user state from Redux
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  console.log("App fetch token",token);
     
  // Restore session on page load
  useEffect(() => {
    const restoreSession = async () => {
       if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("/auth/me");
          dispatch(setUser({ user: response.data, token }));
        } catch (err) {
          console.error("Session restoration failed:", err);
          dispatch(logout()); // Clear Redux state
          localStorage.removeItem("token"); // Remove invalid token
          navigate("/login"); // Redirect to login
        }
      }
    };
  
    restoreSession();
  }, [dispatch, navigate]);
  

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
       
        <Route path="/register" element={<Register />} />
        {user?.role === "admin" && <Route path="/admin" element={<AdminDashboard />} />}
        {user?.role === "seller" && <Route path="/seller" element={<SellerDashboard />} />}
        {user?.role === "customer" && <Route path="/customer" element={<CustomerDashboard />} />}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
 */


/*
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./redux/authSlice";
import api from "./services/api";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import ProfilePage from "./components/ProfilePage";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";

function App() {
  const { user } = useSelector((state) => state.auth); // Access user state from Redux
  const [loading, setLoading] = useState(true); // Loading state for session restoration
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check for token in localStorage or sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        console.log("Token found, restoring session...", token);
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("/auth/me");
          dispatch(setUser({ user: response.data, token }));
        } catch (err) {
          console.error("Session restoration failed:", err);
          dispatch(logout()); // Clear Redux state
          localStorage.removeItem("token"); // Remove invalid token
        }
      }
      setLoading(false); // End loading state
    };

    restoreSession();
  }, [dispatch, token]);

  if (loading) {
    return <div>Loading...</div>; // Show a loader while restoring the session
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={!user ? <Login /> : <Home />} />
        <Route path="/register" element={!user ? <Register /> : <Home />} />
        {user?.role === "admin" && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}
        {user?.role === "seller" && (
          <Route path="/seller" element={<SellerDashboard />} />
        )}
        {user?.role === "customer" && (
          <Route path="/customer" element={<CustomerDashboard />} />
        )}
        <Route path="/profile" element={user ? <ProfilePage /> : <Login />} />
        <Route path="/orders" element={user ? <OrderHistory /> : <Login />} />
        <Route path="/orders/:orderId" element={user ? <OrderDetails /> : <Login />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
*/