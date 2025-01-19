import React from "react";
//import "./ProductList.css";

const ProductList = ({ products, onEdit, onDelete }) => {
  return (
    <div className="product-list">
      {products.length === 0 ? (
        <p>No products available</p>
      ) : (
        products.map((product) => (
          <div key={product._id} className="product-item">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => onEdit(product)} className="edit-button">
              Edit
            </button>
            <button onClick={() => onDelete(product._id)} className="delete-button">
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductList;



/* import React from "react";

const ProductList = ({ products, onEdit, onDelete }) => {
  return (
    <div className="product-list">
      <h2>My Products</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>{product.description}</td>
              <td>
                <button onClick={() => onEdit(product)}>Edit</button>
                <button onClick={() => onDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
 */