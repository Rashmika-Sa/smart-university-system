const express = require('express');
const router  = express.Router();
const { libraryProtect, libraryAdmin } = require('../../middleware/authMiddleware');
const {
  getFloors,
  getAllFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  toggleSeatStatus,
} = require('../../controllers/Library/floorController');

// Student routes
router.get('/',                         libraryProtect,               getFloors);         // Get active floors

// Admin routes
router.get('/all',                      libraryProtect, libraryAdmin, getAllFloors);       // Get all floors
router.post('/',                        libraryProtect, libraryAdmin, createFloor);       // Create floor + auto-generate seats
router.put('/:id',                      libraryProtect, libraryAdmin, updateFloor);       // Update floor details
router.delete('/:id',                   libraryProtect, libraryAdmin, deleteFloor);       // Delete floor and all its seats
router.patch('/:floorId/seats/:seatId', libraryProtect, libraryAdmin, toggleSeatStatus); // Enable/disable a seat

module.exports = router;