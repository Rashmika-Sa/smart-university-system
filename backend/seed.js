require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/Auth/User'); 

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Connected to DB...");

    // --- 1. ADMIN ---
    await User.deleteOne({ email: 'admin@sliit.lk' });
    const admin = new User({
      name: 'System Admin',
      email: 'admin@sliit.lk',
      password: process.env.ADMIN_PASS, 
      role: 'admin'
    });
    await admin.save();
    console.log("✅ Admin Reset");

    // --- 2. STAFF & SERVICE MANAGERS ---
    const staffEmails = [
      'canteen@sliit.lk',
      'main@sliit.lk',
      'birdnest@sliit.lk',
      'ps@sliit.lk',
      'library@sliit.lk',
      'shuttle@sliit.lk', 
      'facility@sliit.lk'
    ];

    // Delete existing staff to avoid duplicates
    await User.deleteMany({ email: { $in: staffEmails } });

    const staffAccounts = [
      { 
        name: 'Chief Canteen Admin', 
        email: 'canteen@sliit.lk', 
        password: process.env.CANTEEN_ADMIN_PASS, 
        role: 'canteen_admin',
        managedCanteen: null
      },
      
      { 
        name: 'Main Canteen Manager', 
        email: 'main@sliit.lk', 
        password: process.env.MAIN_CANTEEN_PASS, 
        role: 'canteen_admin',
        managedCanteen: 'Main Canteen'
      },
      { 
        name: 'Birdnest Canteen Manager', 
        email: 'birdnest@sliit.lk', 
        password: process.env.BIRDNEST_PASS, 
        role: 'canteen_admin',
        managedCanteen: 'Birdnest Canteen'
      },
      { 
        name: 'P&S Manager', 
        email: 'ps@sliit.lk', 
        password: process.env.PS_PASS, 
        role: 'canteen_admin',
        managedCanteen: 'Perera & Sons (P&S)'
      },
      
      { 
        name: 'Library Manager', 
        email: 'library@sliit.lk', 
        password: process.env.LIBRARY_PASS, 
        role: 'library_admin' 
      },
      { 
        name: 'Shuttle Manager', 
        email: 'shuttle@sliit.lk', 
        password: process.env.SHUTTLE_PASS, 
        role: 'shuttle_admin' 
      },
      { 
        name: 'Facility Manager', 
        email: 'facility@sliit.lk', 
        password: process.env.FACILITY_PASS, 
        role: 'facility_admin' 
      }
    ];

    for (const staff of staffAccounts) {
      // ⚠️ IMPORTANT: If your User model has a .pre('save') hook, 
      // it will hash this password automatically here.
      await new User(staff).save();
    }
    console.log("✅ Admin Accounts & Canteen Managers Reset");

    console.log("\n🚀 Database Seeded Successfully!");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();