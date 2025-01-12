import React from "react";
import { Button } from "react-bootstrap";
import { addToCart } from "../redux/cartSlice";
import { useDispatch } from "react-redux";
import "./ProductCard.css";
import cartItem from "./CartItem";

const ProductCard = ({ product }) => {
  const serverBaseUrl = "http://localhost:5000"; // Base URL of your backend
  const dispatch = useDispatch();
  const handleAddToCart = async () => {
    try {
      const response = await dispatch(addToCart({ productId: product._id, quantity: 1 }));
      if (response.meta.requestStatus === 'fulfilled') {
        console.log("Product added to cart:", { productId: product._id, quantity: 1 });
        setShowViewCartButton(true);
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error);
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
              console.log("relativePath", relativePath);
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
