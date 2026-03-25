import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "../../api/axios";
import FacilitiesLayout from "./FacilitiesLayout";

// ── constants ─────────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EVENT_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-800" },
  { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-800" },
  { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-800" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800" },
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800" },
];

// ── helpers ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

const isoDate = (year, month, day) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

// Returns array of day objects for the calendar grid (includes padding days from prev/next month)
const buildCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert to Mon-first (0=Mon … 6=Sun)
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];

  // padding before
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, month: month - 1, year: month === 0 ? year - 1 : year, current: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }
  // padding after (fill to complete rows)
  let after = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: after++, month: month + 1, year: month === 11 ? year + 1 : year, current: false });
  }
  return cells;
};

// Assign a stable color per space id
const colorFor = (id, cache) => {
  if (!cache[id]) {
    const idx = Object.keys(cache).length % EVENT_COLORS.length;
    cache[id] = EVENT_COLORS[idx];
  }
  return cache[id];
};

// ── sub-components ────────────────────────────────────────────────────────────
const VenueItem = ({ space, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors duration-150
      ${active ? "bg-[#0d1b3e] text-white" : "hover:bg-gray-50 text-gray-600"}`}
  >
    <span className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-white/60" : "bg-gray-300"}`} />
    <span className="text-xs font-medium truncate">{space.name}</span>
  </button>
);

const BookingPill = ({ booking, colorClass }) => (
  <div
    title={`${booking.space?.name} — ${booking.startTime}–${booking.endTime}${booking.label ? ` · ${booking.label}` : ""}`}
    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate cursor-default
      ${colorClass.bg} ${colorClass.border} ${colorClass.text}`}
  >
    {booking.startTime} {booking.space?.name}
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────
const FacilitiesCalendar = () => {
  const today = new Date();
  const [tab, setTab] = useState("Sports Places"); // "Event Bookings" | "Sports Places"
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [spaces, setSpaces] = useState([]);
  const [selectedSpaces, setSelectedSpaces] = useState(new Set()); // empty = all
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colorCache] = useState({});

  const spaceType = tab === "Sports Places" ? "Sports Facility" : "Event Space";

  // Filtered spaces by tab type
  const filteredSpaces = useMemo(
    () => spaces.filter((s) => s.type === spaceType),
    [spaces, spaceType]
  );

  // Fetch spaces once
  useEffect(() => {
    axios.get("/facilities/spaces").then(({ data }) => setSpaces(data)).catch(() => {});
  }, []);

  // Fetch bookings for current month whenever month/year changes
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const from = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const to = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      const { data } = await axios.get(`/facilities/bookings?from=${from}&to=${to}&status=confirmed`);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset selected spaces when tab changes
  useEffect(() => {
    setSelectedSpaces(new Set());
  }, [tab]);

  const toggleSpace = (id) => {
    setSelectedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Map bookings to dates, filtered by tab type and selected spaces
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.space) return;
      if (b.space.type !== spaceType) return;
      if (selectedSpaces.size > 0 && !selectedSpaces.has(b.space._id)) return;
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings, spaceType, selectedSpaces]);

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = ["team_captain", "society"].includes(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb]">
      {isStudent && <StudentTopNav active="Calendar" />}

      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          {/* brand / back */}
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-[#0d1b3e] uppercase tracking-widest">Facilities</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Booking Calendar</p>
          </div>

          {/* venue filter */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {spaceType === "Sports Facility" ? "Sports Venues" : "Event Venues"}
            </p>

            {filteredSpaces.length === 0 ? (
              <p className="text-xs text-gray-400 px-1">No spaces found</p>
            ) : (
              <div className="space-y-0.5">
                {/* "All" option */}
                <VenueItem
                  space={{ _id: "__all", name: "All Venues" }}
                  active={selectedSpaces.size === 0}
                  onClick={() => setSelectedSpaces(new Set())}
                />
                {filteredSpaces.map((s) => (
                  <VenueItem
                    key={s._id}
                    space={s}
                    active={selectedSpaces.has(s._id)}
                    onClick={() => toggleSpace(s._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* legend */}
          <div className="px-4 pb-5 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 shrink-0" />
                <span className="text-[11px] text-gray-500">Confirmed booking</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Calendar main ────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
            {/* tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {["Sports Places", "Event Bookings"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150
                    ${tab === t ? "bg-white text-[#0d1b3e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* month nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-[#0d1b3e] w-36 text-center">
                  {MONTH_NAMES[month]} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* calendar grid */}
          <div className="flex-1 overflow-auto p-5">
            {/* day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-2">
                  {d}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="bg-white h-28 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
                {grid.map((cell, idx) => {
                  const dateStr = isoDate(cell.year, cell.month, cell.day);
                  const dayBookings = bookingsByDate[dateStr] || [];
                  const isToday = cell.current && dateStr === todayStr;

                  return (
                    <div
                      key={idx}
                      className={`bg-white p-2 min-h-[7rem] flex flex-col gap-1
                        ${!cell.current ? "opacity-40" : ""}`}
                    >
                      {/* day number */}
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-0.5 self-end
                        ${isToday ? "bg-[#0d1b3e] text-white" : "text-gray-500"}`}
                      >
                        {cell.day}
                      </div>

                      {/* booking pills */}
                      <div className="space-y-0.5 overflow-hidden">
                        {dayBookings.slice(0, 3).map((b) => (
                          <BookingPill
                            key={b._id}
                            booking={b}
                            colorClass={colorFor(b.space?._id, colorCache)}
                          />
                        ))}
                        {dayBookings.length > 3 && (
                          <p className="text-[10px] text-gray-400 font-medium pl-1">
                            +{dayBookings.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacilitiesCalendar;
