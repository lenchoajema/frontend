import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { imageUrl } from '../utils/image';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (alive) setP(data);
      } catch (e) {
        setError(e.message || 'Failed to load product');
      } finally { setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;
  if (!p) return <div className="container py-4">Not found</div>;

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-6">
          {p.pictures && p.pictures[0] && (
            <img src={imageUrl(p.pictures[0])} alt={p.name} className="img-fluid" />
          )}
        </div>
        <div className="col-md-6">
          <h1 className="h4">{p.name}</h1>
          <div className="h5">${Number(p.price).toFixed(2)}</div>
          <p className="text-muted">{p.description}</p>
          <button className="btn btn-primary" onClick={() => dispatch(addToCart({ productId: p._id || p.id, quantity: 1 }))}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
