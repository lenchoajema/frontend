import axios from "axios";

// Determine the correct base URL for the API
const getBaseURL = () => {
  // Check if we have an environment variable set
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Default to the current Codespace URL
  const currentHost = window.location.hostname;
  if (currentHost.includes('github.dev')) {
    return `https://${currentHost.replace('-3000', '-5000')}/api`;
  }
  
  // Fallback to localhost for local development
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Request:", config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.error("404 Error - Route not found:", error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
