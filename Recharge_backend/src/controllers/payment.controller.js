const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Create a Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_user_${userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'dummy_key_id'
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// Verify the payment signature and update wallet
exports.verifyRazorpayPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const userId = req.user.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment signature details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    await connection.beginTransaction();

    // 1. Insert into transactions table
    const [txResult] = await connection.query(
      `INSERT INTO transactions (user_id, transaction_type, amount, description, status, transaction_reference) 
       VALUES (?, 'Wallet_Credit', ?, ?, 'Success', ?)`,
      [userId, amount, 'Add Money via Razorpay', razorpay_payment_id]
    );

    // 2. Insert into payment_methods
    await connection.query(
      `INSERT INTO payment_methods (transaction_id, payment_type, amount, payment_reference, payment_status)
       VALUES (?, 'Wallet', ?, ?, 'Success')`,
      [txResult.insertId, amount, razorpay_payment_id]
    );

    // 3. Update User Wallet
    await connection.query(
      `UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?`,
      [amount, userId]
    );

    await connection.commit();

    res.json({ success: true, message: 'Payment verified and wallet updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  } finally {
    connection.release();
  }
};
