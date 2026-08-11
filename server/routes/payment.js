const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
});

// POST initiate payment (Create Razorpay Order)
router.post('/create-order', async (req, res) => {
  try {
    const { items, orderId, customerEmail } = req.body;
    
    // Calculate total amount from items (in INR paise)
    const amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100;

    const key_id = process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id_here';

    // If using the placeholder mock key, bypass Razorpay completely for demo mode
    if (key_id === 'your_razorpay_key_id_here' || key_id === 'rzp_test_mock') {
      return res.json({ 
        success: true, 
        id: `order_mock_${Date.now()}`, 
        amount: Math.round(amount), 
        currency: 'INR',
        key_id: 'mock' 
      });
    }

    const options = {
      amount: Math.round(amount), // amount in the smallest currency unit
      currency: "INR",
      receipt: orderId.toString(),
      notes: {
        orderId: orderId.toString(),
        customerEmail: customerEmail || ''
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({ 
      success: true, 
      id: order.id, 
      amount: order.amount, 
      currency: order.currency,
      key_id: key_id 
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create Razorpay order' });
  }
});

module.exports = router;
