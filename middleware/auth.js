/* Central auth & RBAC middleware */
const jwt = require('jsonwebtoken');

function authenticate(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    if (!header) {
      if (required) return res.status(401).json({ message: 'Missing Authorization header' });
      return next();
    }
    const token = header.replace(/Bearer\s+/i, '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'test_jwt_secret');
      req.user = { id: payload.id, role: payload.role };
      return next();
    } catch (e) {
      if (required) return res.status(401).json({ message: 'Invalid token' });
      return next();
    }
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
