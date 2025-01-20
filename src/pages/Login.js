import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import api from "../services/api";
import "./styles.css";
import Navbar from "../components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "admin") navigate("/admin");
      else if (role === "seller") navigate("/seller");
      else if (role === "customer") navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user } = response.data;
      const { role } = user;
      const { token } = response.data;
      console.log("Login token", token)
      //const { name } = user;
      //<Navbar userName={name} userRole={role} />
      if (rememberMe) {
      localStorage.setItem("token", token);
       localStorage.setItem("role", role);
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", role);
      } 
      console.log("Response Data from Login",response.data);
      dispatch(login({ user, token }));
      //<Navbar/>
      console.log("role", role);
      if (role === "admin") navigate("/admin");
      else if (role === "seller") navigate("/seller");
      else if (role === "customer") navigate("/");
      
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Please log in to continue</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="login-footer">
          <a href="/" className="forgot-password">
            Forgot Password?
          </a>
          <a href="/register" className="create-account">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
