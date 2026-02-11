const express = require('express');
const router = express.Router();
// 1. Import the new functions here
const { 
  registerUser, 
  loginUser, 
  sendVerificationCode, 
  verifyCode 
} = require('../controllers/authController');

// --- Routes ---

// 1. Send OTP (Step 1)
router.post('/send-code', sendVerificationCode);

// 2. Verify OTP (Step 2)
router.post('/verify-code', verifyCode);

// 3. Register User (Step 3)
router.post('/register', registerUser);

// 4. Login User
router.post('/login', loginUser);

module.exports = router;