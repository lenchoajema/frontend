import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/products?limit=24');
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || res.data?.items || []);
        if (mounted) setProducts(list);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
                <img src={p.pictures[0]} className="card-img-top" alt={p.name} style={{objectFit:'cover',height:140}} />
              ) : (
                <div className="bg-light" style={{height:140}} />
              )}
              <div className="card-body p-2">
                <div className="small text-truncate" title={p.name}>{p.name}</div>
                <div className="fw-bold">${Number(p.price).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
