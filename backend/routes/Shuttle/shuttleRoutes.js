const express  = require('express');
const router   = express.Router();

const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  addBus,
  getAllBuses,
  deleteBus,
  addRoute,
  getAllRoutes,
  createSchedule,
  deleteSchedule,
  getAllBookings,
  getSchedules,
  reserveSeat,
  getMyBookings,
  cancelBooking,
  getTakenSeats
} = require('../../controllers/Shuttle/shuttleController');

// ═══════════════════════════════════════════════
// ADMIN ROUTES — role: 'shuttle_admin'
// ═══════════════════════════════════════════════
router.post('/bus',            protect, authorize('shuttle_admin'), addBus);
router.get('/buses',           protect, authorize('shuttle_admin'), getAllBuses);
router.delete('/bus/:id',      protect, authorize('shuttle_admin'), deleteBus);
router.post('/route',          protect, authorize('shuttle_admin'), addRoute);
router.get('/routes',          protect, authorize('shuttle_admin'), getAllRoutes);
router.post('/schedule',       protect, authorize('shuttle_admin'), createSchedule);
router.delete('/schedule/:id', protect, authorize('shuttle_admin'), deleteSchedule);
router.get('/bookings/all',    protect, authorize('shuttle_admin'), getAllBookings);

// ═══════════════════════════════════════════════
// STUDENT ROUTES — any logged-in user
// ═══════════════════════════════════════════════
router.get('/schedules',            protect, getSchedules);
router.post('/reserve',             protect, reserveSeat);
router.get('/my-bookings',          protect, getMyBookings);
router.delete('/cancel/:bookingId', protect, cancelBooking);
router.get('/seats/:scheduleId',    protect, getTakenSeats);

module.exports = router;