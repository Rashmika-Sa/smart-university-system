require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Connected to DB...");

    // 1. DELETE existing broken admin
    const deleted = await User.deleteOne({ email: 'admin@sliit.lk' });
    if (deleted.deletedCount > 0) {
        console.log("🗑️  Deleted old broken Admin account.");
    }

    // 2. CREATE new Admin with PLAIN password
    // (We send 'admin123' plain, and let User.js model hash it!)
    const admin = new User({
      name: 'System Admin',
      email: 'admin@sliit.lk',
      password: 'admin123', // 👈 sending plain text now
      role: 'admin'
    });

    await admin.save();
    console.log("✅ New Admin Created Successfully!");
    console.log("👉 Login with: admin@sliit.lk / admin123");

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

resetAdmin();