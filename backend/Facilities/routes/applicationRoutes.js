const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  createApplication,
  getMyApplications,
  getAllApplications,
  reviewApplication,
} = require('../controllers/applicationController');

router.use(protect);

router.post('/', authorize('student'), createApplication);
router.get('/my', authorize('student'), getMyApplications);

router.get('/', authorize('facility_admin', 'sports_council', 'admin'), getAllApplications);
router.put('/:id/review', authorize('facility_admin', 'sports_council', 'admin'), reviewApplication);

module.exports = router;
