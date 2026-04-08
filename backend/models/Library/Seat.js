const mongoose = require('mongoose');

// Schema for an individual seat on a floor
// Seats are auto-generated when a floor is created — not manually added
const seatSchema = new mongoose.Schema({
  floor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true }, // Which floor this seat belongs to
  seatNumber: { type: Number, required: true },                                        // Seat number 1-250
  status:     { type: String, enum: ['active','inactive'], default: 'active' },       // Admin can disable a seat e.g. for maintenance
}, { timestamps: true });

// Compound index — ensures no duplicate seat numbers on the same floor
seatSchema.index({ floor: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);