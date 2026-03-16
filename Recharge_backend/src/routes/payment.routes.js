const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Razorpay Wallet Add Money APIs
router.post('/create-order', authMiddleware, paymentController.createRazorpayOrder);
router.post('/verify-payment', authMiddleware, paymentController.verifyRazorpayPayment);

module.exports = router;
