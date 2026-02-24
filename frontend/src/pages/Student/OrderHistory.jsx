import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userString);
      const userId = user._id || user.id;
      
      const response = await axios.get(`/orders/my-orders/${userId}`);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your order history.');
      setLoading(false);
    }
  };

  // 🛡️ FRONTEND TIME POLICE: Check if they are allowed to cancel
  const canCancel = (preOrderDate, status) => {
    // If it's already cancelled, completed, or ready, they can't cancel it
    if (status === 'Cancelled' || status === 'Completed' || status === 'Ready') {
      return false;
    }

    const now = new Date();
    const orderDate = new Date(preOrderDate);

    // Normalize to midnight for accurate day comparison
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderMidnight = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

    const diffTime = orderMidnight - todayMidnight;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Too late if ordering for today or in the past
    if (diffDays <= 0) return false; 

    // Too late if ordering for tomorrow, but it's past 5:00 PM (17:00) today
    if (diffDays === 1 && now.getHours() >= 17) return false; 

    return true; // Safe to cancel!
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this pre-order?")) return;

    setCancellingId(orderId);
    try {
      await axios.put(`/orders/cancel/${orderId}`);
      
      // Update the local state to show it's cancelled without reloading the page
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Cancelled' } : order
      ));
      
      alert("Order cancelled successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  // Helper for Status Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <div className="bg-primary-dark text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/canteen-selection')} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Pre-Orders</h1>
              <p className="text-xs text-accent uppercase tracking-wider font-bold">Track & Manage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="animate-spin h-10 w-10 text-accent mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium animate-pulse">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-200">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-primary-dark mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6">Looks like you haven't pre-ordered any meals.</p>
            <button 
              onClick={() => navigate('/canteen-selection')}
              className="bg-accent text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-500 transition"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Order Card Header */}
                <div className="bg-slate-50/80 p-5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Pre-Order For
                    </p>
                    <p className="text-lg font-bold text-primary-dark">
                      {new Date(order.preOrderDate).toDateString()}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      📍 {order.canteen}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-3 mb-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 font-medium">
                          <span className="text-slate-400 mr-2">{item.quantity || item.qty}x</span> 
                          {item.name}
                        </span>
                        <span className="text-slate-600 font-bold">LKR {item.price * (item.quantity || item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-xl font-extrabold text-primary-dark">LKR {order.totalAmount.toFixed(2)}</p>
                    </div>
                    
                    {/* Action Button: Only show if they are allowed to cancel */}
                    {canCancel(order.preOrderDate, order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-200 disabled:opacity-50"
                      >
                        {cancellingId === order._id ? 'Cancelling...' : 'Cancel Pre-Order'}
                      </button>
                    )}
                    {/* Message if they can't cancel but it's not completed/cancelled yet */}
                    {!canCancel(order.preOrderDate, order.status) && ['Pending', 'Approved'].includes(order.status) && (
                      <span className="text-xs text-slate-400 italic">Past cancellation deadline (5 PM)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;