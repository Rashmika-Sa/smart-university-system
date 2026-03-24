const express  = require('express');
const router   = express.Router();

const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  addBus,
  getAllBuses,
  updateBus,
  deleteBus,
  addRoute,
  getAllRoutes,
  updateRoute,
  deleteRoute,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAllBookings,
  updateBooking,
  getSchedules,
  reserveSeat,
  getMyBookings,
  cancelBooking,
  getTakenSeats
} = require('../../controllers/Shuttle/shuttleController');

// ═══════════════════════════════════════════════
// ADMIN ROUTES — role: 'shuttle_admin'
// ═══════════════════════════════════════════════

// Bus
router.post('/bus',            protect, authorize('shuttle_admin'), addBus);
router.get('/buses',           protect, authorize('shuttle_admin'), getAllBuses);
router.put('/bus/:id',         protect, authorize('shuttle_admin'), updateBus);
router.delete('/bus/:id',      protect, authorize('shuttle_admin'), deleteBus);

// Route
router.post('/route',          protect, authorize('shuttle_admin'), addRoute);
router.get('/routes',          protect, authorize('shuttle_admin'), getAllRoutes);
router.put('/route/:id',       protect, authorize('shuttle_admin'), updateRoute);
router.delete('/route/:id',    protect, authorize('shuttle_admin'), deleteRoute);

// Schedule
router.post('/schedule',       protect, authorize('shuttle_admin'), createSchedule);
router.put('/schedule/:id',    protect, authorize('shuttle_admin'), updateSchedule);
router.delete('/schedule/:id', protect, authorize('shuttle_admin'), deleteSchedule);

// Bookings
router.get('/bookings/all',    protect, authorize('shuttle_admin'), getAllBookings);
router.put('/booking/:id',     protect, authorize('shuttle_admin'), updateBooking);

// ═══════════════════════════════════════════════
// STUDENT ROUTES — any logged-in user
// ═══════════════════════════════════════════════
router.get('/schedules',            protect, getSchedules);
router.post('/reserve',             protect, reserveSeat);
router.get('/my-bookings',          protect, getMyBookings);
router.delete('/cancel/:bookingId', protect, cancelBooking);
router.get('/seats/:scheduleId',    protect, getTakenSeats);

module.exports = router;