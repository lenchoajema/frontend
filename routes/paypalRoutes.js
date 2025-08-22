const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createPaypalOrder, capturePaypalOrder, refundPaypalOrder } = require('../controllers/paypalController');

router.post('/create-order', authenticate(true), createPaypalOrder);
router.post('/capture/:orderId', authenticate(true), capturePaypalOrder);
router.post('/refund/:orderId', authenticate(true), refundPaypalOrder);

module.exports = router;
