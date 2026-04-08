const Room = require('../../models/Library/Room');

// GET /api/library/rooms
// Public to logged-in students — returns only active rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'active' });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/rooms/all
// Admin only — returns all rooms including inactive ones
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/library/rooms
// Admin only — creates a new study room with 4 sessions
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// PUT /api/library/rooms/:id
// Admin only — updates room details (name, description, sessions, status etc.)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc and run schema validators
    );
    if (!room) return res.status(404).json({ msg: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// DELETE /api/library/rooms/:id
// Admin only — permanently removes a room from the system
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ msg: 'Room not found' });
    res.json({ msg: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};