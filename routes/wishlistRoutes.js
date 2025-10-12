const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', auth(), async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.product', 'name price pictures stock rating');

    if (!wishlist) {
      wishlist = { items: [] };
    }

    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/:productId', auth(), async (req, res) => {
    // Manual validation
    if (!req.params.productId || !req.params.productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
      // Check if product exists
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let wishlist = await Wishlist.findOne({ user: req.user.id });

      if (!wishlist) {
        // Create new wishlist
        wishlist = new Wishlist({
          user: req.user.id,
          items: [{ product: req.params.productId }],
        });
      } else {
        // Check if product already in wishlist
        const existingItem = wishlist.items.find(
          (item) => item.product.toString() === req.params.productId
        );

        if (existingItem) {
          return res.status(400).json({ message: 'Product already in wishlist' });
        }

        wishlist.items.push({ product: req.params.productId });
      }

      await wishlist.save();
      await wishlist.populate('items.product', 'name price pictures stock rating');

      res.status(201).json({
        message: 'Product added to wishlist',
        wishlist,
      });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', auth(), async (req, res) => {
    // Manual validation
    if (!req.params.productId || !req.params.productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
      const wishlist = await Wishlist.findOne({ user: req.user.id });

      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      // Filter out the product
      wishlist.items = wishlist.items.filter(
        (item) => item.product.toString() !== req.params.productId
      );

      await wishlist.save();
      await wishlist.populate('items.product', 'name price pictures stock rating');

      res.json({
        message: 'Product removed from wishlist',
        wishlist,
      });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', auth(), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlist/move-to-cart/:productId
// @desc    Move item from wishlist to cart
// @access  Private
router.post('/move-to-cart/:productId', auth(), async (req, res) => {
    // Manual validation
    if (!req.params.productId || !req.params.productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
      const wishlist = await Wishlist.findOne({ user: req.user.id });

      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      // Check if product is in wishlist
      const itemIndex = wishlist.items.findIndex(
        (item) => item.product.toString() === req.params.productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Product not in wishlist' });
      }

      // Remove from wishlist
      wishlist.items.splice(itemIndex, 1);
      await wishlist.save();

      // Note: Cart operations would be handled by the cart API/Redux
      res.json({
        message: 'Product moved to cart',
        productId: req.params.productId,
      });
    } catch (error) {
      console.error('Move to cart error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
