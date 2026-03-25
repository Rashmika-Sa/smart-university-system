const express = require('express');
const router  = express.Router();

// Register Mongoose models on startup
require('./models');

const { authRoutes, bookingRoutes, registrationRoutes, spaceRoutes } = require('./routes');

router.use('/auth',          authRoutes);
router.use('/registrations', registrationRoutes);
router.use('/spaces',        spaceRoutes);
router.use('/bookings',      bookingRoutes);

module.exports = router;
