const express = require("express");
const { getAllUsers, getAllProducts, deleteUser, deleteProduct } = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Routes
router.get("/users", authenticateUser, isAdmin, getAllUsers); // List all users
router.get("/products", authenticateUser, isAdmin, getAllProducts); // List all products
router.delete("/users/:id", authenticateUser, isAdmin, deleteUser); // Delete a user
router.delete("/products/:id", authenticateUser, isAdmin, deleteProduct);

module.exports = router;
