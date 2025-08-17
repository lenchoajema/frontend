const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Prefer env var if provided; fallback to docker service hostname
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:changeme@ecommerce_mongodb:27017/ecommerce?authSource=admin';

// Reuse real User model so pre-save hook hashes passwords
let User;
try {
  User = require('../models/User');
} catch (e) {
  // Fallback (should not normally happen)
  User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
}

const SEED_USERS = [
  {
    name: 'Admin123',
    email: 'admin123@example.com',
    password: 'adminpassword123',
    role: 'admin',
    avatar: 'https://via.placeholder.com/150',
  },
  {
    name: 'Seller123',
    email: 'seller123@example.com',
    password: 'sellerpassword123',
    role: 'seller',
    avatar: 'https://via.placeholder.com/150',
  },
  {
    name: 'Customer123',
    email: 'customer123@example.com',
    password: 'customerpassword123',
    role: 'customer',
    avatar: 'https://via.placeholder.com/150',
  },
];

async function ensureHashed(userDoc, plainPassword) {
  // If password already a bcrypt hash, leave it; else reset to plaintext so pre-save hook hashes ONCE
  if (!userDoc.password || !userDoc.password.startsWith('$2')) {
    userDoc.password = plainPassword; // pre-save hook will hash
    await userDoc.save();
    console.log(`🔐 Normalized password (hashed via hook) for ${userDoc.email}`);
  }
}

const FORCE = process.env.RESEED_FORCE === 'true' || process.argv.includes('--force');

async function seedUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI, {});

    for (const u of SEED_USERS) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`ℹ️  User already exists: ${u.email}`);
        if (FORCE) {
          // Force password reset to known plaintext so hook re-hashes correctly
            existing.password = u.password; // triggers isModified
            await existing.save();
            console.log(`♻️  Forced password reset for ${u.email}`);
        } else {
          await ensureHashed(existing, u.password);
        }
        continue;
      }
      const newUser = new User(u); // pre-save hook will hash
      try {
        await newUser.save();
        console.log(`✅ Created user: ${u.email}`);
      } catch (saveErr) {
        // Handle duplicate key errors that can happen if another process created the user
        if (saveErr && saveErr.code === 11000) {
          console.warn(`⚠️ Duplicate found when creating ${u.email}, loading existing and ensuring hash`);
          const existingAfterDup = await User.findOne({ email: u.email });
          if (existingAfterDup) {
            if (FORCE) {
              existingAfterDup.password = u.password;
              await existingAfterDup.save();
              console.log(`♻️  Forced password reset for ${u.email} (after duplicate)`);
            } else {
              await ensureHashed(existingAfterDup, u.password);
            }
          } else {
            console.error(`❌ Duplicate key error but could not find existing user for ${u.email}`);
          }
        } else {
          throw saveErr;
        }
      }
    }

    console.log('✅ Seeding complete.');
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

if (require.main === module) {
  if (FORCE) console.log('⚠️  FORCE mode enabled: passwords will be reset.');
  seedUsers();
}
