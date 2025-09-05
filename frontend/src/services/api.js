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

export default api;
