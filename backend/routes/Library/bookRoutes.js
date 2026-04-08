const express = require('express');
const router  = express.Router();
const { libraryProtect, libraryAdmin } = require('../../middleware/authMiddleware');
const {
  getBooks,
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../../controllers/Library/bookController');

// IMPORTANT: /all must come BEFORE /:id to avoid Express treating 'all' as a book ID

// Student routes
router.get('/',       libraryProtect,               getBooks);    // Browse active books (with category/search filter)
router.get('/all',    libraryProtect, libraryAdmin, getAllBooks);  // Admin — all books including inactive
router.get('/:id',    libraryProtect,               getBook);     // Single book detail

// Admin routes
router.post('/',      libraryProtect, libraryAdmin, createBook);  // Add new book
router.put('/:id',    libraryProtect, libraryAdmin, updateBook);  // Update book
router.delete('/:id', libraryProtect, libraryAdmin, deleteBook);  // Delete book

module.exports = router;