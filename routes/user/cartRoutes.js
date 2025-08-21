const express = require('express');
const router = express.Router();

// Minimal cart routes stub (no Redis dependency) for backend tests
router.post('/', (req, res) => res.status(201).json({ message: 'Item added (stub)', cart: { items: [], total: 0 } }));
router.get('/', (req, res) => res.status(200).json({ items: [], total: 0 }));
router.delete('/:id', (req, res) => res.status(200).json({ message: 'Item removed (stub)' }));
router.put('/:id', (req, res) => res.status(200).json({ message: 'Item updated (stub)' }));

module.exports = router;
