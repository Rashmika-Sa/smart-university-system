require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/Auth/User'); 

const SPORTS_COUNCIL_DEFAULT_PASS = 'SportsCouncil@123';

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
      'library@sliit.lk',
      'shuttle@sliit.lk', 
      'facility@sliit.lk',
      'sportscouncil@sliit.lk'
    ];

    
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
      },
      {
        name: 'Sports Council',
        email: 'sportscouncil@sliit.lk',
        password: process.env.SPORTS_COUNCIL_PASS || SPORTS_COUNCIL_DEFAULT_PASS,
        role: 'sports_council'
      }
    ];

    for (const staff of staffAccounts) {
      
      await new User(staff).save();
    }
    console.log(" Admin Accounts & Canteen Managers Reset");

    console.log("\n Database Seeded Successfully!");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();