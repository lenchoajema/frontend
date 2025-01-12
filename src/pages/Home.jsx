import React, { useEffect, useState } from "react";
import "./styles.css";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
        console.log("Products:", response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = () => {
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredProducts.length === 0) {
      alert("No product with this name");
    }
    setProducts(filteredProducts);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to Our E-Commerce Store</h1>
        <p>Discover the best products at unbeatable prices!</p>
        <button className="cta-btn">Shop Now</button>
      </section>

      {/* Search Section */}
      <section className="search">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
