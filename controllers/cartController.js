// ./controllers/cartController.js
const Cart = require("../models/Cart"); // Assuming a Cart model exists

// Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to add item to cart", error: error.message });
  }
};

// Get cart items
exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", items: [] });
    }

    res.status(200).json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve cart", error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
  }
};



/*const Cart = require('../models/Cart');
const Product = require('../models/productModel');

// Fetch the user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart." });
  }
};
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    console.log("User ID:", req.user.id);
    console.log("Product ID:", productId);

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.productId");
    if (!cart) {
      console.log("Cart not found for user:", req.user.id);
      cart = new Cart({ user: req.user.id, items: [], totalPrice: 0 });
    }

    // Check if the product is already in the cart
    const existingItem = cart.items.find(
      (item) => item.productId._id.toString() === productId
    );

    if (existingItem) {
      // Update the quantity
      existingItem.quantity += quantity;
    } else {
      // Add a new product
      cart.items.push({ productId: product._id, quantity });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((acc, item) => {
      console.log("Item:", item);
      console.log("Product Price:", item.productId?.price);
      const itemPrice = item.productId?.price || 0;
      return acc + item.quantity * itemPrice;
    }, 0);

    console.log("Updated Cart Total Price:", cart.totalPrice);

    // Save the updated cart
    await cart.save();
    console.log("Cart saved successfully.");
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add product to cart." });
  }
};


// Remove an item from the cart
const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Remove the product from the cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    // Recalculate the total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.productId.price, 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Failed to remove product from cart." });
  }
};

// Update the quantity of an item in the cart
const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Find the item and update its quantity
    const item = cart.items.find(item => item.productId.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    item.quantity = quantity;

    // Recalculate the total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.productId.price, 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Failed to update cart item." });
  }
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItem };
*/