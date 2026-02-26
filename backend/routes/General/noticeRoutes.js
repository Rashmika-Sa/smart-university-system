const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../../controllers/General/noticeController');

const ADMIN_ROLES = ['admin', 'canteen_admin', 'academic_admin', 'shuttle_admin', 'facility_admin'];

router.get('/', protect, getNotices);
router.post('/', protect, authorize(...ADMIN_ROLES), createNotice);
router.put('/:id', protect, authorize(...ADMIN_ROLES), updateNotice);
router.delete('/:id', protect, authorize(...ADMIN_ROLES), deleteNotice);

module.exports = router;
