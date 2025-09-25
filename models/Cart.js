const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String },
    price: { type: Number, required: true },
    pictures: [String],
    quantity: { type: Number, required: true, default: 1 },
  }],
  total: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
