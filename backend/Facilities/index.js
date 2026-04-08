const express = require('express');
const router  = express.Router();

// Register Mongoose models on startup
require('./models');

const { authRoutes, bookingRoutes, registrationRoutes, spaceRoutes, applicationRoutes } = require('./routes');

router.use('/auth',          authRoutes);
router.use('/registrations', registrationRoutes);
router.use('/spaces',        spaceRoutes);
router.use('/bookings',      bookingRoutes);
router.use('/applications',  applicationRoutes);

module.exports = router;
