const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. LOAD ENVIRONMENT VARIABLES FIRST
dotenv.config();

// 2. NOW Import Routes (They can now see the .env variables)
const authRoutes    = require('./routes/Auth/authRoutes');
const userRoutes    = require('./routes/Auth/users');
const canteenRoutes = require('./routes/Canteen/canteenRoutes');
const orderRoutes   = require('./routes/Order/orderRoutes');
const reviewRoutes  = require('./routes/Canteen/reviewRoutes');
const noticeRoutes  = require('./routes/General/noticeRoutes');
const facilitiesRoutes = require('./Facilities');
const shuttleRoutes = require('./routes/Shuttle/shuttleRoutes');

// Library Module Routes
const libraryRoomRoutes         = require('./routes/Library/roomRoutes');
const libraryRoomBookingRoutes  = require('./routes/Library/roomBookingRoutes');
const libraryFloorRoutes        = require('./routes/Library/floorRoutes');
const libraryChairBookingRoutes = require('./routes/Library/chairBookingRoutes');
const libraryBookRoutes         = require('./routes/Library/bookRoutes');
const libraryCartRoutes         = require('./routes/Library/cartRoutes');
const libraryBookBookingRoutes  = require('./routes/Library/bookBookingRoutes');

// Initialize the App
const app        = express();
const PORT       = process.env.PORT       || 5000;
const BODY_LIMIT = process.env.BODY_LIMIT || '10mb';

const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin) => {
  return /^http:\/\/(localhost|127\.0\.0\.1):(\d+)$/.test(origin);
};

const corsOrigin = (origin, callback) => {
  // Allow server-to-server calls and local tools that don't send Origin.
  if (!origin) {
    return callback(null, true);
  }

  if (configuredOrigins.includes(origin) || isLocalDevOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked origin: ${origin}`));
};

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// ── Existing Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/shuttles', shuttleRoutes);

// ── Library Module Routes ─────────────────────────────────────────────────────
app.use('/api/library/rooms',          libraryRoomRoutes);
app.use('/api/library/room-bookings',  libraryRoomBookingRoutes);
app.use('/api/library/floors',         libraryFloorRoutes);
app.use('/api/library/chair-bookings', libraryChairBookingRoutes);
app.use('/api/library/books',          libraryBookRoutes);
app.use('/api/library/cart',           libraryCartRoutes);
app.use('/api/library/book-bookings',  libraryBookBookingRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ── Database Connection ───────────────────────────────────────────────────────
const connectWithFallback = async () => {
  const opts        = { serverSelectionTimeoutMS: 5000 };
  const primaryUri  = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/uni-system';
  const isDev       = (process.env.NODE_ENV || 'development') !== 'production';
  const fallbackEnabled = process.env.FALLBACK_TO_LOCAL === 'true' || isDev;

  try {
    await mongoose.connect(primaryUri, opts);
    console.log('MongoDB Connected (primary)');
  } catch (err) {
    console.log('MongoDB primary connection failed:', err.message || err);
    if (fallbackEnabled) {
      console.log('Attempting fallback to local MongoDB...');
      try {
        await mongoose.connect(fallbackUri, opts);
        console.log('MongoDB Connected (fallback local)');
      } catch (fallbackErr) {
        console.log('Fallback connection also failed:', fallbackErr.message || fallbackErr);
        console.log('If you are using MongoDB Atlas, ensure your current IP is allowed in Network Access (IP whitelist) or set FALLBACK_TO_LOCAL=true to use a local MongoDB instance for development.');
        process.exit(1);
      }
    } else {
      console.log('To enable fallback to a local MongoDB, set `FALLBACK_TO_LOCAL=true` and optionally `LOCAL_MONGO_URI`.');
      console.log('If you are using MongoDB Atlas, make sure your current IP is added to the cluster IP access list: https://www.mongodb.com/docs/atlas/security-whitelist/');
      process.exit(1);
    }
  }
};

// Start Server after DB connection attempt
connectWithFallback()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Fatal error during startup:', err);
    process.exit(1);
  });