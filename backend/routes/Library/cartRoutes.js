const express = require('express');
const router  = express.Router();
const { libraryProtect } = require('../../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require('../../controllers/Library/cartController');

// IMPORTANT: /clear must come BEFORE /remove/:bookId
// Otherwise Express will match 'clear' as the :bookId param

// All cart routes are student-only — no admin access needed
router.get('/',                  libraryProtect, getCart);         // View cart
router.post('/add',              libraryProtect, addToCart);       // Add book to cart
router.delete('/clear',          libraryProtect, clearCart);       // Clear entire cart — must be before /remove/:bookId
router.delete('/remove/:bookId', libraryProtect, removeFromCart);  // Remove one book from cart

module.exports = router;