const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FacilitySpace',
    required: true
  },
  booker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date:      { type: String, required: true },  // "YYYY-MM-DD"
  startTime: { type: String, required: true },  // "10:00"
  endTime:   { type: String, required: true },  // "11:00"
  label: {
    type: String,
    required: [true, 'Booking purpose is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

// Compound index to speed up conflict checks
bookingSchema.index({ space: 1, date: 1, status: 1 });

module.exports = mongoose.model('FacilityBooking', bookingSchema);
