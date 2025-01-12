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
        const response = await api.get('/products/seller/product', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                 });
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
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("description", newProduct.description);
      formData.append("stock", newProduct.stock);
    
      if (newProduct.pictures && Array.isArray(newProduct.pictures)) {
        newProduct.pictures.forEach((file, index) => {
          formData.append(`pictures`, file); // Field name must match backend expectations
        });
        console.log("newProduct pictures:", newProduct.pictures);
      } else {
        console.warn("Pictures array is empty or not set.");
      }
    
      const response = await api.post("/products", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
    
      setProducts([...products, response.data]);
      console.log("response.data:", response.data);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
    
  };

  // Update an existing product
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const formData = new FormData();
      formData.append("name", updatedProduct.name);
      formData.append("price", updatedProduct.price);
      formData.append("description", updatedProduct.description);
      formData.append("stock", updatedProduct.stock);
      updatedProduct.pictures.forEach((file) => formData.append("pictures", file));

      const response = await api.put(
        `/products/${updatedProduct._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
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
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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