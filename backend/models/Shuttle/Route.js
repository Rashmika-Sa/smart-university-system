const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  routeName: { 
    type: String, 
    required: [true, 'Route name is required'],
    trim: true
  },
  startPoint: { 
    type: String, 
    required: [true, 'Start point is required'] 
  },
  endPoint: { 
    type: String, 
    required: [true, 'End point is required'] 
  },
  stops: [{ 
    type: String 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);