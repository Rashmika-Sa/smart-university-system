const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  plateNumber: { 
    type: String, 
    required: [true, 'Plate number is required'], 
    unique: true,
    uppercase: true,
    trim: true
  },
  model: { 
    type: String, 
    required: [true, 'Bus model is required'] 
  },
  capacity: { 
    type: Number, 
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  status: { 
    type: String, 
    enum: ['Active', 'Maintenance'], 
    default: 'Active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);