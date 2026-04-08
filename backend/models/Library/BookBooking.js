const mongoose = require('mongoose');

// Schema for a book borrowing request made from the cart
// Maximum 2 books per booking — enforced in controller
const bookBookingSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who is borrowing
  books:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],               // Which books (max 2)
  bookingDate: { type: String, required: true }, // Date student wants to collect the books
  returnDate:  { type: String, default: '' },    // Return deadline — set by admin when confirming
  status: {
    type:    String,
    enum:    ['pending','confirmed','collected','returned','overdue','cancelled'],
    default: 'pending', // Lifecycle: pending → confirmed → collected → returned
  },
  adminNote: { type: String, default: '' }, // Admin note e.g. return instructions or cancellation reason
}, { timestamps: true });

module.exports = mongoose.model('BookBooking', bookBookingSchema);