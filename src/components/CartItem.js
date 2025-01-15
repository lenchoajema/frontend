import React, { useState } from "react";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity: initialQuantity } = item; // Extract product and quantity from item
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(newQuantity);
    onUpdateQuantity(product._id, newQuantity); // Call callback to update quantity
  };

  return (
    <div className="cart-item">
      <p>Nothing is desplaying</p>
      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="cart-item-image"
      />
      <div className="cart-item-details">
        <h4>{product.name}</h4>
        <p>Price: ${product.price.toFixed(2)}</p>
        <div className="cart-item-quantity">
          <label htmlFor={`quantity-${product._id}`}>Qty:</label>
          <input
            type="number"
            id={`quantity-${product._id}`}
            value={quantity}
            onChange={handleChange}
            min="1"
            className="cart-item-input"
          />
        </div>
      </div>
      <div className="cart-item-actions">
        <button onClick={() => onRemove(product._id)} className="remove-button">
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
