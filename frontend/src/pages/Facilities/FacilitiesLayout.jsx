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
    {
      label: "Booking Requests",
      path: "/facilities/booking-requests",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Applications",
      path: "/facilities/application-reviews",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    CALENDAR_NAV,
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
    {
      label: "Booking Requests",
      path: "/facilities/booking-requests",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Applications",
      path: "/facilities/application-reviews",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    CALENDAR_NAV,
  ],
  admin: [
    {
      label: "Booking Requests",
      path: "/facilities/booking-requests",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Applications",
      path: "/facilities/application-reviews",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
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
  admin: "Admin",
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
  const shouldShowTopNav = ["team_captain", "society", "student", "facility_admin", "sports_council"].includes(user.role);
  const topNavActive = isBooker ? "Book Facilities" : "Facilities";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      {shouldShowTopNav && <StudentTopNav active={topNavActive} />}
      <div className="flex flex-1">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white/95 backdrop-blur border-r border-slate-200 flex flex-col shadow-[0_0_0_1px_rgba(15,23,42,0.02)]">
          <div className="px-5 pt-6 pb-5 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <img src="/sliit-official-logo.png" alt="SLIIT Logo" className="h-9 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-900 truncate">
                  SLIIT Smart Portal
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Facilities
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 truncate">{roleLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border
                ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-900/10"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                }`
                }
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 pb-5 space-y-3 border-t border-slate-200/80 pt-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm shadow-slate-900/10">
                <span className="text-[10px] font-semibold tracking-wide text-white">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name || "User"}</p>
                <p className="text-[11px] text-slate-500 truncate">{roleLabel}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all duration-200"
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
