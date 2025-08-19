/*const register = async (req, res) => {
  res.status(200).json({ message: 'Register endpoint hit' });
};*/
let bcrypt, jwt;
try { bcrypt = require('bcryptjs'); } catch { bcrypt = { compare: async (a,b)=> a===b }; }
try { jwt = require('jsonwebtoken'); } catch { jwt = { sign: () => 'test.jwt.token' }; }
// Centralized User model
// Resolve User model relative to this controller location
// Current file path: frontend/frontend/controllers/authController.js
// Centralized model: backend/models/User.js (two levels up then into backend/models)
const User = require('../../backend/models/User');

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
    // If express.json failed to parse, req.body may be empty but req.rawBody is available
    let { email, password } = req.body || {};
    if ((!email || !password) && req && req.rawBody) {
      try {
        const raw = req.rawBody.trim();
        // If it's JSON-like, try JSON.parse
        if (raw.startsWith('{') || raw.startsWith('[')) {
          const parsed = JSON.parse(raw);
          email = email || parsed.email;
          password = password || parsed.password;
        } else if (raw.includes('&') || raw.includes('=')) {
          // urlencoded
          const pairs = raw.split(/[&\n]/);
          for (const p of pairs) {
            const [k, v] = p.split('=');
            if (k && v) {
              if (!email && k.trim() === 'email') email = decodeURIComponent(v.trim());
              if (!password && k.trim() === 'password') password = decodeURIComponent(v.trim());
            }
          }
        } else if (raw.includes(':')) {
          // simple key:value; support single-line comma-separated or newline-separated
          let segments = raw.split(/\r?\n/).filter(Boolean);
          if (segments.length === 1 && raw.includes(',')) {
            segments = raw.split(',').map(s => s.trim()).filter(Boolean);
          }
          for (const seg of segments) {
            const idx = seg.indexOf(':');
            if (idx > 0) {
              const k = seg.slice(0, idx).trim();
              const v = seg.slice(idx + 1).trim();
              if (!email && k === 'email') email = v;
              if (!password && k === 'password') password = v;
            }
          }
        }
      } catch (e) {
        // ignore fallback parse errors
      }
    }

  // Check if user exists
  const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate password
  console.log('[AUTH] Login attempt', { email, providedPwdLength: password?.length, hashPrefix: user.password?.slice(0,4) });
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('[AUTH] Password match result:', isMatch);
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

module.exports = { register, login };
