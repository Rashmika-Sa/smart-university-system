const express = require('express');
const router  = express.Router();
const { libraryProtect, libraryAdmin } = require('../../middleware/authMiddleware');
const {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  updateStatus,
} = require('../../controllers/Library/bookBookingController');

// IMPORTANT: /my must come BEFORE /:id to avoid Express param conflict

// Student routes
router.post('/',            libraryProtect,               createBooking);   // Book from cart (max 2 books)
router.get('/my',           libraryProtect,               getMyBookings);   // Own book bookings
router.delete('/:id',       libraryProtect,               cancelMyBooking); // Cancel own pending booking

// Admin routes
router.get('/',             libraryProtect, libraryAdmin, getAllBookings);   // All book bookings
router.patch('/:id/status', libraryProtect, libraryAdmin, updateStatus);    // Confirm, collect, return, cancel

module.exports = router;