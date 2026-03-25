import React from "react";
import { useNavigate } from "react-router-dom";

const StudentTopNav = ({ active = "Home" }) => {
  const navigate = useNavigate();

  const NavBtn = ({ label, route }) => {
    const isActive = active === label;
    return (
      <button
        onClick={() => navigate(route)}
        className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-accent text-white shadow-[0_0_12px_rgba(255,107,53,0.35)]"
            : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="font-black text-lg tracking-tight flex items-center gap-2">
          <img src="/sliit-official-logo.png" alt="SLIIT Logo" className="h-10 w-auto object-contain" />
          <span className="text-slate-800">SLIIT Smart Portal</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <NavBtn label="Home" route="/student-dashboard" />
          <NavBtn label="Book Facilities" route="/facilities/home" />
          <NavBtn label="Calendar" route="/facilities/calendar" />
          <NavBtn label="Canteen" route="/canteen-selection" />
          <NavBtn label="Shuttle" route="/shuttle-dashboard" />
        </div>
      </div>
    </nav>
  );
};

export default StudentTopNav;
