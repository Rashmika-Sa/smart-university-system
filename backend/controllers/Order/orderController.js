const Order = require('../../models/Order/order');

// Create New Order
exports.createOrder = async (req, res) => {
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
};