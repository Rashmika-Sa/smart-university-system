const Floor = require('../../models/Library/Floor');
const Seat  = require('../../models/Library/Seat');

// GET /api/library/floors
// Students and admins — returns only active floors
exports.getFloors = async (req, res) => {
  try {
    const floors = await Floor.find({ status: 'active' });
    res.json(floors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/floors/all
// Admin only — returns all floors including inactive ones
exports.getAllFloors = async (req, res) => {
  try {
    const floors = await Floor.find();
    res.json(floors);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/library/floors
// Admin only — creates a new floor and auto-generates all seats for it
// Default is 250 seats but admin can pass a different totalSeats value
exports.createFloor = async (req, res) => {
  const { floorNumber, name, totalSeats = 250 } = req.body;

  try {
    // Prevent duplicate floor numbers
    const existing = await Floor.findOne({ floorNumber });
    if (existing)
      return res.status(400).json({ msg: `Floor ${floorNumber} already exists` });

    // Create the floor record
    const floor = await Floor.create({ floorNumber, name, totalSeats });

    // Auto-generate all seat records for this floor
    // Creates seats numbered 1 to totalSeats
    const seats = Array.from({ length: totalSeats }, (_, i) => ({
      floor:      floor._id,
      seatNumber: i + 1, // Seats start from 1
      status:     'active',
    }));
    await Seat.insertMany(seats); // Bulk insert for performance

    res.status(201).json({
      msg:   `Floor created with ${totalSeats} seats auto-generated`,
      floor,
    });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// PUT /api/library/floors/:id
// Admin only — updates floor name or status
exports.updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!floor) return res.status(404).json({ msg: 'Floor not found' });
    res.json(floor);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// DELETE /api/library/floors/:id
// Admin only — deletes the floor AND all 250 seats belonging to it
exports.deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);
    if (!floor) return res.status(404).json({ msg: 'Floor not found' });

    // Cascade delete — remove all seats that belong to this floor
    await Seat.deleteMany({ floor: req.params.id });

    res.json({ msg: 'Floor and all its seats deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/library/floors/:floorId/seats/:seatId
// Admin only — toggles a single seat between active and inactive
// Used to disable broken or reserved seats without deleting them
exports.toggleSeatStatus = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.seatId);
    if (!seat) return res.status(404).json({ msg: 'Seat not found' });

    // Toggle: active → inactive, inactive → active
    seat.status = seat.status === 'active' ? 'inactive' : 'active';
    await seat.save();

    res.json({ msg: `Seat ${seat.seatNumber} is now ${seat.status}`, seat });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};