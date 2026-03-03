const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const User = require('../../models/Auth/User');
const Otp = require('../../models/Auth/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 0. SETUP EMAIL TRANSPORTER (GMAIL CONFIG) 
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Explicit Host
  port: 465,              // Secure Port
  secure: true,           // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps prevent certificate errors
  }
});

// 1. SEND VERIFICATION CODE 
const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  console.log("📧 Attempting to send OTP to:", cleanEmail);

  try {
    //UPDATED SLIIT GATEKEEPER: Check for IT, EN, BM, HS, AR + 8 digits
    const sliitEmailRegex = /^(it|en|bm|hs|ar)\d{8}@my\.sliit\.lk$/i;
    
    if (!sliitEmailRegex.test(cleanEmail)) {
       console.log("⛔ Blocked: Invalid SLIIT email format detected");
       return res.status(400).json({ 
         message: 'Access Denied: Please use a valid SLIIT student email (e.g., it23836754@my.sliit.lk, en12345678@my.sliit.lk).' 
       });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    // Generate & Save OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.deleteMany({ email: cleanEmail }); // Clear old codes
    await new Otp({ email: cleanEmail, code }).save();

    // Send Email
    await transporter.sendMail({
      from: '"Smart Uni System" <no-reply@sliit.lk>',
      to: cleanEmail,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`
    });

    console.log("✅ OTP Sent Successfully");
    res.json({ message: 'Verification code sent!' });

  } catch (err) {
    console.error("❌ Email Failed:", err);
    res.status(500).json({ message: 'Failed to send email. Check server logs.' });
  }
};

//  2. VERIFY CODE
const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const record = await Otp.findOne({ email: cleanEmail, code });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    console.log("✅ OTP Verified");
    res.json({ message: 'Email verified!' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. REGISTER & AUTO-LOGIN 
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const universityId = cleanEmail.split('@')[0].toUpperCase();

    // UPDATED SECURITY CHECK
    const sliitEmailRegex = /^(it|en|bm|hs|ar)\d{8}@my\.sliit\.lk$/i;
    
    if (!sliitEmailRegex.test(cleanEmail)) {
        return res.status(400).json({ 
          message: 'Invalid email format. Must be a valid SLIIT student email from any faculty.' 
        });
    }

    // Check existing
    let user = await User.findOne({ email: cleanEmail });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create User with PLAIN password
    // (Your User.js model handles the hashing via .pre('save'))
    user = new User({
  name,
  email: cleanEmail,
  password: password,
  role: 'student', //
  universityId
});

    await user.save(); 
    
    // Cleanup OTP
    await Otp.deleteMany({ email: cleanEmail }); 

    // Create Token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        universityId: user.universityId || '',
        managedCanteen: user.managedCanteen || null,
        profilePhoto: user.profilePhoto || ''
      } 
    });

  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).send('Server Error');
  }
};

// 4. LOGIN USER (CLEAN PRODUCTION VERSION)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    console.log("🛡 Login Attempt:", cleanEmail);

    // 1. Find User
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Success
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    console.log("✅ Login Successful!");
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        universityId: user.universityId || '',
        managedCanteen: user.managedCanteen || null,
        profilePhoto: user.profilePhoto || ''
      } 
    });

  } catch (err) {
    console.error("❌ Login Server Error:", err.message);
    res.status(500).send('Server Error');
  }
};

// FORGOT PASSWORD - Step 1: Send OTP to existing user's email
const forgotPasswordSendCode = async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  try {
    // Check if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    // Generate & Save OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email: cleanEmail });
    await new Otp({ email: cleanEmail, code }).save();

    // Send Email
    await transporter.sendMail({
      from: '"Smart Uni System" <no-reply@sliit.lk>',
      to: cleanEmail,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${code}\n\nThis code expires in 5 minutes. If you did not request this, please ignore this email.`
    });

    console.log("✅ Password reset OTP sent to:", cleanEmail);
    res.json({ message: 'Reset code sent to your email!' });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: 'Failed to send reset code. Try again later.' });
  }
};

// FORGOT PASSWORD - Step 2: Verify OTP & Reset Password
const forgotPasswordVerifyAndReset = async (req, res) => {
  const { email, code, newPassword } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Verify OTP
    const record = await Otp.findOne({ email: cleanEmail, code });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    // Find user and update password
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    // Cleanup OTP
    await Otp.deleteMany({ email: cleanEmail });

    console.log("✅ Password reset successful for:", cleanEmail);
    res.json({ message: 'Password reset successful! You can now login.' });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
};

// 5. CREATE CANTEEN ADMIN (Super Admin Only) 
const createCanteenAdmin = async (req, res) => {
  try {
    const { name, email, password, managedCanteen } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    console.log("👤‍💼 Creating Canteen Admin:", cleanEmail, "for canteen:", managedCanteen);

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Allow both @my.sliit.lk and @sliit.lk for admin accounts
    if (!cleanEmail.endsWith('@my.sliit.lk') && !cleanEmail.endsWith('@sliit.lk')) {
      return res.status(400).json({ message: 'Only SLIIT emails are allowed for admin accounts.' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Validate canteen name if provided
    const validCanteens = ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)', ];
    if (managedCanteen && !validCanteens.includes(managedCanteen)) {
      return res.status(400).json({ 
        message: `Invalid canteen. Valid options: ${validCanteens.join(', ')}` 
      });
    }

    // Create new canteen admin
    user = new User({
      name,
      email: cleanEmail,
      password: password,
      role: 'canteen_admin',
      managedCanteen: managedCanteen || null // null means super admin
    });

    await user.save();

    console.log("✅ Canteen Admin Created Successfully!");
    res.status(201).json({ 
      message: 'Canteen admin created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, managedCanteen: user.managedCanteen } 
    });

  } catch (err) {
    console.error("❌ Create Canteen Admin Error:", err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// 6. GET ALL CANTEEN ADMINS (Super Admin Only) 
const getAllCanteenAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'canteen_admin' }).select('-password');
    res.status(200).json(admins);
  } catch (err) {
    console.error("❌ Get Canteen Admins Error:", err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// 7. UPDATE CANTEEN ADMIN (Super Admin Only) 
const updateCanteenAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { managedCanteen } = req.body;

    // Validate canteen
    const validCanteens = ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)', ];
    if (managedCanteen && !validCanteens.includes(managedCanteen)) {
      return res.status(400).json({ 
        message: `Invalid canteen. Valid options: ${validCanteens.join(', ')}` 
      });
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { managedCanteen: managedCanteen || null },
      { returnDocument: 'after' }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log("✅ Canteen Admin Updated!");
    res.status(200).json({ message: 'Canteen admin updated', user: updatedAdmin });

  } catch (err) {
    console.error("❌ Update Canteen Admin Error:", err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// 8. DELETE CANTEEN ADMIN (Super Admin Only) 
const deleteCanteenAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const deletedAdmin = await User.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log("✅ Canteen Admin Deleted!");
    res.status(200).json({ message: 'Canteen admin deleted successfully' });

  } catch (err) {
    console.error("❌ Delete Canteen Admin Error:", err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  sendVerificationCode, 
  verifyCode,
  forgotPasswordSendCode,
  forgotPasswordVerifyAndReset,
  createCanteenAdmin,
  getAllCanteenAdmins,
  updateCanteenAdmin,
  deleteCanteenAdmin
};