const express = require("express");
const { 
  placeOrder, 
  getOrderHistory, 
  getAllOrders,
  getOrderDetail, 
  updateOrderStatus 
} = require("../controllers/orderController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const { createOrder, captureOrder } = require('../controllers/orderController');

const router = express.Router();

// Customer Routes
router.post("/", authenticateUser, placeOrder); // Place an order
router.get("/", authenticateUser, getOrderHistory); // View order history
router.get("/:orderId",authenticateUser, getOrderDetail);


// Admin Routes
router.get("/admin", authenticateUser, authorizeRoles("admin"), getAllOrders); // Get all orders
router.put("/admin/:orderId", authenticateUser, authorizeRoles("admin"), updateOrderStatus); // Update order status


router.post('/create-order', createOrder); // Create PayPal order
router.post('/capture-order/:orderID', captureOrder); // Capture PayPal payment


module.exports = router;
