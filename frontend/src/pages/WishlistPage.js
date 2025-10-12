import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const handleRemove = (productId) => {
    if (window.confirm('Remove this item from your wishlist?')) {
      dispatch(removeFromWishlist(productId));
    }
  };

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(removeFromWishlist(product._id));
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      dispatch(clearWishlist());
    }
  };

  if (!user) {
    return (
      <div className="container py-5">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-heart text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">Sign in to view your wishlist</h4>
            <p className="text-muted">Save items you love for later</p>
            <Link to="/login" className="btn btn-primary mt-3">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="bi bi-heart-fill text-danger me-2"></i>
              My Wishlist ({items?.length || 0})
            </h2>
            {items && items.length > 0 && (
              <button className="btn btn-outline-danger" onClick={handleClearWishlist}>
                <i className="bi bi-trash me-2"></i>
                Clear Wishlist
              </button>
            )}
          </div>
        </div>
      </div>

      {!items || items.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-heart text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">Your wishlist is empty</h4>
            <p className="text-muted">Start adding products you love!</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div key={item._id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="position-relative">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.pictures?.[0] || '/placeholder.png'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                    </Link>
                    <button
                      className="btn btn-light position-absolute top-0 end-0 m-2"
                      onClick={() => handleRemove(product._id)}
                      title="Remove from wishlist"
                    >
                      <i className="bi bi-x-circle text-danger"></i>
                    </button>
                    {product.stock === 0 && (
                      <div className="position-absolute top-0 start-0 m-2">
                        <span className="badge bg-danger">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
                      <h5 className="card-title">{product.name}</h5>
                    </Link>
                    
                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="mb-2">
                        <div className="d-inline-flex align-items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`bi bi-star${star <= Math.round(product.rating) ? '-fill' : ''}`}
                              style={{ color: '#ffc107', fontSize: '0.9rem' }}
                            ></i>
                          ))}
                          <span className="ms-2 text-muted small">
                            ({product.numReviews || 0})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mb-2">
                      <h4 className="text-primary mb-0">${product.price?.toFixed(2)}</h4>
                    </div>

                    <div className="mb-2">
                      <small className="text-muted">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="mt-auto d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <i className="bi bi-cart-plus me-2"></i>
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <Link
                        to={`/products/${product._id}`}
                        className="btn btn-outline-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {items && items.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-4">You might also like</h4>
          <div className="alert alert-info">
            <i className="bi bi-lightbulb me-2"></i>
            Based on your wishlist, we recommend checking out our featured products!
          </div>
        </div>
      )}
    </div>
  );
}
