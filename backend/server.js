const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize the App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Allows the frontend to talk to the backend)
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Basic Route (To test if the server is working)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});