const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const redisClient = require("../utils/redisClient");

exports.placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // Retrieve cart from Redis
    const cartKey = `cart:${userId}`;
    const cart = JSON.parse(await redisClient.get(cartKey));

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate product availability and reduce stock
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${item.name}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cart.total,
    });

    await order.save();

    // Clear cart
    await redisClient.del(cartKey);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};
exports.getOrderHistory = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const orders = await Order.find({ user: userId }).populate("items.product");
      res.status(200).json({ orders });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving order history", error: error.message });
    }
  };
  exports.getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find().populate("items.product user");
      res.status(200).json({ orders });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders", error: error.message });
    }
  };
  
  exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
  
    try {
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.status = status;
      await order.save();
  
      res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
      res.status(500).json({ message: "Error updating order status", error: error.message });
    }
  };
  