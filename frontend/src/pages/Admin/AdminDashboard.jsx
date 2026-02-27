import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserGraduate, 
  FaUtensils,      // Canteen
  FaBus,           // Shuttle
  FaBook,          // Library
  FaBuilding,      // Facilities (Halls/Grounds)
  FaBullhorn,      // Notices
  FaSignOutAlt, 
  FaBars,
  FaStar           // Reviews
} from 'react-icons/fa';
import AdminReviews from './AdminReviews';
import AdminNotices from './AdminNotices';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 relative overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 text-slate-400 transition-all duration-300 flex flex-col shadow-xl relative z-10`}>
        
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between font-bold border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="/sliit-official-logo.png"
                alt="SLIIT Logo"
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-slate-200 text-xs font-semibold tracking-wide">SLIIT Smart Portal</span>
                <span className="text-slate-500 text-[10px] font-semibold tracking-wider">ADMIN</span>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-white">
            <FaBars />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-6 space-y-2 px-3">
          <SidebarItem 
            icon={<FaUserGraduate />} text="Students" 
            active={activeTab === 'students'} onClick={() => setActiveTab('students')} expanded={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaUtensils />} text="Canteen" 
            active={activeTab === 'canteen'} onClick={() => setActiveTab('canteen')} expanded={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaStar />} text="Reviews" 
            active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} expanded={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaBus />} text="Shuttle Service" 
            active={activeTab === 'shuttle'} onClick={() => setActiveTab('shuttle')} expanded={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaBook />} text="Library" 
            active={activeTab === 'library'} onClick={() => setActiveTab('library')} expanded={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaBuilding />} text="Facilities & Booking" 
            active={activeTab === 'facilities'} onClick={() => setActiveTab('facilities')} expanded={isSidebarOpen} 
          />
          <SidebarItem 
            icon={<FaBullhorn />} text="Notices & News" 
            active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} expanded={isSidebarOpen} 
          />
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 rounded-xl transition text-left text-slate-500 hover:text-red-400">
            <FaSignOutAlt />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-auto bg-transparent p-8 relative z-10">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs text-accent uppercase tracking-widest font-bold">Admin Portal</span>
            <h1 className="text-xl font-black text-white mt-0.5 tracking-tight">
              {activeTab === 'overview' ? 'Dashboard ' : `${activeTab} `}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent capitalize">
                {activeTab === 'overview' ? 'Overview' : 'Management'}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your smart campus services.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold text-slate-300">System Admin</span>
              <span className="block text-xs text-emerald-400">● Online</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8 min-h-[600px]">
          
          {activeTab === 'overview' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-black text-white">Welcome to the <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Command Centre</span></h2>
              <p className="text-slate-400 mt-2 text-sm">Select a service from the sidebar to manage.</p>
            </div>
          )}

          {/* Add your other tab contents here as before... */}
          {activeTab === 'canteen' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-accent">🍔 Canteen Management</h2>
              <p className="text-slate-400">Manage daily menus, prices, and pre-orders.</p>
            </div>
          )}

          {activeTab === 'reviews' && <AdminReviews />}
          {activeTab === 'notices' && <AdminNotices />}
          
        </div>
      </div>
    </div>
  );
};

// Helper Component for Sidebar Links
const SidebarItem = ({ icon, text, active, onClick, expanded }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group
    ${active 
      ? 'bg-accent text-white shadow-[0_0_20px_rgba(255,107,53,0.25)] font-bold' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <span className={`text-xl ${active ? 'text-white' : 'group-hover:text-accent'}`}>
      {icon}
    </span>
    {expanded && <span className="text-sm tracking-wide">{text}</span>}
  </button>
);

export default AdminDashboard;