const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

// Index for faster lookups
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

module.exports = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
