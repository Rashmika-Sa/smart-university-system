const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// This means: When someone POSTs to "/", run the registerUser function
router.post('/register', registerUser);

// This means: When someone POSTs to "/login", run the loginUser function
router.post('/login', loginUser);

module.exports = router;