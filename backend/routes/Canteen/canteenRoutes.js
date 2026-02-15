const express = require('express');
const router = express.Router();

// 👇 Notice the path: Up 2 levels -> controllers -> Canteen
const { 
  getMenu, 
  addFoodItem, 
  deleteFoodItem, 
  updateAvailability,
  updateFoodItem,
  getAllCanteens,
  getAccessibleCanteens
} = require('../../controllers/Canteen/canteenController');

const { protect, authorize, checkCanteenPermission } = require('../../middleware/authMiddleware');

// Define Routes
// Public route - no auth needed
router.get('/menu', getMenu);

// Get accessible canteens for logged-in admin user
router.get('/accessible-canteens', protect, authorize('canteen_admin'), checkCanteenPermission, getAccessibleCanteens);

// Protected routes - need authentication and canteen admin role
router.post('/add', protect, authorize('canteen_admin'), checkCanteenPermission, addFoodItem);
router.delete('/delete/:id', protect, authorize('canteen_admin'), checkCanteenPermission, deleteFoodItem);
router.put('/update/:id', protect, authorize('canteen_admin'), checkCanteenPermission, updateAvailability);
router.put('/edit/:id', protect, authorize('canteen_admin'), checkCanteenPermission, updateFoodItem);

// Super admin only route
router.get('/all-canteens', protect, authorize('canteen_admin'), checkCanteenPermission, getAllCanteens);

module.exports = router;