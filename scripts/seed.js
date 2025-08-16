// Seed script to ensure at least one seller user and product exist
// Usage: node backend/scripts/seed.js (run from repo root or backend dir)

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env from backend directory regardless of CWD
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Product = require('../models/productModel');

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI not set. Aborting seed.');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`ℹ️  Products already exist (${productCount}). Skipping product seed.`);
      return process.exit(0);
    }

    // Create seller user
    const sellerEmail = `seed_seller_${Date.now()}@example.com`;
    const seller = await User.create({
      name: 'Seed Seller',
      email: sellerEmail,
      password: 'Password123', // Will be hashed by pre-save hook
      role: 'seller'
    });
    console.log('✅ Created seller user', { id: seller._id.toString(), email: seller.email });

    // Create sample product
    const product = await Product.create({
      name: 'Sample Product',
      price: 19.99,
      description: 'Automatically seeded product for integration tests.',
      pictures: ['sample.png'],
      stock: 50,
      seller: seller._id
    });
    console.log('✅ Created sample product', { id: product._id.toString(), name: product.name });
    console.log('🎉 Seeding complete');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
