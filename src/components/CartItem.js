import React, { useState } from "react";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(newQuantity);
    onUpdateQuantity(item._id, newQuantity);
  };

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div>
        <h4>{item.name}</h4>
        <p>${item.price.toFixed(2)}</p>
      </div>
      <input type="number" value={quantity} onChange={handleChange} min="1" />
      <button onClick={() => onRemove(item._id)}>Remove</button>
    </div>
  );
};

export default CartItem;
