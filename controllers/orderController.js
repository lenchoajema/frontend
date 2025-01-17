const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const redisClient = require("../utils/redisClient");
const mongoose = require("mongoose");

/* exports.placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // Retrieve cart from Redis
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);

    if (!cartData) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const cart = JSON.parse(cartData);

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Start a transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate product availability and prepare stock update operations
      const bulkOperations = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product: ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        bulkOperations.push({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { stock: -item.quantity } },
          },
        });
      }

      // Execute stock updates in bulk
      await Product.bulkWrite(bulkOperations, { session });

      // Create order
      const order = new Order({
        user: userId,
        items: cart.items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          pictures: item.pictures,
        })),
        total: cart.total,
      });

      await order.save({ session });

      // Clear cart in Redis
      await redisClient.del(cartKey);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      message: "Error placing order",
      error: error.message,
    });
  }
}; */
exports.placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // Retrieve cart from Redis
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    console.log("Starting placeOrder", cartData);

    if (!cartData) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const cart = JSON.parse(cartData);

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate product availability and update stock atomically
    const bulkOperations = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      console.log("product validated")
      if (!product) {
        console.log("Product not found");
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        console.log("Insufficient Stock");
        return res.status(400).json({
          message: `Insufficient stock for product: ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } },
        }, 
      });
      console.log("under bulk push operation", bulkOperations[bulkOperations.length - 1].updateOne.filter, bulkOperations[bulkOperations.length - 1].updateOne.update);
    }

    // Execute stock updates in bulk
    await Product.bulkWrite(bulkOperations);
    console.log("After Bulk write operation Executed stock updates in bulk");
    // Create the order
    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        productId: item.productId, // Ensure this field exists and is passed correctly
        quantity: item.quantity,
        price: item.price,
        pictures: item.pictures,
      })),
      total: cart.total,
    });
    console.log("Creating the order ", order);
    await order.save();
    console.log("order is created");
    // Clear cart in Redis
    await redisClient.del(cartKey);
    console.log("cart cleared");
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      message: "Error placing order",
      error: error.message,
    });
  }
};


// Get order history for a specific user
exports.getOrderHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({ user: userId }).populate({ path: "items.product", strictPopulate: false });
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user." });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error retrieving order history:", error);
    res.status(500).json({ message: "Error retrieving order history", error: error.message });
  }
};

// Get all orders (Admin functionality)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product user");
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error retrieving all orders:", error);
    res.status(500).json({ message: "Error retrieving orders", error: error.message });
  }
};

          // Update order status (Admin functionality)
          exports.updateOrderStatus = async (req, res) => {
            const { orderId } = req.params;
            const { status } = req.body;

            try {
              const order = await Order.findById(orderId);

              if (!order) {
                return res.status(404).json({ message: "Order not found." });
              }

              order.status = status;
              await order.save();

              // Clear order cache to ensure updated details
              const cacheKey = `order:${orderId}`;
              await redisClient.del(cacheKey);

              res.status(200).json({ message: "Order status updated successfully.", order });
            } catch (error) {
              console.error("Error updating order status:", error);
              res.status(500).json({ message: "Error updating order status.", error: error.message });
            }
          };

    // Fetch order details
    exports.getOrderDetail = async (req, res) => {
      const userId = req.user.id; // Assuming `req.user` contains authenticated user info
      const { orderId } = req.params;

      try {
        // Validate input
        if (!orderId) {
          return res.status(400).json({ message: "Order ID is required." });
        }

        // Check if order details exist in Redis cache
        const cacheKey = `order:${orderId}`;
        const cachedOrder = await redisClient.get(cacheKey);

        if (cachedOrder) {
          console.log("Cache hit - Returning order from Redis");
          return res.status(200).json(JSON.parse(cachedOrder));
        }

        // Fetch the order from the database
        const order = await Order.findOne({ _id: orderId, user: userId }).populate({path: "items.product", strictPopulate: false,});

        if (!order) {
          return res.status(404).json({ message: "Order not found." });
        }

        // Structure the response
        const orderDetails = {
          orderId: order._id,
          userId: order.user,
          items: order.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            pictures: item.pictures,
            quantity: item.quantity,
            subtotal: item.quantity * item.price,
          })),
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };

        // Store the order details in Redis cache for future requests
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(orderDetails)); // Cache expires in 1 hour
        console.log("Cache hit Returning order from Redis", orderDetails)
        res.status(200).json(orderDetails);
      } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ message: "Error fetching order details.", error: error.message });
      }
    };
