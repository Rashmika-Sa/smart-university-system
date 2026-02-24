const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^(it|en|bn|hs|ar)\d{8}@my\.sliit\.lk$/i,
      'Please use a valid SLIIT student email (e.g., it12345678@my.sliit.lk, en12345678@my.sliit.lk)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    enum: [
      'student', 
      'admin', 
      'staff', 
      'instructor',
      'canteen_admin',
      'academic_admin',
      'shuttle_admin',
      'facility_admin'
    ],
    default: 'student'
  },
  universityId: {
    type: String,
    match: [
      /^(IT|EN|BM|HS|AR)\d{8}$/i, 
      'Please enter a valid SLIIT Student ID'
    ]
  },
  managedCanteen: {
    type: String,
    enum: [
      'Main Canteen',
      'Birdnest Canteen',
      'Perera & Sons (P&S)',
      
      null
    ],
    default: null
  },
  // Store saved cards for the user
  savedCards: [
    {
      brand: { type: String, default: 'Visa' },
      last4: { type: String, required: true },
      cardHolderName: String,
      expiryDate: String // MM/YY
    }
  ]
}, {
  timestamps: true
});


userSchema.pre('save', async function(next) {
  // 1. If the password was NOT changed (e.g., we are just updating cards), stop here.
  if (!this.isModified('password')) {
    return;
  }

  // 2. Hash the password if it WAS changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
     
  
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);