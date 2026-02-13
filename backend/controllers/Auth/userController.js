const User = require('../../models/Auth/User');

// --- GET ALL USERS (Admin Only) ---
const getAllUsers = async (req, res) => {
  try {
    // .find() gets all documents
    // .select('-password') tells MongoDB NOT to return the password field (Security)
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getAllUsers };