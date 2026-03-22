const express  = require('express');
const router   = express.Router();

const { protect, authorize } = require('../../middleware/authMiddleware');

const Bus      = require('../../models/Shuttle/Bus');
const Route    = require('../../models/Shuttle/Route');
const Schedule = require('../../models/Shuttle/Schedule');
const Booking  = require('../../models/Shuttle/Booking');

// ═══════════════════════════════════════════════
// ADMIN ROUTES — role: 'shuttle_admin'
// ═══════════════════════════════════════════════

// POST /api/shuttles/bus — Add a new bus
router.post('/bus', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// POST /api/shuttles/route — Add a new route
router.post('/route', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// POST /api/shuttles/schedule — Create a schedule
// Auto-fills availableSeats from the bus capacity
router.post('/schedule', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.body.busId);
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });

    const schedule = await Schedule.create({
      ...req.body,
      availableSeats: bus.capacity
    });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// GET /api/shuttles/bookings/all?scheduleId=xxx — View all bookings for a trip
router.get('/bookings/all', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) return res.status(400).json({ msg: 'scheduleId query param is required' });

    const bookings = await Booking.find({ scheduleId })
      .populate('userId', 'name email universityId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/shuttles/buses — View all buses (admin dashboard)
router.get('/buses', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/shuttles/routes — View all routes (admin dashboard)
router.get('/routes', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE /api/shuttles/bus/:id — Remove a bus
router.delete('/bus/:id', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    res.json({ msg: 'Bus removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE /api/shuttles/schedule/:id — Remove a schedule
router.delete('/schedule/:id', protect, authorize('shuttle_admin'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    res.json({ msg: 'Schedule removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ═══════════════════════════════════════════════
// STUDENT ROUTES — any logged-in user
// ═══════════════════════════════════════════════

// GET /api/shuttles/schedules — View all available schedules
router.get('/schedules', protect, async (req, res) => {
  try {
    const schedules = await Schedule.find({ availableSeats: { $gt: 0 } })
      .populate('busId')
      .populate('routeId');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST /api/shuttles/reserve — Book a seat
router.post('/reserve', protect, async (req, res) => {
  try {
    const { scheduleId, seatNumber } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!scheduleId || !seatNumber) {
      return res.status(400).json({ msg: 'scheduleId and seatNumber are required' });
    }

    // Rule 1: Check schedule exists and has seats
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    if (schedule.availableSeats === 0) {
      return res.status(400).json({ msg: 'No seats available on this trip' });
    }

    // Rule 2: Check if this specific seat is already taken
    const seatTaken = await Booking.findOne({ scheduleId, seatNumber });
    if (seatTaken) {
      return res.status(400).json({ msg: `Seat ${seatNumber} is already booked` });
    }

    // Rule 3: Prevent duplicate booking (one booking per student per trip)
    const alreadyBooked = await Booking.findOne({ userId, scheduleId });
    if (alreadyBooked) {
      return res.status(400).json({ msg: 'You already have a booking for this trip' });
    }

    // Create booking and decrement available seats
    const booking = await Booking.create({ userId, scheduleId, seatNumber });
    await Schedule.findByIdAndUpdate(scheduleId, { $inc: { availableSeats: -1 } });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/shuttles/my-bookings — Student's own booking history
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'scheduleId',
        populate: [
          { path: 'busId' },
          { path: 'routeId' }
        ]
      });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE /api/shuttles/cancel/:bookingId — Student cancels their own booking
router.delete('/cancel/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Make sure the student can only cancel their own booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
    }

    // Restore the seat back to the schedule
    await Schedule.findByIdAndUpdate(booking.scheduleId, { $inc: { availableSeats: 1 } });
    await booking.deleteOne();

    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/shuttles/seats/:scheduleId — Get taken seats for a schedule (for seat picker UI)
router.get('/seats/:scheduleId', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ scheduleId: req.params.scheduleId }, 'seatNumber');
    const takenSeats = bookings.map(b => b.seatNumber);
    res.json({ takenSeats });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;