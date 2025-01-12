import React, { useEffect, useState } from "react";
import "./styles.css";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
        setAllProducts(response.data);
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
    if (!searchTerm && !selectedCategory) {
      setProducts(allProducts);
      return;
    }

    const filteredProducts = allProducts.filter((product) => {
      const matchesSearchTerm = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      return matchesSearchTerm && matchesCategory;
    });

    if (filteredProducts.length !== 0) {
      setProducts(filteredProducts);
    } else {
      alert("No products match the search criteria.");
    }
  };

  const handleCancel = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setProducts(allProducts);
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

      {/* Search and Filter Section */}
      <section className="search">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home</option>
        </select>
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleCancel}>Cancel</button>
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
