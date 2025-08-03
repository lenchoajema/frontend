import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const CartPage = () => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || "https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev";
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
     const navigate = useNavigate();
  
    // Fetch cart from backend
    const fetchCart = useCallback(async () => {
      setLoading(true);
      setError(""); // Reset any previous error
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
    }, [loading, error]);
  
    // Automatically fetch cart on component mount
    useEffect(() => {
      fetchCart();
    }, [fetchCart]);
    const handlecheckout = () => {
      navigate("/checkout", { state: { items: cart.items, total: cart.total } });
    };
  
  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
      await axios.delete(`/api/user/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.post(
        "/api/orders",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed successfully!");
      setCart({ items: [], total: 0 });
      console.log("Order placed:", response.data);
      
    } catch (error) {
      alert("Error placing order. Please try again.");
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
              {/* Product pictures */}
              <div style={{ display: "flex", gap: "5px" }}>
                { Array.isArray(item.pictures) && item.pictures.length > 0 ? (
                  item.pictures.slice(0, 5).map((picture, index) => {
                    const relativePath = picture.includes("uploads") ? picture.split("uploads").pop() : picture;
                    return (
                      <img
                        key={index}
                        title={relativePath.split('/').pop()}
                        src={`${axios.defaults.baseURL}/uploads/${relativePath}`}
                        alt={`${item.name}-${index}`}
                        className="product-image"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          border: "1px solid #ccc",
                        }}
                      />
                    );
                  })
                ) : (
                  <img
                    src="https://via.placeholder.com/50"
                    alt="Nothing available"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                )
                        
                        

             }
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
          <button onClick={placeOrder}>Place Order</button>
          <button onClick={fetchCart}>Refresh Cart</button>
          <button onClick={handlecheckout} style={styles.checkoutButton}>
        Checkout
      </button>
         </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

const styles = {
   checkoutButton: {
    marginTop: "20px",
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
export default CartPage;
