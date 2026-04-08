const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  busId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bus', 
    required: [true, 'Bus is required'] 
  },
  routeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Route', 
    required: [true, 'Route is required'] 
  },
  departureTime: { 
    type: Date, 
    required: [true, 'Departure time is required'] 
  },
  availableSeats: { 
    type: Number, 
    required: true,
    min: [0, 'Available seats cannot be negative']
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);