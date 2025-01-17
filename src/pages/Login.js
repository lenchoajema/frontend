/*import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      dispatch(login(response.data));
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("Login failed:", error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
*/
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { useDispatch } from "react-redux"; // For Redux actions
import { login } from "../redux/authSlice"; // Redux slice for login action
import api from "../services/api"; // API service
import "./styles.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // To display errors
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    try {
      const response = await api.post("/auth/login", { email, password }); // API call
      console.log("Login response:", response.data);

      const { role, token, ...user } = response.data; // Destructure response
      dispatch(login({ user, token })); // Update Redux state
      localStorage.setItem("token", token); // Save token in localStorage

      // Navigate based on role
      if (role === "admin") navigate("/admin");
      else if (role === "seller") navigate("/seller");
      else if (role === "customer") navigate("/");
      else throw new Error("Invalid role."); // Handle unexpected roles
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again."); // Handle errors
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Please log in to continue</p>
        {error && <p className="error-message">{error}</p>} {/* Display error */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
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
