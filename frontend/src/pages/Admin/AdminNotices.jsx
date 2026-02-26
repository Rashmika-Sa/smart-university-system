import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axios';

const initialForm = {
  title: '',
  content: '',
  priority: 'normal',
  targetAudience: 'students',
  isPublished: true
};

const priorityStyle = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  normal: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
};

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Get current user info for ownership checks
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);
  const isSuperAdmin = currentUser.role === 'admin' || (currentUser.role === 'canteen_admin' && !currentUser.managedCanteen);

  const submitLabel = useMemo(() => (editingId ? 'Update Notice' : 'Post Notice'), [editingId]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/notices', { params: { includeUnpublished: true, limit: 30 } });
      setNotices(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (notice) => {
    setEditingId(notice._id);
    setForm({
      title: notice.title || '',
      content: notice.content || '',
      priority: notice.priority || 'normal',
      targetAudience: notice.targetAudience || 'students',
      isPublished: !!notice.isPublished
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (editingId) {
        await axios.put(`/notices/${editingId}`, form);
        setSuccess('Notice updated successfully.');
      } else {
        await axios.post('/notices', form);
        setSuccess('Notice posted successfully.');
      }

      resetForm();
      await loadNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this notice?');
    if (!confirmed) return;

    try {
      await axios.delete(`/notices/${id}`);
      if (editingId === id) {
        resetForm();
      }
      setSuccess('Notice deleted successfully.');
      setError('');
      await loadNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-accent uppercase tracking-widest font-bold">{isSuperAdmin ? 'Admin Broadcast' : 'My Notices'}</p>
          <h2 className="text-xl font-black text-white mt-0.5">{isSuperAdmin ? 'Notices & News Center' : 'My Published Notices'}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {isSuperAdmin
              ? 'Post updates for students and manage published announcements.'
              : 'Post and manage your own notices for students.'}
          </p>
        </div>
        <button
          onClick={loadNotices}
          className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-400 hover:border-accent/40 hover:text-accent transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <form onSubmit={handleSubmit} className="xl:col-span-5 rounded-2xl border border-slate-700 bg-slate-800 p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest font-bold text-accent">Compose Notice</p>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Shuttle route update"
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-600 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              placeholder="Write a clear update for students..."
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-600 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-accent/40"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audience</label>
              <select
                name="targetAudience"
                value={form.targetAudience}
                onChange={handleChange}
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-accent/40"
              >
                <option value="students">Students</option>
                <option value="all">All Users</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
              className="rounded border-slate-600"
            />
            Publish immediately
          </label>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold hover:opacity-90 transition disabled:opacity-50 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
            >
              {submitting ? 'Saving...' : submitLabel}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-700 transition font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-7 rounded-2xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-xs uppercase tracking-widest font-bold text-accent mb-4">Posted Notices</p>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-slate-700 animate-pulse" />
              <div className="h-20 rounded-xl bg-slate-700 animate-pulse" />
              <div className="h-20 rounded-xl bg-slate-700 animate-pulse" />
            </div>
          ) : notices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-600 px-4 py-8 text-center">
              <p className="text-slate-300 font-semibold">No notices posted yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first notice using the panel.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {notices.map((notice) => (
                <div key={notice._id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{notice.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${priorityStyle[notice.priority] || priorityStyle.normal}`}>
                          {notice.priority || 'normal'}
                        </span>
                        {!notice.isPublished && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-400 font-bold uppercase tracking-wider">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{notice.content}</p>
                      <p className="text-[11px] text-slate-500 mt-2">
                        By {notice.postedByName || 'Admin'} • {new Date(notice.updatedAt || notice.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {/* Super admin can edit/delete any notice; sub-admins only their own */}
                    {(isSuperAdmin || notice.postedBy === (currentUser._id || currentUser.id)) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="px-2.5 py-1.5 rounded-lg border border-accent/25 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;
