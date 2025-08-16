import React, { useState } from "react";
import api from "../services/api";

const ProductTable = ({ products, onDeleteProduct }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/admin/products", newProduct);
      console.log("New product added:", response.data); // Log or use the response data
      setNewProduct({ name: "", price: "", stock: "" });
      alert("Product added successfully!");
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  return (
    <div>
      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => onDeleteProduct(product._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAddProduct} className="add-product-form">
        <h3>Add New Product</h3>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default ProductTable;
