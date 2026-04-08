const express = require('express');
const router  = express.Router();
const { libraryProtect, libraryAdmin } = require('../../middleware/authMiddleware');
const {
  getRooms,
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../../controllers/Library/roomController');

// Student routes — protected but no admin role required
router.get('/',       libraryProtect,               getRooms);    // Get active rooms

// Admin routes — requires library_admin or admin role
router.get('/all',    libraryProtect, libraryAdmin,  getAllRooms); // Get all rooms including inactive
router.post('/',      libraryProtect, libraryAdmin,  createRoom); // Create new room
router.put('/:id',    libraryProtect, libraryAdmin,  updateRoom); // Update room
router.delete('/:id', libraryProtect, libraryAdmin,  deleteRoom); // Delete room

module.exports = router;