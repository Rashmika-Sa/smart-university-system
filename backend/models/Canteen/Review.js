const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  canteen: {
    type: String,
    enum: ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)'],
    required: true,
  },
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    default: null,  // null = general canteen review
  },
  foodItemName: {
    type: String,
    default: null,  // snapshot of name at review time
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  category: {
    type: String,
    enum: ['food_quality', 'service', 'cleanliness', 'value', 'general'],
    default: 'general',
  },
  comment: {
    type: String,
    maxlength: 500,
    default: '',
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  // Always stored but only exposed if !isAnonymous
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,  // stored snapshot so deleting user doesn't break display
  },
  likes: {
    type: Number,
    default: 0,
  },
  reply: {
    text: { type: String, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    repliedByName: { type: String, default: null },
    repliedAt: { type: Date, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
