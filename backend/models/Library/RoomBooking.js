const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema({
  room:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  leadStudent:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupMembers: [{ type: String }], // ✅ plain strings like student emails
  date:         { type: String, required: true },
  sessions:     [{ type: Number }],
  status: {
    type:    String,
    enum:    ['pending','confirmed','cancelled','completed'],
    default: 'pending',
  },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('RoomBooking', roomBookingSchema);