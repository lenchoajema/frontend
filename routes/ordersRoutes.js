const express = require('express');
const router = express.Router();

// Minimal orders routes stub for backend tests
router.get('/', (req, res) => res.status(200).json([]));
router.post('/', (req, res) => res.status(201).json({ message: 'Order placed (stub)' }));

module.exports = router;
