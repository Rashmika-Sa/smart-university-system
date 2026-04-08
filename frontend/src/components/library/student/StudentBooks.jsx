import React, { useEffect, useState } from 'react';
import { getBooks, addToCart, getCart } from '../../../api/libraryApi';
import { Spinner, EmptyState } from '../LibraryUI';
import CartDrawer from './CartDrawer';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','Computing','Business','Engineering','Law','Research','E-Book'];

const StudentBooks = () => {
  const [books,     setBooks]    = useState([]);
  const [cartBooks, setCartBooks]= useState([]);
  const [loading,   setLoading]  = useState(true);
  const [category,  setCategory] = useState('All');
  const [search,    setSearch]   = useState('');
  const [showCart,  setShowCart] = useState(false);

  const loadBooks = () => {
    const params = {};
    if (category !== 'All') params.category = category;
    if (search)             params.search   = search;
    setLoading(true);
    getBooks(params)
      .then(res => setBooks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadCart = () => {
    getCart().then(res => setCartBooks(res.data.books || [])).catch(() => {});
  };

  useEffect(() => { loadBooks(); }, [category, search]);
  useEffect(() => { loadCart(); }, []);

  const handleAddToCart = async (bookId) => {
    try {
      const res = await addToCart(bookId);
      setCartBooks(res.data.books || []);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add');
    }
  };

  const inCart = (id) => cartBooks.some(b => b && ((b._id || b) === id));

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Browse Books</h2>
          <p className="text-sm text-slate-500 mt-1">Add books to cart and borrow up to 2 at a time</p>
        </div>
        <button onClick={() => setShowCart(true)}
          className="relative bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
          🛒 Borrow List
          {cartBooks.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartBooks.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Search by title or author..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
        />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {books.length === 0
        ? <EmptyState msg="No books found." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map(book => (
              <div key={book._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col">
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full self-start mb-3">
                  {book.category}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-slate-500 mb-1">{book.author}</p>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 flex-1">{book.description}</p>
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="text-slate-500">Available:</span>
                  <span className={`font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {book.availableCopies}/{book.totalCopies} copies
                  </span>
                </div>
                {book.category === 'E-Book'
                  ? <a href={book.ebookUrl} target="_blank" rel="noreferrer"
                      className="w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition">
                      Read Online →
                    </a>
                  : inCart(book._id)
                  ? <button disabled className="w-full bg-slate-100 text-slate-400 text-xs font-semibold py-2 rounded-xl cursor-not-allowed">✓ In Cart</button>
                  : book.availableCopies < 1
                  ? <button disabled className="w-full bg-red-50 text-red-400 text-xs font-semibold py-2 rounded-xl cursor-not-allowed">Not Available</button>
                  : <button onClick={() => handleAddToCart(book._id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition">
                      Select Book
                    </button>
                }
              </div>
            ))}
          </div>
        )
      }

      {showCart && <CartDrawer onClose={() => { setShowCart(false); loadCart(); }} onBookingDone={loadCart} />}
    </div>
  );
};

export default StudentBooks;