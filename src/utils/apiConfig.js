const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/api";

export const endpoints = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  products: `${API_BASE_URL}/products`,
  productById: (id) => `${API_BASE_URL}/products/${id}`,
  // Add more as needed
};
