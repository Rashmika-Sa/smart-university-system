const express = require('express');
const router = express.Router();
const { submitReview, getReviews, getReviewStats, deleteReview } = require('../../controllers/Canteen/reviewController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Public
router.get('/', getReviews);
router.get('/stats', getReviewStats);

// Students (and admins) must be logged in to submit
router.post('/', protect, authorize('student', 'admin', 'canteen_admin'), submitReview);

// Delete own review (student) or any review (admin / canteen_admin)
router.delete('/:id', protect, authorize('student', 'admin', 'canteen_admin'), deleteReview);

module.exports = router;
