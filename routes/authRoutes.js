const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/* eslint-env node */
const jwt = require('jsonwebtoken');
const audit = require('../utils/auditLogger');
// In-memory user store (email -> user) for test/demo (replace with Mongo queries)
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
router.post('/logout', async (req, res) => {
	const { refreshToken } = req.body || {};
	if (refreshToken) {
		await revokeRefresh(refreshToken);
		audit.event('user.logout', {});
	}
	return res.json({ message: 'Logged out' });
});

// Export for tests (not part of API contract)
// Export for server integration & tests
router._debug = { users, refreshTokens };
router._refreshStore = { storeRefresh, hasRefresh, revokeRefresh };

module.exports = router;
