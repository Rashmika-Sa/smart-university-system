import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentTopNav from '../../components/StudentTopNav';

const facilities = [
  { id: 1, name: 'Basketball Court', icon: '🏀', location: 'Block C Ground Floor', capacity: 10, status: 'Available', slots: ['08:00–10:00', '10:00–12:00', '14:00–16:00'] },
  { id: 2, name: 'Football Ground', icon: '🏀', location: 'Main Campus Field', capacity: 22, status: 'Booked', slots: ['08:00–10:00', '16:00–18:00'] },
  { id: 3, name: 'Badminton Hall', icon: '🎾', location: 'Block B Level 1', capacity: 4, status: 'Available', slots: ['09:00–11:00', '13:00–15:00', '17:00–19:00'] },
  { id: 4, name: 'Swimming Pool', icon: '🏊', location: 'Aquatic Centre', capacity: 20, status: 'Maintenance', slots: [] },
  { id: 5, name: 'Conference Room A', icon: '🏛️', location: 'Admin Block Level 3', capacity: 30, status: 'Available', slots: ['09:00–11:00', '11:00–13:00', '15:00–17:00'] },
  { id: 6, name: 'Gym & Fitness Centre', icon: '🏋️', location: 'Student Zone', capacity: 15, status: 'Available', slots: ['06:00–08:00', '12:00–14:00', '18:00–20:00'] },
];

const statusConfig = {
  Available: { bg: 'bg-emerald-400/10 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400' },
  Booked: { bg: 'bg-accent/10 text-accent border-orange-200', dot: 'bg-accent' },
  Maintenance: { bg: 'bg-red-400/10 text-red-500 border-red-200', dot: 'bg-red-400' },
};

const FacilityDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [selected, setSelected] = useState(null);
  const [bookedSlot, setBookedSlot] = useState(null);
  const available = facilities.filter(f => f.status === 'Available').length;

  // Show facility admin dashboard if user is facility_admin
  if (user?.role === 'facility_admin') {
    return (
      <>
        <StudentTopNav active="Facilities" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-16">
        {/* Admin Header */}
        <div className="border-b border-slate-700 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Administration</span>
            <h1 className="text-4xl font-black text-white mt-1 tracking-tight">
              🏟️ Facility{' '}
              <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Admin Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">Manage facilities, review applications and handle bookings</p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Facilities</p>
                  <p className="text-3xl font-bold text-white mt-2">{facilities.length}</p>
                </div>
                <div className="text-4xl">🏟️</div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Available</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-2">{available}</p>
                </div>
                <div className="text-4xl">✓</div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Booked</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{facilities.filter(f => f.status === 'Booked').length}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Maintenance</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{facilities.filter(f => f.status === 'Maintenance').length}</p>
                </div>
                <div className="text-4xl">🔧</div>
              </div>
            </div>
          </div>

          {/* Admin Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Space Management */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏗️</span> Space Management
              </h3>
              <p className="text-slate-400 mb-6">Create and manage facility spaces</p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/facilities/spaces/new')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
                >
                  Add New Space
                </button>
                <button 
                  onClick={() => navigate('/facilities/spaces')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition font-medium"
                >
                  Manage Spaces
                </button>
              </div>
            </div>

            {/* Booking Requests */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Booking Requests
              </h3>
              <p className="text-slate-400 mb-6">Review and approve booking requests</p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/facilities/booking-requests')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
                >
                  View Requests
                </button>
                <button 
                  onClick={() => navigate('/facilities/calendar')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition font-medium"
                >
                  Booking Calendar
                </button>
              </div>
            </div>

            {/* Registrations */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span> Registrations
              </h3>
              <p className="text-slate-400 mb-6">Review facility registration applications</p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/facilities/registrations')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition font-medium"
                >
                  View Registrations
                </button>
              </div>
            </div>

            {/* Applications Review */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span> Applications Review
              </h3>
              <p className="text-slate-400 mb-6">Review facility use applications</p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/facilities/application-reviews')}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition font-medium"
                >
                  Review Applications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </>
    );
  }

  // Student/General Facility Booking Dashboard
  return (
    <>
      <StudentTopNav active="Facilities" />
      <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Campus Services</span>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
            🏟️ Facility{' '}
            <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Booking</span>
          </h1>
          <p className="text-white/70 text-sm mt-2">Reserve sports courts, meeting rooms and campus facilities.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Total Facilities', value: facilities.length, color: 'text-cyan-600' },
              { label: 'Available Now', value: available, color: 'text-emerald-500' },
              { label: 'Unavailable', value: facilities.length - available, color: 'text-accent' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">All Facilities</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map(facility => {
            const sc = statusConfig[facility.status];
            return (
              <div key={facility.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl">{facility.icon}</div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm leading-tight">{facility.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{facility.location}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sc.bg} flex items-center gap-1 shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {facility.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
                  <span>Capacity: <span className="text-accent font-semibold">{facility.capacity}</span></span>
                </div>
                {facility.slots.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {facility.slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelected(facility.id); setBookedSlot(slot); }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          selected === facility.id && bookedSlot === slot
                            ? 'bg-accent text-white border-transparent shadow'
                            : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                {facility.status === 'Available' && (
                  <button
                    disabled={selected !== facility.id}
                    onClick={() => alert(`Booked ${facility.name} at ${bookedSlot}!`)}
                    className="mt-auto w-full py-2 text-sm font-bold rounded-xl bg-accent text-white opacity-90 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-[0_0_20px_rgba(255,107,53,0.25)]"
                  >
                    {selected === facility.id ? `Book ${bookedSlot}` : 'Select a Slot'}
                  </button>
                )}
                {facility.status === 'Maintenance' && (
                  <div className="mt-auto text-xs text-center text-red-400 font-semibold py-2 bg-red-50 rounded-xl border border-red-100">Under Maintenance</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};

export default FacilityDashboard;