const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  canteen: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'Cash', 'Pre-order'], 
    required: true
  },
  //The specific date they want the food
  preOrderDate: {
    type: Date,
    required: true 
  },
  //statuses for the approval flow
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending' 
  },

  remarks: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);