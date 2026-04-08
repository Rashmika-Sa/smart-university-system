const mongoose = require('mongoose');

// Sub-schema for individual session inside a room
// Each room has exactly 4 sessions per day
const sessionSchema = new mongoose.Schema({
  sessionNumber: { type: Number, required: true }, // 1, 2, 3, or 4
  startTime:     { type: String, required: true }, // e.g. "08:00"
  endTime:       { type: String, required: true }, // e.g. "10:00"
  label:         { type: String, default: '' },    // e.g. "Morning Session"
});

// Main Room schema
const roomSchema = new mongoose.Schema({
  name:          { type: String, required: true, unique: true }, // e.g. "Study Room A"
  floor:         { type: String, required: true },               // e.g. "2nd Floor"
  description:   { type: String, default: '' },                  // Optional room description
  sessions:      [sessionSchema],                                 // Array of 4 session objects
  availableDays: [{ type: String }],                             // e.g. ["Mon","Tue","Wed","Thu","Fri"]
  status:        { type: String, enum: ['active','inactive'], default: 'active' }, // inactive = hidden from students
}, { timestamps: true }); // createdAt and updatedAt auto-managed

module.exports = mongoose.model('Room', roomSchema);