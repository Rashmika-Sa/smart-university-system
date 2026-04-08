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
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, { timestamps: true });

// Compound index to speed up conflict checks
bookingSchema.index({ space: 1, date: 1, status: 1 });

// Prevent exact duplicate slot requests/bookings for active statuses.
bookingSchema.index(
  { space: 1, date: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] },
    },
  }
);

module.exports = mongoose.model('FacilityBooking', bookingSchema);
