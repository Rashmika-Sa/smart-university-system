import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const CanteenDashboard = () => {
  const navigate = useNavigate();
  
  // 1. Data States
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); 

  // 2. User State
  const [userInfo, setUserInfo] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // 3. Canteen Selection State
  const [selectedCanteen, setSelectedCanteen] = useState('Main Canteen');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 4. Search & Edit States
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null); 
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Rice',
    image: '',
    canteen: 'Main Canteen'
  });

  const canteenOptions = [
    'Main Canteen',
    'Birdnest Canteen',
    'Perera & Sons (P&S)',
    'Barista'
  ];

  // 5. Data Fetching (Wrapped in useCallback to prevent React compile errors)
  const fetchMenu = useCallback(async (canteenName) => {
    setLoading(true);
    try {
      const response = await axios.get(`/canteen/menu?canteen=${encodeURIComponent(canteenName)}`);
      setFoodItems(response.data || []);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (canteenName, showLoader = false) => {
    if (showLoader) setLoading(true); 
    try {
        const response = await axios.get(`/orders/canteen/${encodeURIComponent(canteenName)}`);
        setOrders(response.data || []);
    } catch (err) {
        console.error("Error fetching orders:", err);
    } finally {
        setLoading(false);
    }
  }, []);

  // 6. UseEffects
  
  // Initialize user info on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      const user = JSON.parse(userStr);
      setUserInfo(user);
      if (user.role === 'canteen_admin') {
        if (!user.managedCanteen) {
          setIsSuperAdmin(true);
        } else {
          setSelectedCanteen(user.managedCanteen);
          setIsSuperAdmin(false);
        }
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Data based on Active Tab & Selected Canteen
  useEffect(() => {
    if (activeTab === 'menu') {
        fetchMenu(selectedCanteen);
    } else {
        fetchOrders(selectedCanteen, true);
    }
  }, [selectedCanteen, activeTab, fetchMenu, fetchOrders]);

  // Auto-Refresh Orders every 15 seconds
  useEffect(() => {
    let interval;
    if (activeTab === 'orders') {
        interval = setInterval(() => {
            fetchOrders(selectedCanteen, false);
        }, 15000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedCanteen, fetchOrders]);


  // 7. Action Handlers
  const handleStatusUpdate = async (orderId, currentStatus) => {
    let newStatus = '';
    if (currentStatus === 'Pending') newStatus = 'Approved'; 
    else if (currentStatus === 'Approved') newStatus = 'Preparing';
    else if (currentStatus === 'Preparing') newStatus = 'Ready';
    else if (currentStatus === 'Ready') newStatus = 'Completed';
    else return;

    try {
        await axios.put(`/orders/update-status/${orderId}`, { status: newStatus });
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            )
        );
        fetchOrders(selectedCanteen, false); 
    } catch (err) {
        alert("Failed to update status");
    }
  };

  const handleAdminCancel = async (orderId) => {
    const reason = window.prompt("Are you sure you want to cancel this order?\n\nOptional: Enter a reason to send to the student (e.g., 'Out of stock'):");
    if (reason === null) return; 

    try {
        const response = await axios.put(`/orders/admin-cancel/${orderId}`, { reason });
        setOrders((prevOrders) => 
            prevOrders.map((order) => 
                order._id === orderId ? { ...order, status: 'Cancelled' } : order
            )
        );
        if (response.data?.emailSent) {
            alert("Order cancelled successfully. An email has been sent to the student.");
        } else {
            alert(response.data?.message || "Order cancelled, but failed to send the email notification.");
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.response?.data?.message || "Failed to cancel the order. Please try again.");
    }
  };

  const handleChange = (e) => setNewItem({ ...newItem, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert('Please fill in the item name and price.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        ...newItem, 
        canteen: selectedCanteen,
        price: parseFloat(newItem.price) 
      }; 

      if (editingId) {
        await axios.put(`/canteen/update/${editingId}`, payload, { headers: { 'x-auth-token': token } });
        alert('Menu item updated successfully!');
      } else {
        await axios.post('/canteen/add', payload, { headers: { 'x-auth-token': token } });
        alert('Menu item added successfully!');
      }
      setNewItem({ name: '', price: '', category: 'Rice', image: '', canteen: selectedCanteen });
      setEditingId(null);
      fetchMenu(selectedCanteen);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setNewItem({ name: item.name, price: item.price, category: item.category, image: item.image || '', canteen: item.canteen });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/canteen/delete/${id}`, { headers: { 'x-auth-token': token } });
        fetchMenu(selectedCanteen);
      } catch (err) { alert('Error deleting item'); }
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/canteen/update/${id}`, { isAvailable: !currentStatus }, { headers: { 'x-auth-token': token } });
      fetchMenu(selectedCanteen);
    } catch (err) { alert('Error updating status'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const safeSetSelectedCanteen = (newCanteen) => {
    if (userInfo && userInfo.role === 'canteen_admin' && userInfo.managedCanteen) {
      if (newCanteen !== userInfo.managedCanteen) return;
    }
    setSelectedCanteen(newCanteen);
  };

  // Safe filtering logic
  const filteredItems = foodItems.filter((item) => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Preparing': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Ready': return 'bg-green-100 text-green-700 border-green-200';
        case 'Completed': return 'bg-gray-100 text-gray-500 border-gray-200';
        case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-secondary font-sans text-gray-800">
      
      {/*TOP COMMAND BAR */}
      <div className="bg-primary sticky top-0 z-40 shadow-xl border-b border-primary-dark">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 w-full md:w-auto relative z-50">
             <div className="bg-accent p-2.5 rounded-xl text-white shadow-lg shadow-accent/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
             </div>
             <div>
                <h1 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Kitchen View</h1>
                {isSuperAdmin ? (
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 text-white text-xl font-bold hover:text-accent transition-colors">
                            {selectedCanteen}
                            <svg className={`w-4 h-4 text-accent transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-4 w-64 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {canteenOptions.map((canteen) => (
                                    <button key={canteen} onClick={() => { safeSetSelectedCanteen(canteen); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-semibold hover:bg-accent/10 ${selectedCanteen === canteen ? 'bg-primary text-white' : 'text-gray-600'}`}>
                                        {canteen}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-white text-xl font-bold">{selectedCanteen}</div>
                )}
             </div>
          </div>

          {/* TABS Switcher */}
          <div className="flex bg-primary-dark/50 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-accent text-white shadow-md' : 'text-secondary/70 hover:text-white'}`}
            >
                Incoming Orders
            </button>
            <button 
                onClick={() => setActiveTab('menu')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'menu' ? 'bg-accent text-white shadow-md' : 'text-secondary/70 hover:text-white'}`}
            >
                Menu Inventory
            </button>
          </div>

          <button onClick={handleLogout} className="text-sm font-bold text-red-300 hover:text-white hover:bg-red-500/20 px-5 py-2.5 rounded-xl transition">Log Out</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/*ORDER MANAGEMENT TAB */}
        {activeTab === 'orders' && (
            <div>
                 <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-primary tracking-tight">Live Orders</h2>
                        <p className="text-gray-500 mt-1">Real-time order feed. Auto-refreshes every 15s.</p>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => fetchOrders(selectedCanteen, true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-secondary hover:text-primary transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Refresh
                         </button>
                    </div>
                 </div>

                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <div className="w-12 h-12 border-4 border-primary-dark border-t-accent rounded-full animate-spin mb-4"></div>
                        <p className="animate-pulse font-medium">Fetching orders...</p>
                    </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length === 0 && (
                            <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                                <div className="text-5xl mb-4 opacity-50">😴</div>
                                <h3 className="text-xl font-bold text-gray-700">No Active Orders</h3>
                                <p className="text-gray-400">The kitchen is quiet.</p>
                            </div>
                        )}

                        {orders.map((order) => {
                             if(['Completed', 'Cancelled'].includes(order.status)) return null;

                             return (
                                <div key={order._id} className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${order.status === 'Pending' ? 'ring-2 ring-accent shadow-accent/20' : ''}`}>
                                    
                                    {/* Header Section */}
                                    <div className="px-5 py-4 border-b border-gray-100 flex flex-col bg-secondary/50 gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                
                                                {order.preOrderDate ? (
                                                    <div className="mt-2 inline-block bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded">
                                                        🎯 FOR: {new Date(order.preOrderDate).toDateString()}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                                        Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="text-right">
                                                 <p className="font-extrabold text-primary">LKR {order.totalAmount}</p>
                                                 <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-end gap-1 mt-1">
                                                    {order.paymentMethod === 'Card' ? '💳 Card' : '💵 Cash'}
                                                 </p>
                                            </div>
                                        </div>

                                        {/* Student Details Highlights */}
                                        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">👤</span>
                                                <h3 className="font-bold text-gray-800 text-lg">
                                                    {order.user?.name || order.studentName || 'Student Name N/A'}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 pl-7">
                                                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md tracking-wide">
                                                    ID: {order.user?.universityId || (order.user?.email ? order.user.email.split('@')[0].toUpperCase() : null) || order.studentId || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-5 flex-1 space-y-3">
                                        {(order.items || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start text-sm">
                                                <div className="flex gap-3">
                                                    <span className="font-bold text-gray-400 bg-gray-100 px-2 rounded-md h-6 flex items-center">{item.qty || item.quantity}x</span>
                                                    <span className="font-bold text-gray-700">{item.name}</span>
                                                </div>
                                                <span className="text-gray-400 font-medium text-xs">LKR {item.price * (item.qty || item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Display Remarks (If any) */}
                                    {order.remarks && (
                                        <div className="px-5 pb-4">
                                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                                <p className="text-sm text-yellow-800">
                                                    <span className="font-bold">📝 Remarks:</span> {order.remarks}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="p-4 bg-secondary border-t border-gray-100">
                                        {order.status === 'Pending' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order._id, 'Pending')}
                                                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>✅ Approve Pre-Order</span>
                                            </button>
                                        )}
                                        {order.status === 'Approved' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order._id, 'Approved')}
                                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary-dark/20 hover:bg-primary-dark hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>👨‍🍳 Start Preparing</span>
                                            </button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order._id, 'Preparing')}
                                                className="w-full py-3 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>🍱 Mark as Ready</span>
                                            </button>
                                        )}
                                        {order.status === 'Ready' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order._id, 'Ready')}
                                                className="w-full py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>🎉 Complete Order</span>
                                            </button>
                                        )}

                                        {/* Admin Cancel Button */}
                                        {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                                            <button 
                                                onClick={() => handleAdminCancel(order._id)}
                                                className="w-full mt-3 py-2 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>❌ Cancel Order</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                             );
                        })}
                     </div>
                 )}
            </div>
        )}

        {/* MENU MANAGEMENT TAB */}
        {activeTab === 'menu' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* LEFT COLUMN: Form */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-28 border border-gray-200">
                        <div className={`px-6 py-5 border-b flex items-center justify-between ${editingId ? 'bg-accent' : 'bg-primary'}`}>
                            <div>
                                <h2 className="font-bold text-lg leading-tight text-white">{editingId ? 'Edit Item' : 'New Item'}</h2>
                                <p className="text-xs opacity-80 text-white/80">{editingId ? 'Updating details' : `Adding to ${selectedCanteen}`}</p>
                            </div>
                            {editingId && (
                                <button onClick={() => { setEditingId(null); setNewItem({ name: '', price: '', category: 'Rice', image: '', canteen: selectedCanteen }); }} className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</label>
                                <input type="text" name="name" placeholder="e.g. Chicken Kotto" value={newItem.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-secondary border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition font-medium" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (LKR)</label>
                                    <input type="number" name="price" placeholder="0.00" value={newItem.price} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-secondary border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition font-medium" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                                    <div className="relative">
                                        <select name="category" value={newItem.category} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-secondary border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition font-medium appearance-none cursor-pointer">
                                            <option value="Rice">Rice</option>
                                            <option value="Short Eats">Short Eats</option>
                                            <option value="Beverage">Beverage</option>
                                            <option value="Dessert">Dessert</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                                <input type="text" name="image" placeholder="https://..." value={newItem.image} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-secondary border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition text-sm" />
                            </div>
                            <button type="submit" className={`w-full font-bold py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all ${editingId ? 'bg-accent text-white hover:bg-accent/90' : 'bg-primary text-white hover:bg-primary-dark shadow-primary-dark/30'}`}>
                                {editingId ? 'Update Inventory' : 'Add to Menu'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Grid */}
                <div className="lg:col-span-8 xl:col-span-9">
                    {/* Search Bar */}
                    <div className="mb-6 relative group max-w-md">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg></span>
                        <input type="text" placeholder="Search menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition shadow-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div key={item._id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group flex flex-col relative overflow-hidden ${!item.isAvailable ? 'opacity-80 grayscale-[0.5] bg-secondary' : ''}`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div className="flex gap-4 mb-4 pl-3">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden relative shadow-inner">
                                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span>{item.category === 'Rice' ? '🍛' : '🍔'}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-primary leading-tight mb-1 truncate">{item.name}</h3>
                                        <p className="text-xs text-gray-500 font-bold bg-gray-100 inline-block px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">{item.category}</p>
                                        <p className="text-lg font-bold text-gray-800">LKR {item.price}</p>
                                    </div>
                                </div>
                                <div className="mt-auto pl-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <button onClick={() => handleToggleAvailability(item._id, item.isAvailable)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                                    </button>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-accent/10 rounded-lg transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CanteenDashboard;