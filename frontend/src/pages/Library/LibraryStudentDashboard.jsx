import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StudentRooms        from '../../components/library/student/StudentRooms';
import StudentChairBooking from '../../components/library/student/StudentChairBooking';
import StudentBooks        from '../../components/library/student/StudentBooks';
import StudentMyBookings   from '../../components/library/student/StudentMyBookings';

const TABS = [
  { id: 'rooms',      label: '🏠 Private Rooms' },
  { id: 'chairs',     label: '💺 Chair Booking' },
  { id: 'books',      label: '📚 Browse Books'  },
  { id: 'mybookings', label: '📋 My Bookings'   },
];

const LibraryStudentDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('rooms');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700" style={{ fontFamily: '"Segoe UI", "Aptos", sans-serif' }}>
      <Toaster position="top-right" />

      {/* Top Nav */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="font-black text-lg tracking-tight flex items-center gap-2">
            <img src="/sliit-official-logo.png" alt="SLIIT Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-white">SLIIT Library</span>
              <p className="text-xs font-normal text-slate-400">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden md:block">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </span>
            <button onClick={() => navigate('/student-dashboard')}
              className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all">
              ← Back to Portal
            </button>
            <button onClick={handleLogout}
              className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-xl transition-all">
              Logout
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                tab === t.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-slate-400 hover:text-cyan-400'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'rooms'      && <StudentRooms />}
        {tab === 'chairs'     && <StudentChairBooking />}
        {tab === 'books'      && <StudentBooks />}
        {tab === 'mybookings' && <StudentMyBookings />}
      </main>
    </div>
  );
};

export default LibraryStudentDashboard;