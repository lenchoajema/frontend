import React from "react";
import { Routes, Route, Link } from "react-router-dom";
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

console.log("Home:", Home);
console.log("ProductDetails:", ProductDetails);
function App() {
  return (
    <>
      <Navbar> 
        <Link to="/orders">Order History</Link>
      </Navbar>
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
      </Routes>
      <Footer />
    </>
  );
}

export default App;
