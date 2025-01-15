/* // ./routes/user/cartRoutes.js
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
 */
const express = require("express");
const redisClient = require("../../utils/redisClient");
const { authenticateUser } = require("../../middleware/authMiddleware");
const Product = require("../../models/productModel"); // Import product model
const router = express.Router();

// Add item to cart with product validation

router.post("/", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    // Validate quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than zero." });
    }

    // Check if the product exists in the database and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${product.stock} units available for this product.`,
      });
    }

    // Fetch existing cart from Redis
    const cartKey = `cart:${userId}`;
    let cart = JSON.parse(await redisClient.get(cartKey)) || { items: [], total: 0 };

    // Check if the product is already in the cart
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex !== -1) {
      // If the product already exists in the cart, update its quantity
      cart.items[itemIndex].quantity += quantity;

      // Ensure updated quantity doesn't exceed stock
      if (cart.items[itemIndex].quantity > product.stock) {
        return res.status(400).json({
          message: `Adding this quantity exceeds available stock. Only ${product.stock} units allowed.`,
        });
      }
    } else {
      // Add new product to the cart
      cart.items.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    // Recalculate the total price for the cart
    cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Save the updated cart to Redis
    await redisClient.set(cartKey, JSON.stringify(cart));

    res.status(201).json({
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      message: "Error adding product to cart.",
      error: error.message,
    });
  }
});


/* router.post("/", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    // Check if the product exists and is available
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} units available for this product`,
      });
    }

    // Fetch existing cart from Redis
    const cartKey = `cart:${userId}`;
    let cart = JSON.parse(await redisClient.get(cartKey)) || { items: [], total: 0 };

    // Check if product is already in the cart
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;

      if (cart.items[itemIndex].quantity > product.stock) {
        return res.status(400).json({
          message: `Cannot add more than ${product.stock} units to the cart`,
        });
      }
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image, // Assuming your product model has an image field
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Save updated cart to Redis
    await redisClient.set(cartKey, JSON.stringify(cart));
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
}); */



// Get cart
router.get("/", authenticateUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const cartKey = `cart:${userId}`;
    const cart = JSON.parse(await redisClient.get(cartKey)) || { items: [], total: 0 };
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart", error: error.message });
  }
});

// Remove item from cart
router.delete("/:productId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const cartKey = `cart:${userId}`;
    let cart = JSON.parse(await redisClient.get(cartKey)) || { items: [], total: 0 };

    // Filter out the product to be removed
    cart.items = cart.items.filter((item) => item.productId !== productId);

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Save updated cart to Redis
    await redisClient.set(cartKey, JSON.stringify(cart));
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
});
// Modify item quantity in the cart
router.put("/:productId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    // Check if the product exists in the database and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${product.stock} units available for this product.`,
      });
    }

    // Fetch existing cart from Redis
    const cartKey = `cart:${userId}`;
    let cart = JSON.parse(await redisClient.get(cartKey)) || { items: [], total: 0 };

    // Find the product in the cart
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    // Update the cart item quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate the total price for the cart
    cart.total = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Save the updated cart back to Redis
    await redisClient.set(cartKey, JSON.stringify(cart));

    res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      message: "Error updating cart",
      error: error.message,
    });
  }
});

module.exports = router;
