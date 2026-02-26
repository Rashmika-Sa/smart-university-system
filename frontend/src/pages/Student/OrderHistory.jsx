import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import StudentTopNav from '../../components/StudentTopNav';

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
    <div className="min-h-screen bg-white pb-16">
      <StudentTopNav active="My Orders" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">🧾</div>
            <div>
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Track &amp; Manage</span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                My{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Pre-Orders</span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Review status, totals, and cancellation windows.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/canteen-selection')}
            className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition shadow-lg shadow-accent/20 shrink-0"
          >
            + New Order
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-200">{error}</div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-14 text-center shadow-xl">
            <div className="text-5xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-slate-400 text-sm mb-6">You haven&apos;t pre-ordered any meals yet.</p>
            <button onClick={() => navigate('/canteen-selection')} className="px-6 py-3 rounded-xl bg-accent text-white font-bold shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:opacity-90 transition-opacity">
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Card Header */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="text-xs text-cyan-600 uppercase tracking-widest font-bold">Pre-Order For</span>
                    <p className="font-bold text-slate-900 mt-0.5">{new Date(order.preOrderDate).toDateString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {order.canteen}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="px-6 py-5">
                  <div className="space-y-2 mb-5">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 font-medium">
                          <span className="text-slate-400 mr-2">{item.quantity || item.qty}×</span>{item.name}
                        </span>
                        <span className="text-slate-600 font-bold">LKR {item.price * (item.quantity || item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-xl font-black text-accent">LKR {order.totalAmount.toFixed(2)}</p>
                    </div>
                    {canCancel(order.preOrderDate, order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition border border-red-200 disabled:opacity-50"
                      >
                        {cancellingId === order._id ? 'Cancelling...' : 'Cancel Pre-Order'}
                      </button>
                    )}
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
