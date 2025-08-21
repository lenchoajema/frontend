const express = require('express');
const router = express.Router();

/* eslint-env node */
const jwt = require('jsonwebtoken');
const audit = require('../utils/auditLogger');
// In-memory user store (email -> user) for test/demo (replace with Mongo queries)
const users = new Map();
const refreshTokens = new Set();

function signAccess(user) {
	return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '15m' });
}
function signRefresh(user) {
	const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '7d' });
	refreshTokens.add(token);
	return token;
}

// POST /register
router.post('/register', (req, res) => {
	const { name, email, password } = req.body || {};
	if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
	if (users.has(email)) return res.status(409).json({ message: 'Email already registered.' });
	const user = { id: (users.size+1).toString(), name, email, password, role: 'user' };
		users.set(email, user);
		audit.event('user.register', { userId: user.id, email });
	const accessToken = signAccess(user);
	const refreshToken = signRefresh(user);
	return res.status(201).json({ user: { id: user.id, name, email, role: user.role }, accessToken, refreshToken });
});

// POST /login
router.post('/login', (req, res) => {
	const { email, password } = req.body || {};
	if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
	const user = users.get(email);
	if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials.' });
	const accessToken = signAccess(user);
	const refreshToken = signRefresh(user);
		audit.event('user.login', { userId: user.id, email });
		return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
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
router.post('/logout', (req, res) => {
	const { refreshToken } = req.body || {};
		if (refreshToken && refreshTokens.has(refreshToken)) { refreshTokens.delete(refreshToken); audit.event('user.logout', {}); }
	return res.json({ message: 'Logged out' });
});

// Export for tests (not part of API contract)
router._debug = { users, refreshTokens };

module.exports = router;
