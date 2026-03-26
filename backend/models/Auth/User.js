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
    trim: true,
    lowercase: true,
    validate: [
      {
        validator: (value) => {
          if (!value) return true;
          if (/@sliit\.lk$/i.test(value) && !/@my\.sliit\.lk$/i.test(value)) {
            return true;
          }
          return /@my\.sliit\.lk$/i.test(value);
        },
        message: 'Email must end with @my.sliit.lk for students (or @sliit.lk for staff/admin).'
      },
      {
        validator: (value) => {
          if (!value) return true;
          if (/@my\.sliit\.lk$/i.test(value)) {
            return /^[a-z]{2}\d{8}@my\.sliit\.lk$/i.test(value);
          }
          if (/@sliit\.lk$/i.test(value)) {
            return /^[a-z0-9._%+-]+@sliit\.lk$/i.test(value);
          }
          return false;
        },
        message: 'Student emails must start with 2 letters and 8 digits (example: it12345678@my.sliit.lk).'
      }
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
  profilePhoto: {
    type: String,
    default: ''
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


userSchema.pre('save', async function() {
  // Skip hashing when password is unchanged.
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);