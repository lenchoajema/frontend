import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/api", // Backend API URL
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
 /* const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const createOrder = async (total) => {
    const response = await fetch(`${API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total }),
    });
    return response.json();
};

export const captureOrder = async (orderID) => {
    const response = await fetch(`${API_BASE_URL}/api/capture-order/${orderID}`, {
        method: 'POST',
    });
    return response.json();
};
 */
 
export default api;
