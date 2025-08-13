const User = require("../models/User");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// List all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// List all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

// Delete a user by ID
const deleteUser = async ({ params: { id } }, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(id); // Find the user by ID
    if (user) {
      await User.deleteOne({ _id: id }); // Delete the user by ID
    }
    if (!user) {
      console.error("Error deleting user with ID:", id, error);
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  
 } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

// Delete a product by ID
const deleteProduct = async ({ params: { id } }, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const product = await Product.findById(id); // Find the product by ID
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await Product.deleteOne({ _id: id }); // Delete the product by ID
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product." });
  }
};

module.exports = { getAllUsers, getAllProducts, deleteUser, deleteProduct };