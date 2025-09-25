const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../../middleware/auth');
const cookie = require('cookie');
const Cart = require('../../models/Cart');
let Product; try { Product = require('../../models/Product'); } catch (_) { Product = null; }

const requireAuth = authenticate(false);
const calcTotal = (items) => (items || []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);

router.get('/', requireAuth, async (req, res) => {
	if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	if (!req.user) {
		const cookies = cookie.parse(req.headers.cookie || '');
		try { const guest = cookies.gcart ? JSON.parse(decodeURIComponent(cookies.gcart)) : null; if (guest) return res.json(guest); } catch(_) {}
		return res.json({ items: [], total: 0 });
	}
	const cart = await Cart.findOne({ user: req.user.id }).lean();
	if (!cart) return res.json({ items: [], total: 0 });
	return res.json({ items: cart.items, total: cart.total });
});

router.post('/', requireAuth, async (req, res) => {
	if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	const { productId, quantity = 1 } = req.body || {};
	if (!productId) return res.status(400).json({ message: 'productId required' });
	if (!req.user) {
		const cookies = cookie.parse(req.headers.cookie || '');
		let guest = { items: [], total: 0 };
		try { if (cookies.gcart) guest = JSON.parse(decodeURIComponent(cookies.gcart)); } catch(_) {}
			let price = 0, name = 'Item', pictures = [];
			if (Product) {
				try { 
					const p = await Product.findById(productId).lean(); 
					if (p) { price = p.price; name = p.name; pictures = p.pictures || []; } 
				} catch(_) {}
			}
		const idx = guest.items.findIndex(i => i.productId === String(productId));
		if (idx >= 0) guest.items[idx].quantity += Number(quantity);
		else guest.items.push({ productId: String(productId), name, price, pictures, quantity: Number(quantity) });
				guest.total = calcTotal(guest.items);
				{
					const isSecure = (req.headers['x-forwarded-proto'] === 'https') || (req.protocol === 'https') || process.env.NODE_ENV === 'production';
					const flags = 'Path=/; HttpOnly; SameSite=Lax' + (isSecure ? '; Secure' : '');
					res.setHeader('Set-Cookie', 'gcart=' + encodeURIComponent(JSON.stringify(guest)) + '; ' + flags);
				}
		return res.status(201).json({ message: 'Item added (guest)', cart: guest });
	}
	let price = 0, name = 'Item', pictures = [];
	if (Product) {
		try { const p = await Product.findById(productId).lean(); if (p) { price = p.price; name = p.name; pictures = p.pictures || []; } } catch (_) {}
	}
	let cart = await Cart.findOne({ user: req.user.id });
	if (!cart) cart = new Cart({ user: req.user.id, items: [], total: 0 });
	const idx = cart.items.findIndex(i => i.productId === String(productId));
	if (idx >= 0) cart.items[idx].quantity += Number(quantity);
	else cart.items.push({ productId: String(productId), name, price, pictures, quantity: Number(quantity) });
	cart.total = calcTotal(cart.items);
	await cart.save();
	return res.status(201).json({ message: 'Item added', cart: { items: cart.items, total: cart.total } });
});

router.put('/:id', requireAuth, async (req, res) => {
	if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	const { id } = req.params;
	const { quantity } = req.body || {};
	if (!req.user) {
		const cookies = cookie.parse(req.headers.cookie || '');
		let guest = { items: [], total: 0 };
		try { if (cookies.gcart) guest = JSON.parse(decodeURIComponent(cookies.gcart)); } catch(_) {}
		const idx = guest.items.findIndex(i => i.productId === String(id));
		if (idx < 0) return res.status(404).json({ message: 'Item not in cart' });
		if (quantity <= 0) guest.items.splice(idx, 1); else guest.items[idx].quantity = Number(quantity);
				guest.total = calcTotal(guest.items);
				{
					const isSecure = (req.headers['x-forwarded-proto'] === 'https') || (req.protocol === 'https') || process.env.NODE_ENV === 'production';
					const flags = 'Path=/; HttpOnly; SameSite=Lax' + (isSecure ? '; Secure' : '');
					res.setHeader('Set-Cookie', 'gcart=' + encodeURIComponent(JSON.stringify(guest)) + '; ' + flags);
				}
		return res.json({ message: 'Item updated (guest)', cart: guest });
	}
	let cart = await Cart.findOne({ user: req.user.id });
	if (!cart) return res.status(404).json({ message: 'Cart not found' });
	const idx = cart.items.findIndex(i => i.productId === String(id));
	if (idx < 0) return res.status(404).json({ message: 'Item not in cart' });
	if (quantity <= 0) cart.items.splice(idx, 1);
	else cart.items[idx].quantity = Number(quantity);
	cart.total = calcTotal(cart.items);
	await cart.save();
	return res.json({ message: 'Item updated', cart: { items: cart.items, total: cart.total } });
});

router.delete('/:id', requireAuth, async (req, res) => {
	if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'DB not connected' });
	const { id } = req.params;
	if (!req.user) {
		const cookies = cookie.parse(req.headers.cookie || '');
		let guest = { items: [], total: 0 };
		try { if (cookies.gcart) guest = JSON.parse(decodeURIComponent(cookies.gcart)); } catch(_) {}
		const before = guest.items.length;
		guest.items = guest.items.filter(i => i.productId !== String(id));
		if (guest.items.length === before) return res.status(404).json({ message: 'Item not in cart' });
				guest.total = calcTotal(guest.items);
				{
					const isSecure = (req.headers['x-forwarded-proto'] === 'https') || (req.protocol === 'https') || process.env.NODE_ENV === 'production';
					const flags = 'Path=/; HttpOnly; SameSite=Lax' + (isSecure ? '; Secure' : '');
					res.setHeader('Set-Cookie', 'gcart=' + encodeURIComponent(JSON.stringify(guest)) + '; ' + flags);
				}
		return res.json({ message: 'Item removed (guest)', cart: guest });
	}
	let cart = await Cart.findOne({ user: req.user.id });
	if (!cart) return res.status(404).json({ message: 'Cart not found' });
	const before = cart.items.length;
	cart.items = cart.items.filter(i => i.productId !== String(id));
	if (cart.items.length === before) return res.status(404).json({ message: 'Item not in cart' });
	cart.total = calcTotal(cart.items);
	await cart.save();
	return res.json({ message: 'Item removed', cart: { items: cart.items, total: cart.total } });
});

module.exports = router;
