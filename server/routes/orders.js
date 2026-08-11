const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { calculateDistance, isCodAvailable, isDeliveryAvailable } = require('../utils/distance');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

// POST create a new order
router.post(
  '/',
  [
    check('customer.name', 'Customer name is required').not().isEmpty(),
    check('customer.phone', 'Customer phone is required').not().isEmpty(),
    check('items', 'Order must have at least one item').isArray({ min: 1 }),
    check('orderType', 'Invalid order type').isIn(['delivery', 'pickup']),
    check('paymentMethod', 'Invalid payment method').isIn(['cod', 'online'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { customer, items, orderType, paymentMethod, notes } = req.body;

    // Calculate distance for delivery orders
    let distance = 0;
    if (orderType === 'delivery' && customer.coordinates) {
      const shopLat = parseFloat(process.env.SHOP_LAT) || 12.6819;
      const shopLng = parseFloat(process.env.SHOP_LNG) || 80.0425;
      distance = calculateDistance(shopLat, shopLng, customer.coordinates.lat, customer.coordinates.lng);
      distance = Math.round(distance * 10) / 10;

      // Check delivery availability
      if (!isDeliveryAvailable(distance)) {
        return res.status(400).json({
          success: false,
          error: `Delivery not available beyond ${process.env.MAX_DELIVERY_RADIUS_KM || 15}km. Your distance: ${distance}km`
        });
      }

      // Check COD availability
      if (paymentMethod === 'cod' && !isCodAvailable(distance)) {
        return res.status(400).json({
          success: false,
          error: `Cash on Delivery not available beyond ${process.env.COD_MAX_DISTANCE_KM || 5}km. Your distance: ${distance}km. Please use online payment.`
        });
      }
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check if first order (query DB)
    const existingOrder = await Order.findOne({ 'customer.phone': customer.phone });
    const isFirstOrder = !existingOrder;

    // Calculate delivery charge
    let deliveryCharge = 0;
    if (orderType === 'delivery') {
      if (isFirstOrder) {
        deliveryCharge = 0; // Free delivery for first order
      } else {
        deliveryCharge = distance <= 3 ? 30 : distance <= 5 ? 50 : distance <= 10 ? 80 : 120;
      }
    }

    const total = subtotal + deliveryCharge;

    // Estimate delivery time
    const estimatedTime = orderType === 'pickup' ? 20 : Math.max(25, Math.round(15 + distance * 3));

    const order = await Order.create({
      customer,
      items,
      subtotal,
      deliveryCharge,
      total,
      orderType,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending', // Online is pending until Stripe webhook
      orderStatus: 'placed',
      isFirstOrder,
      distance,
      notes: notes || '',
      estimatedTime
    });

    res.status(201).json({
      success: true,
      data: order,
      message: `Order ${order.orderNumber} placed successfully!`
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// GET logged in user's order history
router.get('/history/me', protect, async (req, res) => {
  try {
    // Find all orders where customer phone or email matches the logged-in user
    const orders = await Order.find({
      $or: [
        { 'customer.email': req.user.email },
        { 'customer.phone': req.user.phone }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Fetch order history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order history' });
  }
});

// GET order by ID or order number
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order;
    
    // Check if ID is a valid MongoDB ObjectId or an orderNumber (CC-XXXXX)
    if (id.startsWith('CC-')) {
      order = await Order.findOne({ orderNumber: id });
    } else {
      order = await Order.findById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// PATCH update order status
router.patch(
  '/:id/status',
  [
    check('status', 'Invalid status').isIn(['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled'])
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status } = req.body;
    const { id } = req.params;
    let order;
    
    if (id.startsWith('CC-')) {
      order = await Order.findOneAndUpdate({ orderNumber: id }, { orderStatus: status }, { new: true });
    } else {
      order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// POST calculate distance
router.post('/distance/calculate', async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'Coordinates are required' });
  }

  const shopLat = parseFloat(process.env.SHOP_LAT) || 12.6819;
  const shopLng = parseFloat(process.env.SHOP_LNG) || 80.0425;
  const distance = calculateDistance(shopLat, shopLng, lat, lng);
  const roundedDistance = Math.round(distance * 10) / 10;

  let address = '';
  try {
    // Perform reverse geocoding safely on the server to avoid browser CORS blocks
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'User-Agent': 'CrispiestChickenApp/1.0 (contact@crispiestchicken.com)'
      }
    });
    const geoData = await response.json();
    if (geoData && geoData.display_name) {
      address = geoData.display_name;
    }
  } catch (geoErr) {
    console.error("Server-side geocoding failed:", geoErr);
  }

  res.json({
    success: true,
    data: {
      distance: roundedDistance,
      address: address,
      codAvailable: isCodAvailable(roundedDistance),
      deliveryAvailable: isDeliveryAvailable(roundedDistance),
      deliveryCharge: roundedDistance <= 3 ? 30 : roundedDistance <= 5 ? 50 : roundedDistance <= 10 ? 80 : 120
    }
  });
});

module.exports = router;
