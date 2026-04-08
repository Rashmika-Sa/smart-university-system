const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { getAll, create, update, toggleStatus, getAvailableSlots } = require('../controllers/spaceController');

// Read — any authenticated user
router.get('/',               protect, getAll);
router.get('/:id/slots',      protect, getAvailableSlots);

// Write — facility_admin only
router.post('/',              protect, authorize('facility_admin'), create);
router.put('/:id',            protect, authorize('facility_admin'), update);
router.patch('/:id/status',   protect, authorize('facility_admin'), toggleStatus);

module.exports = router;
