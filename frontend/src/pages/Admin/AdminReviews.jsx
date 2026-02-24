import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axios';

const CANTEENS = ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)'];

const CATEGORIES = [
  { value: '',            label: 'All Categories' },
  { value: 'general',      label: 'General' },
  { value: 'food_quality', label: 'Food Quality' },
  { value: 'service',      label: 'Service' },
  { value: 'cleanliness',  label: 'Cleanliness' },
  { value: 'value',        label: 'Value for Money' },
];

const CATEGORY_COLORS = {
  general:      'bg-slate-500/20 text-slate-300 border-slate-500/30',
  food_quality: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  service:      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  cleanliness:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  value:        'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const StarDisplay = ({ value, size = 'md' }) => {
  const sz = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 20 20" className={`${sz} ${value >= s ? 'text-yellow-400' : 'text-slate-700'} transition-colors`} fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const RatingBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 w-6 shrink-0">{label}★</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-500 w-6 text-right shrink-0">{count}</span>
    </div>
  );
};

const AdminReviews = ({ initialCanteen }) => {
  const [selectedCanteen, setSelectedCanteen] = useState(
    initialCanteen && CANTEENS.includes(initialCanteen) ? initialCanteen : CANTEENS[0]
  );

  // Sync when parent changes the canteen (e.g. super admin switches canteen in CanteenDashboard)
  useEffect(() => {
    if (initialCanteen && CANTEENS.includes(initialCanteen)) {
      setSelectedCanteen(initialCanteen);
    }
  }, [initialCanteen]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [filterStar, setFilterStar] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        axiosInstance.get('/reviews', { params: { canteen: selectedCanteen, category: filterCat || undefined } }),
        axiosInstance.get('/reviews/stats', { params: { canteen: selectedCanteen } }),
      ]);
      const filtered = filterStar > 0
        ? reviewsRes.data.reviews.filter((r) => r.rating === filterStar)
        : reviewsRes.data.reviews;
      setReviews(filtered);
      setStats(statsRes.data[0] || null);
    } catch {
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCanteen, filterCat, filterStar]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">

      {/* Section Header */}
      <div>
        <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Read-Only</p>
        <h2 className="text-xl font-black text-white mt-0.5">
          Canteen{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Reviews</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">View all student feedback across canteens. Admin view only — no modifications allowed.</p>
      </div>

      {/* Canteen Tabs */}
      <div className="flex flex-wrap gap-2">
        {CANTEENS.map((c) => (
          <button
            key={c}
            onClick={() => { setSelectedCanteen(c); setFilterCat(''); setFilterStar(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
              ${selectedCanteen === c
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-transparent shadow-lg'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500/50 hover:text-white'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Stats Panel */}
        <div className="space-y-4">

          {/* Stats Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-4">Rating Overview</p>
            {stats ? (
              <>
                <div className="flex items-end gap-3 mb-5">
                  <span className="text-5xl font-black text-white">{stats.avgRating.toFixed(1)}</span>
                  <div className="pb-1">
                    <StarDisplay value={Math.round(stats.avgRating)} size="md" />
                    <p className="text-slate-500 text-xs mt-1">{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <RatingBar label="5" count={stats.star5} total={stats.totalReviews} color="bg-yellow-400" />
                  <RatingBar label="4" count={stats.star4} total={stats.totalReviews} color="bg-yellow-500" />
                  <RatingBar label="3" count={stats.star3} total={stats.totalReviews} color="bg-orange-400" />
                  <RatingBar label="2" count={stats.star2} total={stats.totalReviews} color="bg-orange-500" />
                  <RatingBar label="1" count={stats.star1} total={stats.totalReviews} color="bg-red-500" />
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No reviews yet.</p>
            )}
          </div>

          {/* Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Filters</p>

            <div>
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Category</label>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-400/40 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Min Stars</label>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStar(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all
                      ${filterStar === s
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-indigo-500/50 hover:text-white'
                      }`}
                  >
                    {s === 0 ? 'All' : `${s}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-400 text-lg mt-0.5">🔒</span>
              <div>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Admin View</p>
                <p className="text-amber-300/70 text-xs mt-1 leading-relaxed">You are viewing reviews in read-only mode. Students submit and manage their own reviews.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Reviews List */}
        <div className="lg:col-span-2 space-y-4">

          {/* Summary Bar */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Showing <span className="text-white font-bold">{loading ? '...' : reviews.length}</span> review{reviews.length !== 1 ? 's' : ''} for <span className="text-cyan-400 font-semibold">{selectedCanteen}</span>
            </span>
            <button
              onClick={fetchData}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              ↻ Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && reviews.length === 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-300 font-semibold">No reviews found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting the filters or selecting a different canteen.</p>
            </div>
          )}

          {/* Review Cards */}
          {!loading && reviews.map((review) => (
            <div key={review._id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.isAnonymous
                      ? '?'
                      : (review.user?.name?.charAt(0).toUpperCase() || '?')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {review.isAnonymous ? 'Anonymous' : (review.user?.name || 'Student')}
                    </p>
                    <p className="text-xs text-slate-500">{timeAgo(review.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {review.category && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${CATEGORY_COLORS[review.category] || CATEGORY_COLORS.general}`}>
                      {CATEGORIES.find(c => c.value === review.category)?.label || review.category}
                    </span>
                  )}
                  <StarDisplay value={review.rating} size="sm" />
                </div>
              </div>

              {review.comment && (
                <p className="mt-3 text-slate-300 text-sm leading-relaxed pl-12">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
