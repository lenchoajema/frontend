import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  console.log("user Data",user);
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      console.log("Token found in Navbar:", token);
    }
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="navbar-link" activeClassName="active">
          Home
        </NavLink>

        {user?.role === "admin" && (
          <NavLink to="/admin" className="navbar-link" activeClassName="active">
            Admin Dashboard
          </NavLink>
        )}

        {user?.role === "seller" && (
          <NavLink to="/seller" className="navbar-link" activeClassName="active">
            Seller Dashboard
          </NavLink>
        )}

        {isAuthenticated && (
          <>
            <NavLink to="/cart" className="navbar-link" activeClassName="active">
              Cart
            </NavLink>
            <NavLink to="/orders" className="navbar-link" activeClassName="active">
              Orders
            </NavLink>
            <NavLink to="/profile" className="navbar-link" activeClassName="active">
              Profile
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <div className="welcome-message">
              Welcome, {user?.username || user?.role || "User"}!
            </div>
            {user?.avatar && (
              <div className="profile-avatar">
                <img
                  src={user.avatar || "https://via.placeholder.com/40"}
                  alt="Profile Avatar"
                  className="avatar-image"
                />
              </div>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" id="new_public" className="navbar-link" activeClassName="active">
              Login
            </NavLink>
            <NavLink to="/register" id="new_public" className="navbar-link" activeClassName="active">
              Register
            </NavLink> 
          </>
        )}
      </div>

      {/* Mobile Menu*/ }
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" className="navbar-link" onClick={toggleMenu}>
            Home
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className="navbar-link" onClick={toggleMenu}>
              Admin Dashboard
            </NavLink>
          )}
          {user?.role === "seller" && (
            <NavLink to="/seller" className="navbar-link" onClick={toggleMenu}>
              Seller Dashboard
            </NavLink>
          )}
          {isAuthenticated && (
            <>
              <NavLink to="/cart" className="navbar-link" onClick={toggleMenu}>
                Cart
              </NavLink>
              <NavLink to="/orders" className="navbar-link" onClick={toggleMenu}>
                Orders
              </NavLink>
              <NavLink to="/profile" className="navbar-link" onClick={toggleMenu}>
                Profile
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-button mobile">
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="navbar-link" onClick={toggleMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className="navbar-link" onClick={toggleMenu}>
                Register
              </NavLink>
            </>
          )}
        </div>
      )} 
      

    </nav>
  );
};

export default Navbar;
