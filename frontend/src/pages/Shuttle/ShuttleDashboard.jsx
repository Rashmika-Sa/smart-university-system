import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
  </svg>
);
const IC = {
  bus:      'M8 6v6m0 0v6m0-6h8m0-6v6m0 6v-6M3 6h18M3 18h18M5 6V4a1 1 0 011-1h12a1 1 0 011 1v2',
  route:    'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  schedule: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  bookings: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  plus:     'M12 4v16m8-8H4',
  edit:     'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash:    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  close:    'M6 18L18 6M6 6l12 12',
  check:    'M5 13l4 4L19 7',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  eye:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-9C6.268 3 2.478 5.943 1.203 10c1.275 4.057 5.065 7 9.797 7s8.522-2.943 9.797-7C19.522 5.943 15.732 3 12 3z',
  refresh:  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  sun:      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon:     'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
  mail:     'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  seat:     'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  filter:   'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  chevron:  'M19 9l-7 7-7-7',
};

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-toast
    ${type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400' : 'bg-rose-500/15 border-rose-400/30 text-rose-400'}`}>
    <Icon path={type === 'success' ? IC.check : IC.close} className="w-4 h-4" />
    {msg}
    <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><Icon path={IC.close} className="w-3.5 h-3.5" /></button>
  </div>
);

const Modal = ({ title, onClose, children, dark, wide = false }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
    <div className={`rounded-3xl shadow-2xl w-full border ${wide ? 'max-w-2xl' : 'max-w-lg'} ${dark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
      <div className={`flex items-center justify-between px-6 py-5 border-b ${dark ? 'border-white/10' : 'border-gray-100'}`}>
        <h3 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
          <Icon path={IC.close} />
        </button>
      </div>
      <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

const Input = ({ label, dark, ...props }) => (
  <div className="space-y-1.5">
    <label className={`block text-xs font-bold uppercase tracking-widest ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
    <input className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border
      ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20'
             : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20'}`} {...props} />
  </div>
);

const Select = ({ label, dark, children, ...props }) => (
  <div className="space-y-1.5">
    <label className={`block text-xs font-bold uppercase tracking-widest ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>
    <select className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border
      ${dark ? 'bg-gray-800 border-white/10 text-white focus:border-violet-400/60'
             : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400'}`} {...props}>{children}</select>
  </div>
);

const StatCard = ({ label, value, icon, from, to, dark }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.02] cursor-default
    ${dark ? 'bg-gray-900 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}>
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.08] bg-gradient-to-br ${from} ${to}`} />
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${from} ${to} shadow-lg`}>
      <Icon path={icon} className="w-5 h-5 text-white" />
    </div>
    <p className={`text-3xl font-black mb-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
  </div>
);

// ─── Booking Row Card ────────────────────────────────────────────
const BookingCard = ({ booking, dark, onConfirm, confirmingId }) => {
  const b = booking;
  const isConfirmed = b.paymentStatus === 'Confirmed';
  const isLoading   = confirmingId === b._id;
  const dep = b.scheduleId?.departureTime
    ? new Date(b.scheduleId.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'N/A';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all
      ${dark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-gray-50 border-gray-100 hover:border-violet-200'}`}>
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${isConfirmed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      <div className="pl-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0">
            {b.userId?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{b.userId?.name || 'Unknown'}</p>
            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{b.userId?.email}</p>
            <p className={`text-xs font-semibold mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {b.scheduleId?.routeId?.routeName || 'N/A'} ·{' '}
              {b.scheduleId?.routeId?.startPoint} → {b.scheduleId?.routeId?.endPoint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Seat badge */}
          <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${dark ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Seat</span>
            <span className={`text-xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{b.seatNumber}</span>
          </div>

          {/* Departure */}
          <div className={`flex flex-col px-3 py-2 rounded-xl ${dark ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Departure</span>
            <span className={`text-xs font-bold mt-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>{dep}</span>
          </div>

          {/* Status + Action */}
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border
              ${isConfirmed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-400/20'}`}>
              {isConfirmed ? '✓ Confirmed' : '⏳ Pending'}
            </span>

            {isConfirmed ? (
              <span className={`flex items-center gap-1 text-[11px] font-semibold text-emerald-400`}>
                <Icon path={IC.mail} className="w-3 h-3" /> Email sent
              </span>
            ) : (
              <button
                onClick={() => onConfirm(b._id, b.userId?.name)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 text-emerald-400 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending...</>
                ) : (
                  <><Icon path={IC.mail} className="w-3.5 h-3.5" /> Confirm & Email</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
export default function ShuttleDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dark, setDark]   = useState(true);
  const [tab, setTab]     = useState('buses');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const [buses, setBuses]         = useState([]);
  const [routes, setRoutes]       = useState([]);
  const [schedules, setSchedules] = useState([]);

  // ── All bookings (flat list for the Bookings tab) ──────────────
  const [allBookings,       setAllBookings]       = useState([]);
  const [bookingsLoading,   setBookingsLoading]   = useState(false);
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState('all');
  const [statusFilter,           setStatusFilter]           = useState('all');
  // ──────────────────────────────────────────────────────────────

  const [busModal,      setBusModal]      = useState(null);
  const [routeModal,    setRouteModal]    = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);

  const [busForm,      setBusForm]      = useState({ plateNumber:'', model:'', capacity:'', status:'Active' });
  const [routeForm,    setRouteForm]    = useState({ routeName:'', startPoint:'', endPoint:'', stops:'' });
  const [scheduleForm, setScheduleForm] = useState({ busId:'', routeId:'', departureTime:'' });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchBuses     = async () => { try { const r = await axios.get('/shuttles/buses');     setBuses(r.data); } catch {} };
  const fetchRoutes    = async () => { try { const r = await axios.get('/shuttles/routes');    setRoutes(r.data); } catch {} };
  const fetchSchedules = async () => { try { const r = await axios.get('/shuttles/schedules'); setSchedules(r.data); } catch {} };

  // ── Fetch bookings for ALL schedules ─────────────────────────
  const fetchAllBookings = async () => {
    setBookingsLoading(true);
    try {
      // fetch bookings per schedule in parallel
      const results = await Promise.all(
        schedules.map(s =>
          axios.get(`/shuttles/bookings/all?scheduleId=${s._id}`)
            .then(r => r.data.map(b => ({ ...b, scheduleId: s })))
            .catch(() => [])
        )
      );
      setAllBookings(results.flat());
    } catch {}
    setBookingsLoading(false);
  };
  // ────────────────────────────────────────────────────────────

  useEffect(() => { fetchBuses(); fetchRoutes(); fetchSchedules(); }, []);
  // Refresh bookings whenever schedules are loaded or bookings tab opened
  useEffect(() => { if (tab === 'bookings' && schedules.length > 0) fetchAllBookings(); }, [tab, schedules]);

  /* Bus CRUD */
  const openAddBus  = () => { setBusForm({ plateNumber:'', model:'', capacity:'', status:'Active' }); setBusModal('add'); };
  const openEditBus = b  => { setBusForm({ plateNumber:b.plateNumber, model:b.model, capacity:b.capacity, status:b.status }); setBusModal(b); };
  const saveBus = async () => {
    setLoading(true);
    try {
      busModal === 'add' ? await axios.post('/shuttles/bus', busForm) : await axios.put(`/shuttles/bus/${busModal._id}`, busForm);
      showToast(busModal === 'add' ? 'Bus added!' : 'Bus updated!'); setBusModal(null); fetchBuses();
    } catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
    setLoading(false);
  };
  const deleteBus = async id => {
    if (!window.confirm('Delete this bus?')) return;
    try { await axios.delete(`/shuttles/bus/${id}`); showToast('Bus deleted'); fetchBuses(); }
    catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
  };

  /* Route CRUD */
  const openAddRoute  = () => { setRouteForm({ routeName:'', startPoint:'', endPoint:'', stops:'' }); setRouteModal('add'); };
  const openEditRoute = r  => { setRouteForm({ routeName:r.routeName, startPoint:r.startPoint, endPoint:r.endPoint, stops:r.stops?.join(', ') || '' }); setRouteModal(r); };
  const saveRoute = async () => {
    setLoading(true);
    const payload = { ...routeForm, stops: routeForm.stops.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      routeModal === 'add' ? await axios.post('/shuttles/route', payload) : await axios.put(`/shuttles/route/${routeModal._id}`, payload);
      showToast(routeModal === 'add' ? 'Route added!' : 'Route updated!'); setRouteModal(null); fetchRoutes();
    } catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
    setLoading(false);
  };
  const deleteRoute = async id => {
    if (!window.confirm('Delete this route?')) return;
    try { await axios.delete(`/shuttles/route/${id}`); showToast('Route deleted'); fetchRoutes(); }
    catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
  };

  /* Schedule CRUD */
  const openAddSchedule  = () => { setScheduleForm({ busId:'', routeId:'', departureTime:'' }); setScheduleModal('add'); };
  const openEditSchedule = s  => {
    setScheduleForm({ busId: s.busId?._id || s.busId, routeId: s.routeId?._id || s.routeId,
      departureTime: s.departureTime ? new Date(s.departureTime).toISOString().slice(0,16) : '' });
    setScheduleModal(s);
  };
  const saveSchedule = async () => {
    setLoading(true);
    try {
      scheduleModal === 'add' ? await axios.post('/shuttles/schedule', scheduleForm) : await axios.put(`/shuttles/schedule/${scheduleModal._id}`, scheduleForm);
      showToast(scheduleModal === 'add' ? 'Schedule created!' : 'Schedule updated!'); setScheduleModal(null); fetchSchedules();
    } catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
    setLoading(false);
  };
  const deleteSchedule = async id => {
    if (!window.confirm('Delete this schedule?')) return;
    try { await axios.delete(`/shuttles/schedule/${id}`); showToast('Schedule deleted'); fetchSchedules(); }
    catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
  };

  /* Confirm payment + send email */
  const confirmPayment = async (bookingId, studentName) => {
    setConfirmingId(bookingId);
    try {
      await axios.put(`/shuttles/booking/${bookingId}`, { paymentStatus: 'Confirmed' });
      setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, paymentStatus: 'Confirmed' } : b));
      showToast(`✅ Confirmed & email sent to ${studentName || 'student'}!`);
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error confirming payment', 'error');
    }
    setConfirmingId(null);
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  // ── Filtered bookings ─────────────────────────────────────────
  const filteredBookings = allBookings.filter(b => {
    const schedMatch = selectedScheduleFilter === 'all' || b.scheduleId?._id === selectedScheduleFilter;
    const statMatch  = statusFilter === 'all' || b.paymentStatus === statusFilter;
    return schedMatch && statMatch;
  });
  const pendingCount   = allBookings.filter(b => b.paymentStatus === 'Pending').length;
  const confirmedCount = allBookings.filter(b => b.paymentStatus === 'Confirmed').length;

  const D       = dark;
  const bg      = D ? 'bg-gray-950'     : 'bg-slate-50';
  const surface = D ? 'bg-gray-900'     : 'bg-white';
  const border  = D ? 'border-white/10' : 'border-gray-200';
  const text    = D ? 'text-white'      : 'text-gray-900';
  const muted   = D ? 'text-gray-500'   : 'text-gray-400';
  const divider = D ? 'border-white/5'  : 'border-gray-100';
  const rowHov  = D ? 'hover:bg-white/[0.03]' : 'hover:bg-violet-50/40';

  const TABS = [
    { id:'buses',     label:'Fleet',     icon:IC.bus,      g:'from-cyan-500 to-blue-600',       shadow:'shadow-cyan-500/20' },
    { id:'routes',    label:'Routes',    icon:IC.route,    g:'from-violet-500 to-purple-600',   shadow:'shadow-violet-500/20' },
    { id:'schedules', label:'Schedules', icon:IC.schedule, g:'from-rose-500 to-pink-600',       shadow:'shadow-rose-500/20' },
    { id:'bookings',  label:'Bookings',  icon:IC.bookings, g:'from-emerald-500 to-teal-600',    shadow:'shadow-emerald-500/20',
      badge: pendingCount > 0 ? pendingCount : null },
  ];
  const cardGrads = [['from-violet-500','to-purple-600'],['from-cyan-500','to-blue-600'],['from-rose-500','to-pink-600'],['from-emerald-500','to-teal-600'],['from-amber-500','to-orange-500']];
  const btn = g => `w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${g} hover:opacity-90 shadow-lg transition-all disabled:opacity-50`;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes toast-in { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        .animate-toast { animation: toast-in 0.3s cubic-bezier(.22,1,.36,1); }
        @keyframes fade-up { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.4s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#8b5cf6,#06b6d4);border-radius:99px}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <header className={`sticky top-0 z-30 ${surface} border-b ${border} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Icon path={IC.bus} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-extrabold text-base leading-none ${text}`}>Shuttle Control</p>
              <p className={`text-[11px] font-semibold tracking-widest uppercase ${muted}`}>SLIIT Smart University</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDark(!dark)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${surface} ${border} ${muted} hover:text-violet-400`}>
              <Icon path={dark ? IC.sun : IC.moon} className="w-4 h-4" />
            </button>
            <div className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${surface} ${border}`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className={`text-xs font-bold leading-none ${text}`}>{user.name || 'Admin'}</p>
                <p className="text-[10px] text-violet-400 font-semibold mt-0.5">Shuttle Admin</p>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition-all">
              <Icon path={IC.logout} className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-violet-600 via-purple-700 to-cyan-600 shadow-2xl shadow-violet-500/25 fade-up">
          <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize:'32px 32px'}} />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
              <h1 className="text-white text-3xl font-black">{user.name || 'Shuttle Admin'} 👋</h1>
              <p className="text-white/50 text-sm mt-1">Manage fleet, routes, schedules, and confirm bookings.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { v:buses.length,     l:'Buses',     g:'from-cyan-400/20 to-blue-400/20',   t:'text-cyan-300' },
                { v:routes.length,    l:'Routes',    g:'from-violet-400/20 to-purple-400/20', t:'text-violet-300' },
                { v:schedules.length, l:'Schedules', g:'from-rose-400/20 to-pink-400/20',   t:'text-rose-300' },
                { v:pendingCount,     l:'Pending',   g:'from-amber-400/20 to-orange-400/20', t:'text-amber-300' },
              ].map(s => (
                <div key={s.l} className={`bg-gradient-to-br ${s.g} backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10`}>
                  <p className={`text-2xl font-black ${s.t}`}>{s.v}</p>
                  <p className="text-white/50 text-xs font-semibold">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Buses',       value:buses.length,                               icon:IC.bus,      from:'from-cyan-500',    to:'to-blue-600' },
            { label:'Active',            value:buses.filter(b=>b.status==='Active').length, icon:IC.check,    from:'from-emerald-500',  to:'to-teal-600' },
            { label:'Pending Bookings',  value:pendingCount,                               icon:IC.clock,    from:'from-amber-500',    to:'to-orange-500' },
            { label:'Confirmed',         value:confirmedCount,                             icon:IC.bookings, from:'from-violet-500',   to:'to-purple-600' },
          ].map((s,i) => (
            <div key={s.label} className={`fade-up d${i+1}`}><StatCard {...s} dark={dark} /></div>
          ))}
        </div>

        {/* TABS */}
        <div className={`flex gap-1.5 p-1.5 rounded-2xl border w-fit ${surface} ${border}`}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${tab === t.id ? `bg-gradient-to-r ${t.g} text-white shadow-lg ${t.shadow}` : `${muted} hover:${text}`}`}>
              <Icon path={t.icon} className="w-4 h-4" />{t.label}
              {t.badge && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/25 text-white' : 'bg-amber-500/20 text-amber-400'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ BUSES ═══ */}
        {tab === 'buses' && (
          <div className="fade-up space-y-5">
            <div className="flex items-center justify-between">
              <div><h2 className={`text-xl font-extrabold ${text}`}>Bus Fleet</h2><p className={`text-sm ${muted}`}>{buses.length} buses registered</p></div>
              <button onClick={openAddBus} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all">
                <Icon path={IC.plus} className="w-4 h-4" /> Add Bus
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {buses.length === 0 ? (
                <div className={`col-span-3 rounded-2xl border ${surface} ${border} py-20 text-center`}>
                  <Icon path={IC.bus} className={`w-10 h-10 mx-auto mb-3 ${muted}`} /><p className={muted}>No buses added yet</p>
                </div>
              ) : buses.map((b) => {
                const [gf,gt] = b.status==='Active' ? ['from-cyan-500','to-blue-600'] : ['from-amber-400','to-orange-500'];
                return (
                  <div key={b._id} className={`relative overflow-hidden rounded-2xl border p-5 ${surface} ${border} transition-all hover:shadow-2xl hover:-translate-y-1`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gf} ${gt}`} />
                    <div className="flex items-start justify-between mb-4 pt-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gf} ${gt} shadow-lg`}>
                        <Icon path={IC.bus} className="w-6 h-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${b.status==='Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-amber-500/10 text-amber-400 border-amber-400/20'}`}>{b.status}</span>
                    </div>
                    <p className={`font-black text-xl font-mono tracking-wider ${text}`}>{b.plateNumber}</p>
                    <p className={`text-sm ${muted} mt-0.5 mb-3`}>{b.model}</p>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${D?'bg-white/5':'bg-gray-100'} ${muted}`}>
                      <Icon path={IC.users} className="w-3.5 h-3.5" />{b.capacity} seats
                    </div>
                    <div className={`flex gap-2 mt-4 pt-4 border-t ${divider}`}>
                      <button onClick={() => openEditBus(b)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 text-violet-400 text-xs font-bold transition-all">
                        <Icon path={IC.edit} className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => deleteBus(b._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 text-xs font-bold transition-all">
                        <Icon path={IC.trash} className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ ROUTES ═══ */}
        {tab === 'routes' && (
          <div className="fade-up space-y-5">
            <div className="flex items-center justify-between">
              <div><h2 className={`text-xl font-extrabold ${text}`}>Bus Routes</h2><p className={`text-sm ${muted}`}>{routes.length} routes configured</p></div>
              <button onClick={openAddRoute} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all">
                <Icon path={IC.plus} className="w-4 h-4" /> Add Route
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.length === 0 ? (
                <div className={`col-span-3 rounded-2xl border ${surface} ${border} py-20 text-center`}>
                  <Icon path={IC.route} className={`w-10 h-10 mx-auto mb-3 ${muted}`} /><p className={muted}>No routes added yet</p>
                </div>
              ) : routes.map((r,i) => {
                const [gf,gt] = cardGrads[i % cardGrads.length];
                return (
                  <div key={r._id} className={`relative overflow-hidden rounded-2xl border p-5 ${surface} ${border} transition-all hover:shadow-2xl hover:-translate-y-1`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gf} ${gt}`} />
                    <div className="flex items-start justify-between mb-4 pt-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gf} ${gt} shadow-lg`}>
                        <Icon path={IC.route} className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEditRoute(r)} className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-400/20 text-violet-400 transition-all"><Icon path={IC.edit} className="w-4 h-4" /></button>
                        <button onClick={() => deleteRoute(r._id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 transition-all"><Icon path={IC.trash} className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className={`font-extrabold text-lg ${text} mb-4`}>{r.routeName}</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 shrink-0" /><span className={`text-xs font-semibold ${text}`}>{r.startPoint}</span></div>
                      {r.stops?.map((s,j) => <div key={j} className="flex items-center gap-3 pl-1"><div className={`w-1.5 h-1.5 rounded-full shrink-0 ${D?'bg-gray-600':'bg-gray-300'}`} /><span className={`text-xs ${muted}`}>{s}</span></div>)}
                      <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-rose-400 ring-4 ring-rose-400/20 shrink-0" /><span className={`text-xs font-semibold ${text}`}>{r.endPoint}</span></div>
                    </div>
                    <div className={`mt-4 pt-4 border-t ${divider} text-xs ${muted} font-semibold`}>{(r.stops?.length||0)+2} stops total</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SCHEDULES ═══ */}
        {tab === 'schedules' && (
          <div className="fade-up space-y-5">
            <div className="flex items-center justify-between">
              <div><h2 className={`text-xl font-extrabold ${text}`}>Schedules</h2><p className={`text-sm ${muted}`}>{schedules.length} active trips</p></div>
              <div className="flex gap-3">
                <button onClick={fetchSchedules} className={`p-2.5 rounded-xl border transition-all ${surface} ${border} ${muted} hover:text-violet-400`}><Icon path={IC.refresh} className="w-4 h-4" /></button>
                <button onClick={openAddSchedule} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-bold shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all">
                  <Icon path={IC.plus} className="w-4 h-4" /> Add Schedule
                </button>
              </div>
            </div>
            <div className={`rounded-2xl border ${surface} ${border} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${divider} ${D?'bg-white/[0.02]':'bg-gray-50'}`}>
                    {['Bus','Route','Departure','Seats','Actions'].map(h=>(
                      <th key={h} className={`text-left px-5 py-4 text-[11px] font-extrabold uppercase tracking-widest ${muted}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr><td colSpan={5} className={`text-center py-20 ${muted}`}><Icon path={IC.schedule} className="w-8 h-8 mx-auto mb-2 opacity-40" />No schedules yet</td></tr>
                  ) : schedules.map(s => (
                    <tr key={s._id} className={`border-b ${divider} ${rowHov} transition-colors`}>
                      <td className="px-5 py-4"><p className={`font-black font-mono ${text}`}>{s.busId?.plateNumber||'—'}</p><p className={`text-xs ${muted}`}>{s.busId?.model}</p></td>
                      <td className="px-5 py-4"><p className={`font-semibold ${text}`}>{s.routeId?.routeName||'—'}</p><p className={`text-xs ${muted}`}>{s.routeId?.startPoint} → {s.routeId?.endPoint}</p></td>
                      <td className="px-5 py-4"><p className={`font-semibold ${text}`}>{s.departureTime?new Date(s.departureTime).toLocaleDateString():'—'}</p><p className={`text-xs ${muted}`}>{s.departureTime?new Date(s.departureTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''}</p></td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${s.availableSeats>5?'bg-emerald-500/10 text-emerald-400 border-emerald-400/20':s.availableSeats>0?'bg-amber-500/10 text-amber-400 border-amber-400/20':'bg-rose-500/10 text-rose-400 border-rose-400/20'}`}>{s.availableSeats} left</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEditSchedule(s)} className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-400 transition-all"><Icon path={IC.edit} className="w-4 h-4" /></button>
                          <button onClick={() => deleteSchedule(s._id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 transition-all"><Icon path={IC.trash} className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ BOOKINGS TAB ═══ */}
        {tab === 'bookings' && (
          <div className="fade-up space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className={`text-xl font-extrabold ${text}`}>Booking Confirmations</h2>
                <p className={`text-sm ${muted}`}>{allBookings.length} total bookings · {pendingCount} awaiting confirmation</p>
              </div>
              <button onClick={fetchAllBookings} disabled={bookingsLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${surface} ${border} ${muted} hover:text-violet-400 disabled:opacity-50`}>
                <Icon path={IC.refresh} className={`w-4 h-4 ${bookingsLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs font-semibold hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* ── Info Banner ── */}
            <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-xs font-semibold
              ${D ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <Icon path={IC.mail} className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Clicking <strong>Confirm & Email</strong> will update the booking status to <strong>Confirmed</strong> and automatically send a confirmation email to the student's inbox.</span>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label:'Total Bookings', value:allBookings.length, g:'from-violet-500 to-purple-600' },
                { label:'Pending',        value:pendingCount,       g:'from-amber-400 to-orange-500' },
                { label:'Confirmed',      value:confirmedCount,     g:'from-emerald-500 to-teal-500' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-4 ${surface} ${border}`}>
                  <p className={`text-2xl font-black bg-gradient-to-r ${s.g} bg-clip-text text-transparent`}>{s.value}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${muted}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Filters ── */}
            <div className={`flex items-center gap-3 flex-wrap p-4 rounded-2xl border ${surface} ${border}`}>
              <Icon path={IC.filter} className={`w-4 h-4 ${muted} shrink-0`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Filter</span>

              {/* Schedule filter */}
              <select
                value={selectedScheduleFilter}
                onChange={e => setSelectedScheduleFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-all
                  ${D ? 'bg-gray-800 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                <option value="all">All Schedules</option>
                {schedules.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.routeId?.routeName} · {s.departureTime ? new Date(s.departureTime).toLocaleDateString() : ''}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <div className={`flex rounded-xl border overflow-hidden ${border}`}>
                {['all','Pending','Confirmed'].map(v => (
                  <button key={v} onClick={() => setStatusFilter(v)}
                    className={`px-4 py-2 text-xs font-bold transition-all
                      ${statusFilter === v
                        ? v === 'Pending'   ? 'bg-amber-500 text-white'
                        : v === 'Confirmed' ? 'bg-emerald-500 text-white'
                        : 'bg-violet-500 text-white'
                        : `${muted} ${D?'hover:bg-white/5':'hover:bg-gray-50'}`}`}>
                    {v === 'all' ? 'All' : v}
                  </button>
                ))}
              </div>

              <span className={`ml-auto text-xs ${muted}`}>{filteredBookings.length} shown</span>
            </div>

            {/* ── Booking List ── */}
            {bookingsLoading ? (
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <svg className={`w-8 h-8 mx-auto mb-3 animate-spin ${muted}`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className={muted}>Loading bookings…</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Icon path={IC.bookings} className={`w-10 h-10 mx-auto mb-3 ${muted}`} />
                <p className={`font-bold ${text}`}>No bookings found</p>
                <p className={`text-sm mt-1 ${muted}`}>Try adjusting the filters above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map(b => (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    dark={dark}
                    onConfirm={confirmPayment}
                    confirmingId={confirmingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* BUS MODAL */}
      {busModal && (
        <Modal title={busModal==='add'?'🚌 Add New Bus':'✏️ Edit Bus'} onClose={()=>setBusModal(null)} dark={dark}>
          <div className="space-y-4">
            <Input label="Plate Number" dark={dark} placeholder="e.g. CAB-1234" value={busForm.plateNumber} onChange={e=>setBusForm({...busForm,plateNumber:e.target.value})} />
            <Input label="Bus Model" dark={dark} placeholder="e.g. Toyota Coaster" value={busForm.model} onChange={e=>setBusForm({...busForm,model:e.target.value})} />
            <Input label="Seat Capacity" dark={dark} type="number" placeholder="e.g. 30" value={busForm.capacity} onChange={e=>setBusForm({...busForm,capacity:e.target.value})} />
            <Select label="Status" dark={dark} value={busForm.status} onChange={e=>setBusForm({...busForm,status:e.target.value})}>
              <option value="Active">Active</option><option value="Maintenance">Maintenance</option>
            </Select>
            <button onClick={saveBus} disabled={loading} className={btn('from-cyan-500 to-blue-600')}>{loading?'Saving...':busModal==='add'?'Add Bus':'Update Bus'}</button>
          </div>
        </Modal>
      )}

      {/* ROUTE MODAL */}
      {routeModal && (
        <Modal title={routeModal==='add'?'🗺️ Add New Route':'✏️ Edit Route'} onClose={()=>setRouteModal(null)} dark={dark}>
          <div className="space-y-4">
            <Input label="Route Name" dark={dark} placeholder="e.g. Route 01" value={routeForm.routeName} onChange={e=>setRouteForm({...routeForm,routeName:e.target.value})} />
            <Input label="Start Point" dark={dark} placeholder="e.g. SLIIT Main Gate" value={routeForm.startPoint} onChange={e=>setRouteForm({...routeForm,startPoint:e.target.value})} />
            <Input label="End Point" dark={dark} placeholder="e.g. Malabe Town" value={routeForm.endPoint} onChange={e=>setRouteForm({...routeForm,endPoint:e.target.value})} />
            <Input label="Stops (comma separated)" dark={dark} placeholder="e.g. Library, Hostel" value={routeForm.stops} onChange={e=>setRouteForm({...routeForm,stops:e.target.value})} />
            <button onClick={saveRoute} disabled={loading} className={btn('from-violet-500 to-purple-600')}>{loading?'Saving...':routeModal==='add'?'Add Route':'Update Route'}</button>
          </div>
        </Modal>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModal && (
        <Modal title={scheduleModal==='add'?'📅 Create Schedule':'✏️ Edit Schedule'} onClose={()=>setScheduleModal(null)} dark={dark}>
          <div className="space-y-4">
            <Select label="Select Bus" dark={dark} value={scheduleForm.busId} onChange={e=>setScheduleForm({...scheduleForm,busId:e.target.value})}>
              <option value="">-- Choose a bus --</option>
              {buses.filter(b=>b.status==='Active').map(b=><option key={b._id} value={b._id}>{b.plateNumber} — {b.model} ({b.capacity} seats)</option>)}
            </Select>
            <Select label="Select Route" dark={dark} value={scheduleForm.routeId} onChange={e=>setScheduleForm({...scheduleForm,routeId:e.target.value})}>
              <option value="">-- Choose a route --</option>
              {routes.map(r=><option key={r._id} value={r._id}>{r.routeName} ({r.startPoint} → {r.endPoint})</option>)}
            </Select>
            <Input label="Departure Time" dark={dark} type="datetime-local" value={scheduleForm.departureTime} onChange={e=>setScheduleForm({...scheduleForm,departureTime:e.target.value})} />
            <button onClick={saveSchedule} disabled={loading} className={btn('from-rose-500 to-pink-600')}>{loading?'Saving...':scheduleModal==='add'?'Create Schedule':'Update Schedule'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}