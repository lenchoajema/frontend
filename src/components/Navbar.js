import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Assuming we style the Navbar here

const Navbar = () => {
  const { user } = useSelector((state) => state.auth); // Access user state from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
//console.log("user role", user.role)
  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/login"); // Redirect to login
  };

  return (
    <nav className="navbar1">
      <div className="navbar1-left">
        <Link to="/" className="navbar1-link">Home</Link>

        {user?.role === "admin" && (
          <Link to="/admin" className="navbar1-link">Admin Dashboard</Link>
        )}
        
        {user?.role === "seller" && (
          <Link to="/seller" className="navbar1-link">Seller Dashboard</Link>
        )}
        
        {user && (
          <><Link to="/seller" className="navbar1-link">Seller Dashboard</Link>
            <Link to="/admin" className="navbar1-link">Admin Dashboard</Link>
            <Link to="/cart" className="navbar1-link">Cart</Link>
            <Link to="/orders" className="navbar1-link">Orders</Link>
          </>
        )}
        {user && (
          <Link to="/profile" className="navbar1-link">Profile</Link>
        )}

        {console.log("User Role:", user?.role)}
      </div>

      {user ? (
        <div className="navbar1-right">
          <div className="welcome-message">
            Welcome, {user.username || user.role || "User"}!
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
        <div className="navbar1-right">
          <Link to="/login" className="navbar1-link">Login</Link>
          <Link to="/register" className="navbar1-link">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
