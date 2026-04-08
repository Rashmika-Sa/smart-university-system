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
const CALENDAR_ICON = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';

const formatFriendlyDate = (date = new Date()) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);

// ── booking card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-4 shadow-sm shadow-slate-900/5 transition-transform duration-200 hover:-translate-y-0.5">
    <div className="w-11 h-11 rounded-xl bg-slate-900/5 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={SPACE_ICON} />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 truncate">{booking.space?.name}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        {fmtDate(booking.date + 'T00:00:00')} &nbsp;·&nbsp; {booking.startTime} – {booking.endTime}
      </p>
      {booking.label && (
        <p className="text-xs text-slate-500 truncate mt-0.5">{booking.label}</p>
      )}
    </div>
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${STATUS_BADGE[booking.status]}`}>
      {booking.status}
    </span>
  </div>
);

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, sub }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-start gap-4 shadow-sm shadow-slate-900/5">
    <div className="w-11 h-11 rounded-xl bg-slate-900/5 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
    </div>
  </div>
);

// ── pending approval screen ───────────────────────────────────────────────────
const PendingScreen = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center max-w-xl mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5 shadow-sm">
      <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Approval pending</h2>
    <p className="text-sm text-slate-500 leading-relaxed max-w-md">
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
  const nextBooking = upcoming[0];

  return (
    <FacilitiesLayout>
      <div className="px-6 py-6 md:px-8 md:py-8 max-w-6xl">

        {isPending ? (
          <PendingScreen name={user.name?.split(' ')[0] || 'there'} />
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 px-6 py-6 md:px-8 md:py-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] mb-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(148,163,184,0.18),_transparent_30%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Facilities overview
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {roleLabel}
                  </div>
                  <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
                    Good to see you, {user.name?.split(' ')[0] || 'there'}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm md:text-base text-slate-300 leading-relaxed">
                    Keep track of bookings, review availability, and move quickly through the day without clutter.
                  </p>
                  <p className="mt-3 text-sm text-slate-400">
                    Today is {formatFriendlyDate()}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/facilities/bookings/new')}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Booking
                  </button>
                  <Link
                    to="/facilities/calendar"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={CALENDAR_ICON} />
                    </svg>
                    Calendar
                  </Link>
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <StatCard
                label="Upcoming bookings"
                value={loading ? '—' : upcoming.length}
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                sub="Confirmed and scheduled sessions"
              />
              <StatCard
                label="Bookings today"
                value={loading ? '—' : todayBookings.length}
                icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                sub={todayBookings.length > 0 ? `Next: ${todayBookings[0]?.startTime}` : 'None scheduled'}
              />
              <StatCard
                label="Next booking"
                value={loading ? '—' : (nextBooking ? nextBooking.startTime : '—')}
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                sub={loading ? 'Loading schedule' : nextBooking ? nextBooking.space?.name : 'No upcoming booking'}
              />
            </div>

            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Upcoming bookings</h2>
                <p className="text-sm text-slate-500 mt-1">A clean list of your nearest confirmed sessions.</p>
              </div>
              <Link
                to="/facilities/bookings"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-sm" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-slate-900/5 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900">No upcoming bookings</p>
                <p className="text-sm text-slate-500 mt-1 mb-5 max-w-xs">Reserve a space when you are ready to schedule your next session.</p>
                <button
                  onClick={() => navigate('/facilities/bookings/new')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Make a Booking
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
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
