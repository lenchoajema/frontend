const express = require('express');
const router = express.Router();
const { authenticate: auth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @route   POST /api/reviews/:id/reviews  
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', auth(), async (req, res) => {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!req.body.comment || req.body.comment.trim().length < 10 || req.body.comment.trim().length > 1000) {
      return res.status(400).json({ message: 'Comment must be between 10 and 1000 characters' });
    }

    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const review = {
        user: req.user.id,
        name: req.user.name || 'Anonymous',
        rating: Number(req.body.rating),
        comment: req.body.comment,
        createdAt: new Date(),
      };

      if (!product.reviews) product.reviews = [];
      product.reviews.push(review);

      const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.rating = totalRating / product.reviews.length;
      product.numReviews = product.reviews.length;

      await product.save();

      res.status(201).json({
        message: 'Review added successfully',
        review,
        rating: product.rating,
        numReviews: product.numReviews,
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/:id/reviews
// @desc    Get all reviews for a product
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        reviews: product.reviews || [],
        rating: product.rating,
        numReviews: product.numReviews,
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
