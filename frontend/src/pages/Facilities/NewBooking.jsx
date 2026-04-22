import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

// ── helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

const fmtDateLong = (str) =>
  str
    ? new Date(str + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

// ── slot button ───────────────────────────────────────────────────────────────
const SlotBtn = ({ slot, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 text-center
      ${selected
        ? 'bg-[#0d1b3e] text-white border-[#0d1b3e] shadow-sm'
        : 'bg-white text-gray-600 border-gray-200 hover:border-[#0d1b3e]/40 hover:text-[#0d1b3e]'
      }`}
  >
    {slot.startTime} – {slot.endTime}
  </button>
);

// ── summary row ───────────────────────────────────────────────────────────────
const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-3">
    <span className="text-xs text-gray-400 shrink-0">{label}</span>
    <span className="text-xs font-semibold text-gray-800 text-right">{value || '—'}</span>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────
const NewBooking = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [spaces, setSpaces]             = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [date, setDate]                 = useState(todayStr());
  const [slots, setSlots]               = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [label, setLabel]               = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  // load spaces
  useEffect(() => {
    axios.get('/facilities/spaces')
      .then(({ data }) => setSpaces(data))
      .catch(() => {});
  }, []);

  // load slots when space or date changes
  useEffect(() => {
    if (!selectedSpace || !date) { setSlots([]); return; }
    setSlotsLoading(true);
    setSelectedSlot(null);
    axios.get(`/facilities/spaces/${selectedSpace}/slots?date=${date}`)
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedSpace, date]);

  const spaceObj   = spaces.find(s => s._id === selectedSpace);
  const visibleSpaces = user.role === 'team_captain'
    ? spaces.filter((s) => s.type === 'Sports Facility')
    : spaces;
  const canSubmit  = selectedSpace && date && selectedSlot && label.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post('/facilities/bookings', {
        spaceId:   selectedSpace,
        date,
        startTime: selectedSlot.startTime,
        endTime:   selectedSlot.endTime,
        label:     label.trim(),
      });
      navigate('/facilities/bookings');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create booking. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <FacilitiesLayout>
      <div className="p-8">

        {/* heading */}
        <div className="mb-7">
          <button
            onClick={() => navigate('/facilities/home')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-[#0d1b3e]">New Booking</h1>
          <p className="text-sm text-gray-400 mt-1">Select a space and time slot to reserve</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm max-w-4xl">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 max-w-5xl">

          {/* ── Left form (7 cols) ──────────────────────────────── */}
          <div className="col-span-12 lg:col-span-7 space-y-5">

            {/* space + purpose */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Space & Purpose</p>

              {/* space selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Select Space
                </label>
                <select
                  value={selectedSpace}
                  onChange={e => { setSelectedSpace(e.target.value); setSelectedSlot(null); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white outline-none focus:border-[#0d1b3e]/40 transition-colors"
                >
                  <option value="">Choose a space…</option>
                  {visibleSpaces.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} — {s.type}
                    </option>
                  ))}
                </select>
                {spaceObj && (
                  <p className="text-[11px] text-gray-400">
                    Available {spaceObj.openTime} – {spaceObj.closeTime} &nbsp;·&nbsp; {spaceObj.slotDuration} min slots
                  </p>
                )}
              </div>

              {/* purpose */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Booking Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Varsity team practice session"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#0d1b3e]/40 transition-colors"
                />
              </div>
            </div>

            {/* date + slots */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Date & Time</p>

              {/* date */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr()}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0d1b3e]/40 transition-colors"
                />
              </div>

              {/* slots */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Available Slots
                </label>

                {!selectedSpace ? (
                  <p className="text-xs text-gray-400 py-2">Select a space to see available slots</p>
                ) : slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs font-semibold text-gray-500">No slots available</p>
                    <p className="text-xs text-gray-400 mt-1">All slots are booked for this date. Try another day.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(slot => (
                      <SlotBtn
                        key={`${slot.startTime}-${slot.endTime}`}
                        slot={slot}
                        selected={
                          selectedSlot?.startTime === slot.startTime &&
                          selectedSlot?.endTime   === slot.endTime
                        }
                        onClick={() => setSelectedSlot(slot)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right summary (5 cols) ──────────────────────────── */}
          <div className="col-span-12 lg:col-span-5 space-y-4">

            {/* space info card */}
            {spaceObj ? (
              <div className="bg-[#0d1b3e] rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
                />
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-bold">{spaceObj.name}</p>
                  <p className="text-xs text-white/60 mt-0.5">{spaceObj.type}</p>
                  <p className="text-xs text-white/50 mt-3">
                    Open {spaceObj.openTime} – {spaceObj.closeTime}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-xl p-5 flex items-center justify-center h-32">
                <p className="text-xs text-gray-400">Space details will appear here</p>
              </div>
            )}

            {/* booking summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Booking Summary</p>
              <div className="space-y-3">
                <SummaryRow label="Venue"   value={spaceObj?.name} />
                <SummaryRow label="Date"    value={date ? fmtDateLong(date) : null} />
                <SummaryRow label="Time"
                  value={selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : null}
                />
                <SummaryRow label="Purpose" value={label || null} />
              </div>

              <div className="h-px bg-gray-100" />

              <p className="text-[11px] text-gray-400 leading-relaxed">
                By confirming you agree to the SLIIT facility usage policy. Ensure the space is left clean and in good condition after use.
              </p>
            </div>

            {/* confirm button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0d1b3e] text-white text-sm font-semibold hover:bg-[#162244] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Confirming…
                </>
              ) : (
                <>
                  Confirm Booking
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </FacilitiesLayout>
  );
};

export default NewBooking;
