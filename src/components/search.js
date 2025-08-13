import React, { useState } from 'react';
import axios from 'axios';

const ProductSearchWithFilters = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [rating, setRating] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/api/products/search', {
                params: { query, category, minPrice, maxPrice, rating },
            });
            setProducts(response.data);
        } catch (err) {
            setError('Error fetching products');
        }
        setLoading(false);
    };

    return (
        <div className="product-search">
            <h2>Search Products</h2>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search for products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home</option>
                </select>
                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Minimum Rating (1-5)"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="product-list">
                {products.length === 0 && !loading && <p>No products found</p>}
                {products.map((product) => (
                    <div key={product._id} className="product-item">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>${product.price}</p>
                        <p>Rating: {product.rating}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSearchWithFilters;
