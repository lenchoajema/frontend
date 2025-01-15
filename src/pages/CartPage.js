import React, { useState, useEffect } from "react";
import axios from "axios";

const CartPage = () => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    // Fetch cart from backend
    const fetchCart = async () => {
      setLoading(true);
      setError(""); // Reset any previous error
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User is not authenticated. Please log in.");
        }
  
        const response = await axios.get("/api/user/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Cart Fetch Response:", response.data);
  
        // Set cart state with data from backend
        const { items, total } = response.data || { items: [], total: 0 };
        console.log("After response.data.items", items);
        setCart({ items, total });
      } catch (err) {
        console.error("Error fetching cart:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to fetch cart.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }

      if (loading) return <p>Loading...</p>;
      if (error) return <p style={{ color: "red" }}>{error}</p>;
    };
  
    // Automatically fetch cart on component mount
    useEffect(() => {
      fetchCart();
    }, []);
  
 
  

  const getImageUrl = (images) => {
    if (images && images.length > 0) {
      return `${axios.defaults.baseURL}/uploads/${images[0]}`;
    }
    return "https://via.placeholder.com/150"; // Fallback to a placeholder image
  };

  /* const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
      }
  
      // Send PUT request to update cart
      const response = await axios.put(
        `/api/user/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Response from backend:", response.data);
  
      // Update cart from the backend response
      const updatedCart = response.data.cart;
      if (!updatedCart) {
        throw new Error("No cart data returned from backend.");
      }
  
      setCart(updatedCart);
    } catch (err) {
      console.error("Error updating quantity:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update item quantity.";
      alert(errorMessage);
    }
  }; */
  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
      }
  
      // Send PUT request to update cart
      const response = await axios.put(
        `/api/user/cart/${productId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Response from backend:", response.data);
  
      // Check if the response contains the updated cart
      if (response.data.cart) {
        setCart(response.data.cart);
      } else {
        throw new Error("No cart data returned from backend.");
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update item quantity.";
      alert(errorMessage);
    }
  };
  
  
  const removeItem = async (productId) => {
    try {
      await axios.delete(`/api/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setCart((prevCart) => {
        const updatedItems = prevCart.items.filter((item) => item.productId !== productId);
        const updatedTotal = updatedItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        return { ...prevCart, items: updatedItems, total: updatedTotal };
      });
    } catch (err) {
      alert("Error removing item. Please try again.");
    }
  };

 

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cart && cart.items.length > 0 ? (
        <div>
          {cart.items.map((item) => (
            <div
              key={item.productId}
              style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}
            >
              {/* Product Images */}
              <div style={{ display: "flex", gap: "5px" }}>
                {item.images && item.images.length > 0 ? (
                  item.images.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl([image])}
                      alt={`Product image ${index + 1}`}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                      }}
                    />
                  ))
                ) : (
                  <img
                    src="https://via.placeholder.com/50"
                    alt="No image available"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                )}
              </div>

              {/* Product Details */}
              <h2>{item.name}</h2>
              <p>Price: ${item.price.toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>

              {/* Update and Remove Buttons */}
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              <button
                onClick={() =>
                  item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)
                }
              >
                -
              </button>
              <button onClick={() => removeItem(item.productId)}>Remove</button>
            </div>
          ))}
          <h3>Total: ${cart.total.toFixed(2)}</h3>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default CartPage;
