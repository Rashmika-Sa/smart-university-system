import React, { useEffect, useState } from 'react';
import { getCart, removeFromCart, clearCart, createBookBooking } from '../../../api/libraryApi';
import toast from 'react-hot-toast';

const CartDrawer = ({ onClose, onBookingDone }) => {
  const [cartBooks,   setCartBooks]   = useState([]);
  const [selected,    setSelected]    = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [loading,     setLoading]     = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getCart().then(res => setCartBooks(res.data.books || [])).catch(() => {});
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 2 ? [...prev, id]
        : prev
    );
  };

  const handleRemove = async (bookId) => {
    try {
      const res = await removeFromCart(bookId);
      setCartBooks(res.data.books || []);
      setSelected(prev => prev.filter(x => x !== bookId));
      toast.success('Removed from cart');
    } catch { toast.error('Failed to remove'); }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setCartBooks([]);
      setSelected([]);
      toast.success('Cart cleared');
    } catch { toast.error('Failed to clear'); }
  };

  const handleBook = async () => {
    if (selected.length === 0) return toast.error('Select 1 or 2 books to book');
    if (!bookingDate)           return toast.error('Select a collection date');
    setLoading(true);
    try {
      await createBookBooking({ bookIds: selected, bookingDate });
      toast.success('Books booked successfully! Awaiting admin approval.');
      setSelected([]);
      if (onBookingDone) onBookingDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-sm bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="font-bold text-slate-800 text-lg">🛒 Your Borrow List</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        {cartBooks.length === 0
          ? <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Your cart is empty</div>
          : (
            <div className="flex-1 p-5 space-y-3">
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl p-3">
                ⚠️ You can only book <strong>2 books at a time</strong>. Select up to 2 then book.
              </div>
              {cartBooks.map(book => {
                const id = book._id || book;
                const isSelected = selected.includes(id);
                return (
                  <div key={id} className={`border rounded-xl p-3 transition ${isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(id)}
                        className="mt-1 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{book.category}</span>
                      </div>
                      <button onClick={() => handleRemove(id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Collection Date</label>
                <input type="date" min={today} value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )
        }

        {cartBooks.length > 0 && (
          <div className="p-5 border-t border-slate-200 space-y-2 sticky bottom-0 bg-white">
            <p className="text-xs text-slate-500 text-center">{selected.length}/2 books selected</p>
            <button onClick={handleBook} disabled={loading || selected.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition text-sm">
              {loading ? 'Booking...' : `Book ${selected.length} Book${selected.length !== 1 ? 's' : ''}`}
            </button>
            <button onClick={handleClearCart}
              className="w-full text-red-500 hover:bg-red-50 text-sm font-semibold py-2 rounded-xl transition">
              Clear 
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;