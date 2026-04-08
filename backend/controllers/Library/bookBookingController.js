const BookBooking = require('../../models/Library/BookBooking');
const Book        = require('../../models/Library/Book');
const Cart        = require('../../models/Library/Cart');

// POST /api/library/book-bookings
// Student books selected books from their cart
// Maximum 2 books per booking — student cannot have more than 2 active borrowed books at any time
exports.createBooking = async (req, res) => {
  const { bookIds, bookingDate } = req.body;

  // Rule 1: Must select at least 1 book
  if (!bookIds || bookIds.length === 0)
    return res.status(400).json({ msg: 'Select at least 1 book to book' });

  // Rule 2: Cannot book more than 2 books at a time
  if (bookIds.length > 2)
    return res.status(400).json({ msg: 'You can only book a maximum of 2 books at a time' });

  try {
    // Rule 3: Student cannot have more than 2 active books across all bookings
    const activeBookings = await BookBooking.find({
      student: req.user.id,
      status:  { $in: ['pending','confirmed','collected'] }, // Active statuses
    });
    const activeBooksCount = activeBookings.reduce((sum, b) => sum + b.books.length, 0);
    if (activeBooksCount + bookIds.length > 2)
      return res.status(400).json({
        msg: `You already have ${activeBooksCount} active book(s). Maximum 2 allowed at a time.`,
      });

    // Rule 4: All selected books must exist, be active, and have available copies
    const books = await Book.find({ _id: { $in: bookIds }, status: 'active' });
    if (books.length !== bookIds.length)
      return res.status(400).json({ msg: 'One or more books are unavailable' });

    // Check each book has at least 1 available copy
    const unavailable = books.filter(b => b.availableCopies < 1);
    if (unavailable.length > 0)
      return res.status(400).json({
        msg: `No copies available for: ${unavailable.map(b => b.title).join(', ')}`,
      });

    // Reserve copies — decrement availableCopies for each booked book
    await Book.updateMany(
      { _id: { $in: bookIds } },
      { $inc: { availableCopies: -1 } } // Atomic decrement
    );

    // Create the booking record
    const booking = await BookBooking.create({
      student:     req.user.id,
      books:       bookIds,
      bookingDate,
    });

    // Auto-remove booked books from the student's cart
    await Cart.findOneAndUpdate(
      { student: req.user.id },
      { $pull: { books: { $in: bookIds } } } // Pull removes matching items from array
    );

    // Return booking with book details
    await booking.populate('books', 'title author category');
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// GET /api/library/book-bookings/my
// Student gets their own book booking history with book details
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await BookBooking
      .find({ student: req.user.id })
      .populate('books', 'title author category coverImage') // Include cover for UI display
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/library/book-bookings/:id
// Student cancels their own pending booking — restores available copies
exports.cancelMyBooking = async (req, res) => {
  try {
    // Ensure the booking belongs to the logged-in student
    const booking = await BookBooking.findOne({
      _id:     req.params.id,
      student: req.user.id,
    });
    if (!booking)
      return res.status(404).json({ msg: 'Booking not found' });

    // Only pending bookings can be cancelled by student
    if (booking.status !== 'pending')
      return res.status(400).json({ msg: 'Only pending bookings can be cancelled' });

    // Restore available copies since booking is cancelled
    await Book.updateMany(
      { _id: { $in: booking.books } },
      { $inc: { availableCopies: 1 } } // Increment back
    );

    booking.status = 'cancelled';
    await booking.save();
    res.json({ msg: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/book-bookings
// Admin only — get all book bookings with optional filters
exports.getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status      = req.query.status; // Filter by status
    if (req.query.date)   filter.bookingDate = req.query.date;   // Filter by booking date

    const bookings = await BookBooking
      .find(filter)
      .populate('student', 'name email universityId') // Student details
      .populate('books',   'title author category isbn') // Book details
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/library/book-bookings/:id/status
// Admin only — updates booking status through its full lifecycle
// Lifecycle: pending → confirmed → collected → returned
// Admin also sets the return date when confirming
exports.updateStatus = async (req, res) => {
  const { status, adminNote, returnDate } = req.body;
  const allowed = ['confirmed','cancelled','collected','returned','overdue'];

  if (!allowed.includes(status))
    return res.status(400).json({ msg: `Status must be one of: ${allowed.join(', ')}` });

  try {
    const booking = await BookBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // If admin cancels — restore available copies (only if not already cancelled)
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await Book.updateMany(
        { _id: { $in: booking.books } },
        { $inc: { availableCopies: 1 } }
      );
    }

    // If admin marks as returned — restore available copies (only if not already returned)
    if (status === 'returned' && booking.status !== 'returned') {
      await Book.updateMany(
        { _id: { $in: booking.books } },
        { $inc: { availableCopies: 1 } }
      );
    }

    // Update status, admin note, and return date
    booking.status    = status;
    booking.adminNote = adminNote || booking.adminNote;
    if (returnDate) booking.returnDate = returnDate; // Admin sets return deadline on confirmation

    await booking.save();
    await booking.populate('books', 'title author');
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};