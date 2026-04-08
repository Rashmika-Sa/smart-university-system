const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applyFor: {
      type: String,
      enum: ['team_captain', 'society'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    teamName: { type: String, default: '' },
    sportName: { type: String, default: '' },
    societyName: { type: String, default: '' },
    statement: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('FacilityApplication', applicationSchema);
