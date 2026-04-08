const express = require('express');
const router  = express.Router();
const { libraryProtect, libraryAdmin } = require('../../middleware/authMiddleware');
const {
  createBooking,
  updateMyBooking,
  getMyBookings,
  getAvailability,
  getAllBookings,
  updateStatus,
  cancelMyBooking,
} = require('../../controllers/Library/roomBookingController');

// IMPORTANT: Specific routes (/my, /availability) must come BEFORE param routes (/:id)
// Otherwise Express will treat 'my' and 'availability' as an :id value

// Student routes
router.get('/my',           libraryProtect,               getMyBookings);    // Get own bookings
router.get('/availability', libraryProtect,               getAvailability);  // Check session availability
router.post('/',            libraryProtect,               createBooking);    // Create booking
router.put('/:id',          libraryProtect,               updateMyBooking);  // Update own pending booking
router.delete('/:id',       libraryProtect,               cancelMyBooking);  // Cancel own booking

// Admin routes
router.get('/',             libraryProtect, libraryAdmin, getAllBookings);   // Get all bookings
router.patch('/:id/status', libraryProtect, libraryAdmin, updateStatus);    // Confirm or cancel

module.exports = router;