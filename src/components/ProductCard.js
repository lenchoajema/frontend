/*import React from "react";
import PropTypes from "prop-types";
import { Card, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { Link } from "react-router-dom"; // Use `Link` for navigation

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };
 

  const getpictures = () => {
    if (product.pictures && product.pictures.length > 0) {
      // Assuming product.pictures contains filenames, not full paths
      return `${product.pictures[0]}`;
    }
    return "https://via.placeholder.com/150"; // Fallback to a placeholder image
  };
  
  return (
    <Card style={{ width: "18rem" }}>
     <img variant="top" src={getpictures()} alt={product.name} />
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Text>{product.description}</Card.Text>
        <Card.Text>
          <strong>${product.price}</strong>
        </Card.Text>
        <Button variant="primary" onClick={handleAddToCart}>
          Add to Cart
        </Button>
        
        <Link to={`/user/product/${product._id}`} className="btn btn-secondary">
          Detail View
        </Link>
      </Card.Body>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    pictures: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default ProductCard;
*/
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const serverBaseUrl = "http://localhost:5000"; // Base URL of your backend

  return (
    <div className="product-card">
      <div className="product-images">
        {product.pictures && product.pictures.length > 0 ? (
          product.pictures.map((picture, index) => {
            // Extract the relative path if the full path is passed
            const relativePath = picture.split(serverBaseUrl).pop() || picture;

            return (
              <img
                key={index}
                src={`${serverBaseUrl}/${relativePath}`} // Ensure the full URL is reconstructed
                alt={`${product.name}-${index}`}
                className="product-image"
              />
            );
          })
        ) : (
          <p>No images available</p>
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
