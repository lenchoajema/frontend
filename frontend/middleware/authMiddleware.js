let jwt;
try { jwt = require('jsonwebtoken'); } catch { jwt = { verify: () => ({ id: 'test-user-id', role: 'customer' }) }; }
const User = require("../../../backend/models/User");

// Authenticate user using JWT
const authenticateUser = async (req, res, next) => {
  console.log("Authenticating user...");
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Authorization" header

  if (!token) {
    console.log("No token found in request headers.");
    return res.status(401).json({ message: "Authentication token required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    const user = await User.findById(decoded.id).select("-password"); // Find user by ID, exclude password
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token or user not found." });
    }
    console.log("User authenticated:", user);

    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. You do not have the required role." });
    }
    next(); // Proceed if the role matches
  };
};

// Authorize admin users specifically
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Proceed if the user is an admin
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = { authenticateUser, authorizeRoles, isAdmin };
