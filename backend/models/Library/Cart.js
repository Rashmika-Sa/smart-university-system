const mongoose = require('mongoose');

// Schema for a student's book cart
// Each student has exactly one cart (unique: true on student field)
// Cart holds books the student wants to book — no limit on adding, but max 2 can be booked at a time
const cartSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // One cart per student
  books:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }], // Books added to cart
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);