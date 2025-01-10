// ./routes/user/cartRoutes.js
const express = require("express");
const router = express.Router();
const { addToCart, getCart, removeFromCart } = require("../../controllers/cartController");
const { authenticateUser } = require("../../middleware/authMiddleware");

// Add item to cart
router.post("/", authenticateUser, addToCart);

// Get cart items
router.get("/", authenticateUser, getCart);

// Remove item from cart
router.delete("/:itemId", authenticateUser, removeFromCart);

module.exports = router;
