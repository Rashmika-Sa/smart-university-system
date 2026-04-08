import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

// ── type option card ──────────────────────────────────────────────────────────
const TypeCard = ({ value, label, description, icon, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 w-full
      ${selected
        ? 'border-[#0d1b3e] bg-white shadow-sm'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
      ${selected ? 'bg-[#0d1b3e] text-white' : 'bg-gray-200 text-gray-500'}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
      </svg>
    </div>
    <div>
      <p className={`text-sm font-semibold ${selected ? 'text-[#0d1b3e]' : 'text-gray-600'}`}>{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-1
      ${selected ? 'border-[#0d1b3e] bg-[#0d1b3e]' : 'border-gray-300'}`}>
      {selected && (
        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
      )}
    </div>
  </button>
);

// ── field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
);

// ── toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? 'bg-[#0d1b3e]' : 'bg-gray-200'}`}
  >
    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
      ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

// ── main ──────────────────────────────────────────────────────────────────────
const SpaceForm = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const isEdit       = Boolean(id);

  // pre-fill from navigation state (passed from ManageSpaces edit button)
  const prefill = location.state?.space;

  const [name, setName]               = useState(prefill?.name        || '');
  const [type, setType]               = useState(prefill?.type        || 'Sports Facility');
  const [openTime, setOpenTime]       = useState(prefill?.openTime    || '08:00');
  const [closeTime, setCloseTime]     = useState(prefill?.closeTime   || '22:00');
  const [slotDuration, setSlotDuration] = useState(prefill?.slotDuration ?? 60);
  const [isActive, setIsActive]       = useState(prefill ? prefill.status === 'active' : true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  // if navigated directly to edit URL without state, fetch the space
  useEffect(() => {
    if (isEdit && !prefill) {
      axios.get('/facilities/spaces')
        .then(({ data }) => {
          const found = data.find(s => s._id === id);
          if (found) {
            setName(found.name);
            setType(found.type);
            setOpenTime(found.openTime);
            setCloseTime(found.closeTime);
            setSlotDuration(found.slotDuration);
            setIsActive(found.status === 'active');
          }
        })
        .catch(() => {});
    }
  }, [id, isEdit, prefill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name:         name.trim(),
      type,
      openTime,
      closeTime,
      slotDuration: Number(slotDuration),
      status:       isActive ? 'active' : 'inactive',
    };

    try {
      if (isEdit) {
        await axios.put(`/facilities/spaces/${id}`, payload);
      } else {
        await axios.post('/facilities/spaces', payload);
      }
      navigate('/facilities/spaces');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save space. Please try again.');
      setSaving(false);
    }
  };

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-4xl">

        {/* breadcrumb */}
        <button
          onClick={() => navigate('/facilities/spaces')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Manage Spaces
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium">{isEdit ? 'Edit Space' : 'Add Space'}</span>
        </button>

        {/* heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0d1b3e]">
            {isEdit ? 'Edit Space' : 'Add New Space'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEdit
              ? 'Update the details of this bookable space'
              : 'Define a new space that students can reserve'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-5">

            {/* ── Left: main form (7 cols) ────────────────────────── */}
            <div className="col-span-12 lg:col-span-7 space-y-5">

              {/* general info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">General Information</p>

                <Field label="Space Name">
                  <input
                    type="text"
                    placeholder="e.g. Volleyball Court A"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#0d1b3e]/40 transition-colors"
                  />
                </Field>

                <Field label="Facility Type">
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <TypeCard
                      value="Sports Facility"
                      label="Sports Facility"
                      description="Gyms, courts, and fields"
                      icon="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      selected={type === 'Sports Facility'}
                      onClick={() => setType('Sports Facility')}
                    />
                    <TypeCard
                      value="Event Space"
                      label="Event Space"
                      description="Theatres, halls, and plazas"
                      icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      selected={type === 'Event Space'}
                      onClick={() => setType('Event Space')}
                    />
                  </div>
                </Field>
              </div>

              {/* operational hours */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Operational Hours</p>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Default Schedule
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Opening Time">
                    <input
                      type="time"
                      value={openTime}
                      onChange={e => setOpenTime(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0d1b3e]/40 transition-colors"
                    />
                  </Field>
                  <Field label="Closing Time">
                    <input
                      type="time"
                      value={closeTime}
                      onChange={e => setCloseTime(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0d1b3e]/40 transition-colors"
                    />
                  </Field>
                </div>

                <Field
                  label="Slot Duration (minutes)"
                  hint="Each bookable time slot will be this many minutes long"
                >
                  <select
                    value={slotDuration}
                    onChange={e => setSlotDuration(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white outline-none focus:border-[#0d1b3e]/40 transition-colors"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes (1 hour)</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes (2 hours)</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Right: status + summary (5 cols) ───────────────── */}
            <div className="col-span-12 lg:col-span-5 space-y-4">

              {/* publishing status */}
              <div className="bg-[#f4f6f9] rounded-xl border border-gray-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Publishing Status</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {isActive ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isActive
                        ? 'Visible and bookable by students'
                        : 'Hidden from booking — not reservable'}
                    </p>
                  </div>
                  <Toggle checked={isActive} onChange={setIsActive} />
                </div>

                <div className="h-px bg-gray-200" />

                <p className="text-[11px] text-gray-400">
                  Inactive spaces are hidden from the booking screen and cannot be reserved until reactivated.
                </p>
              </div>

              {/* live summary preview */}
              <div className="bg-[#0d1b3e] rounded-xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
                />
                <div className="relative z-10 space-y-3">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Preview</p>
                  <p className="text-lg font-bold text-white">{name || 'Space Name'}</p>
                  <p className="text-xs text-white/60">{type}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-white/50">
                      {openTime} – {closeTime}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/50">{slotDuration} min slots</span>
                  </div>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                    ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── footer actions ──────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {isEdit ? 'Changes will affect all future bookings for this space.' : ''}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/facilities/spaces')}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold hover:bg-[#162244] transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Save Changes' : 'Create Space'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </FacilitiesLayout>
  );
};

export default SpaceForm;
