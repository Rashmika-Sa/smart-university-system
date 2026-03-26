import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import StudentTopNav from "../../components/StudentTopNav";

// ── per-role sidebar navigation ─────────────────────────────────────────────
const CALENDAR_NAV = {
  label: "Calendar",
  path: "/facilities/calendar",
  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const NAV = {
  sports_council: [
    {
      label: "Registrations",
      path: "/facilities/registrations",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
  ],
  facility_admin: [
    {
      label: "Registrations",
      path: "/facilities/registrations",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "Spaces",
      path: "/facilities/spaces",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    CALENDAR_NAV,
  ],
  team_captain: [
    {
      label: "Home",
      path: "/facilities/home",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      label: "My Bookings",
      path: "/facilities/bookings",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "New Booking",
      path: "/facilities/bookings/new",
      icon: "M12 4v16m8-8H4",
    },
    CALENDAR_NAV,
  ],
  society: [
    {
      label: "Home",
      path: "/facilities/home",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      label: "My Bookings",
      path: "/facilities/bookings",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "New Booking",
      path: "/facilities/bookings/new",
      icon: "M12 4v16m8-8H4",
    },
    CALENDAR_NAV,
  ],
};

const ROLE_LABELS = {
  sports_council: "Sports Council",
  facility_admin: "Facility Admin",
  team_captain: "Team Captain",
  society: "Society",
};

// ── component ────────────────────────────────────────────────────────────────
const FacilitiesLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navItems = NAV[user.role] || [];
  const roleLabel = ROLE_LABELS[user.role] || user.role;

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // initials for avatar
  const initials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isBooker = ["team_captain", "society"].includes(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb]">
      {isBooker && <StudentTopNav active="Book Facilities" />}
      <div className="flex flex-1">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          {/* brand */}

          {/* nav */}
          <nav className="flex-1 px-3 py-5 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                ${isActive ? "bg-[#0d1b3e] text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`
                }
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* user + sign out */}
          <div className="px-3 pb-5 space-y-1 border-t border-gray-100 pt-4">
            {/* user pill */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-[#0d1b3e]/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#0d1b3e]">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user.name || "User"}</p>
                <p className="text-[10px] text-gray-400 truncate">{roleLabel}</p>
              </div>
            </div>

            {/* sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default FacilitiesLayout;
