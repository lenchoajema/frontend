import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { addToCart } from '../redux/cartSlice';
import { imageUrl } from '../utils/image';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [params] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const q = params.get('q');
        const query = new URLSearchParams({ limit: 24, ...(q ? { q } : {}) }).toString();
        const res = await api.get('/products?' + query);
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || res.data?.items || []);
        if (mounted) setProducts(list);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params]);

  if (loading) return <div className="container py-4">Loading products…</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Products</h1>
      <div className="row g-3">
        {Array.isArray(products) && products.map((p) => (
          <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={p._id || p.id}>
            <div className="card h-100">
              {p.pictures && p.pictures[0] ? (
                <img src={imageUrl(p.pictures[0])} className="card-img-top" alt={p.name} style={{objectFit:'cover',height:140}} />
              ) : (
                <div className="bg-light" style={{height:140}} />
              )}
              <div className="card-body p-2">
                <Link className="small text-truncate d-block text-decoration-none" to={`/product/${p._id || p.id}`} title={p.name}>{p.name}</Link>
                <div className="fw-bold">${Number(p.price).toFixed(2)}</div>
                <button className="btn btn-sm btn-primary mt-2" onClick={() => dispatch(addToCart({ productId: p._id || p.id, quantity: 1 }))}>Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
