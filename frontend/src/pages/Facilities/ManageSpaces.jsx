import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

// ── helpers ───────────────────────────────────────────────────────────────────
const TYPE_ICON = {
  'Sports Facility': 'M4.5 12.75l6 6 9-13.5',   // checkmark placeholder — replaced below
  'Event Space':     'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16',
};

const SpaceTypeIcon = ({ type }) => {
  if (type === 'Sports Facility') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  );
};

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, dark }) => (
  <div className={`rounded-xl border px-5 py-4 ${dark ? 'bg-[#0d1b3e] border-[#0d1b3e]' : 'bg-white border-gray-100 shadow-sm'}`}>
    <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${dark ? 'text-white/50' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-3xl font-bold ${dark ? 'text-white' : 'text-[#0d1b3e]'}`}>{value}</p>
  </div>
);

// ── space card ────────────────────────────────────────────────────────────────
const SpaceCard = ({ space, onEdit, onToggle, toggling }) => {
  const isActive = space.status === 'active';

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 transition-opacity ${!isActive ? 'opacity-70' : ''}`}>
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-[#0d1b3e]/8 flex items-center justify-center shrink-0 text-[#0d1b3e]">
          <SpaceTypeIcon type={space.type} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
          ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {space.status}
        </span>
      </div>

      {/* name + meta */}
      <div>
        <p className="text-base font-bold text-gray-900">{space.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{space.type}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {space.openTime} – {space.closeTime} &nbsp;·&nbsp; {space.slotDuration} min slots
        </p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() => onEdit(space)}
          className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onToggle(space._id)}
          disabled={toggling === space._id}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60
            ${isActive
              ? 'border border-red-200 text-red-500 hover:bg-red-50'
              : 'border border-green-200 text-green-600 hover:bg-green-50'
            }`}
        >
          {toggling === space._id
            ? '…'
            : isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────
const ManageSpaces = () => {
  const navigate = useNavigate();

  const [spaces, setSpaces]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toggling, setToggling] = useState('');
  const [error, setError]       = useState('');

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/facilities/spaces');
      setSpaces(data);
    } catch {
      setError('Failed to load spaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await axios.patch(`/facilities/spaces/${id}/status`);
      setSpaces(prev => prev.map(s => s._id === id ? data.space : s));
    } catch {
      setError('Failed to update status');
    } finally {
      setToggling('');
    }
  };

  const handleEdit = (space) => {
    navigate(`/facilities/spaces/${space._id}/edit`, { state: { space } });
  };

  const filtered = spaces.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = spaces.filter(s => s.status === 'active').length;
  const inactiveCount = spaces.filter(s => s.status === 'inactive').length;

  return (
    <FacilitiesLayout>
      <div className="p-8">

        {/* heading */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0d1b3e]">Manage Spaces</h1>
            <p className="text-sm text-gray-400 mt-1">Configure and manage all bookable spaces on campus</p>
          </div>
          <button
            onClick={() => navigate('/facilities/spaces/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold hover:bg-[#162244] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Space
          </button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-4 mb-7 max-w-lg">
          <StatCard label="Total Spaces" value={spaces.length} />
          <StatCard label="Active"       value={activeCount} />
          <StatCard label="Inactive"     value={inactiveCount} dark />
        </div>

        {/* search */}
        <div className="relative mb-6 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#0d1b3e]/30 transition-colors"
          />
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 rounded-xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {search ? 'No spaces match your search' : 'No spaces yet'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/facilities/spaces/new')}
                className="mt-4 px-4 py-2 rounded-lg bg-[#0d1b3e] text-white text-xs font-semibold hover:bg-[#162244] transition-colors"
              >
                Add your first space
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(space => (
              <SpaceCard
                key={space._id}
                space={space}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggling={toggling}
              />
            ))}
          </div>
        )}
      </div>
    </FacilitiesLayout>
  );
};

export default ManageSpaces;
