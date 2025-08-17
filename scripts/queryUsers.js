const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:changeme@ecommerce_mongodb:27017/ecommerce?authSource=admin';

async function queryUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {});

    let User;
    try {
      User = require('../models/User');
    } catch (e) {
      User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    }

    const users = await User.find({}, 'email role createdAt');
    console.log('👥 Users found:', users.length);
    users.forEach(u => console.log(` - ${u.email} (${u.role})`));
  } catch (err) {
    console.error('Error querying users:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

if (require.main === module) {
  queryUsers();
}
