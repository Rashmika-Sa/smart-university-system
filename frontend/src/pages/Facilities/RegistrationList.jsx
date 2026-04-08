import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

// ── helpers ──────────────────────────────────────────────────────────────────
const TABS = ['all', 'pending', 'approved', 'rejected'];

const STATUS_BADGE = {
  pending:  'bg-amber-50  text-amber-700  border border-amber-200',
  approved: 'bg-green-50  text-green-700  border border-green-200',
  rejected: 'bg-red-50    text-red-600    border border-red-200',
};

const AVATAR_COLORS = [
  'bg-blue-100   text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100   text-rose-700',
  'bg-cyan-100   text-cyan-700',
];

const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ── empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    </div>
    <p className="text-sm font-semibold text-gray-700">
      {tab === 'all' ? 'No registrations found' : `No ${tab} registrations`}
    </p>
    <p className="text-xs text-gray-400 mt-1">New registrations will appear here</p>
  </div>
);

// ── registration card ─────────────────────────────────────────────────────────
const RegCard = ({ reg, onReview }) => {
  const name = reg.user?.name || '—';
  const email = reg.user?.email || '—';
  const roleLabel = reg.role === 'team_captain' ? 'Team Captain' : 'Society';
  const detail = reg.role === 'team_captain'
    ? `${reg.teamName}  ·  ${reg.sportName}`
    : reg.societyName;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      {/* avatar */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${avatarColor(name)}`}>
        {initials(name)}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {roleLabel}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[reg.status]}`}>
            {reg.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
        {detail && <p className="text-xs text-gray-500 mt-0.5 truncate">{detail}</p>}
      </div>

      {/* date */}
      <p className="text-xs text-gray-400 shrink-0 hidden sm:block">{fmtDate(reg.createdAt)}</p>

      {/* action */}
      {reg.status === 'pending' ? (
        <button
          onClick={() => onReview(reg._id)}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d1b3e] text-white text-xs font-semibold hover:bg-[#162244] transition-colors"
        >
          Review
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => onReview(reg._id)}
          className="shrink-0 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors"
        >
          View
        </button>
      )}
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────
const RegistrationList = () => {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  const pageTitle = 'Facility Registrations';
  const pageSubtitle = 'Review and action Team Captain and Society registration requests.';

  const [activeTab, setActiveTab]   = useState('all');
  const [search, setSearch]         = useState('');
  const [registrations, setRegs]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetchRegs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const { data } = await axios.get(`/facilities/registrations${query}`);
      setRegs(data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchRegs(); }, [fetchRegs]);

  const filtered = registrations.filter(r => {
    const term = search.toLowerCase();
    const name = (r.user?.name || '').toLowerCase();
    const extra = (r.teamName || r.societyName || '').toLowerCase();
    return name.includes(term) || extra.includes(term);
  });

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-4xl">

        {/* heading */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0d1b3e]">{pageTitle}</h1>
          <p className="text-sm text-gray-400 mt-1">{pageSubtitle}</p>
        </div>

        {/* tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* tabs */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1 w-fit">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch(''); }}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors duration-150
                  ${activeTab === tab
                    ? 'bg-[#0d1b3e] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#0d1b3e]/30 w-52 transition-colors"
            />
          </div>
        </div>

        {/* content */}
        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-2.5">
            {filtered.map(reg => (
              <RegCard
                key={reg._id}
                reg={reg}
                onReview={id => navigate(`/facilities/registrations/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </FacilitiesLayout>
  );
};

export default RegistrationList;
