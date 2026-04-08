const User = require('../../models/Auth/User');

// --- GET STUDENT EMAILS (Admin Only) ---
const getStudentEmails = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('email -_id');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

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

// --- GET CURRENT USER PROFILE ---
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- UPDATE CURRENT USER PROFILE ---
const updateMyProfile = async (req, res) => {
  try {
    const { name, email, universityId, profilePhoto } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === 'string' && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = cleanEmail;
    }

    if (typeof universityId === 'string') {
      user.universityId = universityId.trim().toUpperCase();
    }

    if (typeof profilePhoto === 'string') {
      user.profilePhoto = profilePhoto;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        universityId: updatedUser.universityId,
        managedCanteen: updatedUser.managedCanteen || null,
        profilePhoto: updatedUser.profilePhoto || ''
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- DELETE CURRENT USER ACCOUNT ---
const deleteMyProfile = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getStudentEmails, getAllUsers, getMyProfile, updateMyProfile, deleteMyProfile };