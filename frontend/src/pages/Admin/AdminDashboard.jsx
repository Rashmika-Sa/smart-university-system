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
    <div className="flex h-screen bg-secondary font-sans">
      
      {/* --- SIDEBAR (60% Primary) --- */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-primary text-white transition-all duration-300 flex flex-col shadow-xl`}>
        
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between font-bold border-b border-primary-dark">
          {isSidebarOpen && <span className="text-lg tracking-wider text-accent">SMART ADMIN</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-primary-dark rounded-lg transition">
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
        <div className="p-4 border-t border-primary-dark">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-600 rounded-lg transition text-left text-red-100 hover:text-white">
            <FaSignOutAlt />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-auto bg-secondary p-8">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-primary uppercase tracking-wide">
              {activeTab === 'overview' ? 'Dashboard Overview' : `${activeTab} Management`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your smart campus services here.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold text-gray-700">System Admin</span>
              <span className="block text-xs text-green-600">● Online</span>
            </div>
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-md">
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

          {/* Add your other tab contents here as before... */}
          {activeTab === 'canteen' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-accent">🍔 Canteen Management</h2>
              <p className="text-gray-500">Manage daily menus, prices, and pre-orders.</p>
            </div>
          )}
          
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
      ? 'bg-accent text-white shadow-lg font-bold' 
      : 'text-gray-300 hover:bg-primary-dark hover:text-white'}`}
  >
    <span className={`text-xl ${active ? 'text-white' : 'group-hover:text-accent'}`}>
      {icon}
    </span>
    {expanded && <span className="text-sm tracking-wide">{text}</span>}
  </button>
);

export default AdminDashboard;