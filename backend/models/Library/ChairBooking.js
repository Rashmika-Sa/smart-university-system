const mongoose = require('mongoose');

// Schema for a chair/seat booking made by a student
const chairBookingSchema = new mongoose.Schema({
  seat:      { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }, // Which seat was booked
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who booked it
  date:      { type: String, required: true },     // Booking date e.g. "2026-05-10"
  timeSlot:  { type: String, required: true },     // "morning" | "afternoon" | "evening"
  status: {
    type:    String,
    enum:    ['pending','confirmed','cancelled','completed'],
    default: 'pending', // Starts as pending until admin approves
  },
  adminNote: { type: String, default: '' }, // Optional note from admin
}, { timestamps: true });

module.exports = mongoose.model('ChairBooking', chairBookingSchema);