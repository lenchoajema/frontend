import React, { useState, useEffect } from "react";

const ProductForm = ({ onSubmit, editingProduct, isEditing, cancelEdit }) => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingProduct) {
      setProduct(editingProduct);
    } else {
      setProduct({ name: "", price: "", stock: "", description: "" });
    }
  }, [editingProduct]);

  const validate = () => {
    const newErrors = {};
    if (!product.name) newErrors.name = "Product name is required";
    if (!product.price || product.price <= 0)
      newErrors.price = "Price must be greater than zero";
    if (!product.stock || product.stock < 0)
      newErrors.stock = "Stock must be zero or more";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      onSubmit(product);
      setProduct({ name: "", price: "", stock: "", description: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{isEditing ? "Edit Product" : "Add Product"}</h2>
      <input
        type="text"
        name="name"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
        placeholder="Product Name"
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <input
        type="number"
        name="price"
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: e.target.value })}
        placeholder="Price"
      />
      {errors.price && <span className="error">{errors.price}</span>}

      <input
        type="number"
        name="stock"
        value={product.stock}
        onChange={(e) => setProduct({ ...product, stock: e.target.value })}
        placeholder="Stock"
      />
      {errors.stock && <span className="error">{errors.stock}</span>}

      <textarea
        name="description"
        value={product.description}
        onChange={(e) =>
          setProduct({ ...product, description: e.target.value })
        }
        placeholder="Description"
      />
      <button type="submit">
        {isEditing ? "Update Product" : "Add Product"}
      </button>
      {isEditing && <button onClick={cancelEdit}>Cancel</button>}
    </form>
  );
};
export default ProductForm;
