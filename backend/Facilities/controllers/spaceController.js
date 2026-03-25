const { Space, Booking } = require('../models');

// --- Time helpers ---
const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const generateSlots = (open, close, duration) => {
  const slots = [];
  let cur = toMinutes(open);
  const end = toMinutes(close);
  while (cur + duration <= end) {
    slots.push({ startTime: toTime(cur), endTime: toTime(cur + duration) });
    cur += duration;
  }
  return slots;
};

const timesOverlap = (s1, e1, s2, e2) =>
  toMinutes(s1) < toMinutes(e2) && toMinutes(e1) > toMinutes(s2);

// GET /api/facilities/spaces
// facility_admin sees all; others see only active
const getAll = async (req, res) => {
  try {
    const filter = req.user.role === 'facility_admin' ? {} : { status: 'active' };
    const spaces = await Space.find(filter).sort({ name: 1 });
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// POST /api/facilities/spaces  [facility_admin]
const create = async (req, res) => {
  try {
    const { name, type, openTime, closeTime, slotDuration } = req.body;
    const space = await Space.create({ name, type, openTime, closeTime, slotDuration });
    res.status(201).json(space);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'A space with that name already exists' });
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/facilities/spaces/:id  [facility_admin]
const update = async (req, res) => {
  try {
    const { name, type, openTime, closeTime, slotDuration, status } = req.body;
    const space = await Space.findByIdAndUpdate(
      req.params.id,
      { name, type, openTime, closeTime, slotDuration, status },
      { new: true, runValidators: true }
    );
    if (!space) return res.status(404).json({ msg: 'Space not found' });
    res.json(space);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PATCH /api/facilities/spaces/:id/status  [facility_admin]
const toggleStatus = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ msg: 'Space not found' });
    space.status = space.status === 'active' ? 'inactive' : 'active';
    await space.save();
    res.json({ msg: `Space is now ${space.status}`, space });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/facilities/spaces/:id/slots?date=YYYY-MM-DD
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ msg: 'date query param is required (YYYY-MM-DD)' });

    const space = await Space.findById(req.params.id);
    if (!space || space.status !== 'active') {
      return res.status(404).json({ msg: 'Space not found or inactive' });
    }

    const allSlots = generateSlots(space.openTime, space.closeTime, space.slotDuration);

    const booked = await Booking.find({ space: space._id, date, status: 'confirmed' });

    const available = allSlots.filter(slot =>
      !booked.some(b => timesOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime))
    );

    res.json({ date, spaceId: space._id, spaceName: space.name, slots: available });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, update, toggleStatus, getAvailableSlots };
