/*import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); // Destructure directly from useContext

  console.log("AuthContext Value:", { user, logout }); // Log for debugging

  return (
    <nav>
      <a href="/">Home</a>
      {user?.role === "seller" && <a href="/seller/products">My Products</a>}
      {user?.role === "customer" && <a href="/cart">Cart</a>}
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
};

export default Navbar;
*/
/* import React from "react";
//import "./Navbar.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { Link, useNavigate } from "react-router-dom"; // Use `Link` for navigation

const Navbar = () => {
  const { user } = useSelector((state) => state.auth); // Access user state from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/login"); // Redirect to login
  };

  return (
    <nav>
      <Link to="/">Home</Link> {/* Updated from `<a>` to `Link` */
    /*}
      {user ? (
        <>
          {user.role === "admin" && <Link to="/admin">Admin Dashboard</Link>} {/* Admin-specific */
        /*}
    /*      {user.role === "seller" && <Link to="/seller">Seller Dashboard</Link>} {/* Seller-specific */
  /*}
    /*      {user.role === "customer" && <Link to="/cart">Cart</Link>} {/* Customer-specific */
  /*}
     /*     <button onClick={handleLogout}>Logout</button> {/* Logout button */
    /*}
       /* </>
      ) : (
        <>
          <Link to="/login">Login</Link> {/* Visible for unauthenticated users */
        /*}
      /*    <Link to="/register">Register</Link> {/* Visible for unauthenticated users */
    /*}

        /*</>
      )}
    </nav>
  );
};

export default Navbar;
*/
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { Link, useNavigate } from "react-router-dom"; // Use `Link` for navigation
//import "./Navbar.css"; // Assuming we style the Navbar here

const Navbar = () => {
  const { user } = useSelector((state) => state.auth); // Access user state from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/login"); // Redirect to login
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-link">Home</Link>
        {user?.role === "admin" && <Link to="/admin" className="navbar-link">Admin Dashboard</Link>}
        
        {user?.role === "seller" && <Link to="/seller" className="navbar-link">Seller Dashboard</Link>}
        {user?.role === "customer" && <Link to="/cart" className="navbar-link">Cart</Link>}
      </div>
      
      {user ? (
        <div className="navbar-right">
          <div className="welcome-message">
            Welcome, {user.username || "User"}!
          </div>
          <div className="profile-avatar">
            <img
              src={user.avatar || "https://via.placeholder.com/40"} // Default avatar if none exists
              alt="Profile Avatar"
              className="avatar-image"
            />
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      ) : (
        <div className="navbar-right">
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/register" className="navbar-link">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
