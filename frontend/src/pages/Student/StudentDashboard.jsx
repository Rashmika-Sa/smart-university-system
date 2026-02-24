import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Get user name safely
  const user = JSON.parse(localStorage.getItem('user'));
  const studentName = user ? user.name : 'Student';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👋 Welcome back, {studentName}!</h1>
          <p className="text-gray-500">What would you like to do today?</p>
        </div>
        
        {/* 👇 UPDATED: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* 🆕 My Orders Button */}
          <button 
            onClick={() => navigate('/my-orders')}
            className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-orange-100 transition flex items-center gap-2"
          >
            <span>🧾</span> My Pre-Orders
          </button>

          <button 
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="bg-red-50 text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🚀 Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 🍔 Smart Canteen Card */}
        <div 
          onClick={() => navigate('/canteen-selection')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer group"
        >
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🍔
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Canteen</h3>
          <p className="text-gray-500 text-sm">Pre-order food from Main, Birdnest, or Subway and skip the queue.</p>
        </div>

        {/* 🚌 Shuttle Service */}
        <div 
          onClick={() => navigate('/shuttle-dashboard')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer group"
        >
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🚌
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Shuttle Tracker</h3>
          <p className="text-gray-500 text-sm">Track university shuttles in real-time and check schedules.</p>
        </div>

        {/* 📚 Academic Spaces */}
        <div 
          onClick={() => navigate('/academic-space-dashboard')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer group"
        >
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            📚
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Study Spaces</h3>
          <p className="text-gray-500 text-sm">Book discussion rooms, labs, or library seats instantly.</p>
        </div>

        {/* 🛠️ Facility Reporting */}
        <div 
          onClick={() => navigate('/facility-dashboard')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer group"
        >
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
            🔧
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Report Issue</h3>
          <p className="text-gray-500 text-sm">Report broken ACs, projectors, or other facility issues.</p>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;