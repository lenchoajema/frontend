import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './SellerProductList.css';

const SellerProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('products/seller/product', {
          params: { page },
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setError('');
      } catch (error) {
        setError('Error fetching seller products');
        console.error('Error fetching seller products:', error);
      }
      setLoading(false);
    };

    fetchSellerProducts();
  }, [page]);

  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
     const resp = await api.delete(`products/seller/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Delete product response:', resp.data);
          alert('Product deleted successfully');
      
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      setError('Error deleting product');
      console.error('Error deleting product:', error);
    }
  };
  const serverBaseUrl = "http://localhost:5000"; // Base URL of your backend

  return (
    <div className="seller-product-list">
      <h1>Your Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div>
          {products.length === 0 ? (
            <p>No products to display.</p>
          ) : (
            products.map((product) => (
              <div key={product._id} className="product-item">
                <div className="product-details">
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
                  {/* <img
                    src={product.pictures[0]}
                    alt={product.name}
                    className="product-image"
                  /> */}
                  <div>
                    <h3>{product.name}</h3>
                    <p>${product.price}</p>
                    <p><strong>Stock:</strong> {product.stock}</p>
                    <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => deleteProduct(product._id)} className="delete-button">
                  Delete
                </button>
              </div>
            ))
          )}
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="pagination-button">
              Previous
            </button>
            <span>{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagination-button">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductList;
