import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import StudentTopNav from '../../components/StudentTopNav';

const CANTEENS = ['Main Canteen', 'Birdnest Canteen', 'Perera & Sons (P&S)'];

const CATEGORIES = [
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

const StarRow = ({ value, onChange, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`${sz} transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <svg viewBox="0 0 20 20" className={`${sz} ${(hovered || value) >= s ? 'text-yellow-400' : 'text-slate-700'} transition-colors`} fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
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

const CanteenReviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const initialCanteen = CANTEENS.includes(searchParams.get('canteen')) ? searchParams.get('canteen') : CANTEENS[0];
  const [selectedCanteen, setSelectedCanteen] = useState(initialCanteen);
  const [reviews, setReviews]     = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [filterStar, setFilterStar] = useState(0);
  const [submitError, setSubmitError]   = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [deleting, setDeleting]   = useState(null);

  // Form state
  const [rating, setRating]         = useState(0);
  const [category, setCategory]     = useState('general');
  const [comment, setComment]       = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    if (!rating) { setSubmitError('Please select a star rating.'); return; }
    setSubmitting(true);
    try {
      await axiosInstance.post('/reviews', { canteen: selectedCanteen, rating, category, comment, isAnonymous });
      setSubmitSuccess('Your review was submitted!');
      setRating(0); setComment(''); setCategory('general'); setIsAnonymous(false);
      fetchData();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await axiosInstance.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      fetchData();
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

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
    <div className="min-h-screen bg-secondary">
      <StudentTopNav active="Canteen" />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Canteen{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Rate your experience — anonymous feedback is welcome</p>
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
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN — Stats + Submit Form */}
          <div className="space-y-6">

            {/* Stats Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-4">Rating Overview</p>

              {stats ? (
                <>
                  <div className="flex items-end gap-3 mb-5">
                    <span className="text-5xl font-black text-white">{stats.avgRating.toFixed(1)}</span>
                    <div className="pb-1">
                      <StarRow value={Math.round(stats.avgRating)} size="md" />
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
                <p className="text-slate-600 text-sm">No reviews yet. Be the first!</p>
              )}
            </div>

            {/* Submit Review Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-4">Write a Review</p>

              {!user?.id ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-3">Sign in to leave a review</p>
                  <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-semibold">
                    Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Star picker */}
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Your Rating *</label>
                    <StarRow value={rating} onChange={setRating} size="lg" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all
                            ${category === cat.value
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20'
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Comment</label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Share your experience... (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none resize-none transition-all"
                    />
                    <p className="text-right text-[10px] text-slate-700 mt-0.5">{comment.length}/500</p>
                  </div>

                  {/* Anonymous toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAnonymous((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                      ${isAnonymous
                        ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                      }`}
                  >
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Post Anonymously
                    </span>
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 relative ${isAnonymous ? 'bg-violet-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isAnonymous ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </button>
                  {isAnonymous && (
                    <p className="text-[11px] text-violet-400/80 -mt-1 px-1">Your name will be hidden from all other users.</p>
                  )}

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{submitError}</div>
                  )}
                  {submitSuccess && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">{submitSuccess}</div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="relative w-full overflow-hidden py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 group"
                  >
                    <span className="relative z-10">{submitting ? 'Submitting...' : 'Submit Review'}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Reviews List */}
          <div className="lg:col-span-2 space-y-4">

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Filter:</span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCat(filterCat === cat.value ? '' : cat.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all
                    ${filterCat === cat.value
                      ? `${CATEGORY_COLORS[cat.value]}`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
              <div className="ml-auto flex gap-1">
                {[0, 5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStar(filterStar === s ? 0 : s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all
                      ${filterStar === s && s > 0
                        ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {s === 0 ? 'All' : `${s}★`}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                <svg className="w-8 h-8 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2 text-slate-400">
                <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-semibold">No reviews yet</p>
                <p className="text-xs">Be the first to review {selectedCanteen}</p>
              </div>
            ) : (
              reviews.map((review) => {
                const isOwn = user?.id && review.author === user.id;
                return (
                  <div key={review._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                          ${review.isAnonymous ? 'bg-violet-100 text-violet-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {review.isAnonymous ? '?' : review.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{review.authorName}</p>
                          <p className="text-[11px] text-slate-400">{timeAgo(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${CATEGORY_COLORS[review.category] || CATEGORY_COLORS.general}`}>
                          {CATEGORIES.find((c) => c.value === review.category)?.label || review.category}
                        </span>
                        {isOwn && (
                          <button
                            onClick={() => handleDelete(review._id)}
                            disabled={deleting === review._id}
                            className="text-slate-300 hover:text-red-400 transition-colors p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <StarRow value={review.rating} size="md" />
                      <span className="text-xs text-slate-400">({review.rating}/5)</span>
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                    )}

                    {review.foodItemName && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-500 font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {review.foodItemName}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanteenReviews;
