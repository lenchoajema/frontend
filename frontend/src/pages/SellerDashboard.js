import React, { useState } from "react";
import ProductForm from "../components/ProductForm";
import SellerProductList from "../components/SellerProductList";
import useSellerProducts from "../hooks/useSellerProducts";
import "./SellerDashboard.css";
import api from "../services/api";

const SellerDashboard = () => {
  const { products, loading, error, fetchProducts, page, totalPages, setPage } = useSellerProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Add product
  const handleAddProduct = async (productData) => {
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("price", productData.price);
      formData.append("description", productData.description);
      formData.append("stock", productData.stock);

      if (productData.pictures && Array.isArray(productData.pictures)) {
        productData.pictures.forEach((file) => formData.append("pictures", file));
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.post("/products", formData, { headers });
      alert("Product added successfully!");

      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  // Update product
  const handleUpdateProduct = async (productData) => {
    try {
      console.log("productData", productData);
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("price", productData.price);
      formData.append("description", productData.description);
      formData.append("stock", productData.stock);
      productData._id=editingProduct._id;
      if (productData.pictures && Array.isArray(productData.pictures)) {
        productData.pictures.forEach((file) => formData.append("pictures", file));
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await api.put(`/products/seller/${productData._id}`, formData, { headers });
      alert("Product updated successfully!");

      // Refresh product list and reset editing state
      fetchProducts();
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
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
      <SellerProductList
        products={products}
        loading={loading}
        error={error}
        onEdit={(product) => {
          setIsEditing(true);
          setEditingProduct(product);
        }}
        onDelete={handleDeleteProduct}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
};

export default SellerDashboard;


/* import React, { useState } from "react";
import ProductForm from "../components/ProductForm";
import SellerProductList from "../components/SellerProductList";
import useSellerProducts from "../hooks/useSellerProducts";
import "./SellerDashboard.css";
import api from "../services/api";

const SellerDashboard = () => {
  const { products, loading, error, fetchProducts } = useSellerProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Add or update product
  const handleSaveProduct = async (productData, isUpdate = false) => {
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("price", productData.price);
      formData.append("description", productData.description);
      formData.append("stock", productData.stock);
  
      if (productData.pictures && Array.isArray(productData.pictures)) {
        productData.pictures.forEach((file) => formData.append("pictures", file));
        console.log("SDB product.pictures", productData.pictures);
      }
  
      if (isUpdate) {
        // Update existing product
        const token = localStorage.getItem("token");
        const response = await api.put(`/products/seller/${productData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("USP response", response);
        fetchProducts();
      } else {
        // Add new product
        await api.post("/products", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
  
      // Refresh product list after save
      fetchProducts();
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
      <ProductForm
        onSubmit={handleSaveProduct}
        editingProduct={editingProduct}
        isEditing={isEditing}
        cancelEdit={() => {
          setIsEditing(false);
          setEditingProduct(null);
        }}
      />
      <SellerProductList
        products={products}
        loading={loading}
        error={error}
        onEdit={(product) => {
          setIsEditing(true);
          setEditingProduct(product);
          isUpdate(true);
        }}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default SellerDashboard;
 */


/* import React, { useState } from "react";
import useSellerProducts from "../hooks/useSellerProducts";
import ProductForm from "../components/ProductForm";
import SellerProductList from "../components/SellerProductList";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  
  const { products,
     addProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  } = useSellerProducts(); 
  


  const [editingProduct, setEditingProduct] = useState(null);

  const handleFormSubmit = (product) => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("stock", product.stock);
    product.pictures.forEach((file) => formData.append("pictures", file));

    if (editingProduct) {
      updateProduct(editingProduct._id, formData);
      setEditingProduct(null);
    } else {
      addProduct(formData);
    }
  };

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
      <ProductForm
        onSubmit={handleFormSubmit}
        editingProduct={editingProduct}
        cancelEdit={() => setEditingProduct(null)}
      />
      <SellerProductList
        products={products}
        loading={loading}
        error={error}
        onEdit={(product) => setEditingProduct(product)}
        onDelete={deleteProduct}
      />
    </div>
  );
};

export default SellerDashboard; */



/* import React, { useState } from "react";
import useSellerProducts from "../hooks/useSellerProducts";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts } =
    useSellerProducts();
  const [editingProduct, setEditingProduct] = useState(null);

  const handleFormSubmit = (product) => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("stock", product.stock);
    product.pictures.forEach((file) => formData.append("pictures", file));

    if (editingProduct) {
      updateProduct(editingProduct._id, formData);
      setEditingProduct(null);
    } else {
      addProduct(formData);
    }
  };

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
      <ProductForm
        onSubmit={handleFormSubmit}
        editingProduct={editingProduct}
        cancelEdit={() => setEditingProduct(null)}
      />
      <ProductList
        products={products}
        onEdit={(product) => setEditingProduct(product)}
        onDelete={(id) => deleteProduct(id)}
        fetchProducts={fetchProducts}
      />
    </div>
  );
};

export default SellerDashboard; */





/* import React, { useState, useEffect } from "react";
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

export default SellerDashboard; */