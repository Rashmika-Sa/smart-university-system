require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); 

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Connected to DB...");

    // --- 1. ADMIN ---
    await User.deleteOne({ email: 'admin@sliit.lk' });
    const admin = new User({
      name: 'System Admin',
      email: 'admin@sliit.lk',
      password: 'admin123', 
      role: 'admin'
    });
    await admin.save();
    console.log("✅ Admin Reset");

    // --- 2. STAFF ---
    const staffEmails = ['canteen@sliit.lk', 'library@sliit.lk', 'shuttle@sliit.lk', 'facility@sliit.lk'];
    await User.deleteMany({ email: { $in: staffEmails } });

    const staffAccounts = [
      { name: 'Canteen Manager', email: 'canteen@sliit.lk', password: '123', role: 'canteen_admin' },
      { name: 'Library Manager', email: 'library@sliit.lk', password: '123', role: 'library_admin' },
      { name: 'Shuttle Manager', email: 'shuttle@sliit.lk', password: '123', role: 'shuttle_admin' },
      { name: 'Facility Manager', email: 'facility@sliit.lk', password: '123', role: 'facility_admin' }
    ];

    for (const staff of staffAccounts) {
      await new User(staff).save();
    }
    console.log("✅ Staff Reset");

    console.log("\n🚀 Database Seeded Successfully!");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();