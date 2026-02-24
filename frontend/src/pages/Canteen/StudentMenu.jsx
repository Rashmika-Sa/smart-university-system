import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom'; 
import StudentTopNav from '../../components/StudentTopNav';

const StudentMenu = () => {
  const navigate = useNavigate();
  const { canteenName } = useParams();
  
  // 📦 Data & UI State
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // 🛒 Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Categories
  const categories = ['All', 'Rice', 'Short Eats', 'Beverage', 'Dessert'];

  // 🔄 Fetch Data
  useEffect(() => {
    if (canteenName) {
      fetchMenu();
    }
  }, [canteenName]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(`/canteen/menu?canteen=${encodeURIComponent(canteenName)}`);
      setFoodItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setLoading(false);
    }
  };

  // ➕ Cart Logic: Add Item
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        // If item exists, increment qty
        return prevCart.map((cartItem) =>
          cartItem._id === item._id 
            ? { ...cartItem, qty: cartItem.qty + 1 } 
            : cartItem
        );
      } else {
        // Add new item with qty 1
        return [...prevCart, { ...item, qty: 1 }];
      }
    });
    setIsCartOpen(true); // Auto open cart to show feedback
  };

  // ➖ Cart Logic: Remove/Decrease Item
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      return prevCart.reduce((acc, item) => {
        if (item._id === itemId) {
          if (item.qty > 1) {
            acc.push({ ...item, qty: item.qty - 1 });
          }
          // If qty is 1, it gets removed (not pushed to acc)
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    });
  };

  // 🗑️ Cart Logic: Clear Item Completely
  const deleteFromCart = (itemId) => {
    setCart((prev) => prev.filter(item => item._id !== itemId));
  };

  // 💰 Calculate Totals
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // 🚀 Handle Checkout Navigation
  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout', { 
      state: { 
        cartItems: cart, 
        totalAmount: cartTotal,
        canteenName: canteenName 
      } 
    });
  };

  // 🔍 Filter Logic
  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-secondary font-sans">
      <StudentTopNav active="Canteen" />
      
      {/* ================= HEADER ================= */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/canteen-selection')} 
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
                <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Ordering From</span>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
                {canteenName ? decodeURIComponent(canteenName) : 'Canteen'}
                </h1>
            </div>
          </div>
          
          {/* Cart Trigger Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 bg-white/10 rounded-xl hover:bg-accent group transition-all duration-300 border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white group-hover:text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 5c.07.286.074.58.012.868l-.56 2.228c-.287 1.15-.35 2.023-.35 2.474v2.918a1.5 1.5 0 01-1.5 1.5H5.625a1.5 1.5 0 01-1.5-1.5v-3.098c0-.966-.351-1.878-.965-2.583l.516-2.062a4.436 4.436 0 011.309-2.14m12 0c.325.226.65.45.965.683" />
            </svg>
            {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-primary">
                    {cartCount}
                </span>
            )}
          </button>
        </div>

        {/* Search & Filter Section */}
        <div className="max-w-7xl mx-auto px-6 pb-6 pt-2 space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </span>
            <input 
                type="text" 
                placeholder="Search for rice, short eats, beverages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-transparent shadow-lg shadow-indigo-500/20' 
                    : 'bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MENU GRID ================= */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-32 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
             <div className="w-10 h-10 border-4 border-primary-dark border-t-accent rounded-full animate-spin mb-4"></div>
             <p className="animate-pulse font-medium text-sm tracking-widest uppercase">Loading Menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item._id} 
                className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col h-full group ${!item.isAvailable ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                {/* Image */}
                <div className="h-44 bg-secondary rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                  {item.image && item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl">{item.category === 'Rice' ? '🍛' : item.category === 'Beverage' ? '🥤' : '🍔'}</span>
                  )}
                  
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-primary-dark/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-lg transform -rotate-3">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">{item.category}</span>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mt-2 line-clamp-2">{item.name}</h3>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-extrabold text-xl text-accent">
                            <span className="text-xs font-bold text-slate-400 mr-1 align-top">LKR</span>
                            {item.price}
                        </span>
                    </div>
                </div>

                {/* Add Button */}
                <button 
                  onClick={() => addToCart(item)}
                  disabled={!item.isAvailable}
                  className={`w-full py-3 rounded-xl font-bold mt-4 transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-[0.98] ${
                    item.isAvailable 
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {item.isAvailable ? (
                    <>
                        Add to Order
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </>
                  ) : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="text-5xl mb-4 opacity-50">🍽️</div>
                <h3 className="text-xl font-bold text-slate-700">Menu Empty</h3>
                <p className="text-slate-400 text-sm mt-1">Try changing the category or search term.</p>
                <button onClick={() => {setSearchTerm(''); setSelectedCategory('All')}} className="mt-4 text-indigo-500 font-bold text-sm hover:underline">Clear Filters</button>
            </div>
        )}
      </div>

      {/* ================= CART SLIDE-OVER / SIDEBAR ================= */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Backdrop */}
        <div 
            className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setIsCartOpen(false)}
        ></div>

        {/* Sidebar Panel */}
        <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            
            {/* Cart Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Your Tray</h2>
                    <p className="text-xs text-slate-400">{canteenName}</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">🛒</div>
                        <h3 className="text-lg font-bold text-gray-700">Your tray is empty</h3>
                        <p className="text-sm text-gray-500 max-w-[200px]">Go ahead and explore the menu to add delicious food.</p>
                        <button onClick={() => setIsCartOpen(false)} className="mt-6 text-primary font-bold text-sm hover:underline">Browse Menu</button>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item._id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4 animate-in slide-in-from-right-4 duration-300">
                            {/* Item Img */}
                            <div className="w-16 h-16 bg-secondary rounded-lg flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : '🍽️'}
                            </div>
                            
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-gray-400 font-medium">{item.category}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-700">LKR {item.price * item.qty}</p>
                                    
                                    {/* Qty Controls */}
                                    <div className="flex items-center gap-3 bg-secondary rounded-lg px-2 py-1">
                                        <button onClick={() => removeFromCart(item._id)} className="text-gray-500 hover:text-red-500 transition">-</button>
                                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                        <button onClick={() => addToCart(item)} className="text-gray-500 hover:text-green-600 transition">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cart Footer */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-500 text-sm font-medium">Total Amount</span>
                    <span className="text-2xl font-extrabold text-accent">LKR {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                        cart.length === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-accent text-white hover:bg-accent/90 hover:shadow-accent/40 transform active:scale-[0.98]'
                    }`}
                >
                    Proceed to Checkout
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>

        </div>
      </div>

    </div>
  );
};

export default StudentMenu;