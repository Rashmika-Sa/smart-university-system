const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/Order/orderController');

// @route   POST /api/orders/create
// @desc    Create a new order
// @access  Public (or Protected if you add auth middleware)
router.post('/create', async (req, res) => {
  try {
    const { items, totalAmount, canteen, paymentMethod, studentId } = req.body;

    const newOrder = new Order({
      items,
      totalAmount,
      canteen,
      paymentMethod,
      studentId,
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get orders for a specific student (for history page)
router.get('/my-orders/:studentId', async (req, res) => {
    try {
        const orders = await Order.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;