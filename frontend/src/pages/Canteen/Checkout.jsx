import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; 

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. Initialize State 
  const { cartItems, totalAmount, canteenName } = state || { cartItems: [], totalAmount: 0, canteenName: '' };
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState(''); // State for remarks
  
  // State for the chosen pre-order date
  const [preOrderDate, setPreOrderDate] = useState('');

  // 2.Safety Check: Redirect if cart is empty
  useEffect(() => {
    if (!state || !state.cartItems || state.cartItems.length === 0) {
      navigate('/canteen-selection'); 
    }
  }, [state, navigate]);

  // Calculate the allowed date range using Local Time
  const getMinMaxDates = () => {
    const today = new Date();
    const minDate = new Date(today);
    
    // If it's already past 5 PM (17:00), tomorrow is no longer allowed!
    if (today.getHours() >= 17) {
        minDate.setDate(today.getDate() + 2); // Day after tomorrow
    } else {
        minDate.setDate(today.getDate() + 1); // Tomorrow
    }

    const maxDate = new Date(minDate);
    maxDate.setDate(minDate.getDate() + 14); // 2 weeks from the min date

    // Safe Local Date Formatter (YYYY-MM-DD)
    const formatLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        min: formatLocal(minDate),
        max: formatLocal(maxDate)
    };
  };

  const { min: minDateStr, max: maxDateStr } = getMinMaxDates();

  // 3. Handle Order Submission
  const handlePlaceOrder = async () => {
    if (loading) return;
    
    // Frontend check: Did they pick a date?
    if (!preOrderDate) {
        setError('Please select a date for your pre-order.');
        return;
    }

    setLoading(true);
    setError(null);

    // Get User AND Token
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token'); 

    if (!userString) {
        setError('User data missing. Please log out and log in again.');
        setLoading(false);
        return;
    }

    const user = JSON.parse(userString);
    const studentId = user._id || user.id;

    if (!studentId) {
        setError('User ID is missing. Please Log Out and Log In again.');
        setLoading(false);
        return;
    }

    const orderData = {
      items: cartItems.map(item => ({
        foodId: item._id, 
        name: item.name,
        qty: item.qty,
        price: item.price
      })),
      totalAmount: totalAmount,
      canteen: canteenName,
      paymentMethod: 'Pre-order', 
      user: studentId, 
      preOrderDate: preOrderDate,
      remarks: remarks // <--- ADDED REMARKS TO PAYLOAD
    };

    try {
      // Send Request WITH HEADERS (Auth Token)
      await axios.post('/orders/create', orderData, {
        headers: {
            'x-auth-token': token 
        }
      });
      
      setLoading(false);
      setOrderSuccess(true);
      
      // Redirect to menu after 4 seconds
      setTimeout(() => {
        navigate('/canteen-selection'); 
      }, 4000);

    } catch (err) {
      console.error('Order failed:', err);
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
      } else {
          setError(err.response?.data?.message || 'Failed to place order.');
      }
    }
  };

  // 4.Success View
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-primary-dark mb-2">Order Added to Waiting List!</h2>
        <p className="text-slate-500 max-w-sm mx-auto mb-4">
            Your pre-order for <strong>{new Date(preOrderDate).toDateString()}</strong> at <strong>{canteenName}</strong> has been sent for approval.
        </p>
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200 text-sm max-w-md mx-auto mb-8 font-medium">
            You will receive an email confirmation once the canteen approves your order.
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting to home...
        </div>
      </div>
    );
  }

  // 5.Checkout Form View
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* Header */}
      <div className="bg-primary-dark text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Confirm Pre-Order</h1>
            <p className="text-xs text-accent uppercase tracking-wider font-bold">{canteenName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid gap-8 md:grid-cols-12">
        
        {/* Left Column: Order Summary & Date Picker */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-primary-dark mb-4 flex items-center gap-2">
                <span>📅</span> Select Pre-Order Date
            </h2>
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                    When do you want to collect your food?
                </label>
                <input 
                    type="date" 
                    min={minDateStr}
                    max={maxDateStr}
                    value={preOrderDate}
                    onChange={(e) => setPreOrderDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none text-slate-700"
                    required
                />
                <p className="text-xs text-slate-400 mt-2">
                    * Orders must be placed before 5:00 PM for the next day. You can order up to 14 days in advance.
                </p>
            </div>
            
            {/* NEW: Remarks Field */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                    <span>✍️</span> Order Remarks (Optional)
                </label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g., Less sugar, extra spicy, no onions..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none text-slate-700 resize-none"
                    rows="3"
                />
            </div>

            <hr className="border-slate-100 my-6" />

            <h2 className="text-lg font-bold text-primary-dark mb-4 flex items-center gap-2">
                <span>🧾</span> Order Summary
            </h2>
            
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
            
            <div className="mt-6 pt-4 border-t border-dashed border-slate-300 bg-slate-50/50 -mx-6 px-6 pb-2">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>LKR {totalAmount}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-extrabold text-primary-dark mt-2">
                <span>Total Amount</span>
                <span>LKR {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
            <h2 className="text-lg font-bold text-primary-dark mb-4 flex items-center gap-2">
                <span>🚀</span> Ready to Order?
            </h2>

            <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Your order will be sent to the canteen admin for approval. You will receive an email once your order is confirmed.
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 mb-6 rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
              </div>
            )}

            {/* Place Order Button */}
            <button 
              onClick={handlePlaceOrder}
              disabled={loading || !preOrderDate}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                  (loading || !preOrderDate)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                  : 'bg-accent hover:bg-orange-500 hover:shadow-accent/40'
              }`}
            >
              {loading ? (
                  <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                  </>
              ) : (
                  `Request Approval (LKR ${totalAmount.toFixed(2)})`
              )}
            </button>
            
            <button 
              onClick={() => navigate(-1)}
              disabled={loading}
              className="w-full mt-3 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
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