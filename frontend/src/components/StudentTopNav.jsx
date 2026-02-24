import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentTopNav = ({ active = 'Home', showLogout = true }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const NavBtn = ({ label, route }) => {
    const isActive = active === label;
    return (
      <button
        onClick={() => navigate(route)}
        className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]'
            : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="font-black text-lg tracking-tight">
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Sliit Smart</span>
          <span className="text-slate-800"> Uni</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <NavBtn label="Home" route="/student-dashboard" />
          <NavBtn label="Academic Spaces" route="/academic-space-dashboard" />
          <NavBtn label="Canteen" route="/canteen-selection" />
          <NavBtn label="Shuttle" route="/shuttle-dashboard" />
          <NavBtn label="Facilities" route="/facility-dashboard" />
          <NavBtn label="My Orders" route="/my-orders" />
          {showLogout && (
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default StudentTopNav;
