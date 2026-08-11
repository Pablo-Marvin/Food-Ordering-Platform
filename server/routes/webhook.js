const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

// POST Razorpay Payment Verification
// This receives the payment details from the frontend after successful payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Bypass for mock mode
    if (razorpay_signature === 'mock_signature') {
      const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { paymentStatus: 'paid', orderStatus: 'confirmed' },
        { new: true }
      );
      console.log(`Payment confirmed for mock order ${orderId}`);
      return res.json({ success: true, message: 'Mock payment verified successfully' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';

    // Create signature to verify
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is legit
      // Update order status in MongoDB
      const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { paymentStatus: 'paid', orderStatus: 'confirmed' },
        { new: true }
      );
      console.log(`Payment confirmed for order ${orderId}`);
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

// Optionally, we can also add a raw webhook endpoint for Razorpay server-to-server events here

module.exports = router;
