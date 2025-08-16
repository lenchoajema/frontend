const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    pictures: [
      {
        type: String, // Array of strings to store file paths or URLs
        required: true,
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0, // Default stock is 0
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;

//module.exports = mongoose.model('Product', productSchema);
/*
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
});

// Use an existing model if it exists, otherwise define a new one
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
*/