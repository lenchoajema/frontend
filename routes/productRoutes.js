/* eslint-env node */
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
// Lazy require to avoid model load issues during tests without DB
let Product; try { Product = require('../models/Product'); } catch (_) { Product = null; }
// Simple auth/role stubs (replace with centralized middleware later)
const { authenticate, requireRole } = require('../middleware/auth');
const requireAuth = authenticate(true);
const requireAdmin = requireRole('admin');

// GET /api/products?page=&limit=&seller=&q=&minPrice=&maxPrice=
router.get('/', async (req, res) => {
	const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
	const filter = {};
	const { seller, q, minPrice, maxPrice } = req.query;
	if (seller) filter.seller = seller;
	if (q) filter.name = { $regex: q, $options: 'i' };
	if (minPrice || maxPrice) {
		filter.price = {};
		if (minPrice) filter.price.$gte = Number(minPrice);
		if (maxPrice) filter.price.$lte = Number(maxPrice);
	}

	// If no DB connection (tests) return empty deterministic structure quickly
	if (!Product || mongoose.connection.readyState !== 1) {
		res.set('X-Total', '0');
		res.set('X-Page', String(page));
		res.set('X-Pages', '0');
<<<<<<< HEAD
		return res.json([]);
=======
		return res.json({ items: [], total: 0, page, pages: 0 });
>>>>>>> 269f5cbb0820f180d9f52190c3f3471a8e8605b8
	}
	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		Product.find(filter).skip(skip).limit(limit).lean().exec(),
		Product.countDocuments(filter)
	]);
	res.set('X-Total', String(total));
	res.set('X-Page', String(page));
	res.set('X-Pages', String(Math.ceil(total / limit)));
<<<<<<< HEAD
	return res.json(items);
=======
	return res.json({ items, total, page, pages: Math.ceil(total / limit) });
>>>>>>> 269f5cbb0820f180d9f52190c3f3471a8e8605b8
});

router.get('/:id', async (req, res) => {
	if (!Product || mongoose.connection.readyState !== 1) {
		return res.status(404).json({ message: 'Product not found' });
	}
	try {
		const prod = await Product.findById(req.params.id).lean();
		if (!prod) return res.status(404).json({ message: 'Product not found' });
		return res.json(prod);
	} catch (e) {
		return res.status(400).json({ message: 'Invalid product id' });
	}
});

// POST create product
router.post('/', requireAuth, requireAdmin, async (req, res) => {
	if (!Product || mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	const { name, price, description, pictures = [], stock = 0, seller } = req.body || {};
	if (!name || typeof price !== 'number' || !seller) return res.status(400).json({ message: 'name, price, seller required' });
	try {
		const doc = await Product.create({ name, price, description, pictures, stock, seller });
		return res.status(201).json({ id: doc._id, name: doc.name });
	} catch (e) { return res.status(500).json({ message: 'Create failed', error: e.message }); }
});

// PUT update product
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
	if (!Product || mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	try {
		const updates = (({ name, price, description, pictures, stock }) => ({ name, price, description, pictures, stock }))(req.body || {});
		Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
		const doc = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
		if (!doc) return res.status(404).json({ message: 'Product not found' });
		return res.json({ id: doc._id, name: doc.name });
	} catch (e) { return res.status(400).json({ message: 'Update failed', error: e.message }); }
});

// DELETE product
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
	if (!Product || mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	try {
		const doc = await Product.findByIdAndDelete(req.params.id);
		if (!doc) return res.status(404).json({ message: 'Not found' });
		return res.json({ deleted: true });
	} catch (e) { return res.status(400).json({ message: 'Delete failed', error: e.message }); }
});

module.exports = router;
