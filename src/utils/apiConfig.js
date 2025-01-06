const API_BASE_URL = "http://localhost:5000/api"; // Adjust if your backend URL differs

export const endpoints = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  products: `${API_BASE_URL}/products`,
  productById: (id) => `${API_BASE_URL}/products/${id}`,
  // Add more as needed
};
