const express = require('express');
const router = express.Router();
const { submitReview, getReviews, getReviewStats, deleteReview, replyToReview, updateReply, deleteReply } = require('../../controllers/Canteen/reviewController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Public
router.get('/', getReviews);
router.get('/stats', getReviewStats);

// Students (and admins) must be logged in to submit
router.post('/', protect, authorize('student', 'admin', 'canteen_admin'), submitReview);

// Delete own review (student) or any review (admin / canteen_admin)
router.delete('/:id', protect, authorize('student', 'admin', 'canteen_admin'), deleteReview);

// Admin reply to a review (create / update / delete)
router.post('/:id/reply', protect, authorize('admin', 'canteen_admin'), replyToReview);
router.put('/:id/reply', protect, authorize('admin', 'canteen_admin'), updateReply);
router.delete('/:id/reply', protect, authorize('admin', 'canteen_admin'), deleteReply);

module.exports = router;
