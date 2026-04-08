const express = require('express');
const router  = express.Router();
const { libraryProtect, libraryAdmin } = require('../../middleware/authMiddleware');
const {
  getSeatsWithAvailability,
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  updateStatus,
} = require('../../controllers/Library/chairBookingController');

// IMPORTANT: /seats and /my must come BEFORE /:id to avoid Express param conflict

// Student routes
router.get('/seats',        libraryProtect,               getSeatsWithAvailability); // Seat map with availability
router.get('/my',           libraryProtect,               getMyBookings);            // Own bookings
router.post('/',            libraryProtect,               createBooking);            // Book a seat
router.delete('/:id',       libraryProtect,               cancelMyBooking);          // Cancel own booking

// Admin routes
router.get('/',             libraryProtect, libraryAdmin, getAllBookings);            // All bookings
router.patch('/:id/status', libraryProtect, libraryAdmin, updateStatus);             // Confirm or cancel

module.exports = router;