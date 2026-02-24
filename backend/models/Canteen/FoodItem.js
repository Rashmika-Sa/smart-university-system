const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['Rice', 'Short Eats', 'Beverage', 'Dessert'], 
    required: true,
  },
  canteen: { 
    type: String,
    enum: ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)'], 
    required: true,
  },
  image: {
    type: String, 
    default: 'https://placehold.co/150'
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'ID of the admin who created this item'
  }
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', foodItemSchema);