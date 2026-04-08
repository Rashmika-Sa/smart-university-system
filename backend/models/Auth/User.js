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
        validator: function(value) {
          // Skip ALL validation for admin/staff roles
          const userRole = this.get('role') || this.role;
          if (userRole && userRole !== 'student') {
            return true;
          }
          
          // Only validate student emails
          if (!value) return true;
          return /@my\.sliit\.lk$/i.test(value);
        },
        message: 'Students must use SLIIT email ending with @my.sliit.lk'
      },
      {
        validator: function(value) {
          // Skip ALL validation for admin/staff roles
          const userRole = this.get('role') || this.role;
          if (userRole && userRole !== 'student') {
            return true;
          }
          
          // Only validate student emails - must be 2 letters + 8 digits
          if (!value) return true;
          return /^[a-z]{2}\d{8}@my\.sliit\.lk$/i.test(value);
        },
        message: 'Student email must start with 2 letters and 8 digits (example: it12345678@my.sliit.lk)'
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
      'library_admin',
      'shuttle_admin',
      'facility_admin',
      // Facilities booking platform
      'team_captain',
      'society',
      'sports_council'
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
  // Facilities booking platform — approval state for team_captain and society
  facilityStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  teamName:    { type: String, default: '' },
  societyName: { type: String, default: '' },

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