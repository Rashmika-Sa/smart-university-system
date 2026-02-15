import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; // Ensure this path matches your folder structure

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. Initialize State
  const { cartItems, totalAmount, canteenName } = state || { cartItems: [], totalAmount: 0, canteenName: '' };
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 2. 🛡️ Safety Check: Redirect if cart is empty
  useEffect(() => {
    if (!state || !state.cartItems || state.cartItems.length === 0) {
      navigate('/canteen-selection'); // Redirect back to canteen selection
    }
  }, [state, navigate]);

  // 3. 📝 Handle Order Submission
  const handlePlaceOrder = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    // Get the current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      setError('User not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    // Prepare data exactly as the Backend expects
    const orderData = {
      items: cartItems.map(item => ({
        foodId: item._id, // Matches 'ref' in Backend Model
        name: item.name,
        qty: item.qty,
        price: item.price
      })),
      totalAmount: totalAmount,
      canteen: canteenName,
      paymentMethod: paymentMethod,
      studentId: user._id // Use actual user ID from auth
    };

    try {
      // Post to the Order Route we created
      await axios.post('/orders/create', orderData);
      
      setLoading(false);
      setOrderSuccess(true);
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        // Navigate to Student Dashboard
        navigate('/student-dashboard'); 
      }, 3000);

    } catch (err) {
      console.error('Order failed:', err);
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  // 4. ✅ Success View
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-[#002147] mb-2">Order Successful!</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
            Your order for <strong>{canteenName}</strong> has been placed successfully.
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting to history...
        </div>
      </div>
    );
  }

  // 5. 🛒 Checkout Form View
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* Header */}
      <div className="bg-[#002147] text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
            <p className="text-xs text-amber-400 uppercase tracking-wider font-bold">{canteenName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid gap-8 md:grid-cols-12">
        
        {/* Left Column: Order Summary (Takes 7 columns on desktop) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-[#002147] mb-4 flex items-center gap-2">
                <span>🧾</span> Order Summary
            </h2>
            
            {/* Scrollable List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-start border-b border-slate-50 pb-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg"/> : (item.category === 'Rice' ? '🍛' : '🍔')}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-400 font-medium">Qty: {item.qty} × LKR {item.price}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-700">LKR {item.price * item.qty}</p>
                </div>
              ))}
            </div>
            
            {/* Total Section */}
            <div className="mt-6 pt-4 border-t border-dashed border-slate-300 bg-slate-50/50 -mx-6 px-6 pb-2">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>LKR {totalAmount}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-extrabold text-[#002147] mt-2">
                <span>Total Amount</span>
                <span>LKR {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Actions (Takes 5 columns on desktop) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-[#002147] mb-4 flex items-center gap-2">
                <span>💳</span> Payment Method
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                    paymentMethod === 'Card' 
                    ? 'border-amber-400 bg-amber-50 text-[#002147] shadow-md scale-[1.02]' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-bold text-sm">Card</span>
              </button>
              
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                    paymentMethod === 'Cash' 
                    ? 'border-amber-400 bg-amber-50 text-[#002147] shadow-md scale-[1.02]' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">💵</span>
                <span className="font-bold text-sm">Cash</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg text-[#002147] shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                    loading 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-amber-400 hover:bg-amber-300 hover:shadow-amber-400/40'
                }`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-[#002147]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    `Pay LKR ${totalAmount.toFixed(2)}`
                )}
            </button>
            
            <button 
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
            >
                Cancel & Go Back
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default Checkout;