const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Use String for user & productId to support in-memory test users without requiring ObjectId casting
  user: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    pictures: [String],
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled', 'Failed'], default: 'Pending' },
  idemKey: { type: String, index: true },
  timeline: [{
    ts: { type: Date, default: Date.now },
    type: { type: String, required: true }, // e.g. created, payment_intent_created, payment_failed, payment_succeeded
    meta: { type: Object }
  }]
}, { timestamps: true });

orderSchema.methods.addEvent = function(type, meta) {
  this.timeline.push({ type, meta });
  return this.save().catch(()=>this);
};

module.exports = mongoose.model('Order', orderSchema);
