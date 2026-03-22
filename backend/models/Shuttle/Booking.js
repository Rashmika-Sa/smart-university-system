const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User is required'] 
  },
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Schedule', 
    required: [true, 'Schedule is required'] 
  },
  seatNumber: { 
    type: Number, 
    required: [true, 'Seat number is required'],
    min: [1, 'Seat number must be at least 1']
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Confirmed'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);