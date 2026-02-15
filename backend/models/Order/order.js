const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
      name: String, // Storing name as snapshot in case menu changes
      qty: Number,
      price: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  canteen: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'Cash'],
    default: 'Cash'
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);