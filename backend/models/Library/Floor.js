const mongoose = require('mongoose');

// Schema for a library floor
// When a floor is created, 250 seats are auto-generated (handled in floorController)
const floorSchema = new mongoose.Schema({
  floorNumber: { type: Number, required: true, unique: true }, // 1, 2, or 3
  name:        { type: String, required: true },               // e.g. "Ground Floor"
  totalSeats:  { type: Number, default: 250 },                 // Total seats on this floor
  status:      { type: String, enum: ['active','inactive'], default: 'active' }, // inactive = hidden from students
}, { timestamps: true });

module.exports = mongoose.model('Floor', floorSchema);