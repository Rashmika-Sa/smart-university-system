const User = require('../../models/Auth/User');
const { Application } = require('../models');

// POST /api/facilities/applications
// student submits application for team_captain or society
const createApplication = async (req, res) => {
  try {
    const { applyFor, teamName, sportName, societyName, statement } = req.body;

    if (!['team_captain', 'society'].includes(applyFor)) {
      return res.status(400).json({ msg: 'applyFor must be team_captain or society' });
    }

    if (applyFor === 'team_captain' && (!teamName || !sportName)) {
      return res.status(400).json({ msg: 'teamName and sportName are required for team captain applications' });
    }

    if (applyFor === 'society' && !societyName) {
      return res.status(400).json({ msg: 'societyName is required for society applications' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.role !== 'student') {
      return res.status(400).json({ msg: 'Only students can submit applications' });
    }

    const pendingExisting = await Application.findOne({ user: req.user.id, status: 'pending' });
    if (pendingExisting) {
      return res.status(409).json({ msg: 'You already have a pending application' });
    }

    const application = await Application.create({
      user: req.user.id,
      applyFor,
      teamName: applyFor === 'team_captain' ? String(teamName || '').trim() : '',
      sportName: applyFor === 'team_captain' ? String(sportName || '').trim() : '',
      societyName: applyFor === 'society' ? String(societyName || '').trim() : '',
      statement: String(statement || '').trim(),
    });

    const populated = await Application.findById(application._id)
      .populate('user', 'name email role universityId')
      .populate('reviewedBy', 'name email role');

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/facilities/applications/my
const getMyApplications = async (req, res) => {
  try {
    const docs = await Application.find({ user: req.user.id })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/facilities/applications?status=pending|approved|rejected&applyFor=team_captain|society
const getAllApplications = async (req, res) => {
  try {
    const { status, applyFor } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (applyFor && ['team_captain', 'society'].includes(applyFor)) {
      filter.applyFor = applyFor;
    }

    const docs = await Application.find(filter)
      .populate('user', 'name email role universityId')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/facilities/applications/:id/review
// body: { status: approved|rejected, reason?: string }
const reviewApplication = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'status must be approved or rejected' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    if (application.status !== 'pending') {
      return res.status(400).json({ msg: 'Application already reviewed' });
    }

    const existingUser = await User.findById(application.user);
    if (!existingUser) {
      return res.status(404).json({ msg: 'User record not found for this application' });
    }

    if (status === 'approved') {
      const roleUpdate = {
        role: application.applyFor,
        facilityStatus: 'approved',
      };

      if (application.applyFor === 'team_captain') {
        roleUpdate.teamName = application.teamName || existingUser.teamName || '';
        roleUpdate.societyName = '';
      } else {
        roleUpdate.societyName = application.societyName || existingUser.societyName || '';
        roleUpdate.teamName = '';
      }

      await User.findByIdAndUpdate(application.user, roleUpdate, { runValidators: true });
    } else {
      await User.findByIdAndUpdate(application.user, { facilityStatus: 'rejected' }, { runValidators: true });
    }

    application.status = status;
    application.rejectionReason = status === 'rejected' ? String(reason || '').trim() : '';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    const updated = await Application.findById(application._id)
      .populate('user', 'name email role universityId')
      .populate('reviewedBy', 'name email role');

    const updatedUser = await User.findById(application.user).select('name email role universityId facilityStatus teamName societyName');

    return res.json({ application: updated, user: updatedUser });
  } catch (err) {
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications,
  reviewApplication,
};
