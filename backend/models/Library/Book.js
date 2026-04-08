const mongoose = require('mongoose');

// Schema for a library book (physical or e-book)
const bookSchema = new mongoose.Schema({
  title:           { type: String, required: true },  // Book title
  author:          { type: String, required: true },  // Author name(s)
  isbn:            { type: String, required: true, unique: true }, // Unique book identifier
  category: {
    type:     String,
    enum:     ['Computing','Business','Engineering','Law','Research','E-Book'], // Allowed categories
    required: true,
  },
  totalCopies:     { type: Number, default: 1 }, // Total physical copies in the library
  availableCopies: { type: Number, default: 1 }, // Copies currently available (decrements on booking)
  coverImage:      { type: String, default: '' }, // URL or path to cover image
  description:     { type: String, default: '' }, // Short book summary
  ebookUrl:        { type: String, default: '' }, // Required if category is E-Book — link to digital access
  status:          { type: String, enum: ['active','inactive'], default: 'active' }, // inactive = hidden from students
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);