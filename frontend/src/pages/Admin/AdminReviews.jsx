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
  general:      'bg-slate-100 text-slate-600 border-slate-300',
  food_quality: 'bg-orange-100 text-orange-600 border-orange-300',
  service:      'bg-cyan-100 text-cyan-600 border-cyan-300',
  cleanliness:  'bg-emerald-100 text-emerald-600 border-emerald-300',
  value:        'bg-violet-100 text-violet-600 border-violet-300',
};

const StarDisplay = ({ value, size = 'md' }) => {
  const sz = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 20 20" className={`${sz} ${value >= s ? 'text-yellow-400' : 'text-slate-300'} transition-colors`} fill="currentColor">
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
      <span className="text-slate-500 w-6 shrink-0">{label}★</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-500 w-6 text-right shrink-0">{count}</span>
    </div>
  );
};

const AdminReviews = ({ initialCanteen }) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSubCanteenAdmin = currentUser?.role === 'canteen_admin' && !!currentUser?.managedCanteen;
  const allowedCanteens = isSubCanteenAdmin
    ? CANTEENS.filter((c) => c === currentUser.managedCanteen)
    : CANTEENS;

  const isAdmin = ['admin', 'canteen_admin'].includes(currentUser?.role);

  const [selectedCanteen, setSelectedCanteen] = useState(
    isSubCanteenAdmin
      ? currentUser.managedCanteen
      : (initialCanteen && CANTEENS.includes(initialCanteen) ? initialCanteen : CANTEENS[0])
  );

  // Sync when parent changes the canteen (e.g. super admin switches canteen in CanteenDashboard)
  useEffect(() => {
    if (isSubCanteenAdmin) {
      setSelectedCanteen(currentUser.managedCanteen);
      return;
    }

    if (initialCanteen && CANTEENS.includes(initialCanteen)) {
      setSelectedCanteen(initialCanteen);
    }
  }, [initialCanteen, isSubCanteenAdmin, currentUser?.managedCanteen]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [filterStar, setFilterStar] = useState(0);

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

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

  // Reply handlers
  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await axiosInstance.post(`/reviews/${reviewId}/reply`, { text: replyText });
      setReplyingTo(null);
      setReplyText('');
      fetchData();
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateReply = async (reviewId) => {
    if (!editReplyText.trim()) return;
    setReplyLoading(true);
    try {
      await axiosInstance.put(`/reviews/${reviewId}/reply`, { text: editReplyText });
      setEditingReply(null);
      setEditReplyText('');
      fetchData();
    } catch (err) {
      console.error('Update reply failed:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await axiosInstance.delete(`/reviews/${reviewId}/reply`);
      fetchData();
    } catch (err) {
      console.error('Delete reply failed:', err);
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
    <div className="space-y-6">

      {/* Section Header */}
      <div>
        <p className="text-xs text-primary uppercase tracking-widest font-bold">Manage & Reply</p>
        <h2 className="text-xl font-black text-slate-900 mt-0.5">
          Canteen{' '}
          <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Reviews</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">View student feedback and reply to reviews across canteens.</p>
      </div>

      {/* Canteen Tabs */}
      <div className="flex flex-wrap gap-2">
        {allowedCanteens.map((c) => (
          <button
            key={c}
            onClick={() => { setSelectedCanteen(c); setFilterCat(''); setFilterStar(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
              ${selectedCanteen === c
                ? 'bg-accent text-white border-transparent shadow-lg'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/50 hover:text-slate-900'
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs text-primary uppercase tracking-widest font-bold mb-4">Rating Overview</p>
            {stats ? (
              <>
                <div className="flex items-end gap-3 mb-5">
                  <span className="text-5xl font-black text-slate-900">{stats.avgRating.toFixed(1)}</span>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Filters</p>

            <div>
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Category</label>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-400/40 outline-none"
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
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/50 hover:text-slate-900'
                      }`}
                  >
                    {s === 0 ? 'All' : `${s}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-primary text-lg mt-0.5">💬</span>
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-widest">Admin View</p>
                <p className="text-primary/70 text-xs mt-1 leading-relaxed">You can reply to student reviews. Your replies will be visible to all students.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Reviews List */}
        <div className="lg:col-span-2 space-y-4">

          {/* Summary Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="text-slate-900 font-bold">{loading ? '...' : reviews.length}</span> review{reviews.length !== 1 ? 's' : ''} for <span className="text-primary font-semibold">{selectedCanteen}</span>
            </span>
            <button
              onClick={fetchData}
              className="text-xs text-primary/70 hover:text-primary font-semibold transition-colors"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-600 font-semibold">No reviews found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting the filters or selecting a different canteen.</p>
            </div>
          )}

          {/* Review Cards */}
          {!loading && reviews.map((review) => (
            <div key={review._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.isAnonymous
                      ? '?'
                      : (review.user?.name?.charAt(0).toUpperCase() || '?')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
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
                <p className="mt-3 text-slate-600 text-sm leading-relaxed pl-12">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}

              {/* Existing Reply Display */}
              {review.reply?.text && editingReply !== review._id && (
                <div className="mt-4 ml-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                      </div>
                      <span className="text-xs font-bold text-cyan-400">{review.reply.repliedByName || 'Admin'}</span>
                      <span className="text-[10px] text-slate-500">{review.reply.repliedAt ? timeAgo(review.reply.repliedAt) : ''}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingReply(review._id); setEditReplyText(review.reply.text); }}
                          className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                          title="Edit reply"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteReply(review._id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Delete reply"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{review.reply.text}</p>
                </div>
              )}

              {/* Edit Reply Form */}
              {editingReply === review._id && (
                <div className="mt-4 ml-12">
                  <textarea
                    value={editReplyText}
                    onChange={(e) => setEditReplyText(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-cyan-400/40 outline-none resize-none"
                    placeholder="Update your reply..."
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateReply(review._id)}
                      disabled={replyLoading}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50"
                    >
                      {replyLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditingReply(null); setEditReplyText(''); }}
                      className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Button & Form (only if no existing reply) */}
              {isAdmin && !review.reply?.text && replyingTo !== review._id && (
                <div className="mt-3 pl-12">
                  <button
                    onClick={() => { setReplyingTo(review._id); setReplyText(''); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    Reply
                  </button>
                </div>
              )}

              {replyingTo === review._id && (
                <div className="mt-3 ml-12">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-cyan-400/40 outline-none resize-none"
                    placeholder="Write a reply to this review..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReply(review._id)}
                      disabled={replyLoading}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50"
                    >
                      {replyLoading ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
