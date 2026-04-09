import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const StudentTopNav = ({ active = "Home" }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isBooker = ["team_captain", "society"].includes(user.role);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavBtn = ({ label, route }) => {
    const isActive = active === label;
    return (
      <button
        onClick={() => navigate(route)}
        className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-accent text-white shadow-[0_0_12px_rgba(255,107,53,0.35)]"
            : isDarkMode
            ? "text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className={`sticky top-0 z-50 shadow-sm border-b transition-colors duration-200 ${
      isDarkMode
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-slate-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className={`font-black text-lg tracking-tight flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
          <img src="/sliit-official-logo.png" alt="SLIIT Logo" className="h-10 w-auto object-contain" />
          <span>SLIIT Smart Portal</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <NavBtn label="Home" route="/student-dashboard" />
          {user.role === "student" && <NavBtn label="Application" route="/facilities/application" />}
          {isBooker && <NavBtn label="Book Facilities" route="/facilities/home" />}
          <NavBtn label="Calendar" route="/facilities/calendar" />
          <NavBtn label="Canteen" route="/canteen-selection" />
          <NavBtn label="Shuttle" route="/student-shuttle-dashboard" />
          <NavBtn label="Facilities" route="/facility-dashboard" />
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isDarkMode
                ? "bg-slate-700 text-yellow-300 hover:bg-slate-600"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          
          <button
            onClick={handleLogout}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isDarkMode
                ? "text-rose-400 hover:bg-rose-500/10"
                : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
};

export default StudentTopNav;
