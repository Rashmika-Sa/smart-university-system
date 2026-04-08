const Book = require('../../models/Library/Book');

// GET /api/library/books
// Students — get all active books with optional category filter and search
exports.getBooks = async (req, res) => {
  try {
    const filter = { status: 'active' };

    // Filter by category e.g. ?category=Computing
    if (req.query.category) filter.category = req.query.category;

    // Search by title or author name (case-insensitive)
    if (req.query.search) {
      filter.$or = [
        { title:  { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const books = await Book.find(filter).sort({ title: 1 }); // Sort alphabetically by title
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/books/all
// Admin only — get all books including inactive ones
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/library/books/:id
// Get a single book by ID — used for book detail view
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/library/books
// Admin only — adds a new book to the library catalogue
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// PUT /api/library/books/:id
// Admin only — updates book details (title, author, copies, status etc.)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// DELETE /api/library/books/:id
// Admin only — removes a book from the catalogue
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json({ msg: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};