const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../../controllers/Auth/userController');
// We need middleware to protect this route (Only Admins can see it)
const { protect, authorize } = require('../../middleware/authMiddleware');

// Route: GET /api/users
// Desc:  Get all users
// Access: Private/Admin
router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;