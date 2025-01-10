const Product = require('../models/productModel');

// Create a product
const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    // Extract seller ID from the authenticated user's token
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const seller = req.user.id;

    // Handle pictures if uploaded
    const pictures = req.files ? req.files.map((file) => file.path) : [];

    // Create the product
    const product = new Product({ name, price, description, stock, pictures, seller });
    console.log("backend create product", product);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;

    // Find the product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You cannot update this product.' });
    }

    // Handle pictures if uploaded
    if (req.files) {
      product.pictures = req.files.map((file) => file.path);
    }

    // Update other fields
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock !== undefined ? stock : product.stock;

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Get a single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
// Get all products by a specific seller
const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const products = await Product.find({ seller: sellerId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by seller', error: error.message });
  }
};
//const Product = require("../models/productModel");

const getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Ensure the seller ID is extracted from the authenticated user
    const sellerId = req.user.id;

    // Find products by the seller with pagination
    const products = await Product.find({ seller: sellerId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    // Get the total count of seller's products
    const totalProducts = await Product.countDocuments({ seller: sellerId });

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error("Error fetching seller products:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Export all product controller functions
module.exports = {
  getSellerProducts,
  createProduct,
  updateProduct,
  getProduct,
  getProducts,
  deleteProduct,
  getProductsBySeller,
};
