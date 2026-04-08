import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "../../api/axios";
import FacilitiesLayout from "./FacilitiesLayout";
import StudentTopNav from "../../components/StudentTopNav";

// ── design tokens (system palette) ───────────────────────────────────────────
// primary: #1B4D89  accent: #FF6B35  gradient: #6366f1→#06b6d4  navy: #0d1b3e
const PALETTES = [
  { bar: "#1B4D89", bg: "rgba(27,77,137,0.12)",   text: "#123661" },  // system primary blue
  { bar: "#FF6B35", bg: "rgba(255,107,53,0.12)",  text: "#c44a15" },  // system accent orange
  { bar: "#6366f1", bg: "rgba(99,102,241,0.12)",  text: "#4338ca" },  // indigo (gradient start)
  { bar: "#06b6d4", bg: "rgba(6,182,212,0.12)",   text: "#0e7490" },  // cyan (gradient end)
  { bar: "#10b981", bg: "rgba(16,185,129,0.12)",  text: "#065f46" },
  { bar: "#f59e0b", bg: "rgba(245,158,11,0.12)",  text: "#92400e" },
  { bar: "#ec4899", bg: "rgba(236,72,153,0.12)",  text: "#9d174d" },
  { bar: "#14b8a6", bg: "rgba(20,184,166,0.12)",  text: "#0f766e" },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_LONG   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOURS       = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM – 10 PM
const HOUR_H      = 64;
const GRID_START  = 7;
const TIME_COL_W  = 48;

// ── helpers ───────────────────────────────────────────────────────────────────
const pad         = (n) => String(n).padStart(2, "0");
const isoDate     = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const dateIso     = (d) => isoDate(d.getFullYear(), d.getMonth(), d.getDate());
const fmtHour     = (h) => h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`;
const timeToMins  = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const minsToTop   = (m) => ((m / 60) - GRID_START) * HOUR_H;
const minsToH     = (s, e) => Math.max(((e - s) / 60) * HOUR_H, 24);

const getMondayOf = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildMonthGrid = (year, month) => {
  const firstDay    = new Date(year, month, 1).getDay();
  const startOff    = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startOff - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: month - 1, year: month === 0 ? year - 1 : year, current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month, year, current: true });
  let a = 1;
  while (cells.length % 7 !== 0)
    cells.push({ day: a++, month: month + 1, year: month === 11 ? year + 1 : year, current: false });
  return cells;
};


const paletteFor = (id, cache) => {
  if (!cache[id]) cache[id] = PALETTES[Object.keys(cache).length % PALETTES.length];
  return cache[id];
};

// ── event card (month view) ───────────────────────────────────────────────────
const EventCard = ({ booking, palette }) => (
  <div
    title={`${booking.space?.name} · ${booking.startTime}–${booking.endTime}${booking.label ? ` · ${booking.label}` : ""}`}
    className="flex rounded-[4px] overflow-hidden cursor-default select-none w-full"
    style={{ background: palette.bg }}
  >
    <div style={{ width: 3, flexShrink: 0, background: palette.bar }} />
    <div className="px-1.5 py-0.5 min-w-0 flex flex-col gap-0.5 overflow-hidden">
      <span className="text-[10px] font-medium leading-none whitespace-nowrap" style={{ color: palette.bar }}>
        {booking.startTime}
      </span>
      <span className="text-[10px] font-semibold leading-tight truncate" style={{ color: palette.text }}>
        {booking.space?.name}
      </span>
    </div>
  </div>
);

// ── calendar body ─────────────────────────────────────────────────────────────
const CalendarContent = ({ colorCache }) => {
  const today    = new Date();
  const todayStr = dateIso(today);

  const [view, setView]   = useState("month");
  const [tab,  setTab]    = useState("Sports Places");
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [weekStart, setWeekStart] = useState(() => getMondayOf(today));

  const [spaces, setSpaces]   = useState([]);
  const [selectedSpaces, setSelectedSpaces] = useState(new Set());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]  = useState(true);

  const weekScrollRef = useRef(null);
  const spaceType     = tab === "Sports Places" ? "Sports Facility" : "Event Space";

  const filteredSpaces = useMemo(
    () => spaces.filter((s) => s.type === spaceType),
    [spaces, spaceType]
  );

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    }), [weekStart]);

  useEffect(() => {
    axios.get("/facilities/spaces").then(({ data }) => setSpaces(data)).catch(() => {});
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let from, to;
      if (view === "month") {
        from = `${year}-${pad(month + 1)}-01`;
        to   = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;
      } else {
        from = dateIso(weekDays[0]);
        to   = dateIso(weekDays[6]);
      }
      const { data } = await axios.get(`/facilities/bookings?from=${from}&to=${to}&status=confirmed&calendar=true`);
      setBookings(data);
    } catch { setBookings([]); }
    finally   { setLoading(false); }
  }, [view, year, month, weekStart]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setSelectedSpaces(new Set()); }, [tab]);

  const toggleSpace = (id) =>
    setSelectedSpaces((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.space || b.space.type !== spaceType) return;
      if (selectedSpaces.size > 0 && !selectedSpaces.has(b.space._id)) return;
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings, spaceType, selectedSpaces]);

  const monthGrid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const goPrev = () => {
    if (view === "month") {
      if (month === 0) { setMonth(11); setYear((y) => y - 1); }
      else setMonth((m) => m - 1);
    } else {
      setWeekStart((d) => { const n = new Date(d); n.setDate(d.getDate() - 7); return n; });
    }
  };
  const goNext = () => {
    if (view === "month") {
      if (month === 11) { setMonth(0); setYear((y) => y + 1); }
      else setMonth((m) => m + 1);
    } else {
      setWeekStart((d) => { const n = new Date(d); n.setDate(d.getDate() + 7); return n; });
    }
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setWeekStart(getMondayOf(today));
  };

  const monthTotal = bookings.filter((b) => b.space?.type === spaceType).length;

  const weekLabel = useMemo(() => {
    const s = weekDays[0], e = weekDays[6];
    return s.getMonth() === e.getMonth()
      ? `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
      : `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }, [weekDays]);

  return (
    // Outer: full width, fixed height fill, no overflow escape
    <div style={{ display: "flex", width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>

      {/* ── Dark left panel ─────────────────────────────────────────── */}
      <aside style={{ width: 224, flexShrink: 0, background: "#0d1b3e", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>

        {/* Month/Year + mini-nav */}
        <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 17, lineHeight: 1 }}>{MONTH_NAMES[month]}</span>
            <span style={{ color: "#FF6B35", fontWeight: 400, fontSize: 17, lineHeight: 1 }}>{year}</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { dir: "prev", path: "M15 19l-7-7 7-7" },
              { dir: "next", path: "M9 5l7 7-7 7" },
            ].map(({ dir, path }) => (
              <button key={dir}
                onClick={() => {
                  if (dir === "prev") { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
                  else { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }
                }}
                style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, cursor: "pointer", background: "transparent", border: "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Venue filter */}
        <div style={{ padding: "0 12px", flex: 1, minHeight: 0, overflowY: "auto" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#71717a", padding: "0 8px 8px" }}>
            {spaceType === "Sports Facility" ? "Sports Venues" : "Event Venues"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[{ _id: "__all", name: "All Venues" }, ...filteredSpaces].map((s) => {
              const isAll  = s._id === "__all";
              const active = isAll ? selectedSpaces.size === 0 : selectedSpaces.has(s._id);
              const pal    = isAll ? null : paletteFor(s._id, colorCache);
              return (
                <button key={s._id}
                  onClick={() => isAll ? setSelectedSpaces(new Set()) : toggleSpace(s._id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                    background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: pal ? pal.bar : "rgba(255,255,255,0.3)" }} />
                  <span style={{ fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                </button>
              );
            })}
            {filteredSpaces.length === 0 && (
              <p style={{ fontSize: 11, color: "#71717a", padding: "4px 8px" }}>No venues</p>
            )}
          </div>
        </div>

        {/* stat */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#71717a", marginBottom: 4 }}>
            {view === "month" ? "This month" : "This week"}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{monthTotal}</p>
          <p style={{ fontSize: 11, color: "#71717a", marginTop: 2 }}>confirmed bookings</p>
        </div>
      </aside>

      {/* ── Main calendar ────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>

        {/* Toolbar */}
        <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", flexShrink: 0, gap: 12 }}>
          {/* prev / today / next */}
          <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
            {[
              { label: <svg width="16" height="16" fill="none" stroke="#18181b" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>, action: goPrev, r: "8px 0 0 8px" },
              { label: <span style={{ fontSize: 12, fontWeight: 500, color: "#18181b" }}>Today</span>, action: goToday, r: 0 },
              { label: <svg width="16" height="16" fill="none" stroke="#18181b" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>, action: goNext, r: "0 8px 8px 0" },
            ].map(({ label, action, r }, i) => (
              <button key={i} onClick={action}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", background: "#f4f4f5", border: "none", borderRadius: r, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {/* title */}
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#18181b", flex: 1, textAlign: "center", margin: 0 }}>
            {view === "month" ? `${MONTH_NAMES[month]} ${year}` : weekLabel}
          </h2>

          {/* right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* content filter */}
            <div style={{ display: "flex", background: "#f4f4f5", borderRadius: 8, padding: 3 }}>
              {["Sports Places", "Event Bookings"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "5px 12px", fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer",
                    borderRadius: 6,
                    background: tab === t ? "#FF6B35" : "transparent",
                    color: tab === t ? "#fff" : "#71717a",
                  }}>
                  {t}
                </button>
              ))}
            </div>
            {/* view toggle */}
            <div style={{ display: "flex", background: "#f4f4f5", borderRadius: 8, padding: 3 }}>
              {["Month", "Week"].map((v) => (
                <button key={v} onClick={() => setView(v.toLowerCase())}
                  style={{
                    padding: "5px 12px", fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer",
                    borderRadius: 6,
                    background: view === v.toLowerCase() ? "#1B4D89" : "transparent",
                    color: view === v.toLowerCase() ? "#fff" : "#71717a",
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MONTH VIEW ────────────────────────────────────────── */}
        {view === "month" && (
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
            {/* day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", flexShrink: 0, borderBottom: "1px solid #f0f0f0" }}>
              {DAYS_LONG.map((d, i) => (
                <div key={d} style={{
                  textAlign: "center", padding: "10px 0", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717a",
                  background: i >= 5 ? "#fafafa" : "#fff",
                  borderRight: i < 6 ? "1px solid #f0f0f0" : "none",
                }}>
                  {d}
                </div>
              ))}
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", flex: 1 }}>
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} style={{ height: 128, background: i % 7 >= 5 ? "#fafafa" : "#fff", borderRight: i % 7 < 6 ? "1px solid #f0f0f0" : "none", borderBottom: "1px solid #f0f0f0", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {monthGrid.map((cell, idx) => {
                  const col     = idx % 7;
                  const ds      = isoDate(cell.year, cell.month, cell.day);
                  const dayBk   = bookingsByDate[ds] || [];
                  const isToday = cell.current && ds === todayStr;
                  const isWknd  = col >= 5;
                  return (
                    <div key={idx} style={{
                      minHeight: 128, display: "flex", flexDirection: "column", padding: 8,
                      background: isToday ? "rgba(27,77,137,0.05)" : isWknd ? "#fafafa" : "#fff",
                      borderRight: col < 6 ? "1px solid #f0f0f0" : "none",
                      borderBottom: "1px solid #f0f0f0",
                      opacity: cell.current ? 1 : 0.35,
                    }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                        <div style={{
                          width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "50%", fontSize: 11, fontWeight: 600,
                          background: isToday ? "#1B4D89" : "transparent",
                          color: isToday ? "#fff" : cell.current ? "#18181b" : "#a1a1aa",
                        }}>
                          {cell.day}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                        {dayBk.slice(0, 3).map((b) => (
                          <EventCard key={b._id} booking={b} palette={paletteFor(b.space?._id, colorCache)} />
                        ))}
                        {dayBk.length > 3 && (
                          <span style={{ fontSize: 10, fontWeight: 500, color: "#71717a", paddingLeft: 4 }}>
                            +{dayBk.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── WEEK VIEW ─────────────────────────────────────────── */}
        {view === "week" && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            {/* scrollable container — header lives inside so widths always match the grid */}
            <div ref={weekScrollRef} style={{ height: "100%", overflowY: "scroll", overflowX: "hidden", scrollbarGutter: "stable" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                  <div style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#374151", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              ) : (
                <>
                {/* sticky day header — inside the scroll container so widths match the grid */}
                <div style={{
                  position: "sticky", top: 0, zIndex: 10,
                  display: "flex", background: "#fff",
                  borderBottom: "1px solid #f0f0f0",
                }}>
                  <div style={{ width: TIME_COL_W, flexShrink: 0, borderRight: "1px solid #f0f0f0", background: "#fff" }} />
                  {weekDays.map((d, i) => {
                    const ds      = dateIso(d);
                    const isToday = ds === todayStr;
                    const isWknd  = i >= 5;
                    return (
                      <div key={i} style={{
                        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0",
                        background: isToday ? "rgba(27,77,137,0.05)" : isWknd ? "#fafafa" : "#fff",
                        borderRight: i < 6 ? "1px solid #f0f0f0" : "none",
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717a" }}>
                          {DAYS_LONG[i]}
                        </span>
                        <div style={{
                          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "50%", marginTop: 2, fontSize: 14, fontWeight: 600,
                          background: isToday ? "#1B4D89" : "transparent",
                          color: isToday ? "#fff" : "#18181b",
                        }}>
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* flex row: time column + 7 day columns, all same height */}
                <div style={{ display: "flex", width: "100%" }}>
                  {/* time labels column */}
                  <div style={{ width: TIME_COL_W, flexShrink: 0, borderRight: "1px solid #f0f0f0" }}>
                    {HOURS.map((h) => (
                      <div key={h} style={{
                        height: HOUR_H, display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
                        paddingRight: 8, paddingTop: 0, borderBottom: "1px solid #f7f7f7",
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: "#a1a1aa", marginTop: -7 }}>{fmtHour(h)}</span>
                      </div>
                    ))}
                  </div>

                  {/* 7 day columns — each flex:1, position:relative */}
                  {weekDays.map((d, di) => {
                    const ds      = dateIso(d);
                    const dayBk   = bookingsByDate[ds] || [];
                    const isToday = ds === todayStr;
                    const isWknd  = di >= 5;
                    return (
                      <div key={di} style={{
                        flex: 1, minWidth: 0, position: "relative",
                        borderRight: di < 6 ? "1px solid #f0f0f0" : "none",
                      }}>
                        {/* hour background cells */}
                        {HOURS.map((h) => (
                          <div key={h} style={{
                            height: HOUR_H,
                            background: isToday ? "rgba(239,246,255,0.5)" : isWknd ? "#fafafa" : "#fff",
                            borderBottom: "1px solid #f7f7f7",
                          }} />
                        ))}

                        {/* events absolutely positioned within this column */}
                        {dayBk.map((b) => {
                          const top    = minsToTop(timeToMins(b.startTime));
                          const height = minsToH(timeToMins(b.startTime), timeToMins(b.endTime));
                          const pal    = paletteFor(b.space?._id, colorCache);
                          return (
                            <div key={b._id}
                              title={`${b.space?.name} · ${b.startTime}–${b.endTime}${b.label ? ` · ${b.label}` : ""}`}
                              style={{
                                position: "absolute", top, left: 2, right: 2, height,
                                display: "flex", borderRadius: 4, overflow: "hidden",
                                background: pal.bg, cursor: "default",
                              }}>
                              <div style={{ width: 3, flexShrink: 0, background: pal.bar }} />
                              <div style={{ padding: "4px 6px", overflow: "hidden", minWidth: 0 }}>
                                <p style={{ fontSize: 10, fontWeight: 500, color: pal.bar, lineHeight: 1, whiteSpace: "nowrap", margin: 0 }}>
                                  {b.startTime}–{b.endTime}
                                </p>
                                <p style={{ fontSize: 10, fontWeight: 600, color: pal.text, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "3px 0 0" }}>
                                  {b.space?.name}
                                </p>
                                {b.label && height >= 56 && (
                                  <p style={{ fontSize: 9, color: pal.text, opacity: 0.7, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0 0" }}>
                                    {b.label}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── page wrapper ──────────────────────────────────────────────────────────────
const FacilitiesCalendar = () => {
  const [colorCache] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isFacilitiesRole = ["team_captain", "society", "facility_admin"].includes(user.role);

  if (isFacilitiesRole) {
    return (
      <FacilitiesLayout>
        <CalendarContent colorCache={colorCache} />
      </FacilitiesLayout>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <StudentTopNav active="Calendar" />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <CalendarContent colorCache={colorCache} />
      </div>
    </div>
  );
};

export default FacilitiesCalendar;
