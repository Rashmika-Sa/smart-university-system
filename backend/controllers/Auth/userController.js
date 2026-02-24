const User = require('../../models/Auth/User');

// --- GET ALL USERS (Admin Only) ---
const getAllUsers = async (req, res) => {
  try {
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getAllUsers };