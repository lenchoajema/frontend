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

const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
if (!redisClient.isOpen) {
(async () => {
  await redisClient.connect();
  console.log("Redis client connected successfully");
})();
}
/* if (!redisClient.isOpen) {
  (async () => {
    try {
      await redisClient.connect();
      console.log("Redis client connected successfully");
    } catch (err) {
      console.error("Error connecting to Redis:", err);
    }
  })();
}
 */



const app = express();

// Middleware
app.use(express.json());
app.use(cors());
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
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection error:', err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
