// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
//const productRoutes = require('./routes/productRoutes'); // Import product routes
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const cartRoutes = require('./routes/user/cartRoutes');
const userRoutes = require("./routes/userRoutes");
//const sellerProductRoutes = require('./routes/seller/productRoute');
const productRoutes = require("./routes/productRoutes");
const path = require('path');
const redis = require('redis');
//const redisClient = require("./utils/redisClient");
const ordersRoutes = require('./routes/ordersRoutes');

dotenv.config();

// Redis configuration (Optional)
let redisClient = null;

if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      redisClient = null; // Disable Redis on error
    });

    redisClient.on('connect', () => console.log('✅ Redis client connected successfully'));

    // Connect to Redis
    (async () => {
      try {
        await redisClient.connect();
      } catch (err) {
        console.error("❌ Error connecting to Redis:", err.message);
        console.log("⚠️  Redis disabled. Server will continue without caching.");
        redisClient = null;
      }
    })();
  } catch (err) {
    console.error("❌ Redis setup failed:", err.message);
    console.log("⚠️  Redis disabled. Server will continue without caching.");
    redisClient = null;
  }
} else {
  console.log('⚠️  Redis not configured. Add REDIS_URL to .env file to enable caching.');
}



const app = express();

// Middleware
app.use(express.json());

// CORS configuration for GitHub Codespaces
const corsOptions = {
  origin: [
    'https://potential-guide-wv5pxxvwg45cgr75.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3001.app.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3002.app.github.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use("/api/products", productRoutes); //Routes for home page
// Routes
app.use('/api/auth', authRoutes); // Authentication routes
//app.use('/api/seller', productRoutes); // seller Product routes
//app.use('/api/seller/products', sellerProductRoutes); // 
// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
// Cart Routes (Updated for consistency)
//app.use('/api/cart', cartRoutes);  
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/user/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use((req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

// Database connection
if (process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '') {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection error:', err));
} else {
  console.log('⚠️  MongoDB not configured. Add MONGO_URI to .env file to enable database functionality.');
  console.log('   The server will run but database-dependent features will not work.');
}

// Server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Allow connections from any IP (required for Codespaces)
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Server accessible at https://potential-guide-wv5pxxvwg45cgr75-${PORT}.app.github.dev`);
});
