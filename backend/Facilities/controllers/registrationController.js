const User             = require('../../models/Auth/User');
const { Registration } = require('../models');
const { notifyApproved, notifyRejected } = require('../email');

// GET /api/facilities/registrations?status=pending|approved|rejected
// reviewer roles (sports_council, facility_admin) → see all registrations
const getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const registrations = await Registration.find(filter)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/facilities/registrations/:id
const getOne = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name');

    if (!registration) return res.status(404).json({ msg: 'Registration not found' });

    res.json(registration);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/facilities/registrations/:id/approve
const approve = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('user');
    if (!registration) return res.status(404).json({ msg: 'Registration not found' });
    if (registration.status !== 'pending') {
      return res.status(400).json({ msg: 'Registration has already been reviewed' });
    }

    registration.status    = 'approved';
    registration.reviewedBy = req.user.id;
    registration.reviewedAt = new Date();
    await registration.save();

    await User.findByIdAndUpdate(registration.user._id, { facilityStatus: 'approved' });
    await notifyApproved(registration.user);

    res.json({ msg: 'Registration approved' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/facilities/registrations/:id/reject
// Body: { reason: string } (optional)
const reject = async (req, res) => {
  try {
    const { reason } = req.body;
    const registration = await Registration.findById(req.params.id).populate('user');
    if (!registration) return res.status(404).json({ msg: 'Registration not found' });
    if (registration.status !== 'pending') {
      return res.status(400).json({ msg: 'Registration has already been reviewed' });
    }

    registration.status          = 'rejected';
    registration.rejectionReason = reason || '';
    registration.reviewedBy      = req.user.id;
    registration.reviewedAt      = new Date();
    await registration.save();

    await User.findByIdAndUpdate(registration.user._id, { facilityStatus: 'rejected' });
    await notifyRejected(registration.user, reason);

    res.json({ msg: 'Registration rejected' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getAll, getOne, approve, reject };
