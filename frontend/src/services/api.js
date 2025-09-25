// Centralized Axios instance for frontend API calls
// - Base URL resolves to backend /api prefix
// - Automatically attaches Authorization from localStorage/sessionStorage
// - Handles Codespaces port mapping (3000 -> 5000) when REACT_APP_BACKEND_URL is not set

import axios from 'axios';

function resolveBaseURL() {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  // If we're running in a Codespaces browser context, prefer mapping -3000 -> -5000 over any http-only env URL
  try {
    const origin = window.location.origin;
    const isCodespaces = origin.includes('.github.dev');
    const isHttpsPage = origin.startsWith('https://');
    if (isCodespaces && isHttpsPage) {
      // Map Codespaces port suffix
      if (origin.includes('-3000.')) {
        return origin.replace('-3000.', '-5000.') + '/api';
      }
    }
  } catch (_) {}

  // 1) Explicit env override
  if (envUrl && envUrl.trim() !== '') {
    // Avoid mixed content: if page is https and env is http internal host, prefer derived host from location when available
    try {
      const origin = window.location.origin;
      const isHttpsPage = origin.startsWith('https://');
      const looksInternalDocker = /ecommerce_backend|localhost:5000/.test(envUrl);
      if (isHttpsPage && looksInternalDocker) {
        // Derive from origin (works for Codespaces or reverse-proxy setups)
        if (origin.includes('-3000.')) {
          return origin.replace('-3000.', '-5000.') + '/api';
        }
      }
    } catch (_) {}
    return envUrl.replace(/\/$/, '') + '/api';
  }

  // 2) Infer from current origin
  try {
    const origin = window.location.origin;
    if (origin.includes('-3000.')) {
      return origin.replace('-3000.', '-5000.') + '/api';
    }
    if (origin.includes('localhost:3000')) {
      return 'http://localhost:5000/api';
    }
  } catch (_) {}

  // 3) Fallback
  return '/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

// Attach Authorization header from storage on each request
api.interceptors.request.use((config) => {
  try {
    const token =
      (typeof localStorage !== 'undefined' && localStorage.getItem('token')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('token')) ||
      null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Normalize certain API responses so UI code can be simpler
function normalizeProductsPayload(data) {
  // Accept a few common shapes and always return an array for products
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && data.data && Array.isArray(data.data)) return data.data;
  return data; // fallback unchanged
}

api.interceptors.response.use(
  (response) => {
    try {
      const url = (response?.config?.url || '').toString();
      // Only touch product listing endpoints; leave others intact
      if (/\/products(\?|$)/.test(url)) {
        const normalized = normalizeProductsPayload(response.data);
        // Replace response.data so callers that destructure { data } get the array
        response.data = normalized;
      }
    } catch (_) {}
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
