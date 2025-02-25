import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const useSellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await api.get("/products/seller/product", {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response",response);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setError("");
    } catch (err) {
      setError("Failed to fetch products.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch products automatically on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page]);

  /* const addProduct = useCallback(async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/products", formData, {
        headers: { Authorization: `Bearer ${token}` },
      }); 
      alert("Item is created");
      setProducts((prev) => (Array.isArray(prev) ? [...prev, response.data] : [response.data]));
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  }, []);
 */
  /*const updateProduct = useCallback(async (id, formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/products/seller/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      }); 
      console.log("USP response",response);
      setProducts((prev) =>
        prev.map((product) => (product._id === id ? response.data : product))
      );
      
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  }, []); */

  const deleteProduct = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }, []);

  return {
    products,
    fetchProducts,
   // addProduct,
    //updateProduct,
    deleteProduct,
    loading,
    error,
    page,
    setPage: (newPage) => setPage(newPage),
    totalPages
  };
};

export default useSellerProducts;
