const express = require("express");
const { 
  placeOrder, 
  getOrderHistory, 
  getAllOrders, 
  updateOrderStatus 
} = require("../controllers/orderController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer Routes
router.post("/", authenticateUser, placeOrder); // Place an order
router.get("/", authenticateUser, getOrderHistory); // View order history

// Admin Routes
router.get("/admin", authenticateUser, authorizeRoles("admin"), getAllOrders); // Get all orders
router.put("/admin/:orderId", authenticateUser, authorizeRoles("admin"), updateOrderStatus); // Update order status

module.exports = router;
