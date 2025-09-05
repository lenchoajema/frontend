const express = require('express');
const router = express.Router();

const { authenticate, requireRole } = require('../middleware/auth');
const auth = authenticate(true);
const admin = requireRole('admin');
router.get('/users', auth, admin, (req, res) => res.status(200).json([]));
router.get('/products', auth, admin, (req, res) => res.status(200).json([]));
router.delete('/users/:id', auth, admin, (req, res) => res.status(200).json({ message: 'User deleted (stub)' }));
router.delete('/products/:id', auth, admin, (req, res) => res.status(200).json({ message: 'Product deleted (stub)' }));

module.exports = router;
