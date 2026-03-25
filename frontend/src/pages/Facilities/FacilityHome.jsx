import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

const today = new Date().toISOString().split('T')[0];

const STATUS_BADGE = {
  confirmed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled:  'bg-red-50   text-red-600   border border-red-200',
};

const SPACE_ICON = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';

// ── booking card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-[#0d1b3e]/8 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-[#0d1b3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={SPACE_ICON} />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{booking.space?.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">
        {fmtDate(booking.date + 'T00:00:00')} &nbsp;·&nbsp; {booking.startTime} – {booking.endTime}
      </p>
      {booking.label && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{booking.label}</p>
      )}
    </div>
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${STATUS_BADGE[booking.status]}`}>
      {booking.status}
    </span>
  </div>
);

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, sub }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-[#0d1b3e]/8 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-[#0d1b3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-2xl font-bold text-[#0d1b3e]">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── pending approval screen ───────────────────────────────────────────────────
const PendingScreen = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-5">
      <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 className="text-lg font-bold text-gray-900 mb-2">Approval Pending</h2>
    <p className="text-sm text-gray-400 leading-relaxed">
      Hi {name}, your registration is still under review. You'll receive an email notification once your account is approved and you can start making bookings.
    </p>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────
const FacilityHome = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const [upcoming, setUpcoming]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isPending, setIsPending]   = useState(false);

  useEffect(() => {
    axios.get('/facilities/bookings?status=upcoming')
      .then(({ data }) => setUpcoming(data))
      .catch(err => {
        if (err.response?.status === 403) setIsPending(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayBookings = upcoming.filter(b => b.date === today);
  const roleLabel = user.role === 'team_captain' ? 'Team Captain' : 'Society';

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-3xl">

        {isPending ? (
          <PendingScreen name={user.name?.split(' ')[0] || 'there'} />
        ) : (
          <>
            {/* greeting */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#0d1b3e]">
                  Hi, {user.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="inline-block bg-[#0d1b3e]/8 text-[#0d1b3e] text-[11px] font-semibold px-2 py-0.5 rounded-full mr-2">
                    {roleLabel}
                  </span>
                  Here's your bookings overview
                </p>
              </div>
              <button
                onClick={() => navigate('/facilities/bookings/new')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold hover:bg-[#162244] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Booking
              </button>
            </div>

            {/* stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard
                label="Upcoming bookings"
                value={loading ? '—' : upcoming.length}
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
              <StatCard
                label="Bookings today"
                value={loading ? '—' : todayBookings.length}
                icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                sub={todayBookings.length > 0 ? `Next: ${todayBookings[0]?.startTime}` : 'None scheduled'}
              />
            </div>

            {/* upcoming list */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Upcoming Bookings</h2>
              <Link
                to="/facilities/bookings"
                className="text-xs text-[#0d1b3e] font-semibold hover:underline flex items-center gap-1"
              >
                View all
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-white border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">No upcoming bookings</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Reserve a space for your next session</p>
                <button
                  onClick={() => navigate('/facilities/bookings/new')}
                  className="px-4 py-2 rounded-lg bg-[#0d1b3e] text-white text-xs font-semibold hover:bg-[#162244] transition-colors"
                >
                  Make a Booking
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcoming.slice(0, 5).map(b => (
                  <BookingCard key={b._id} booking={b} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </FacilitiesLayout>
  );
};

export default FacilityHome;
