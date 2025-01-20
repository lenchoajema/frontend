import React from "react";
import { Button } from "react-bootstrap";
//import { addToCart } from "../redux/cartSlice";
//import { useDispatch } from "react-redux";
import axios from "axios";
import "./ProductCard.css";
//import cartItem from "./CartItem";

const ProductCard = ({ product }) => {
  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const serverBaseUrl = "http://localhost:5000"; // Base URL of your backend
  //const dispatch = useDispatch();
  const handleAddToCart = async () => {
    try {
      const response = await addToCart(product._id, 1); // Add 1 quantity
      console.log("Cart updated:", response);
      alert("Item added to cart!"); 
      //const response = await dispatch(addToCart({  productId: product._id, quantity: 1 }));
      if (response) {
        console.log("Product added to cart:", { productId: product._id, quantity: 1 });
        setShowViewCartButton(true);
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };
  //
  const addToCart = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        throw new Error("User is not authenticated");
      }
      console.log("token1", token);
      const response = await axios.post("/api/user/cart", {
        productId,
        quantity,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });// Add token in the Authorization header);
      console.log("Item added to cart:", response.data);
      
      return response.data.cart; // Return updated cart if needed
    } catch (error) {
      console.error("Error adding item to cart:", error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || "Failed to add item to cart");
    }
  };
  
  const [showViewCartButton, setShowViewCartButton] = React.useState(false);

  const handleViewCart = () => {
    // Logic to navigate to the cart page
    console.log("Navigating to cart page");
    // Navigate to the cart page
    window.location.href = "/cart";
  }
  
  return (
    <div className="product-card">
      <div className="product-images">
                          {product.pictures && product.pictures.length > 0 ? (
                            product.pictures.map((picture, index) => {
                              // Extract the last folder, which is 'upload'
                              const relativePath = picture.includes("upload") ? picture.split("upload").pop() : picture;
                              if (index === 0) {
                               // console.log("relativePath", relativePath);
                                return (
                                <img
                                  key={index}
                                  title={relativePath.split('/').pop()}
                                  src={`${serverBaseUrl}/upload${relativePath}`} // Ensure the full URL is reconstructed
                                  alt={`${product.name}-${index}`}
                                  className="product-image"
                                />
                                );
                                
                                


                              }
                              return null;
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
             </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </div>
    </div>
  );
};


export default ProductCard;
