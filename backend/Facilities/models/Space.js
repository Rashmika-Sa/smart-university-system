const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Space name is required'],
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Sports Facility', 'Event Space'],
    required: [true, 'Space type is required']
  },
  openTime: {
    type: String,
    required: [true, 'Open time is required']   // "08:00"
  },
  closeTime: {
    type: String,
    required: [true, 'Close time is required']  // "22:00"
  },
  slotDuration: {
    type: Number,
    default: 60   // minutes
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('FacilitySpace', spaceSchema);
