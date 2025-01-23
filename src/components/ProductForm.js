import React, { useState, useEffect } from "react";

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '400px',
  margin: '0 auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#f9f9f9'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '16px'
};

const textareaStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '16px',
  minHeight: '100px'
};

const fileInputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  fontSize: '16px'
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#007bff',
  color: '#fff',
  fontSize: '16px',
  cursor: 'pointer'
};

const ProductForm = ({ onSubmit, editingProduct, isEditing, cancelEdit }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [pictures, setPictures] = useState([]);
  
  useEffect(() => {
    if (isEditing && editingProduct) {
      setName(editingProduct.name);
      setPrice(editingProduct.price);
      setDescription(editingProduct.description);
      setStock(editingProduct.stock);
      setPictures(editingProduct.pictures || []);
    }
  }, [isEditing, editingProduct]);

  const handleFileChange = (event) => {
    setPictures([...event.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = { name, price, description, stock, pictures };
    onSubmit(newProduct);
    setName("");
    setPrice("");
    setDescription("");
    setStock("");
    setPictures([]);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3>{isEditing ? "Edit Product" : "Add Product"}</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        required
        style={inputStyle}
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        required
        style={inputStyle}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={textareaStyle}
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Stock Quantity"
        required
        style={inputStyle}
      />
      <input
        type="file"
        name="pictures"
        multiple
        onChange={handleFileChange}
        accept="image/*"
        style={fileInputStyle}
      />
      {isEditing && (
        <input
          type="text"
          name="_id"
          value={editingProduct._id}
          readOnly
          style={{ ...inputStyle, backgroundColor: '#e9ecef' }}
        />
      )}
      <button type="submit" style={buttonStyle}>{isEditing ? "Update Product" : "Add Product"}</button>
      {isEditing && <button type="button" onClick={cancelEdit} style={buttonStyle}>Cancel</button>}
    </form>
  );
};

export default ProductForm;
