// backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Connected to DB...");

    // 1. Check if Admin exists
    const existingAdmin = await User.findOne({ email: 'admin@sliit.lk' });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists!");
      process.exit();
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Default Password

    // 3. Create Admin User
    const admin = new User({
      name: 'System Admin',
      email: 'admin@sliit.lk', // Master Email
      password: hashedPassword,
      role: 'admin' // 👈 The Magic Key
    });

    await admin.save();
    console.log("✅ Master Admin Created!");
    console.log("📧 Email: admin@sliit.lk");
    console.log("🔑 Pass: admin123");

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

createAdmin();