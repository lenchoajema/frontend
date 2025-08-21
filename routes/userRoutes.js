const express = require('express');
const router = express.Router();

// Minimal user routes stub for backend tests
router.get('/profile', (req, res) => res.status(200).json({ id: 'test-user', name: 'Test User' }));
router.put('/profile', (req, res) => res.status(200).json({ message: 'Profile updated (stub)' }));
router.put('/change-password', (req, res) => res.status(200).json({ message: 'Password changed (stub)' }));
router.put('/upload-profile-picture', (req, res) => res.status(200).json({ message: 'Profile picture uploaded (stub)' }));

module.exports = router;
