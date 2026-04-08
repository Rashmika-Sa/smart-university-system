const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { getAll, getOne, approve, reject } = require('../controllers/registrationController');

// All registration management routes require auth + reviewer role
router.use(protect, authorize('facility_admin', 'admin'));

router.get('/',               getAll);
router.get('/:id',            getOne);
router.put('/:id/approve',    approve);
router.put('/:id/reject',     reject);

module.exports = router;
