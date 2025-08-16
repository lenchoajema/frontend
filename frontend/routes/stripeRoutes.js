const express = require('express');
const { createPaymentIntent } = require('../controllers/stripeController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-payment-intent', authenticateUser, createPaymentIntent);

module.exports = router;
