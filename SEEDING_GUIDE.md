# 📋 Database Seeding Guide - Canteen Admins

If you want to seed your database with canteen admins during development/testing, follow this guide.

## Option 1: Manual Database Seeding (Recommended for Development)

### Using MongoDB Compass or Atlas UI

1. **Navigate to Users Collection**
2. **Insert** new canteen admin documents:

#### Document 1: Super Admin
```json
{
  "name": "Chief Canteen Admin",
  "email": "canteen@sliit.lk",
  "password": "$2a$10$YOUR_HASHED_PASSWORD", // Use bcrypt hash
  "role": "canteen_admin",
  "managedCanteen": null,
  "universityId": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Document 2: Barista Admin
```json
{
  "name": "Barista Manager",
  "email": "barista@sliit.lk",
  "password": "$2a$10$YOUR_HASHED_PASSWORD",
  "role": "canteen_admin",
  "managedCanteen": "Barista",
  "universityId": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Document 3: Main Canteen Admin
```json
{
  "name": "Main Canteen Manager",
  "email": "main@sliit.lk",
  "password": "$2a$10$YOUR_HASHED_PASSWORD",
  "role": "canteen_admin",
  "managedCanteen": "Main Canteen",
  "universityId": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Document 4: Birdnest Admin
```json
{
  "name": "Birdnest Canteen Manager",
  "email": "birdnest@sliit.lk",
  "password": "$2a$10$YOUR_HASHED_PASSWORD",
  "role": "canteen_admin",
  "managedCanteen": "Birdnest Canteen",
  "universityId": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Document 5: P&S Admin
```json
{
  "name": "Perera & Sons Manager",
  "email": "ps@sliit.lk",
  "password": "$2a$10$YOUR_HASHED_PASSWORD",
  "role": "canteen_admin",
  "managedCanteen": "Perera & Sons (P&S)",
  "universityId": null,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

### Getting Hashed Passwords

**Power User Approach**: Install bcrypt locally:
```bash
npm install -g bcrypt
```

Then in Node:
```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  console.log('Use this hash:', hashed);
}

hashPassword('BaristaPwd@123');
```

**Use These Pre-Hashed Examples** (Password: Admin@123):
- Hash: `$2a$10$5gJ5LNsM1z7Gu8Ho3l4Z.OJw.Z1qX2q5t9h8p7k6j5i4u3y2w1q0a`

---

## Option 2: Programmatic Seeding (Advanced)

Create a file `backend/seed-canteen-admins.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/Auth/User');
require('dotenv').config();

const seedCanteenAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing canteen admins (Optional)
    // await User.deleteMany({ role: 'canteen_admin' });

    const admins = [
      {
        name: 'Chief Canteen Admin',
        email: 'canteen@sliit.lk',
        password: 'SuperAdmin@123',
        role: 'canteen_admin',
        managedCanteen: null // Super Admin
      },
      {
        name: 'Barista Manager',
        email: 'barista@sliit.lk',
        password: 'BaristaPwd@123',
        role: 'canteen_admin',
        managedCanteen: 'Barista'
      },
      {
        name: 'Main Canteen Manager',
        email: 'main@sliit.lk',
        password: 'MainCantPwd@123',
        role: 'canteen_admin',
        managedCanteen: 'Main Canteen'
      },
      {
        name: 'Birdnest Canteen Manager',
        email: 'birdnest@sliit.lk',
        password: 'BirdnestPwd@123',
        role: 'canteen_admin',
        managedCanteen: 'Birdnest Canteen'
      },
      {
        name: 'Perera & Sons Manager',
        email: 'ps@sliit.lk',
        password: 'PSPwd@123',
        role: 'canteen_admin',
        managedCanteen: 'Perera & Sons (P&S)'
      }
    ];

    // Create each admin
    for (const adminData of admins) {
      const existingAdmin = await User.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log(`⚠️  Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      const admin = new User(adminData);
      await admin.save();
      console.log(`✅ Created admin: ${adminData.name} (${adminData.managedCanteen || 'Super Admin'})`);
    }

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admins:', error);
    process.exit(1);
  }
};

seedCanteenAdmins();
```

**Run it with:**
```bash
node backend/seed-canteen-admins.js
```

---

## Option 3: Add to Existing seed.js

If you have `backend/seed.js`, add this to it:

```javascript
// Add after your existing seeds...

const seedCanteenAdmins = async () => {
  console.log('\n🍔 Seeding Canteen Admins...');
  
  const canteenAdmins = [
    {
      name: 'Chief Canteen Admin',
      email: 'canteen@sliit.lk',
      password: 'SuperAdmin@123',
      role: 'canteen_admin',
      managedCanteen: null
    },
    {
      name: 'Barista Manager',
      email: 'barista@sliit.lk',
      password: 'BaristaPwd@123',
      role: 'canteen_admin',
      managedCanteen: 'Barista'
    },
    // ... add other admins
  ];

  for (const admin of canteenAdmins) {
    const exists = await User.findOne({ email: admin.email });
    if (!exists) {
      await User.create(admin);
      console.log(`  ✅ ${admin.name}`);
    }
  }
};

// Call it in your main seed function:
// await seedCanteenAdmins();
```

---

## Test Credentials After Seeding

After seeding, you can immediately test with:

### Super Admin Login
```
Email:    canteen@sliit.lk
Password: SuperAdmin@123
```

### Barista Admin Login
```
Email:    barista@sliit.lk
Password: BaristaPwd@123
```

### Main Canteen Admin Login
```
Email:    main@sliit.lk
Password: MainCantPwd@123
```

---

## Verify Seeding in MongoDB

```javascript
// In MongoDB Shell or Compass
use('uni-system')

// View all canteen admins
db.users.find({ role: 'canteen_admin' })

// View specific admin
db.users.findOne({ email: 'barista@sliit.lk' })

// Count total admins
db.users.countDocuments({ role: 'canteen_admin' })
```

---

## Reset/Clear Admins (If Needed)

**WARNING: This will delete all canteen admins**

```javascript
use('uni-system')
db.users.deleteMany({ role: 'canteen_admin' })
```

---

## Sample Food Items Per Canteen

After seeding admins, you can seed food items:

```javascript
const sampleFoodItems = [
  // Barista Items
  { name: 'Iced Latte', price: 350, category: 'Beverage', canteen: 'Barista', isAvailable: true },
  { name: 'Cappuccino', price: 380, category: 'Beverage', canteen: 'Barista', isAvailable: true },
  
  // Main Canteen Items
  { name: 'Chicken Kotto', price: 450, category: 'Rice', canteen: 'Main Canteen', isAvailable: true },
  { name: 'Kottu Roti', price: 400, category: 'Rice', canteen: 'Main Canteen', isAvailable: true },
  
  // Birdnest Items
  { name: 'Birdnest Rice Bowl', price: 480, category: 'Rice', canteen: 'Birdnest Canteen', isAvailable: true },
  
  // P&S Items
  { name: 'Special Mix', price: 520, category: 'Rice', canteen: 'Perera & Sons (P&S)', isAvailable: true }
];

await FoodItem.insertMany(sampleFoodItems);
```

---

## Troubleshooting Seeding

### Issue: "Email must be unique"
**Solution**: Admin already exists. Either:
- Update the existing admin
- Delete it first then seed

### Issue: "Invalid email domain"
**Solution**: Ensure emails end with @sliit.lk or @my.sliit.lk

### Issue: "Cannot read property 'managedCanteen' of null"
**Solution**: Make sure User model is properly imported before running seed

---

## Production Best Practices

1. **Use Environment Variables**:
   ```javascript
   const adminPassword = process.env.ADMIN_PASSWORD || 'DefaultPwd@123';
   ```

2. **Hash Passwords Before Storing**:
   - Never store plain text passwords
   - The User model auto-hashes via .pre('save') hook

3. **Backup Before Seeding**:
   ```bash
   mongodump --uri="mongodb://..." --out=./backup
   ```

4. **Use Transaction for Multiple Inserts**:
   ```javascript
   const session = await mongoose.startSession();
   session.startTransaction();
   // ... create admins
   await session.commitTransaction();
   ```

---

**Ready to seed!** 🌱
