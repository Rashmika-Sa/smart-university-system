const Cart = require('../../models/Library/Cart');
const Book = require('../../models/Library/Book');

// GET /api/library/cart
// Student gets their current cart with full book details populated
exports.getCart = async (req, res) => {
  try {
    // Find the cart or return an empty cart object if none exists yet
    let cart = await Cart.findOne({ student: req.user.id }).populate('books');
    if (!cart) cart = { student: req.user.id, books: [] }; // Return empty cart if not created yet
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/library/cart/add
// Student adds a single book to their cart
// No limit on how many books can be in the cart — limit only applies at checkout (max 2)
exports.addToCart = async (req, res) => {
  const { bookId } = req.body;

  try {
    // Verify the book exists and is active before adding to cart
    const book = await Book.findOne({ _id: bookId, status: 'active' });
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    let cart = await Cart.findOne({ student: req.user.id });

    if (!cart) {
      // First time — create a new cart for this student
      cart = await Cart.create({ student: req.user.id, books: [bookId] });
    } else {
      // Cart exists — check if book is already in it
      if (cart.books.map(id => id.toString()).includes(bookId))
        return res.status(400).json({ msg: 'Book is already in your cart' });

      // Add book to existing cart
      cart.books.push(bookId);
      await cart.save();
    }

    // Return cart with full book details
    await cart.populate('books');
    res.json(cart);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// DELETE /api/library/cart/remove/:bookId
// Student removes a specific book from their cart
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ student: req.user.id });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    // Filter out the book to remove
    cart.books = cart.books.filter(id => id.toString() !== req.params.bookId);
    await cart.save();

    // Return updated cart with full book details
    await cart.populate('books');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/library/cart/clear
// Student clears their entire cart — used after booking or manual clear
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ student: req.user.id });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    cart.books = []; // Remove all books
    await cart.save();
    res.json({ msg: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};