import React, { useState } from "react";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity: initialQuantity } = item; // Use destructuring if item contains a product object
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(newQuantity);
    onUpdateQuantity(product._id, newQuantity);
  };

  return (
    <div className="cart-item">
      <img src={product.image || "/placeholder.png"} alt={product.name} />
      <div className="cart-item-details">
        <h4>{product.name}</h4>
        <p>${product.price.toFixed(2)}</p>
      </div>
      <div className="cart-item-actions">
        <input
          type="number"
          value={quantity}
          onChange={handleChange}
          min="1"
          onBlur={(e) => {
            if (!e.target.value || parseInt(e.target.value, 10) <= 0) {
              setQuantity(1);
              onUpdateQuantity(product._id, 1);
            }
          }}
        />
        <button onClick={() => onRemove(product._id)}>Remove</button>
      </div>
    </div>
  );
};

export default CartItem;
