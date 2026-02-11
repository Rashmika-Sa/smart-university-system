const dns = require('dns');
//  Force Node.js to use IPv4 first 
dns.setDefaultResultOrder('ipv4first');

const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- 0. SETUP EMAIL TRANSPORTER (GMAIL CONFIG) ---
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

// --- 1. SEND VERIFICATION CODE ---
const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  
  // 🧹 CLEAN INPUT: Remove extra spaces and force lowercase
  const cleanEmail = email.trim().toLowerCase();

  console.log("-----------------------------------------");
  console.log("📧 Attempting to send OTP to:", cleanEmail);

  try {
    // SLIIT GATEKEEPER: Check if it ends with @my.sliit.lk
    if (!cleanEmail.endsWith('@my.sliit.lk')) {
       console.log("⛔ Blocked: Non-SLIIT email detected");
       return res.status(400).json({ 
         message: 'Access Denied: Only SLIIT Student Emails (xxxx@my.sliit.lk) are allowed.' 
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

// --- 2. VERIFY CODE ---
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

// --- 3. REGISTER & AUTO-LOGIN ---
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // 🛑 SECURITY CHECK
    if (!cleanEmail.endsWith('@my.sliit.lk')) {
        return res.status(400).json({ message: 'Only SLIIT emails are allowed.' });
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
  role: 'student' // 🔒 HARDCODE THIS. No one can register as admin via API.
});

    await user.save(); 
    
    // Cleanup OTP
    await Otp.deleteMany({ email: cleanEmail }); 

    // Create Token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).send('Server Error');
  }
};

// --- 4. LOGIN USER (CLEAN PRODUCTION VERSION) ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    console.log("-----------------------------------------");
    console.log("🔐 Login Attempt:", cleanEmail);

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
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (err) {
    console.error("❌ Login Server Error:", err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { registerUser, loginUser, sendVerificationCode, verifyCode };