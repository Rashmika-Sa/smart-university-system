import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';

const Ic = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);
const I = {
  bus:      'M8 6v6m0 0v6m0-6h8m0-6v6m0 6v-6M3 6h18M3 18h18M5 6V4a1 1 0 011-1h12a1 1 0 011 1v2',
  route:    'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  ticket:   'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  close:    'M6 18L18 6M6 6l12 12',
  check:    'M5 13l4 4L19 7',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  map:      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  seat:     'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  trash:    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  sun:      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon:     'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  arrow:    'M13 7l5 5m0 0l-5 5m5-5H6',
  back:     'M11 17l-5-5m0 0l5-5m-5 5h12',
  info:     'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  refresh:  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  mail:     'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  bell:     'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
};

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold animate-toast
    ${type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400' : 'bg-rose-500/15 border-rose-400/30 text-rose-400'}`}>
    <Ic d={type === 'success' ? I.check : I.close} className="w-4 h-4" />
    {msg}
    <button onClick={onClose}><Ic d={I.close} className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
  </div>
);

const Modal = ({ onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
    <div className={`relative rounded-3xl shadow-2xl w-full border border-white/10 bg-gray-900 max-h-[90vh] overflow-y-auto ${wide ? 'max-w-4xl' : 'max-w-lg'}`}>
      {children}
    </div>
  </div>
);

/* ─── VERTICAL Bus Seat Map ──────────────────────────────── */
const BusSeatMap = ({ capacity, takenSeats, selectedSeat, onSelect }) => {
  // Build rows of [left1, left2, aisle, right1, right2] — standard 2+2 layout
  const rows = Math.ceil(capacity / 4);
  const seats = [];
  for (let r = 0; r < rows; r++) {
    // left pair (A, B), right pair (C, D)
    const a = r * 4 + 1;
    const b = r * 4 + 2;
    const c = r * 4 + 3;
    const d = r * 4 + 4;
    seats.push([
      a <= capacity ? a : null,
      b <= capacity ? b : null,
      c <= capacity ? c : null,
      d <= capacity ? d : null,
    ]);
  }

  const getState = n => {
    if (!n) return 'empty';
    if (takenSeats.includes(n)) return 'taken';
    if (selectedSeat === n) return 'selected';
    return 'free';
  };

  const Seat = ({ num }) => {
    const state = getState(num);
    if (num === null) return <div className="w-10 h-11 opacity-0 pointer-events-none" />;

    const baseStyle = 'relative w-10 h-11 rounded-t-lg rounded-b-sm border transition-all duration-150 select-none';
    const stateStyle = {
      free:     'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-300/30 hover:from-emerald-300 hover:to-emerald-500 cursor-pointer shadow-md shadow-emerald-900/50 hover:scale-105 hover:-translate-y-0.5',
      taken:    'bg-gradient-to-b from-rose-400/50 to-rose-700/50 border-rose-300/20 cursor-not-allowed opacity-60',
      selected: 'bg-gradient-to-b from-cyan-300 to-cyan-600 border-cyan-200/40 cursor-pointer shadow-lg shadow-cyan-500/50 scale-105 -translate-y-0.5 ring-2 ring-cyan-300/60',
      empty:    'invisible',
    };

    return (
      <div
        onClick={() => state === 'free' && onSelect(num)}
        className={`${baseStyle} ${stateStyle[state]}`}
        title={state === 'taken' ? `Seat ${num} — Taken` : state === 'selected' ? `Seat ${num} — Selected` : `Seat ${num}`}
      >
        {/* Seat back cushion highlight */}
        <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg"
          style={{ background: 'rgba(255,255,255,0.18)' }} />
        {/* Seat number */}
        <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-black text-white/90 leading-none">{num}</div>
        {/* Taken X */}
        {state === 'taken' && (
          <div className="absolute inset-0 flex items-center justify-center pb-2">
            <span className="text-white/60 text-sm font-black leading-none">✕</span>
          </div>
        )}
        {/* Selected ✓ */}
        {state === 'selected' && (
          <div className="absolute inset-0 flex items-center justify-center pb-2">
            <span className="text-white text-sm font-black leading-none">✓</span>
          </div>
        )}
        {/* Bottom rail */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-sm"
          style={{ background: state === 'selected' ? '#0891b2' : state === 'taken' ? '#991b1b' : '#15803d' }} />
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      {/* ── Bus body (vertical) ── */}
      <div className="relative flex flex-col items-center">
        {/* Bus nose / front */}
        <div className="w-28 h-10 rounded-t-[32px] bg-gradient-to-b from-slate-500 to-slate-600 border border-white/10 flex items-end justify-center pb-1 shadow-lg">
          <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">FRONT</span>
        </div>
        {/* Windscreen */}
        <div className="w-28 h-6 bg-gradient-to-b from-cyan-400/30 to-blue-500/20 border-x border-white/10" />

        {/* Main body */}
        <div className="relative w-28 bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 px-3 py-3 flex flex-col gap-2.5">
          {/* Left body stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500/40 to-cyan-500/40" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500/40 to-cyan-500/40" />

          {/* Driver row */}
          <div className="flex items-center justify-end mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[8px] font-black shadow-md">DRV</div>
          </div>

          {/* Seat rows — each row: [A B | C D] split by aisle */}
          {seats.map((row, ri) => (
            <div key={ri} className="flex items-center gap-1">
              {/* Left pair */}
              <div className="flex gap-1">
                <Seat num={row[0]} />
                <Seat num={row[1]} />
              </div>
              {/* Aisle — row number label */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[8px] text-slate-600 font-bold">{ri + 1}</span>
              </div>
              {/* Right pair */}
              <div className="flex gap-1">
                <Seat num={row[2]} />
                <Seat num={row[3]} />
              </div>
            </div>
          ))}
        </div>

        {/* Bus rear / tail lights */}
        <div className="w-28 h-5 bg-gradient-to-b from-slate-700 to-slate-800 border border-white/10 rounded-b-xl flex items-center justify-around px-4">
          <div className="w-5 h-2 rounded-sm bg-red-500/70" />
          <div className="w-5 h-2 rounded-sm bg-red-500/70" />
        </div>
      </div>

      {/* ── Right panel: Legend + seat count ── */}
      <div className="flex flex-col justify-start gap-4 pt-12">
        {/* Legend */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Legend</p>
          {[
            { color: 'from-emerald-400 to-emerald-600', label: 'Available' },
            { color: 'from-rose-400/60 to-rose-700/60', label: 'Taken' },
            { color: 'from-cyan-300 to-cyan-600',       label: 'Selected' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-sm bg-gradient-to-b ${l.color} border border-white/10 shrink-0`} />
              <span className="text-slate-400 text-xs font-semibold">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Seat count */}
        <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available</p>
          <p className="text-2xl font-black text-emerald-400">{capacity - takenSeats.length}</p>
          <p className="text-[10px] text-slate-600 font-semibold">of {capacity}</p>
        </div>

        {/* Selected indicator */}
        {selectedSeat && (
          <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">Your Seat</p>
            <p className="text-3xl font-black text-cyan-300">{selectedSeat}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Schedule Card ──────────────────────────────────────── */
const ScheduleCard = ({ schedule, onBook, hasBooked, dark }) => {
  const dep  = new Date(schedule.departureTime);
  const mins = Math.round((dep - new Date()) / 60000);
  const soon = mins > 0 && mins < 60;
  const gone = mins < 0;
  const pct  = Math.round(((schedule.busId?.capacity||30) - schedule.availableSeats) / (schedule.busId?.capacity||30) * 100);

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
      ${dark?'bg-gray-900 border-white/10 hover:border-violet-400/30':'bg-white border-gray-200 hover:border-violet-300 shadow-sm'}`}>
      <div className={`h-1 w-full ${gone?'bg-gray-500':soon?'bg-gradient-to-r from-amber-400 to-orange-500':'bg-gradient-to-r from-violet-500 to-cyan-500'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${gone?'bg-gray-700':soon?'bg-gradient-to-br from-amber-400 to-orange-500':'bg-gradient-to-br from-violet-500 to-cyan-500'}`}>
              <Ic d={I.bus} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-extrabold text-base ${dark?'text-white':'text-gray-900'}`}>{schedule.routeId?.routeName||'Route'}</p>
              <p className={`text-xs font-semibold ${dark?'text-slate-500':'text-gray-400'}`}>{schedule.busId?.plateNumber} · {schedule.busId?.model}</p>
            </div>
          </div>
          {soon && !gone && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-400/20 animate-pulse">SOON</span>}
          {gone && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-500/15 text-gray-400 border border-gray-400/20">DEPARTED</span>}
        </div>
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-semibold ${dark?'bg-white/5':'bg-gray-50'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 shrink-0" />
          <span className={dark?'text-slate-300':'text-gray-600'}>{schedule.routeId?.startPoint}</span>
          <div className="flex-1 flex items-center gap-0.5">
            {[...Array(4)].map((_,i)=><div key={i} className={`flex-1 h-px ${dark?'bg-white/10':'bg-gray-200'}`}/>)}
            <Ic d={I.arrow} className="w-3 h-3 text-violet-400 shrink-0" />
          </div>
          <span className={dark?'text-slate-300':'text-gray-600'}>{schedule.routeId?.endPoint}</span>
          <div className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-400/30 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`rounded-xl p-3 ${dark?'bg-white/5':'bg-gray-50'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark?'text-slate-500':'text-gray-400'}`}>Departure</p>
            <p className={`font-black text-sm ${dark?'text-white':'text-gray-900'}`}>{dep.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
            <p className={`text-[10px] ${dark?'text-slate-500':'text-gray-400'}`}>{dep.toLocaleDateString()}</p>
          </div>
          <div className={`rounded-xl p-3 ${dark?'bg-white/5':'bg-gray-50'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark?'text-slate-500':'text-gray-400'}`}>Seats Left</p>
            <p className={`font-black text-sm ${schedule.availableSeats===0?'text-rose-400':schedule.availableSeats<5?'text-amber-400':dark?'text-white':'text-gray-900'}`}>{schedule.availableSeats}</p>
            <p className={`text-[10px] ${dark?'text-slate-500':'text-gray-400'}`}>of {schedule.busId?.capacity||'?'} total</p>
          </div>
        </div>
        <div className="mb-4">
          <div className={`h-2 rounded-full overflow-hidden ${dark?'bg-white/10':'bg-gray-100'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${pct>80?'bg-gradient-to-r from-rose-400 to-rose-600':pct>50?'bg-gradient-to-r from-amber-400 to-orange-500':'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{width:`${pct}%`}} />
          </div>
          <p className={`text-[10px] mt-1 font-semibold ${dark?'text-slate-500':'text-gray-400'}`}>{pct}% occupied</p>
        </div>
        {hasBooked ? (
          <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold text-center">✓ Already Booked</div>
        ) : schedule.availableSeats === 0 ? (
          <div className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-400 text-xs font-bold text-center">Fully Booked</div>
        ) : gone ? (
          <div className="w-full py-3 rounded-xl bg-gray-500/10 border border-gray-400/20 text-gray-400 text-xs font-bold text-center">Already Departed</div>
        ) : (
          <button onClick={() => onBook(schedule)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <Ic d={I.ticket} className="w-4 h-4" /> Book Seat
          </button>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════ */
export default function StudentShuttleDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dark, setDark]       = useState(true);
  const [tab, setTab]         = useState('schedules');
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');

  const [schedules, setSchedules]   = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);

  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [selectedSeat,    setSelectedSeat]    = useState(null);
  const [confirming,      setConfirming]      = useState(false);

  const prevBookingsRef = useRef([]);
  const [newlyConfirmed, setNewlyConfirmed] = useState([]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchSchedules  = async () => { try { const r = await axios.get('/shuttles/schedules');  setSchedules(r.data); } catch {} };
  const fetchMyBookings = async () => {
    try {
      const r = await axios.get('/shuttles/my-bookings');
      const fresh = r.data || [];
      const prev  = prevBookingsRef.current;
      const justConfirmed = fresh.filter(b => {
        const old = prev.find(p => p._id === b._id);
        return old && old.paymentStatus === 'Pending' && b.paymentStatus === 'Confirmed';
      });
      if (justConfirmed.length > 0) {
        justConfirmed.forEach(b => {
          showToast(`🎉 Your booking for ${b.scheduleId?.routeId?.routeName || 'your trip'} has been confirmed! Check your email.`);
        });
        setNewlyConfirmed(prev => [...prev, ...justConfirmed.map(b => b._id)]);
      }
      prevBookingsRef.current = fresh;
      setMyBookings(fresh);
    } catch {}
  };
  const fetchTakenSeats = async id => { try { const r = await axios.get(`/shuttles/seats/${id}`); setTakenSeats(r.data.takenSeats); } catch {} };

  useEffect(() => {
    fetchSchedules();
    fetchMyBookings();
    const interval = setInterval(() => { fetchMyBookings(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const openBooking = async schedule => {
    setBookingSchedule(schedule); setSelectedSeat(null); setConfirming(false);
    await fetchTakenSeats(schedule._id);
  };

  const handleConfirmBook = async () => {
    if (!selectedSeat) return showToast('Please select a seat first', 'error');
    setLoading(true);
    try {
      await axios.post('/shuttles/reserve', { scheduleId: bookingSchedule._id, seatNumber: selectedSeat });
      showToast(`🎉 Seat ${selectedSeat} booked! Waiting for admin confirmation.`);
      setBookingSchedule(null); setSelectedSeat(null); setConfirming(false);
      fetchSchedules(); fetchMyBookings();
    } catch (err) { showToast(err.response?.data?.msg || 'Booking failed', 'error'); }
    setLoading(false);
  };

  const cancelBooking = async id => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await axios.delete(`/shuttles/cancel/${id}`); showToast('Booking cancelled'); fetchMyBookings(); fetchSchedules(); }
    catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  const filteredSchedules = schedules.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.routeId?.routeName?.toLowerCase().includes(q) || s.routeId?.startPoint?.toLowerCase().includes(q) || s.routeId?.endPoint?.toLowerCase().includes(q) || s.busId?.plateNumber?.toLowerCase().includes(q);
  });

  const myBookedIds    = myBookings.map(b => b.scheduleId?._id).filter(Boolean);
  const pendingCount   = myBookings.filter(b => b.paymentStatus === 'Pending').length;
  const confirmedCount = myBookings.filter(b => b.paymentStatus === 'Confirmed').length;

  const D        = dark;
  const bg       = D ? 'bg-gray-950'     : 'bg-slate-50';
  const surface  = D ? 'bg-gray-900'     : 'bg-white';
  const border   = D ? 'border-white/10' : 'border-gray-200';
  const text     = D ? 'text-white'      : 'text-gray-900';
  const muted    = D ? 'text-gray-500'   : 'text-gray-400';
  const divider  = D ? 'border-white/5'  : 'border-gray-100';
  const inputCls = D
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20';

  const TABS = [
    { id:'schedules', label:'Find a Bus',  icon:I.bus },
    { id:'bookings',  label:'My Bookings', icon:I.ticket },
  ];

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1,h2,h3,.font-display { font-family: 'Syne', sans-serif; }
        @keyframes toast-in { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        .animate-toast { animation: toast-in 0.3s cubic-bezier(.22,1,.36,1); }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.45s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}.d4{animation-delay:.16s}.d5{animation-delay:.20s}.d6{animation-delay:.24s}
        @keyframes confirmed-pulse { 0%{box-shadow:0 0 0 0 rgba(52,211,153,0.4)}70%{box-shadow:0 0 0 12px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)} }
        .confirmed-glow { animation: confirmed-pulse 1.5s ease-out 2; }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#7c3aed,#0891b2);border-radius:99px}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <header className={`sticky top-0 z-30 ${surface} border-b ${border} backdrop-blur-xl`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Ic d={I.bus} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-display font-black text-base leading-none ${text}`}>SLIIT Shuttle</p>
              <p className={`text-[11px] font-semibold tracking-widest uppercase ${muted}`}>Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 text-[10px] font-semibold ${muted}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-refresh on
            </div>
            <button onClick={() => { fetchMyBookings(); fetchSchedules(); showToast('Refreshed!'); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${surface} ${border} ${muted} hover:text-violet-400`}>
              <Ic d={I.refresh} className="w-4 h-4" />
            </button>
            <button onClick={() => setDark(!dark)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${surface} ${border} ${muted} hover:text-violet-400`}>
              <Ic d={dark ? I.sun : I.moon} className="w-4 h-4" />
            </button>
            <div className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${surface} ${border}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black">
                {user.name?.[0]?.toUpperCase()||'S'}
              </div>
              <div>
                <p className={`text-xs font-bold leading-none ${text}`}>{user.name||'Student'}</p>
                <p className="text-[10px] text-violet-400 font-semibold mt-0.5">{user.universityId||'Student'}</p>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition-all">
              <Ic d={I.logout} className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl p-8 fade-up" style={{background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #0891b2 100%)'}}>
          <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Good {new Date().getHours()<12?'Morning':new Date().getHours()<18?'Afternoon':'Evening'}</p>
              <h1 className="font-display text-white text-3xl font-black mb-1">{user.name?.split(' ')[0]||'Student'} 👋</h1>
              <p className="text-white/50 text-sm">Find your bus, pick your seat, travel smart.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { v:schedules.length,  l:'Available', c:'from-white/10 to-white/5' },
                { v:myBookings.length, l:'My Trips',  c:'from-white/10 to-white/5' },
                { v:schedules.reduce((a,s)=>a+s.availableSeats,0), l:'Free Seats', c:'from-white/10 to-white/5' },
              ].map(s=>(
                <div key={s.l} className={`bg-gradient-to-br ${s.c} backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10 min-w-[80px]`}>
                  <p className="text-3xl font-display font-black text-white">{s.v}</p>
                  <p className="text-white/50 text-[11px] font-semibold mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status bar */}
        {myBookings.length > 0 && (
          <div className={`flex items-center gap-4 flex-wrap p-4 rounded-2xl border ${surface} ${border}`}>
            <Ic d={I.bell} className="w-4 h-4 text-violet-400 shrink-0" />
            <span className={`text-sm font-semibold ${text}`}>Booking Status</span>
            <div className="flex gap-3 flex-wrap">
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-400/20">
                  ⏳ {pendingCount} Pending — waiting for admin confirmation
                </span>
              )}
              {confirmedCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">
                  <Ic d={I.mail} className="w-3.5 h-3.5" /> {confirmedCount} Confirmed — email sent to your inbox
                </span>
              )}
            </div>
            <span className={`ml-auto text-[11px] ${muted}`}>Auto-refreshes every 30s</span>
          </div>
        )}

        {/* TABS */}
        <div className={`flex gap-1.5 p-1.5 rounded-2xl border w-fit ${surface} ${border}`}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${tab===t.id?'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25':`${muted} hover:${text}`}`}>
              <Ic d={t.icon} className="w-4 h-4" />
              {t.label}
              {t.id==='bookings' && myBookings.length>0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab===t.id?'bg-white/20 text-white':'bg-violet-500/20 text-violet-400'}`}>{myBookings.length}</span>
              )}
              {t.id==='bookings' && pendingCount>0 && tab!=='bookings' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ═══ FIND A BUS ═══ */}
        {tab === 'schedules' && (
          <div className="fade-up space-y-6">
            <div className="relative">
              <Ic d={I.search} className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search by route, destination or bus plate..."
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-all ${inputCls}`} />
            </div>
            {filteredSchedules.length === 0 ? (
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Ic d={I.bus} className={`w-12 h-12 mx-auto mb-3 ${muted}`} />
                <p className={`font-bold ${text}`}>No buses found</p>
                <p className={`text-sm mt-1 ${muted}`}>Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredSchedules.map((s,i)=>(
                  <div key={s._id} className={`fade-up d${Math.min(i+1,6)}`}>
                    <ScheduleCard schedule={s} onBook={openBooking} hasBooked={myBookedIds.includes(s._id)} dark={dark} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ MY BOOKINGS ═══ */}
        {tab === 'bookings' && (
          <div className="fade-up space-y-5">
            <div>
              <h2 className={`font-display text-xl font-extrabold ${text}`}>My Bookings</h2>
              <p className={`text-sm ${muted}`}>{myBookings.length} reservation{myBookings.length!==1?'s':''}</p>
            </div>

            {myBookings.length === 0 ? (
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Ic d={I.ticket} className={`w-12 h-12 mx-auto mb-3 ${muted}`} />
                <p className={`font-bold ${text}`}>No bookings yet</p>
                <p className={`text-sm mt-1 ${muted}`}>Go to Find a Bus to book your first trip</p>
                <button onClick={()=>setTab('schedules')} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 transition-all">Find a Bus</button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b,i)=>{
                  const dep  = new Date(b.scheduleId?.departureTime);
                  const gone = dep < new Date();
                  const isNewlyConfirmed = newlyConfirmed.includes(b._id);
                  const isConfirmed = b.paymentStatus === 'Confirmed';
                  return (
                    <div key={b._id}
                      className={`fade-up d${Math.min(i+1,6)} relative overflow-hidden rounded-2xl border p-5 ${surface} ${border} transition-all hover:shadow-xl ${isNewlyConfirmed?'confirmed-glow':''}`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 ${isConfirmed?'bg-gradient-to-r from-emerald-400 to-teal-500':'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
                      <div className="flex items-start justify-between gap-4 flex-wrap pt-2">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg font-display font-black text-xl text-white
                            ${gone?'bg-gradient-to-br from-gray-600 to-gray-700':isConfirmed?'bg-gradient-to-br from-emerald-500 to-teal-500':'bg-gradient-to-br from-violet-500 to-cyan-500'}`}>
                            {b.seatNumber}
                          </div>
                          <div>
                            <p className={`font-display font-extrabold text-base ${text}`}>{b.scheduleId?.routeId?.routeName||'Route'}</p>
                            <p className={`text-xs font-semibold ${muted}`}>{b.scheduleId?.busId?.plateNumber} · Seat {b.seatNumber}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}>
                                <Ic d={I.clock} className="w-3 h-3" />
                                {dep.toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}
                              </span>
                              <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}>
                                <Ic d={I.map} className="w-3 h-3" />
                                {b.scheduleId?.routeId?.startPoint} → {b.scheduleId?.routeId?.endPoint}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border
                            ${isConfirmed?'bg-emerald-500/10 text-emerald-400 border-emerald-400/20':'bg-amber-500/10 text-amber-400 border-amber-400/20'}`}>
                            {isConfirmed ? '✓ Confirmed' : '⏳ Pending'}
                          </span>
                          {isConfirmed && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <Ic d={I.mail} className="w-3 h-3" /> Email sent to your inbox
                            </span>
                          )}
                          {!isConfirmed && !gone && (
                            <span className={`text-[11px] font-semibold ${muted} text-right max-w-[140px] leading-snug`}>
                              Waiting for admin to confirm
                            </span>
                          )}
                          {!gone && (
                            <button onClick={()=>cancelBooking(b._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 text-xs font-bold transition-all">
                              <Ic d={I.trash} className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                          {gone && <span className={`text-xs font-semibold ${muted}`}>Completed</span>}
                        </div>
                      </div>
                      {b.scheduleId?.routeId?.stops?.length > 0 && (
                        <div className={`mt-4 pt-4 border-t ${divider} flex items-center gap-2 flex-wrap`}>
                          <Ic d={I.route} className={`w-3.5 h-3.5 ${muted} shrink-0`} />
                          {[b.scheduleId.routeId.startPoint,...b.scheduleId.routeId.stops,b.scheduleId.routeId.endPoint].map((s,j,arr)=>(
                            <React.Fragment key={j}>
                              <span className={`text-xs font-semibold ${j===0?'text-emerald-400':j===arr.length-1?'text-rose-400':muted}`}>{s}</span>
                              {j<arr.length-1 && <Ic d={I.arrow} className="w-3 h-3 text-slate-600 shrink-0" />}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ BOOKING MODAL (wide, with vertical seat map) ═══ */}
      {bookingSchedule && (
        <Modal onClose={()=>{setBookingSchedule(null);setSelectedSeat(null);setConfirming(false);}} wide>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-black text-xl text-white">{confirming?'✅ Confirm Booking':'🚌 Pick Your Seat'}</h2>
                <p className="text-sm mt-0.5 text-gray-400">{bookingSchedule.routeId?.routeName} · {bookingSchedule.busId?.plateNumber}</p>
              </div>
              <button onClick={()=>{setBookingSchedule(null);setSelectedSeat(null);setConfirming(false);}}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <Ic d={I.close} className="w-5 h-5" />
              </button>
            </div>

            {!confirming ? (
              <>
                {/* Trip info strip */}
                <div className="flex items-center gap-4 p-4 rounded-2xl mb-6 flex-wrap bg-white/5">
                  {[
                    {icon:I.clock, val:new Date(bookingSchedule.departureTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}), label:'Departs'},
                    {icon:I.map,   val:`${bookingSchedule.routeId?.startPoint} → ${bookingSchedule.routeId?.endPoint}`, label:'Route'},
                    {icon:I.seat,  val:`${bookingSchedule.availableSeats} left`, label:'Available'},
                  ].map(info=>(
                    <div key={info.label} className="flex items-center gap-2">
                      <Ic d={info.icon} className="w-4 h-4 text-violet-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{info.label}</p>
                        <p className="text-xs font-bold text-white">{info.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── VERTICAL seat map ── */}
                <div className="overflow-x-auto">
                  <div className="min-w-[340px]">
                    <BusSeatMap
                      capacity={bookingSchedule.busId?.capacity||30}
                      takenSeats={takenSeats}
                      selectedSeat={selectedSeat}
                      onSelect={setSelectedSeat}
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={()=>{setBookingSchedule(null);setSelectedSeat(null);}}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-bold text-sm transition-all">
                    Cancel
                  </button>
                  <button onClick={()=>{if(!selectedSeat)return showToast('Select a seat first','error');setConfirming(true);}} disabled={!selectedSeat}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {selectedSeat ? `Continue with Seat ${selectedSeat} →` : 'Select a seat'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                {/* Ticket preview */}
                <div className="relative overflow-hidden rounded-3xl p-6" style={{background:'linear-gradient(135deg, #4f46e5, #7c3aed, #0891b2)'}}>
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'20px 20px'}} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">SLIIT Shuttle</p>
                        <p className="text-white font-display font-black text-2xl">{bookingSchedule.routeId?.routeName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Seat</p>
                        <p className="text-white font-display font-black text-4xl">{selectedSeat}</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/20 my-4" style={{backgroundImage:'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 8px, transparent 8px, transparent 16px)'}} />
                    <div className="flex items-center justify-between text-xs">
                      <div><p className="text-white/50 font-semibold">FROM</p><p className="text-white font-bold">{bookingSchedule.routeId?.startPoint}</p></div>
                      <Ic d={I.arrow} className="w-5 h-5 text-white/50" />
                      <div className="text-right"><p className="text-white/50 font-semibold">TO</p><p className="text-white font-bold">{bookingSchedule.routeId?.endPoint}</p></div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs">
                      <div><p className="text-white/50 font-semibold">BUS</p><p className="text-white font-bold">{bookingSchedule.busId?.plateNumber}</p></div>
                      <div><p className="text-white/50 font-semibold">DEPARTS</p><p className="text-white font-bold">{new Date(bookingSchedule.departureTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p></div>
                      <div><p className="text-white/50 font-semibold">DATE</p><p className="text-white font-bold">{new Date(bookingSchedule.departureTime).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                </div>

                {/* Pending note */}
                <div className="p-4 rounded-xl flex items-start gap-3 bg-amber-500/10 border border-amber-400/20">
                  <Ic d={I.info} className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-400 font-bold">Booking Pending Confirmation</p>
                    <p className="text-xs text-amber-400/80 mt-0.5">Once you confirm, your booking will be marked as <strong>Pending</strong>. When the shuttle admin confirms your seat, your status will update to <strong>Confirmed</strong> and you'll receive a confirmation email.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={()=>setConfirming(false)}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <Ic d={I.back} className="w-4 h-4" /> Change Seat
                  </button>
                  <button onClick={handleConfirmBook} disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? 'Booking...' : <><Ic d={I.check} className="w-4 h-4" /> Confirm Booking</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}