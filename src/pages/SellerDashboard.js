import React, { useState, useEffect } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
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
        const response = await api.get("/seller/products");
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
      const response = await api.post("/seller/products", newProduct);
      setProducts([...products, response.data]);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  // Update an existing product
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const response = await api.put(
        `/seller/products/${updatedProduct._id}`,
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
      await api.delete(`/seller/products/${id}`);
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
