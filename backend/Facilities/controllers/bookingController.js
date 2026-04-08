const User = require('../../models/Auth/User');
const { Booking, Space } = require('../models');
const { notifyBookingConfirmed, notifyBookingCancelled } = require('../email');

// POST /api/facilities/bookings
// Requires: approved team_captain or society
const create = async (req, res) => {
  try {
    const { spaceId, date, startTime, endTime, label } = req.body;

    const space = await Space.findById(spaceId);
    if (!space || space.status !== 'active') {
      return res.status(404).json({ msg: 'Space not found or inactive' });
    }

    if (req.user.role === 'team_captain' && space.type === 'Event Space') {
      return res.status(403).json({ msg: 'Team captains can only book sports facilities.' });
    }

    // Block overlaps against both pending requests and confirmed bookings.
    const conflict = await Booking.findOne({
      space: spaceId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json({ msg: 'This time slot is already requested/booked' });
    }

    const booking = await Booking.create({
      space: spaceId,
      booker: req.user.id,
      date,
      startTime,
      endTime,
      label,
      status: 'pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('space', 'name type')
      .populate('booker', 'name email role teamName societyName');

    res.status(201).json(populated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ msg: 'This space is already booked/requested for the selected slot.' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/facilities/bookings
// team_captain / society → own bookings, optional ?status=upcoming|past|cancelled|pending|rejected
// reviewer roles         → all bookings, optional ?spaceId=&from=&to=&bookerType=&status=
const getAll = async (req, res) => {
  try {
    const { status, spaceId, from, to, bookerType } = req.query;
    const filter = {};
    const today = new Date().toISOString().split('T')[0];

    if (['team_captain', 'society'].includes(req.user.role) && req.query.calendar !== 'true') {
      filter.booker = req.user.id;

      if (status === 'upcoming') {
        filter.status = 'confirmed';
        filter.date = { $gte: today };
      } else if (status === 'past') {
        filter.status = 'confirmed';
        filter.date = { $lt: today };
      } else if (status === 'cancelled') {
        filter.status = 'cancelled';
      } else if (status === 'pending') {
        filter.status = 'pending';
      } else if (status === 'rejected') {
        filter.status = 'rejected';
      }
    } else {
      if (spaceId) filter.space = spaceId;
      if (status) filter.status = status;

      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (to) filter.date.$lte = to;
      }

      if (bookerType) {
        const bookers = await User.find({ role: bookerType }).select('_id');
        filter.booker = { $in: bookers.map((b) => b._id) };
      }
    }

    const bookings = await Booking.find(filter)
      .populate('space', 'name type')
      .populate('booker', 'name email role teamName societyName')
      .populate('reviewedBy', 'name email role')
      .sort({ date: 1, startTime: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/facilities/bookings/:id
const getOne = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('space', 'name type')
      .populate('booker', 'name email role teamName societyName')
      .populate('reviewedBy', 'name email role');

    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (['team_captain', 'society'].includes(req.user.role) && booking.booker?._id?.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/facilities/bookings/:id/status
// Reviewer action: confirm or reject pending booking requests
const updateStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'status must be confirmed or rejected' });
    }

    const booking = await Booking.findById(req.params.id).populate('space', 'name type');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (booking.status !== 'pending') {
      return res.status(400).json({ msg: 'Only pending bookings can be reviewed' });
    }

    if (status === 'confirmed') {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        space: booking.space._id,
        date: booking.date,
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
      });

      if (conflict) {
        return res.status(409).json({ msg: 'Cannot approve. This slot conflicts with another request/booking.' });
      }
    }

    booking.status = status;
    booking.rejectionReason = status === 'rejected' ? (reason || '') : '';
    booking.reviewedBy = req.user.id;
    booking.reviewedAt = new Date();
    await booking.save();

    if (status === 'confirmed') {
      const user = await User.findById(booking.booker);
      if (user) {
        await notifyBookingConfirmed(user, booking, booking.space);
      }
    }

    const updated = await Booking.findById(booking._id)
      .populate('space', 'name type')
      .populate('booker', 'name email role teamName societyName')
      .populate('reviewedBy', 'name email role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// DELETE /api/facilities/bookings/:id
// Requires: approved team_captain or society (owner only)
const cancel = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('space', 'name type');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (booking.booker.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You can only cancel your own bookings' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ msg: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const user = await User.findById(req.user.id);
    await notifyBookingCancelled(user, booking, booking.space);

    res.json({ msg: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { create, getAll, getOne, updateStatus, cancel };
