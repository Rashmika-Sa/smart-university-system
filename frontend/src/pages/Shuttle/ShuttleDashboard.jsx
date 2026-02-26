import React, { useState } from 'react';

const routes = [
  {
    id: 1,
    name: 'Route A — City Campus',
    stops: ['SLIIT Main Gate', 'Malabe Town', 'Kaduwela Junction', 'Kadawatha', 'Colombo Fort'],
    nextDeparture: '08:15 AM',
    status: 'On Time',
    seats: 14,
    driver: 'Mr. Perera',
    plate: 'WP CAB 6612',
  },
  {
    id: 2,
    name: 'Route B — Kelaniya',
    stops: ['SLIIT Main Gate', 'Biyagama', 'Kelaniya University', 'Wattala', 'Peliyagoda'],
    nextDeparture: '08:30 AM',
    status: 'Delayed',
    seats: 3,
    driver: 'Mr. Silva',
    plate: 'WP CAD 4421',
  },
  {
    id: 3,
    name: 'Route C — Gampaha',
    stops: ['SLIIT Main Gate', 'Malabe Town', 'Kaduwela', 'Nittambuwa', 'Gampaha'],
    nextDeparture: '09:00 AM',
    status: 'On Time',
    seats: 22,
    driver: 'Mr. Fernando',
    plate: 'WP CAF 8830',
  },
  {
    id: 4,
    name: 'Route D — Piliyandala',
    stops: ['SLIIT Main Gate', 'Athurugiriya', 'Pannipitiya', 'Piliyandala', 'Moratuwa'],
    nextDeparture: '09:15 AM',
    status: 'Full',
    seats: 0,
    driver: 'Mr. Jayaweera',
    plate: 'WP CAG 2204',
  },
];

const statusConfig = {
  'On Time': { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  Delayed: { dot: 'bg-accent', text: 'text-accent' },
  Full: { dot: 'bg-red-500', text: 'text-red-400' },
};

const ShuttleDashboard = () => {
  const [expanded, setExpanded] = useState(null);
  const onTime = routes.filter(r => r.status === 'On Time').length;
  const delayed = routes.filter(r => r.status === 'Delayed').length;
  const totalSeats = routes.reduce((a, r) => a + r.seats, 0);

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Campus Mobility</span>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
            🚌 Shuttle{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Tracker</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Live route status and seat availability for SLIIT campus shuttles.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Routes', value: routes.length, color: 'text-cyan-400' },
              { label: 'On Time', value: onTime, color: 'text-emerald-400' },
              { label: 'Delayed', value: delayed, color: 'text-accent' },
              { label: 'Seats Available', value: totalSeats, color: 'text-white' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Routes */}
      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-4">
        <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Available Routes</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {routes.map(route => {
          const sc = statusConfig[route.status];
          const isOpen = expanded === route.id;
          return (
            <div key={route.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                onClick={() => setExpanded(isOpen ? null : route.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-xl shrink-0">🚌</div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{route.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Next: <span className="text-accent font-semibold">{route.nextDeparture}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs text-slate-400">Seats</div>
                    <div className={`text-sm font-bold ${route.seats === 0 ? 'text-red-500' : 'text-slate-900'}`}>{route.seats === 0 ? 'Full' : route.seats}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${sc.dot} animate-pulse`} />
                    <span className={`text-xs font-bold ${sc.text}`}>{route.status}</span>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div><span className="text-xs text-cyan-600 font-bold uppercase tracking-wider">Driver</span><p className="text-sm font-semibold text-slate-800 mt-0.5">{route.driver}</p></div>
                    <div><span className="text-xs text-cyan-600 font-bold uppercase tracking-wider">Vehicle</span><p className="text-sm font-semibold text-slate-800 mt-0.5">{route.plate}</p></div>
                  </div>
                  <span className="text-xs text-cyan-600 font-bold uppercase tracking-wider">Stops</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {route.stops.map((stop, i) => (
                      <span key={i} className="px-3 py-1 text-xs bg-white border border-slate-200 rounded-full text-slate-600 font-medium">{i + 1}. {stop}</span>
                    ))}
                  </div>
                  {route.seats > 0 && (
                    <button className="mt-4 px-5 py-2 text-sm font-bold rounded-xl bg-accent text-white shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:opacity-90 transition-opacity">Reserve Seat</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl shrink-0">⚠️</div>
          <div>
            <p className="text-xs text-accent uppercase tracking-widest font-bold mb-1">Notice</p>
            <p className="text-slate-400 text-sm leading-relaxed">Shuttle schedules may change during exams and public holidays. For urgent queries call the Transport Office at <span className="text-accent font-semibold">+94 11 754 4890</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShuttleDashboard;