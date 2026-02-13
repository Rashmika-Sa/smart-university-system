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
  FaBars 
} from 'react-icons/fa';

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
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#002b5c] text-white transition-all duration-300 flex flex-col shadow-xl`}>
        
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between font-bold border-b border-blue-800">
          {isSidebarOpen && <span className="text-lg tracking-wider text-yellow-400">SMART ADMIN</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-800 rounded-lg transition">
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
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-600 rounded-lg transition text-left text-red-100 hover:text-white">
            <FaSignOutAlt />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-[#002b5c] uppercase tracking-wide">
              {activeTab === 'overview' ? 'Dashboard Overview' : `${activeTab} Management`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your smart campus services here.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold text-gray-700">System Admin</span>
              <span className="block text-xs text-green-600">● Online</span>
            </div>
            <div className="w-10 h-10 bg-[#002b5c] text-white rounded-full flex items-center justify-center font-bold shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[600px]">
          
          {activeTab === 'overview' && (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-gray-300">Welcome to the Command Center 🚀</h2>
              <p className="text-gray-400 mt-2">Select a service from the sidebar to manage.</p>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-700">Student Database</h2>
              <p className="text-gray-500">Table of registered students goes here...</p>
            </div>
          )}

          {activeTab === 'canteen' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-orange-600">🍔 Canteen Management</h2>
              <p className="text-gray-500">Manage daily menus, prices, and pre-orders.</p>
              {/* Future: Add Menu Form here */}
            </div>
          )}

          {activeTab === 'shuttle' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-blue-600">🚌 Shuttle Services</h2>
              <p className="text-gray-500">Update bus schedules, routes, and live status.</p>
              {/* Future: Schedule Table here */}
            </div>
          )}

          {activeTab === 'library' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-green-700">📚 Library System</h2>
              <p className="text-gray-500">Manage book inventory and reservations.</p>
            </div>
          )}

          {activeTab === 'facilities' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-purple-600">🏟️ Facility Booking</h2>
              <p className="text-gray-500">Manage bookings for Halls, Grounds, and Parking slots.</p>
            </div>
          )}

          {activeTab === 'notices' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-red-500">📢 Notices & News</h2>
              <p className="text-gray-500">Post announcements for all students.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

// Helper Component for Sidebar Links (Unchanged logic, just styling tweaks)
const SidebarItem = ({ icon, text, active, onClick, expanded }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group
    ${active 
      ? 'bg-yellow-500 text-[#002b5c] shadow-lg font-bold' 
      : 'text-blue-100 hover:bg-[#004080] hover:text-white'}`}
  >
    <span className={`text-xl ${active ? 'text-[#002b5c]' : 'group-hover:text-yellow-400'}`}>
      {icon}
    </span>
    {expanded && <span className="text-sm tracking-wide">{text}</span>}
  </button>
);

export default AdminDashboard;