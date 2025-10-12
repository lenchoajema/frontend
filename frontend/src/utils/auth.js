import { setAuthToken } from './api';

export const TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'currentUser';
export const AUTH_EVENT = 'auth:changed';

function safeDispatchAuthEvent() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  }
}

function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = typeof window !== 'undefined' && typeof window.atob === 'function'
      ? window.atob(padded)
      : typeof Buffer !== 'undefined'
        ? Buffer.from(padded, 'base64').toString('utf8')
        : null;
    return decoded ? JSON.parse(decoded) : null;
  } catch (err) {
    console.warn('Failed to decode JWT', err);
    return null;
  }
}

export function getStoredAuth() {
  if (typeof window === 'undefined') {
    return { token: null, accessToken: null, refreshToken: null, user: null };
  }
  try {
    const token = window.localStorage.getItem(TOKEN_KEY) || null;
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY) || null;
    let user = null;
    const rawUser = window.localStorage.getItem(USER_KEY);
    if (rawUser) {
      try { user = JSON.parse(rawUser); } catch (_) { user = null; }
    }
    if (!user && token) {
      const payload = decodeJwt(token);
      if (payload) {
        user = {
          id: payload.id || payload.sub || null,
          role: payload.role || payload.userRole || payload.scope || null,
          email: payload.email || null,
          name: payload.name || payload.fullName || null,
        };
      }
    }
    if (token) {
      setAuthToken(token);
    }
    return { token, accessToken: token, refreshToken, user };
  } catch (err) {
    return { token: null, accessToken: null, refreshToken: null, user: null };
  }
}

export function storeAuth({ user, accessToken, refreshToken }) {
  if (typeof window === 'undefined') return;
  try {
    let nextUser = user || null;
    if (accessToken) {
      window.localStorage.setItem(TOKEN_KEY, accessToken);
      setAuthToken(accessToken);
      if (!nextUser) {
        const payload = decodeJwt(accessToken);
        if (payload) {
          nextUser = {
            id: payload.id || payload.sub || null,
            role: payload.role || payload.userRole || payload.scope || null,
            email: payload.email || null,
            name: payload.name || payload.fullName || null,
          };
        }
      }
    }
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (nextUser) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
    safeDispatchAuthEvent();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to persist auth state', err);
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } finally {
    setAuthToken(null);
    safeDispatchAuthEvent();
  }
}

export function decodeToken(token) {
  return decodeJwt(token);
}
