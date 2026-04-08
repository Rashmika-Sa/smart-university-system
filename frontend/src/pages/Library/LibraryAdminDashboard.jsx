import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminRooms         from '../../components/library/admin/AdminRooms';
import AdminChairBookings from '../../components/library/admin/AdminChairBookings';
import AdminBooks         from '../../components/library/admin/AdminBooks';
import AdminConfirmations from '../../components/library/admin/AdminConfirmations';

const TABS = [
  { id: 'rooms',         label: '🏠 Private Rooms'   },
  { id: 'chairs',        label: '💺 Chair Bookings'  },
  { id: 'books',         label: '📚 Book Management' },
  { id: 'confirmations', label: '✅ Confirmations'   },
];

const LibraryAdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('confirmations');
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
              <p className="text-xs font-normal text-slate-400">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs bg-accent/15 text-accent font-semibold px-2 py-1 rounded-full border border-accent/30">
                Library Admin
              </span>
              <span className="text-sm text-slate-400">{user.name}</span>
            </div>
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
        {tab === 'rooms'         && <AdminRooms />}
        {tab === 'chairs'        && <AdminChairBookings />}
        {tab === 'books'         && <AdminBooks />}
        {tab === 'confirmations' && <AdminConfirmations />}
      </main>
    </div>
  );
};

export default LibraryAdminDashboard;