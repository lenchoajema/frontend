const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const cookie = require('cookie');
let Cart; try { Cart = require('../models/Cart'); } catch (_) { Cart = null; }
let User; try { User = require('../models/User'); } catch (_) { User = null; }

/* eslint-env node */
const jwt = require('jsonwebtoken');
const audit = require('../utils/auditLogger');
// In-memory user store (email -> user) for test/demo (fallback when DB is not connected)
const users = new Map();
// Local fallback set (shared with server.js via exported helpers to avoid divergence)
const refreshTokens = new Set();
const { getRedis } = require('../utils/redisClient');
async function storeRefresh(token, userId) {
	const rc = getRedis();
	if (rc) { try { await rc.set('rt:'+token, JSON.stringify({ userId, created: Date.now() }), { EX: 60*60*24*7 }); return; } catch(_) {} }
	refreshTokens.add(token);
}
async function addAndReturn(token) { refreshTokens.add(token); return token; }
async function hasRefresh(token) {
	const rc = getRedis();
	if (rc) { try { return !!(await rc.get('rt:'+token)); } catch(_) {} }
	return refreshTokens.has(token);
}
async function revokeRefresh(token) {
	const rc = getRedis();
	if (rc) { try { await rc.del('rt:'+token); } catch(_) {} }
	refreshTokens.delete(token);
}

function signAccess(user) {
	return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '15m' });
}
function signRefresh(user) {
	// Include random jti to avoid identical token when reissued within same second
	const jti = (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex'));
	const token = jwt.sign({ id: user.id, role: user.role, jti }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '7d' });
	storeRefresh(token, user.id).catch(()=>{});
	return token;
}

// POST /register
router.post('/register', async (req, res) => {
	// Fallback: if body is empty but rawBody exists, attempt to parse
	if ((!req.body || Object.keys(req.body).length === 0) && req.rawBody) {
		try { req.body = JSON.parse(req.rawBody); } catch (_) {}
	}
	const { name, email, password } = req.body || {};
	if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });

	const useDb = !!(User && mongoose.connection.readyState === 1);
	try {
		let uid, role = 'user', nameOut = name, emailOut = email;
		if (useDb) {
			const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
			if (existing) return res.status(409).json({ message: 'Email already registered.' });
			const userDoc = new User({ name, email, password, role: 'user' });
			await userDoc.save();
			uid = String(userDoc._id); role = userDoc.role || 'user'; nameOut = userDoc.name; emailOut = userDoc.email;
			audit.event('user.register', { userId: uid, email: emailOut });
		} else {
			if (users.has(email)) return res.status(409).json({ message: 'Email already registered.' });
			const user = { id: (users.size + 1).toString(), name, email, password, role: 'user' };
			users.set(email, user);
			uid = user.id; role = user.role; nameOut = user.name; emailOut = user.email;
			audit.event('user.register', { userId: uid, email: emailOut });
		}

		const accessToken = signAccess({ id: uid, role });
		const refreshToken = signRefresh({ id: uid, role });

		// Merge guest cart if present
		let headers = {};
		try {
			if (Cart && mongoose.connection.readyState === 1) {
				const cookies = cookie.parse(req.headers.cookie || '');
				const g = cookies.gcart ? JSON.parse(decodeURIComponent(cookies.gcart)) : null;
				if (g && Array.isArray(g.items) && g.items.length) {
					let cart = await Cart.findOne({ user: uid });
					if (!cart) cart = new Cart({ user: uid, items: [], total: 0 });
					for (const it of g.items) {
						const idx = cart.items.findIndex(i => i.productId === String(it.productId));
						if (idx >= 0) cart.items[idx].quantity += Number(it.quantity || 1);
						else cart.items.push({ productId: String(it.productId), name: it.name, price: Number(it.price||0), pictures: it.pictures||[], quantity: Number(it.quantity||1) });
					}
					cart.total = (cart.items || []).reduce((s, i) => s + Number(i.price||0)*Number(i.quantity||0), 0);
					await cart.save();
					headers['Set-Cookie'] = 'gcart=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
				}
			}
		} catch (_) {}

		return res.status(201).set(headers).json({ user: { id: uid, name: nameOut, email: emailOut, role }, accessToken, refreshToken, mergedGuestCart: !!headers['Set-Cookie'] });
	} catch (e) {
		if (e && e.code === 11000) return res.status(409).json({ message: 'Email already registered.' });
		return res.status(500).json({ message: 'Registration failed' });
	}
});

// POST /login
router.post('/login', async (req, res) => {
	if ((!req.body || Object.keys(req.body).length === 0) && req.rawBody) {
		try { req.body = JSON.parse(req.rawBody); } catch (_) {}
	}
	const { email, password } = req.body || {};
	if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
	const useDb = !!(User && mongoose.connection.readyState === 1);
	let uid, role = 'user', nameOut, emailOut;
	if (useDb) {
		try {
			const userDoc = await User.findOne({ email: String(email).toLowerCase().trim() });
			if (!userDoc) return res.status(401).json({ message: 'Invalid credentials.' });
			const ok = await userDoc.matchPassword(password);
			if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });
			uid = String(userDoc._id); role = userDoc.role || 'user'; nameOut = userDoc.name; emailOut = userDoc.email;
		} catch (e) {
			return res.status(500).json({ message: 'Login failed' });
		}
	} else {
		const user = users.get(email);
		if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials.' });
		uid = user.id; role = user.role; nameOut = user.name; emailOut = user.email;
	}

	const accessToken = signAccess({ id: uid, role });
	const refreshToken = signRefresh({ id: uid, role });
	audit.event('user.login', { userId: uid, email: emailOut });
	let headers = {};
	// Merge guest cart if present
	try {
		if (Cart && mongoose.connection.readyState === 1) {
			const cookies = cookie.parse(req.headers.cookie || '');
			const g = cookies.gcart ? JSON.parse(decodeURIComponent(cookies.gcart)) : null;
			if (g && Array.isArray(g.items) && g.items.length) {
				let cart = await Cart.findOne({ user: uid });
				if (!cart) cart = new Cart({ user: uid, items: [], total: 0 });
				for (const it of g.items) {
					const idx = cart.items.findIndex(i => i.productId === String(it.productId));
					if (idx >= 0) cart.items[idx].quantity += Number(it.quantity || 1);
					else cart.items.push({ productId: String(it.productId), name: it.name, price: Number(it.price||0), pictures: it.pictures||[], quantity: Number(it.quantity||1) });
				}
				cart.total = (cart.items || []).reduce((s, i) => s + Number(i.price||0)*Number(i.quantity||0), 0);
				await cart.save();
				headers['Set-Cookie'] = 'gcart=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
			}
		}
	} catch (_) {}
	return res.set(headers).json({ user: { id: uid, name: nameOut, email: emailOut, role }, accessToken, refreshToken, mergedGuestCart: !!headers['Set-Cookie'] });
});

// GET /me
router.get('/me', (req, res) => {
	const auth = req.headers.authorization;
	if (!auth) return res.status(401).json({ message: 'Missing token' });
	const token = auth.replace(/Bearer\s+/i,'');
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'test_jwt_secret');
		// naive lookup
		const user = [...users.values()].find(u => u.id === payload.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
	} catch (e) {
		return res.status(401).json({ message: 'Invalid token' });
	}
});

// POST /logout (invalidate refresh token)
router.post('/logout', async (req, res) => {
	const { refreshToken } = req.body || {};
	if (refreshToken) {
		await revokeRefresh(refreshToken);
		audit.event('user.logout', {});
	}
	return res.json({ message: 'Logged out' });
});

// Diagnostic ping endpoint to verify auth router is mounted
router.get('/_ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Export for tests (not part of API contract)
// Export for server integration & tests
router._debug = { users, refreshTokens };
router._refreshStore = { storeRefresh, hasRefresh, revokeRefresh };

module.exports = router;
