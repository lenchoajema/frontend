/*const register = async (req, res) => {
  res.status(200).json({ message: 'Register endpoint hit' });
};*/
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password it is already hashed in the model user.js
    //const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password;


    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer', // Default role is 'customer'
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

module.exports = { register };



/*
const login = async (req, res) => {
  res.status(200).json({ message: 'Login endpoint hit' });
};*/
// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // Ensure JWT_SECRET is in your .env file
      { expiresIn: '12h' } // Token expires in 12 hour
    );

    res.status(200).json({
      message: 'Login successful',
      token,user: { username: user.username, role: user.role, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

module.exports = { login };

module.exports = { register, login };
