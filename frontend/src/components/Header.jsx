import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);
  const [q, setQ] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    navigate('/?' + params.toString());
  };
  const count = (cart.items || []).reduce((a, i) => a + (i.quantity || 0), 0);
  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);
  return (
    <nav className="navbar navbar-expand navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Shop</Link>
        <form className="d-flex me-auto" onSubmit={onSubmit}>
          <input className="form-control me-2" type="search" placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="btn btn-outline-primary" type="submit">Search</button>
        </form>
        <div className="d-flex gap-3">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
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
