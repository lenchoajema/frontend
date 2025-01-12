import React, { useState } from 'react';
import axios from 'axios';

const ProductSearch = () => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/api/products/search?query=${query}`);
            setProducts(response.data);
        } catch (err) {
            setError('Error fetching products');
        }
        setLoading(false);
    };

    return (
        <div className="product-search">
            <input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="product-list">
                {products.length === 0 && !loading && <p>No products found</p>}
                {products.map((product) => (
                    <div key={product._id} className="product-item">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>${product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSearch;
