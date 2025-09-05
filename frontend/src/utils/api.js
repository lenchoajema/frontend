// Normalized API utility: reuse the primary axios instance from services/api
// to ensure a single consistent baseURL and interceptors.
import api from '../services/api';

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Helper endpoints for PayPal/Stripe style order flows.
// These assume backend routes mounted at /api/payments/* or /api/orders/*.
// Adjust paths if backend implements different structure.
export const createOrder = async (total) => {
  const { data } = await api.post('/payments/create-order', { total });
  return data; // expected { id, ... }
};

export const captureOrder = async (orderID) => {
  const { data } = await api.post(`/payments/capture-order/${orderID}`);
  return data;
};

export default api;
