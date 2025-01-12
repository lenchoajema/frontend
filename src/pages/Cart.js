import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart, removeFromCart } from "../redux/cartSlice";
import CartItem from "../components/CartItem";

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    console.log("Cart items:", items);
    
  }, [items]);

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  if (loading) {
    return <p>Loading your cart...</p>;
  }

  if (error) {
    return <p>Error fetching cart: {error.message}</p>;
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      {items && items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            <p></p>
            {items.map((item) => (
              item && item.product && item.product._id ? (
                <CartItem
                  key={item.product._id}
                  item={item}
                  onRemove={handleRemoveItem}
                />
              ) : (
                <p key={item._id || Math.random()}>Invalid product</p>
              )
            ))}
          </div>

          <h3>Total: ${total.toFixed(2)}</h3>
        </>
      )}
    </div>
  );
};

export default Cart;
