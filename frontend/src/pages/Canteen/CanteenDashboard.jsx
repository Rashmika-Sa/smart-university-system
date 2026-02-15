import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const CanteenDashboard = () => {
  const navigate = useNavigate();
  
  // 📦 Data States
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 👤 User State - Check if admin and their permissions
  const [userInfo, setUserInfo] = useState(null);
  const [isCanteenAdmin, setIsCanteenAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // 🏢 Canteen Selection State
  const [selectedCanteen, setSelectedCanteen] = useState('Main Canteen');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔍 Search State
  const [searchTerm, setSearchTerm] = useState('');

  // ✏️ Edit State
  const [editingId, setEditingId] = useState(null); 

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Rice',
    image: '',
    canteen: 'Main Canteen'
  });

  // 🏪 Available Canteens List
  const canteenOptions = [
    'Main Canteen',
    'Birdnest Canteen',
    'Perera & Sons (P&S)',
    'Barista'
  ];

  // 🔄 Initialize user info and permissions on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserInfo(user);
      
      // Check if user is canteen admin
      if (user.role === 'canteen_admin') {
        setIsCanteenAdmin(true);
        
        // Check if they're a super admin (no managedCanteen)
        if (!user.managedCanteen) {
          setIsSuperAdmin(true);
        } else {
          // Set to their managed canteen and disable dropdown
          setSelectedCanteen(user.managedCanteen);
          setIsSuperAdmin(false);
        }
      }
    }
  }, []);

  // 🔄 Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Fetch menu whenever the selected canteen changes
  useEffect(() => {
    fetchMenu();
  }, [selectedCanteen]);

  // Update newItem canteen when selection changes
  useEffect(() => {
    if (!editingId) {
        setNewItem(prev => ({ ...prev, canteen: selectedCanteen }));
    }
  }, [selectedCanteen, editingId]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/canteen/menu?canteen=${encodeURIComponent(selectedCanteen)}`);
      setFoodItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const itemPayload = { ...newItem, canteen: selectedCanteen };

      if (editingId) {
        await axios.put(`/canteen/edit/${editingId}`, itemPayload, {
          headers: { 'x-auth-token': token }
        });
        setEditingId(null);
      } else {
        await axios.post('/canteen/add', itemPayload, {
          headers: { 'x-auth-token': token }
        });
      }
      
      fetchMenu();
      setNewItem({ name: '', price: '', category: 'Rice', image: '', canteen: selectedCanteen }); 
    } catch (err) {
      alert('Error saving item: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setNewItem({
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image || '',
      canteen: item.canteen
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewItem({ name: '', price: '', category: 'Rice', image: '', canteen: selectedCanteen });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/canteen/delete/${id}`, {
          headers: { 'x-auth-token': token }
        });
        fetchMenu();
      } catch (err) {
        alert('Error deleting item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/canteen/update/${id}`, { isAvailable: !currentStatus }, {
        headers: { 'x-auth-token': token }
      });
      fetchMenu();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 🔒 Safe canteen selector - prevents sub admins from changing canteen
  const safeSetSelectedCanteen = (newCanteen) => {
    // If user is a sub admin (has managedCanteen), they can ONLY view their own canteen
    if (userInfo && userInfo.role === 'canteen_admin' && userInfo.managedCanteen) {
      if (newCanteen !== userInfo.managedCanteen) {
        console.warn(`Access Denied: You can only manage '${userInfo.managedCanteen}' canteen`);
        return; // Prevent the change
      }
    }
    // If super admin, allow all canteens
    setSelectedCanteen(newCanteen);
  };

  const filteredItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 🟢 TOP COMMAND BAR */}
      <div className="bg-[#002147] sticky top-0 z-40 shadow-xl border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Branding & Custom Dropdown */}
            <div className="flex items-center gap-4 w-full md:w-auto relative z-50">
                <div className="bg-amber-400 p-2.5 rounded-xl text-[#002147] shadow-lg shadow-amber-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                    </svg>
                </div>
                
                <div className="relative">
                    <h1 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Console</h1>
                    
                    {/* ✨ SHOW DROPDOWN ONLY FOR SUPER ADMIN */}
                    {isSuperAdmin ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 text-white text-xl font-bold hover:text-amber-400 transition-colors group focus:outline-none"
                            >
                                {selectedCanteen}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth={3} 
                                    stroke="currentColor" 
                                    className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {/* ✨ CUSTOM DROPDOWN MENU */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-4 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform origin-top-left animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Outlet</span>
                                    </div>
                                    <ul className="py-1">
                                        {canteenOptions.map((canteen) => (
                                            <li key={canteen}>
                                                <button
                                                    onClick={() => {
                                                        safeSetSelectedCanteen(canteen);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-between
                                                        ${selectedCanteen === canteen 
                                                            ? 'bg-[#002147] text-white' 
                                                            : 'text-slate-600 hover:bg-amber-50 hover:text-[#002147]'
                                                        }`}
                                                >
                                                    {canteen}
                                                    {selectedCanteen === canteen && (
                                                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        // 🔒 SPECIFIC CANTEEN ADMIN - NO DROPDOWN
                        <div className="text-white text-xl font-bold">
                            {selectedCanteen}
                            <p className="text-xs text-amber-300">Admin Access</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl w-full relative group">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-amber-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </span>
                <input 
                    type="text" 
                    placeholder="Search menu inventory..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#003366]/50 text-white placeholder-blue-300/70 border border-blue-800/50 focus:ring-2 focus:ring-amber-400/50 focus:bg-[#002a55] outline-none transition-all backdrop-blur-sm"
                />
            </div>

            {/* Logout */}
            <button 
                onClick={handleLogout}
                className="text-sm font-bold text-red-300 hover:text-white hover:bg-red-500/20 px-5 py-2.5 rounded-xl transition border border-transparent hover:border-red-500/30"
            >
                Log Out
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 👈 LEFT COLUMN: Control Panel (Form) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-28 border border-slate-200">
            {/* Form Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${editingId ? 'bg-amber-400' : 'bg-[#002147]'}`}>
                <div>
                    <h2 className={`font-bold text-lg leading-tight ${editingId ? 'text-[#002147]' : 'text-white'}`}>
                        {editingId ? 'Edit Item' : 'New Item'}
                    </h2>
                    <p className={`text-xs opacity-80 ${editingId ? 'text-[#002147]' : 'text-blue-200'}`}>
                        {editingId ? 'Updating details' : `Adding to ${selectedCanteen}`}
                    </p>
                </div>
                {editingId && (
                    <button onClick={handleCancelEdit} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#002147]">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Chicken Kotto"
                  value={newItem.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-[#002147] focus:border-transparent outline-none transition font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (LKR)</label>
                    <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-[#002147] outline-none transition font-medium"
                    required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    {/* Custom Styled Select Box */}
                    <div className="relative">
                        <select
                            name="category"
                            value={newItem.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-[#002147] outline-none transition font-medium appearance-none cursor-pointer"
                        >
                            <option value="Rice">Rice</option>
                            <option value="Short Eats">Short Eats</option>
                            <option value="Beverage">Beverage</option>
                            <option value="Dessert">Dessert</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                             </svg>
                        </div>
                    </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                <input
                  type="text"
                  name="image"
                  placeholder="https://..."
                  value={newItem.image}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-[#002147] outline-none transition text-sm"
                />
              </div>

              <button
                type="submit"
                className={`w-full font-bold py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    editingId 
                    ? 'bg-amber-400 text-[#002147] hover:bg-amber-300' 
                    : 'bg-[#002147] text-white hover:bg-blue-900 shadow-blue-900/30'
                }`}
              >
                {editingId ? 'Update Inventory' : 'Add to Menu'}
              </button>
            </form>
          </div>
        </div>

        {/* 👉 RIGHT COLUMN: Inventory Grid */}
        <div className="lg:col-span-8 xl:col-span-9">
            
          {/* Stats / Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl font-bold text-[#002147] tracking-tight">{selectedCanteen}</h2>
                <p className="text-slate-500 mt-1">Manage stock availability and pricing.</p>
            </div>
            <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Items</span>
                <p className="text-2xl font-bold text-[#002147] leading-none mt-1">{filteredItems.length}</p>
            </div>
          </div>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-12 h-12 border-4 border-blue-900 border-t-amber-400 rounded-full animate-spin mb-4"></div>
                <p className="animate-pulse font-medium">Syncing Database...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div 
                    key={item._id} 
                    className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group flex flex-col relative overflow-hidden ${!item.isAvailable ? 'opacity-80 grayscale-[0.5] bg-slate-50' : ''}`}
                >
                  {/* Status Strip (Left side color) */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>

                  <div className="flex gap-4 mb-4 pl-3">
                    {/* Image */}
                    <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden relative shadow-inner">
                      {item.image && item.image.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                          <span>{item.category === 'Rice' ? '🍛' : item.category === 'Beverage' ? '🥤' : '🍔'}</span>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#002147] leading-tight mb-1 truncate">{item.name}</h3>
                      <p className="text-xs text-slate-500 font-bold bg-slate-100 inline-block px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">{item.category}</p>
                      <p className="text-lg font-bold text-slate-800">LKR {item.price}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-auto pl-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    
                    {/* Availability Toggle */}
                    <button 
                        onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                            item.isAvailable 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>

                    <div className="flex gap-1">
                        {/* Edit Button */}
                        <button 
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-slate-400 hover:text-[#002147] hover:bg-amber-100 rounded-lg transition"
                            title="Edit Item"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>

                        {/* Delete Button */}
                        <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete Item"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
             <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="text-5xl mb-4 text-slate-200">🍽️</div>
                <h3 className="text-xl font-bold text-slate-700">No items found</h3>
                <p className="text-slate-400 text-sm mt-2">
                    {searchTerm ? "No results match your search." : `The ${selectedCanteen} menu is empty.`}
                </p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CanteenDashboard;