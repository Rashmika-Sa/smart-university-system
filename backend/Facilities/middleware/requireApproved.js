const User = require('../../models/Auth/User');

// Confirms the requesting team_captain / society has been approved before
// they can create or cancel bookings. Must be used AFTER protect + authorize.
const requireApproved = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('facilityStatus');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.facilityStatus !== 'approved') {
      return res.status(403).json({
        msg: 'Your account is pending facility approval. You will be notified once approved.'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = requireApproved;
