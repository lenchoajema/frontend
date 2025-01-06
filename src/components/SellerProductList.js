import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SellerProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/seller/products', { params: { page } });
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching seller products:', error);
      }
      setLoading(false);
    };

    fetchSellerProducts();
  }, [page]);

  const deleteProduct = async (productId) => {
    try {
      await api.delete(`/seller/product/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div>
      <h1>Your Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {products.map((product) => (
            <div key={product._id}>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button onClick={() => deleteProduct(product._id)}>Delete</button>
            </div>
          ))}
          <div>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductList;
