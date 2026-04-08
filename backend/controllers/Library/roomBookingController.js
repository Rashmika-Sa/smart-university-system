const RoomBooking = require('../../models/Library/RoomBooking');
const User = require('../../models/Auth/User');

async function validate({ groupMembers, roomId, date, sessions, excludeId, leadStudentId }) {

  // Rule 1: group size 4–5
  if (groupMembers.length < 4 || groupMembers.length > 5)
    return 'Group must have 4 to 5 students';

  const normalizedMembers = groupMembers.map(member => member.trim().toLowerCase());
  const invalidEmails = normalizedMembers.filter(member => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member));
  if (invalidEmails.length > 0)
    return `All group members must be valid email addresses. Invalid: ${invalidEmails.join(', ')}`;

  const studentUsers = await User.find({
    email: { $in: normalizedMembers },
    role: 'student',
  }).select('email');

  const foundEmails = new Set(studentUsers.map(user => user.email.toLowerCase()));
  const missingEmails = normalizedMembers.filter(member => !foundEmails.has(member));
  if (missingEmails.length > 0)
    return `Student account not found for: ${missingEmails.join(', ')}`;

  // Rule 3: same lead student max 2 sessions per day in this room
  // ✅ Use leadStudentId (MongoDB ObjectId) not groupMembers[0] (string)
  const q = {
    room:        roomId,
    date,
    leadStudent: leadStudentId,
    status:      { $nin: ['cancelled'] },
    ...(excludeId && { _id: { $ne: excludeId } }),
  };
  const existing    = await RoomBooking.find(q);
  const bookedCount = existing.reduce((sum, b) => sum + b.sessions.length, 0);
  if (bookedCount + sessions.length > 2)
    return 'Your team cannot book more than 2 sessions per day in the same room';

  // Rule 4: no session conflict
  const conflict = await RoomBooking.findOne({
    room:     roomId,
    date,
    sessions: { $in: sessions },
    status:   { $in: ['pending','confirmed'] },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });
  if (conflict) return 'One or more selected sessions are already booked';

  return null;
}

// POST /api/library/room-bookings
exports.createBooking = async (req, res) => {
  const { groupMembers, date, sessions, roomId } = req.body;
  const leadStudentId = req.user.id; // ✅ MongoDB ObjectId from JWT token

  const error = await validate({ groupMembers, roomId, date, sessions, leadStudentId });
  if (error) return res.status(400).json({ msg: error });

  try {
    const normalizedMembers = groupMembers.map(member => member.trim().toLowerCase());
    const booking = await RoomBooking.create({
      room:        roomId,
      leadStudent: leadStudentId, // ✅ MongoDB ObjectId
      groupMembers: normalizedMembers,
      date,
      sessions,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// PUT /api/library/room-bookings/:id
// Student updates own pending room booking
exports.updateMyBooking = async (req, res) => {
  try {
    const booking = await RoomBooking.findOne({
      _id: req.params.id,
      leadStudent: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ msg: 'Only pending bookings can be edited' });
    }

    const roomId = req.body.roomId || booking.room.toString();
    const date = req.body.date || booking.date;
    const sessions = Array.isArray(req.body.sessions) && req.body.sessions.length > 0
      ? req.body.sessions
      : booking.sessions;
    const groupMembers = Array.isArray(req.body.groupMembers) && req.body.groupMembers.length > 0
      ? req.body.groupMembers
      : booking.groupMembers;

    const error = await validate({
      groupMembers,
      roomId,
      date,
      sessions,
      excludeId: booking._id,
      leadStudentId: req.user.id,
    });

    if (error) {
      return res.status(400).json({ msg: error });
    }

    booking.room = roomId;
    booking.date = date;
    booking.sessions = sessions;
    booking.groupMembers = groupMembers.map(member => member.trim().toLowerCase());

    await booking.save();

    const updatedBooking = await RoomBooking.findById(booking._id)
      .populate('room', 'name floor sessions availableDays status');

    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// GET /api/library/room-bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await RoomBooking
      .find({ leadStudent: req.user.id })
      .populate('room', 'name floor sessions')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/room-bookings/availability?roomId=&date=
exports.getAvailability = async (req, res) => {
  const { roomId, date, excludeId } = req.query;
  try {
    const bookings = await RoomBooking.find({
      room:   roomId,
      date,
      status: { $in: ['pending','confirmed'] },
      ...(excludeId && { _id: { $ne: excludeId } }),
    });
    const bookedSessions = [...new Set(bookings.flatMap(b => b.sessions))];
    res.json({ bookedSessions });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/room-bookings — admin
exports.getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date)   filter.date   = req.query.date;
    if (req.query.roomId) filter.room   = req.query.roomId;

    const bookings = await RoomBooking
      .find(filter)
      .populate('room',        'name floor')
      .populate('leadStudent', 'name email universityId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/library/room-bookings/:id/status — admin
exports.updateStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  if (!['confirmed','cancelled'].includes(status))
    return res.status(400).json({ msg: 'Status must be confirmed or cancelled' });

  try {
    const booking = await RoomBooking.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('room', 'name');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/library/room-bookings/:id — student cancels own
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await RoomBooking.findOne({
      _id:         req.params.id,
      leadStudent: req.user.id,
    });
    if (!booking)
      return res.status(404).json({ msg: 'Booking not found' });
    if (booking.status !== 'pending')
      return res.status(400).json({ msg: 'Only pending bookings can be cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};