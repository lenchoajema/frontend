import React, { useState, useEffect } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/SellerProductList";
import api from "../services/api";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch seller's products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Add a new product
  const handleAddProduct = async (newProduct) => {
    try {
      const response = await api.post("/products", newProduct);
      setProducts([...products, response.data]);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  // Update an existing product
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const response = await api.put(
        `/products/${updatedProduct._id}`,
        updatedProduct
      );
      setProducts(
        products.map((product) =>
          product._id === updatedProduct._id ? response.data : product
        )
      );
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
      <ProductForm
        onSubmit={isEditing ? handleUpdateProduct : handleAddProduct}
        editingProduct={editingProduct}
        isEditing={isEditing}
        cancelEdit={() => {
          setIsEditing(false);
          setEditingProduct(null);
        }}
      />
      <ProductList
        products={products}
        onEdit={(product) => {
          setIsEditing(true);
          setEditingProduct(product);
        }}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default SellerDashboard;

// SellerDashboard.js

/*import React, { useState } from 'react';
import axios from '../services/api'; // Import Axios instance for API calls
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const SellerDashboard = () => {
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [message, setMessage] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Retrieve JWT token

      // Make API call to create a product
      const response = await axios.post('/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(`Product created successfully: ${response.data.name}`);
      setFormData({ name: '', price: '', description: '' }); // Reset form
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'An error occurred while creating the product'
      );
    }
  };
const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const response = await api.get('/products/my-products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch your products.');
      }
    };

    fetchSellerProducts();
  }, []);
  return (
    <div>
      <h1>Seller Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Product</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SellerDashboard;
/*
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch your products.');
      }
    };

    fetchSellerProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Retrieve JWT token

      // Make API call to create a product
      const response = await api.post('/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(`Product created successfully: ${response.data.name}`);
      setFormData({ name: '', price: '', description: '' }); // Reset form

      // Update the product list with the new product
      setProducts((prevProducts) => [...prevProducts, response.data]);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'An error occurred while creating the product'
      );
    }
  };

  return (
    <div>
      <h1>Seller Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Product</button>
      </form>
      {message && <p>{message}</p>}

      <h2>My Products</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;*/