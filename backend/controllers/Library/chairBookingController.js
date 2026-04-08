const ChairBooking = require('../../models/Library/ChairBooking');
const Seat         = require('../../models/Library/Seat');

// Allowed time slots for chair booking
const VALID_SLOTS = ['morning', 'afternoon', 'evening'];

// GET /api/library/chair-bookings/seats?floorId=&date=&timeSlot=
// Returns all seats on a floor with their availability status for a given date and time slot
// Used by the frontend seat map to show green/red seats
exports.getSeatsWithAvailability = async (req, res) => {
  const { floorId, date, timeSlot } = req.query;

  // All three query params are required to check availability
  if (!floorId || !date || !timeSlot)
    return res.status(400).json({ msg: 'floorId, date and timeSlot are required' });

  try {
    // Get all active seats for this floor
    const seats = await Seat.find({ floor: floorId, status: 'active' });

    // Get all pending/confirmed bookings for these seats on the given date and time slot
    const bookings = await ChairBooking.find({
      seat:    { $in: seats.map(s => s._id) },
      date,
      timeSlot,
      status:  { $in: ['pending','confirmed'] },
    });

    // Build a set of booked seat IDs for quick lookup
    const bookedSeatIds = new Set(bookings.map(b => b.seat.toString()));

    // Check if the logged-in student already has a booking for this slot
    const myBooking = bookings.find(b => b.student.toString() === req.user.id);

    // Map seats to include availability and ownership flags
    const result = seats.map(seat => ({
      _id:        seat._id,
      seatNumber: seat.seatNumber,
      isBooked:   bookedSeatIds.has(seat._id.toString()), // true = seat taken
      isMine:     myBooking?.seat.toString() === seat._id.toString(), // true = booked by me
    }));

    res.json({ 
      seats:       result, 
      myBookingId: myBooking?._id || null, // Pass booking ID so student can cancel from the map
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/library/chair-bookings
// Student books a specific seat for a date and time slot
exports.createBooking = async (req, res) => {
  const { seatId, date, timeSlot } = req.body;

  // Validate time slot value
  if (!VALID_SLOTS.includes(timeSlot))
    return res.status(400).json({ msg: 'Invalid time slot. Use morning, afternoon or evening' });

  try {
    // Check the seat exists and is currently active (not disabled by admin)
    const seat = await Seat.findOne({ _id: seatId, status: 'active' });
    if (!seat) return res.status(404).json({ msg: 'Seat not found or unavailable' });

    // Check this specific seat is not already booked by someone else for the same date/slot
    const seatTaken = await ChairBooking.findOne({
      seat:   seatId,
      date,
      timeSlot,
      status: { $in: ['pending','confirmed'] },
    });
    if (seatTaken)
      return res.status(400).json({ msg: 'This seat is already booked for the selected time slot' });

    // Check the student doesn't already have any seat booked for the same date/slot
    // One student can only occupy one seat per time slot
    const alreadyBooked = await ChairBooking.findOne({
      student: req.user.id,
      date,
      timeSlot,
      status:  { $in: ['pending','confirmed'] },
    });
    if (alreadyBooked)
      return res.status(400).json({ msg: 'You already have a seat booked for this date and time slot' });

    // All checks passed — create the booking
    const booking = await ChairBooking.create({
      seat:     seatId,
      student:  req.user.id,
      date,
      timeSlot,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// GET /api/library/chair-bookings/my
// Student gets their own chair bookings with seat and floor details
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await ChairBooking
      .find({ student: req.user.id })
      .populate({
        path:     'seat',
        populate: { path: 'floor', select: 'name floorNumber' }, // Nested populate to get floor info through seat
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/library/chair-bookings/:id
// Student cancels their own pending chair booking
exports.cancelMyBooking = async (req, res) => {
  try {
    // Only find bookings that belong to the logged-in student
    const booking = await ChairBooking.findOne({
      _id:     req.params.id,
      student: req.user.id,
    });
    if (!booking)
      return res.status(404).json({ msg: 'Booking not found' });

    // Students can only cancel pending bookings — not confirmed or completed
    if (booking.status !== 'pending')
      return res.status(400).json({ msg: 'Only pending bookings can be cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/chair-bookings
// Admin only — get all chair bookings with optional filters
exports.getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;   // Filter by status
    if (req.query.date)     filter.date      = req.query.date;     // Filter by date
    if (req.query.timeSlot) filter.timeSlot  = req.query.timeSlot; // Filter by time slot

    const bookings = await ChairBooking
      .find(filter)
      .populate('student', 'name email universityId') // Student details
      .populate({
        path:     'seat',
        populate: { path: 'floor', select: 'name floorNumber' }, // Floor info through seat
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/library/chair-bookings/:id/status
// Admin only — confirms or cancels a chair booking with optional note
exports.updateStatus = async (req, res) => {
  const { status, adminNote } = req.body;

  // Only confirmed or cancelled allowed from admin action
  if (!['confirmed','cancelled'].includes(status))
    return res.status(400).json({ msg: 'Status must be confirmed or cancelled' });

  try {
    const booking = await ChairBooking.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('student', 'name email');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};