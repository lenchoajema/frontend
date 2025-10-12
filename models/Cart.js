const mongoose = require('mongoose');

// Use String identifiers to be compatible with in-memory auth user ids and flexible product ids.
const cartSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String },
<<<<<<< HEAD
    price: { type: Number, required: true },
=======
    price: { type: Number, required: true }, // snapshot of price at add time
>>>>>>> 269f5cbb0820f180d9f52190c3f3471a8e8605b8
    pictures: [String],
    quantity: { type: Number, required: true, default: 1 },
  }],
  total: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
