import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

const TABS = ['all', 'pending', 'confirmed', 'rejected'];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const BookingRequests = () => {
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = tab === 'all' ? '' : `?status=${tab}`;
      const { data } = await axios.get(`/facilities/bookings${query}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setItems([]);
      setError(err.response?.data?.msg || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onReview = async (id, status) => {
    setBusyAction(`${id}-${status}`);
    setError('');
    try {
      await axios.put(`/facilities/bookings/${id}/status`, {
        status,
        reason: status === 'rejected' ? 'Rejected by reviewer' : '',
      });
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update status');
    } finally {
      setBusyAction('');
    }
  };

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0d1b3e]">Booking Requests</h1>
          <p className="text-sm text-gray-400 mt-1">Review team captain and society booking requests.</p>
        </div>

        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1 w-fit mb-5">
          {TABS.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors duration-150 ${
                tab === item ? 'bg-[#0d1b3e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">Loading requests...</td>
                  </tr>
                )}

                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">No {tab} booking requests.</td>
                  </tr>
                )}

                {!loading && items.map((booking) => (
                  <tr key={booking._id} className="border-t border-gray-100 text-sm text-gray-700">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{booking.booker?.name || '-'}</p>
                      <p className="text-xs text-gray-400">{booking.booker?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{(booking.booker?.role || '-').replace('_', ' ')}</td>
                    <td className="px-4 py-3">{booking.space?.name || '-'}</td>
                    <td className="px-4 py-3">{formatDate(booking.date)}</td>
                    <td className="px-4 py-3">{booking.startTime} - {booking.endTime}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate" title={booking.label || '-'}>{booking.label || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onReview(booking._id, 'confirmed')}
                            disabled={busyAction === `${booking._id}-confirmed` || !!busyAction}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReview(booking._id, 'rejected')}
                            disabled={busyAction === `${booking._id}-rejected` || !!busyAction}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FacilitiesLayout>
  );
};

export default BookingRequests;
