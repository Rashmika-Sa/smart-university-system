const Bus      = require('../../models/Shuttle/Bus');
const Route    = require('../../models/Shuttle/Route');
const Schedule = require('../../models/Shuttle/Schedule');
const Booking  = require('../../models/Shuttle/Booking');

// ═══════════════════════════════════════════════
// ADMIN CONTROLLERS
// ═══════════════════════════════════════════════

// @desc    Add a new bus
// @route   POST /api/shuttles/bus
// @access  shuttle_admin
const addBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// @desc    Get all buses
// @route   GET /api/shuttles/buses
// @access  shuttle_admin
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Update a bus
// @route   PUT /api/shuttles/bus/:id
// @access  shuttle_admin
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// @desc    Delete a bus
// @route   DELETE /api/shuttles/bus/:id
// @access  shuttle_admin
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    res.json({ msg: 'Bus removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Add a new route
// @route   POST /api/shuttles/route
// @access  shuttle_admin
const addRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// @desc    Get all routes
// @route   GET /api/shuttles/routes
// @access  shuttle_admin
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Update a route
// @route   PUT /api/shuttles/route/:id
// @access  shuttle_admin
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!route) return res.status(404).json({ msg: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// @desc    Delete a route
// @route   DELETE /api/shuttles/route/:id
// @access  shuttle_admin
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ msg: 'Route not found' });
    res.json({ msg: 'Route removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Create a schedule
// @route   POST /api/shuttles/schedule
// @access  shuttle_admin
const createSchedule = async (req, res) => {
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
};

// @desc    Update a schedule
// @route   PUT /api/shuttles/schedule/:id
// @access  shuttle_admin
const updateSchedule = async (req, res) => {
  try {
    // If busId is being changed, recalculate availableSeats from new bus
    if (req.body.busId) {
      const bus = await Bus.findById(req.body.busId);
      if (!bus) return res.status(404).json({ msg: 'Bus not found' });
      req.body.availableSeats = bus.capacity;
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('busId').populate('routeId');

    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/shuttles/schedule/:id
// @access  shuttle_admin
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    res.json({ msg: 'Schedule removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Get all bookings for a specific trip
// @route   GET /api/shuttles/bookings/all?scheduleId=xxx
// @access  shuttle_admin
const getAllBookings = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) return res.status(400).json({ msg: 'scheduleId query param is required' });

    const bookings = await Booking.find({ scheduleId })
      .populate('userId', 'name email universityId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Update booking payment status (admin confirms payment)
// @route   PUT /api/shuttles/booking/:id
// @access  shuttle_admin
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true, runValidators: true }
    ).populate('userId', 'name email universityId');

    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// ═══════════════════════════════════════════════
// STUDENT CONTROLLERS
// ═══════════════════════════════════════════════

// @desc    Get all available schedules
// @route   GET /api/shuttles/schedules
// @access  any logged-in user
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ availableSeats: { $gt: 0 } })
      .populate('busId')
      .populate('routeId');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Reserve a seat
// @route   POST /api/shuttles/reserve
// @access  any logged-in user
const reserveSeat = async (req, res) => {
  try {
    const { scheduleId, seatNumber } = req.body;
    const userId = req.user.id;

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

    // Rule 3: Prevent duplicate booking
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
};

// @desc    Get student's own booking history
// @route   GET /api/shuttles/my-bookings
// @access  any logged-in user
const getMyBookings = async (req, res) => {
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
};

// @desc    Cancel a booking
// @route   DELETE /api/shuttles/cancel/:bookingId
// @access  any logged-in user
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Student can only cancel their own booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
    }

    // Restore the seat back to schedule
    await Schedule.findByIdAndUpdate(booking.scheduleId, { $inc: { availableSeats: 1 } });
    await booking.deleteOne();

    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Get taken seats for a schedule
// @route   GET /api/shuttles/seats/:scheduleId
// @access  any logged-in user
const getTakenSeats = async (req, res) => {
  try {
    const bookings = await Booking.find(
      { scheduleId: req.params.scheduleId },
      'seatNumber'
    );
    const takenSeats = bookings.map(b => b.seatNumber);
    res.json({ takenSeats });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
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
};