const express = require('express');
const router = express.Router();
// 1. Import the functions here
const { 
  registerUser, 
  loginUser, 
  sendVerificationCode, 
  verifyCode,
  forgotPasswordSendCode,
  forgotPasswordVerifyAndReset,
  createCanteenAdmin,
  getAllCanteenAdmins,
  updateCanteenAdmin,
  deleteCanteenAdmin
} = require('../../controllers/Auth/authController');

const { protect, authorize } = require('../../middleware/authMiddleware');

// 1. Send OTP (Step 1)
router.post('/send-code', sendVerificationCode);

// 2. Verify OTP (Step 2)
router.post('/verify-code', verifyCode);

// 3. Register User
router.post('/register', registerUser);

// 4. Login User
router.post('/login', loginUser);

// --- FORGOT PASSWORD ROUTES ---
router.post('/forgot-password/send-code', forgotPasswordSendCode);
router.post('/forgot-password/reset', forgotPasswordVerifyAndReset);

// --- CANTEEN ADMIN MANAGEMENT ROUTES (Super Admin Only) ---

// 5. Create Canteen Admin
router.post('/canteen-admin/create', protect, authorize('canteen_admin'), createCanteenAdmin);

// 6. Get All Canteen Admins
router.get('/canteen-admin/all', protect, authorize('canteen_admin'), getAllCanteenAdmins);

// 7. Update Canteen Admin (assign/change canteen)
router.put('/canteen-admin/:adminId', protect, authorize('canteen_admin'), updateCanteenAdmin);

// 8. Delete Canteen Admin
router.delete('/canteen-admin/:adminId', protect, authorize('canteen_admin'), deleteCanteenAdmin);

module.exports = router;