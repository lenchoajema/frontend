const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:changeme@localhost:27017/ecommerce?authSource=admin';

async function queryDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {});

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Item = mongoose.model('Item', new mongoose.Schema({}, { strict: false }));

    console.log('Users:');
    const users = await User.find();
    console.log(users);

    console.log('Items:');
    const items = await Item.find();
    console.log(items);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error querying database:', err.message);
  }
}

queryDatabase();
