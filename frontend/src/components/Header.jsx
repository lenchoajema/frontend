import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';
import api from '../services/api';
import { AUTH_EVENT, clearAuth, getStoredAuth } from '../utils/auth';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [q, setQ] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    navigate('/?' + params.toString());
  };
  const count = (cart.items || []).reduce((a, i) => a + (i.quantity || 0), 0);
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, auth?.token]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncAuth = () => setAuth(getStoredAuth());
    window.addEventListener('storage', syncAuth);
    window.addEventListener(AUTH_EVENT, syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener(AUTH_EVENT, syncAuth);
    };
  }, []);

  const role = (auth?.user?.role || '').toLowerCase();
  const dashboardLink = useMemo(() => {
    switch (role) {
      case 'admin':
        return { to: '/admin', label: 'Admin Dashboard' };
      case 'seller':
        return { to: '/seller/dashboard', label: 'Seller Dashboard' };
      case 'customer':
        return { to: '/account', label: 'My Account' };
      default:
        return null;
    }
  }, [role]);

  const displayName = useMemo(() => {
    if (!auth?.user) return '';
    return auth.user.name || auth.user.email || 'Account';
  }, [auth?.user]);

  const handleLogout = useCallback(async () => {
    try {
      if (auth?.refreshToken) {
        await api.post('/auth/logout', { refreshToken: auth.refreshToken });
      }
    } catch (err) {
      console.warn('Logout failed', err);
    } finally {
      clearAuth();
      setAuth(getStoredAuth());
      dispatch(fetchCart());
      navigate('/login');
    }
  }, [auth?.refreshToken, dispatch, navigate]);

  return (
    <nav className="navbar navbar-expand navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Shop</Link>
        <form className="d-flex me-auto" onSubmit={onSubmit}>
          <input className="form-control me-2" type="search" placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="btn btn-outline-primary" type="submit">Search</button>
        </form>
        <div className="d-flex align-items-center gap-3">
          {!auth?.token ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small">Signed in as {displayName}{role ? ` (${role})` : ''}</span>
              {dashboardLink && <Link to={dashboardLink.to} className="nav-link">{dashboardLink.label}</Link>}
              <button type="button" className="btn btn-link nav-link p-0" onClick={handleLogout}>Logout</button>
            </div>
          )}
          <Link to="/cart" className="btn btn-primary position-relative">
            Cart
            {count > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
