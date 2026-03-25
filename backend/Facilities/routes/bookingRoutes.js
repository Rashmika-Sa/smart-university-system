const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { requireApproved }    = require('../middleware');
const { create, getAll, getOne, cancel } = require('../controllers/bookingController');

// All booking routes require authentication
router.use(protect);

// Create — approved team_captain or society only
router.post('/',
  authorize('team_captain', 'society'),
  requireApproved,
  create
);

// Read — bookers see their own; facility_admin sees all
router.get('/',    authorize('team_captain', 'society', 'facility_admin'), getAll);
router.get('/:id', authorize('team_captain', 'society', 'facility_admin'), getOne);

// Cancel — approved team_captain or society (owner only, enforced in controller)
router.delete('/:id',
  authorize('team_captain', 'society'),
  requireApproved,
  cancel
);

module.exports = router;
