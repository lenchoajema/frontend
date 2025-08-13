 const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware"); // Your authentication middleware
const { authLimiter } = require('../middleware/rateLimiter');


router.post('/register', authLimiter, register); // Registration route
router.post('/login', authLimiter, login);       // Login route


// GET /auth/me - Return current logged-in user details
router.get("/auth/me", authenticateUser, (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(req.user); // `req.user` is populated by `authenticateUser`
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
