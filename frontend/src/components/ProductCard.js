import React from "react";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addToCart as addToCartThunk } from "../redux/cartSlice";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const serverBaseUrl = process.env.REACT_APP_BACKEND_URL || 'https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev';

  const [showViewCartButton, setShowViewCartButton] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  const handleAddToCart = async () => {
    try {
      // Dispatch addToCart thunk which calls backend and updates store
      const action = await dispatch(addToCartThunk({ productId: product._id, quantity: 1 }));
      if (action.error) {
        throw new Error(action.error.message || 'Failed to add to cart');
      }
      setMessage('Item added to cart');
      setShowViewCartButton(true);
      // auto-hide message after 2 seconds
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Add to cart failed', err);
      setMessage(err.message || 'Failed to add to cart');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleViewCart = () => { window.location.href = '/cart'; };

  return (
    <div className="product-card">
      <div className="product-images">
        {product.pictures && product.pictures.length > 0 ? (
          product.pictures.slice(0,1).map((picture, index) => {
            const relativePath = picture.includes('upload') ? picture.split('upload').pop() : picture;
            return (
              <img
                key={index}
                title={relativePath.split('/').pop()}
                src={`${serverBaseUrl}/upload${relativePath}`}
                alt={`${product.name}-${index}`}
                className="product-image"
              />
            );
          })
        ) : (
          <p>No images available</p>
        )}

        <Button variant="primary" onClick={handleAddToCart}>
          Add to Cart
        </Button>
        {showViewCartButton && (
          <Button variant="secondary" onClick={handleViewCart}>
            View Cart
          </Button>
        )}
        {message && <div className="cart-message">{message}</div>}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
