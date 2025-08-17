// Test MongoDB and Redis connections
const mongoose = require('mongoose');
const redis = require('redis');
require('dotenv').config();

async function testConnections() {
  console.log('Testing connections...');
  
  // Test MongoDB
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {});
      console.log('✅ MongoDB connected successfully');
      await mongoose.disconnect();
    } else {
      console.log('⚠️  MongoDB URI not configured');
    }
  } catch (err) {
    console.log('❌ MongoDB connection failed:', err.message);
  }
  
  // Test Redis (optional)
  try {
    if (process.env.REDIS_URL) {
      const redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 5000 }
      });
      
      await redisClient.connect();
      console.log('✅ Redis connected successfully');
      await redisClient.quit();
    } else {
      console.log('⚠️  Redis URL not configured (optional)');
    }
  } catch (err) {
    console.log('❌ Redis connection failed:', err.message);
  }
}

testConnections();
