const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    startPoint: {
      type: String,
      required: [true, 'Start point is required'],
    },
    // Latitude/longitude stored when admin picks location from the map picker
    // These power the student-side map without any geocoding API call
    startLat: { type: Number, default: null },
    startLng: { type: Number, default: null },

    endPoint: {
      type: String,
      required: [true, 'End point is required'],
    },
    endLat: { type: Number, default: null },
    endLng: { type: Number, default: null },

    stops: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', RouteSchema);