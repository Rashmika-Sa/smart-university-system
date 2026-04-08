<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentTopNav from '../../components/StudentTopNav';
import AppFooter from '../../components/AppFooter';

const LibraryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <StudentTopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Library Manager Dashboard</h1>
          <p className="text-slate-400">Manage library resources and operations</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.name}!</h2>
          <p className="text-indigo-100">You have full access to library management features.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Books</p>
                <p className="text-3xl font-bold text-white mt-2">--</p>
              </div>
              <div className="text-4xl text-blue-400">📚</div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Books Issued</p>
                <p className="text-3xl font-bold text-white mt-2">--</p>
              </div>
              <div className="text-4xl text-green-400">✓</div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Books Available</p>
                <p className="text-3xl font-bold text-white mt-2">--</p>
              </div>
              <div className="text-4xl text-purple-400">📖</div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Returns</p>
                <p className="text-3xl font-bold text-white mt-2">--</p>
              </div>
              <div className="text-4xl text-yellow-400">⏱️</div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Book Management */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span> Book Management
            </h3>
            <p className="text-slate-400 mb-6">Manage library book inventory and catalog</p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                Add New Book
              </button>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition">
                View All Books
              </button>
            </div>
          </div>

          {/* Issuance Management */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">✓</span> Issuance Management
            </h3>
            <p className="text-slate-400 mb-6">Track book issuance and returns</p>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">
                Issue Book
              </button>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition">
                Process Returns
              </button>
            </div>
          </div>

          {/* Member Management */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> Member Management
            </h3>
            <p className="text-slate-400 mb-6">Manage library member accounts</p>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition">
                View Members
              </button>
              <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition">
                Manage Membership
              </button>
            </div>
          </div>

          {/* Reports & Analytics */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Reports & Analytics
            </h3>
            <p className="text-slate-400 mb-6">View library statistics and reports</p>
            <div className="space-y-3">
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition">
                View Reports
              </button>
              <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition">
                Circulation Stats
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm">Name</p>
              <p className="text-white font-semibold">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Email</p>
              <p className="text-white font-semibold">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Role</p>
              <p className="text-white font-semibold">Library Manager</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <AppFooter />
    </div>
  );
};

export default LibraryDashboard;
=======
import React from 'react';
import { Navigate } from 'react-router-dom';

const LibraryDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'library_admin' || user.role === 'admin')
    return <Navigate to="/library-admin" replace />;
  return <Navigate to="/library-student" replace />;
};

export default LibraryDashboard;
>>>>>>> Stashed changes
