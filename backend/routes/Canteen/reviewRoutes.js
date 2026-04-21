const express = require('express');
const router = express.Router();
const { submitReview, getReviews, getReviewStats, updateReview, deleteReview, replyToReview, updateReply, deleteReply } = require('../../controllers/Canteen/reviewController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Public routes (must come before /:id routes)
router.get('/stats', getReviewStats);
router.get('/', getReviews);

// Students (and admins) must be logged in to submit
router.post('/', protect, authorize('student', 'admin', 'canteen_admin'), submitReview);

// Specific ID routes (more specific paths before generic :id)
// Edit own review (student) or any review (admin / canteen_admin)
router.put('/:id', protect, authorize('student', 'admin', 'canteen_admin'), updateReview);

// Delete own review (student) or any review (admin / canteen_admin)
router.delete('/:id', protect, authorize('student', 'admin', 'canteen_admin'), deleteReview);

// Admin reply to a review (create / update / delete)
router.post('/:id/reply', protect, authorize('admin', 'canteen_admin'), replyToReview);
router.put('/:id/reply', protect, authorize('admin', 'canteen_admin'), updateReply);
router.delete('/:id/reply', protect, authorize('admin', 'canteen_admin'), deleteReply);

module.exports = router;
