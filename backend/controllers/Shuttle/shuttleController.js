const Bus      = require('../../models/Shuttle/Bus');
const Route    = require('../../models/Shuttle/Route');
const Schedule = require('../../models/Shuttle/Schedule');
const Booking  = require('../../models/Shuttle/Booking');
const nodemailer = require('nodemailer');

// ─── Email transporter ─────────────────────────────────────────
// Uses Gmail SMTP. Set EMAIL_USER and EMAIL_PASS in your .env file.
// For Gmail, EMAIL_PASS must be an App Password (not your login password).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Send booking confirmation email ──────────────────────────
const sendConfirmationEmail = async (booking) => {
  const student  = booking.userId;
  const schedule = booking.scheduleId;
  const route    = schedule?.routeId;
  const bus      = schedule?.busId;

  const dep = schedule?.departureTime
    ? new Date(schedule.departureTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
    : 'N/A';

  const mailOptions = {
    from: `"SLIIT Shuttle Service" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: '✅ Your Shuttle Booking is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f46e5, #7c3aed, #0891b2); padding: 36px 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px; }
          .ticket { margin: 28px 32px; background: linear-gradient(135deg, #4f46e5, #7c3aed, #0891b2); border-radius: 16px; padding: 24px; color: white; }
          .ticket-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
          .ticket-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.55); font-weight: 700; }
          .ticket-value { font-size: 15px; font-weight: 800; color: white; margin-top: 3px; }
          .seat-big { font-size: 52px; font-weight: 900; color: white; text-align: right; line-height: 1; }
          .divider { border: none; border-top: 1px dashed rgba(255,255,255,0.25); margin: 16px 0; }
          .body { padding: 0 32px 28px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
          .info-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; font-weight: 700; }
          .info-box .value { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 4px; }
          .status-badge { display: inline-block; background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; border-radius: 99px; padding: 6px 16px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 20px; }
          .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 16px; margin-top: 20px; font-size: 12px; color: #92400e; line-height: 1.6; }
          .footer { text-align: center; padding: 20px 32px; border-top: 1px solid #f1f5f9; }
          .footer p { font-size: 11px; color: #94a3b8; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 Booking Confirmed!</h1>
            <p>SLIIT Smart University — Shuttle Service</p>
          </div>

          <div class="ticket">
            <div class="ticket-row">
              <div>
                <div class="ticket-label">Route</div>
                <div class="ticket-value" style="font-size:20px">${route?.routeName || 'N/A'}</div>
              </div>
              <div>
                <div class="ticket-label">Seat</div>
                <div class="seat-big">${booking.seatNumber}</div>
              </div>
            </div>
            <hr class="divider">
            <div class="ticket-row" style="margin-bottom:0">
              <div>
                <div class="ticket-label">From</div>
                <div class="ticket-value">${route?.startPoint || 'N/A'}</div>
              </div>
              <div style="text-align:right">
                <div class="ticket-label">To</div>
                <div class="ticket-value">${route?.endPoint || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="body">
            <p style="color:#334155;font-size:15px;margin:0">Hi <strong>${student.name}</strong>,</p>
            <p style="color:#64748b;font-size:14px;margin:10px 0 0;line-height:1.6">
              Your shuttle booking has been <strong style="color:#059669">confirmed</strong> by the shuttle admin. Here are your trip details:
            </p>

            <div class="info-grid">
              <div class="info-box">
                <div class="label">Bus</div>
                <div class="value">${bus?.plateNumber || 'N/A'}</div>
              </div>
              <div class="info-box">
                <div class="label">Model</div>
                <div class="value">${bus?.model || 'N/A'}</div>
              </div>
              <div class="info-box" style="grid-column: span 2">
                <div class="label">Departure</div>
                <div class="value">${dep}</div>
              </div>
            </div>

            <div style="text-align:center">
              <span class="status-badge">✓ Payment Confirmed</span>
            </div>

            <div class="note">
              📋 <strong>Important:</strong> Please arrive at the departure point at least 5 minutes before departure. Show this email or your booking ID to the driver if asked.
            </div>
          </div>

          <div class="footer">
            <p>SLIIT Smart University System · Shuttle Service</p>
            <p style="margin-top:4px">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ═══════════════════════════════════════════════
// ADMIN CONTROLLERS
// ═══════════════════════════════════════════════

const addBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    res.json(bus);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    res.json({ msg: 'Bus removed successfully' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const addRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!route) return res.status(404).json({ msg: 'Route not found' });
    res.json(route);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ msg: 'Route not found' });
    res.json({ msg: 'Route removed successfully' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const createSchedule = async (req, res) => {
  try {
    const bus = await Bus.findById(req.body.busId);
    if (!bus) return res.status(404).json({ msg: 'Bus not found' });
    const schedule = await Schedule.create({ ...req.body, availableSeats: bus.capacity });
    res.status(201).json(schedule);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

const updateSchedule = async (req, res) => {
  try {
    if (req.body.busId) {
      const bus = await Bus.findById(req.body.busId);
      if (!bus) return res.status(404).json({ msg: 'Bus not found' });
      req.body.availableSeats = bus.capacity;
    }
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('busId').populate('routeId');
    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    res.json(schedule);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    res.json({ msg: 'Schedule removed successfully' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const getAllBookings = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) return res.status(400).json({ msg: 'scheduleId query param is required' });
    const bookings = await Booking.find({ scheduleId }).populate('userId', 'name email universityId');
    res.json(bookings);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

// ─── UPDATE BOOKING — confirms payment and sends email ─────────
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email universityId')
      .populate({
        path: 'scheduleId',
        populate: [{ path: 'busId' }, { path: 'routeId' }],
      });

    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Send confirmation email only when status changes to Confirmed
    if (req.body.paymentStatus === 'Confirmed') {
      try {
        await sendConfirmationEmail(booking);
        console.log(`✅ Confirmation email sent to ${booking.userId.email}`);
      } catch (emailErr) {
        // Email failure should not fail the API response
        console.error('❌ Email send failed:', emailErr.message);
      }
    }

    res.json(booking);
  } catch (err) { res.status(400).json({ msg: err.message }); }
};

// ═══════════════════════════════════════════════
// STUDENT CONTROLLERS
// ═══════════════════════════════════════════════

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ availableSeats: { $gt: 0 } })
      .populate('busId').populate('routeId');
    res.json(schedules);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const reserveSeat = async (req, res) => {
  try {
    const { scheduleId, seatNumber } = req.body;
    const userId = req.user.id;

    if (!scheduleId || !seatNumber)
      return res.status(400).json({ msg: 'scheduleId and seatNumber are required' });

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ msg: 'Schedule not found' });
    if (schedule.availableSeats === 0)
      return res.status(400).json({ msg: 'No seats available on this trip' });

    const seatTaken = await Booking.findOne({ scheduleId, seatNumber });
    if (seatTaken)
      return res.status(400).json({ msg: `Seat ${seatNumber} is already booked` });

    const alreadyBooked = await Booking.findOne({ userId, scheduleId });
    if (alreadyBooked)
      return res.status(400).json({ msg: 'You already have a booking for this trip' });

    const booking = await Booking.create({ userId, scheduleId, seatNumber });
    await Schedule.findByIdAndUpdate(scheduleId, { $inc: { availableSeats: -1 } });

    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'scheduleId',
        populate: [{ path: 'busId' }, { path: 'routeId' }],
      });
    res.json(bookings);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
    await Schedule.findByIdAndUpdate(booking.scheduleId, { $inc: { availableSeats: 1 } });
    await booking.deleteOne();
    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

const getTakenSeats = async (req, res) => {
  try {
    const bookings = await Booking.find({ scheduleId: req.params.scheduleId }, 'seatNumber');
    const takenSeats = bookings.map(b => b.seatNumber);
    res.json({ takenSeats });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

module.exports = {
  addBus, getAllBuses, updateBus, deleteBus,
  addRoute, getAllRoutes, updateRoute, deleteRoute,
  createSchedule, updateSchedule, deleteSchedule,
  getAllBookings, updateBooking,
  getSchedules, reserveSeat, getMyBookings, cancelBooking, getTakenSeats,
};