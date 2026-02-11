const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER USER ---
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("-----------------------------------------");
    console.log("📝 Register Attempt:", email);

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ User already exists");
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log("🔑 Original Password:", password);
    console.log("🔒 Hashed Password:", hashedPassword);

    // 3. Create User
    user = new User({
      name,
      email,
      password: hashedPassword, // Important: Save the hashed version!
      role: role || 'student'
    });

    await user.save();
    console.log("✅ User Saved to DB");

    // 4. Create Token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).send('Server Error');
  }
};

// --- LOGIN USER ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("-----------------------------------------");
    console.log("🔐 Login Attempt:", email);

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Error: User not found in DB.");
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    
    // 2. Compare Passwords
    // We compare the 'plain text' password from the login form 
    // with the 'hashed' password saved in the database.
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("   Input Password:", password);
    console.log("   Stored Hash:", user.password);
    console.log("❓ Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ Error: Passwords do not match.");
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Create Token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    console.log("✅ Login Successful!");
    console.log("-----------------------------------------");
    
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (err) {
    console.error("❌ Login Server Error:", err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { registerUser, loginUser };