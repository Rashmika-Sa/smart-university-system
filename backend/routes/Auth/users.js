const express = require('express');
const router = express.Router();
const { getAllUsers, getMyProfile, updateMyProfile, deleteMyProfile } = require('../../controllers/Auth/userController');
// We need middleware to protect this route (Only Admins can see it)
const { protect, authorize } = require('../../middleware/authMiddleware');

// Route: GET /api/users/me
// Desc:  Get current logged-in user profile
// Access: Private
router.get('/me', protect, getMyProfile);

// Route: PUT /api/users/me
// Desc:  Update current logged-in user profile
// Access: Private
router.put('/me', protect, updateMyProfile);

// Route: DELETE /api/users/me
// Desc:  Delete current logged-in user account
// Access: Private
router.delete('/me', protect, deleteMyProfile);

// Route: GET /api/users
// Desc:  Get all users
// Access: Private/Admin
router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;