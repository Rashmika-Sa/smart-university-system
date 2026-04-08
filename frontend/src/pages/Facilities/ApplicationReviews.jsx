import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

const ROLE_SECTIONS = [
  { key: 'team_captain', label: 'Team Captain' },
  { key: 'society', label: 'Society' },
];

const STATUS_TABS = ['pending', 'approved', 'rejected'];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const ApplicationReviews = () => {
  const [section, setSection] = useState('team_captain');
  const [status, setStatus] = useState('pending');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/facilities/applications', {
        params: { status, applyFor: section },
      });
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setApplications([]);
      setError(err.response?.data?.msg || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [section, status]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const reviewApplication = async (id, nextStatus) => {
    setBusyId(`${id}-${nextStatus}`);
    setError('');
    try {
      await axios.put(`/facilities/applications/${id}/review`, {
        status: nextStatus,
        reason: nextStatus === 'rejected' ? 'Rejected by reviewer' : '',
      });
      await fetchApplications();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to review application');
    } finally {
      setBusyId('');
    }
  };

  const closeDetails = () => setSelectedApp(null);

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0d1b3e]">Student Applications</h1>
          <p className="text-sm text-gray-400 mt-1">Review applications and grant Team Captain or Society privileges.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {ROLE_SECTIONS.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                section === item.key ? 'bg-[#0d1b3e] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1 w-fit mb-5">
          {STATUS_TABS.map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors duration-150 ${
                status === item ? 'bg-[#0d1b3e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Apply For</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Statement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">Loading applications...</td>
                  </tr>
                )}

                {!loading && applications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No {status} applications in this section.</td>
                  </tr>
                )}

                {!loading && applications.map((item) => (
                  <tr key={item._id} className="border-t border-gray-100 text-sm text-gray-700">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{item.user?.name || '-'}</p>
                      <p className="text-xs text-gray-400">{item.user?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{item.applyFor?.replace('_', ' ') || '-'}</td>
                    <td className="px-4 py-3">
                      {item.applyFor === 'team_captain'
                        ? `${item.teamName || '-'} / ${item.sportName || '-'}`
                        : item.societyName || '-'}
                    </td>
                    <td className="px-4 py-3 max-w-[280px] truncate" title={item.statement || '-'}>{item.statement || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold capitalize ${STATUS_STYLES[item.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      {item.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedApp(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => reviewApplication(item._id, 'approved')}
                            disabled={busyId === `${item._id}-approved` || !!busyId}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reviewApplication(item._id, 'rejected')}
                            disabled={busyId === `${item._id}-rejected` || !!busyId}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedApp(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={closeDetails}>
            <div
              className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review full user submission before taking action.</p>
                </div>
                <button onClick={closeDetails} className="text-slate-400 hover:text-slate-700 text-sm font-semibold">Close</button>
              </div>

              <div className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
                <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="font-semibold text-slate-900">{selectedApp.user?.name || '-'}</p>
                  <p className="text-slate-500 text-xs mt-1">{selectedApp.user?.email || '-'}</p>
                  <p className="text-slate-500 text-xs mt-1">University ID: {selectedApp.user?.universityId || '-'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Apply For</p>
                  <p className="mt-1 text-slate-800 capitalize">{selectedApp.applyFor?.replace('_', ' ') || '-'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Status</p>
                  <span className={`inline-block mt-1 text-[11px] px-2 py-1 rounded-full border font-semibold capitalize ${STATUS_STYLES[selectedApp.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {selectedApp.status}
                  </span>
                </div>

                {selectedApp.applyFor === 'team_captain' ? (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Team Name</p>
                      <p className="mt-1 text-slate-800">{selectedApp.teamName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Sport</p>
                      <p className="mt-1 text-slate-800">{selectedApp.sportName || '-'}</p>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Society Name</p>
                    <p className="mt-1 text-slate-800">{selectedApp.societyName || '-'}</p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Statement</p>
                  <p className="mt-1 text-slate-800 whitespace-pre-wrap">{selectedApp.statement || '-'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Submitted On</p>
                  <p className="mt-1 text-slate-800">{selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString() : '-'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Reviewed By</p>
                  <p className="mt-1 text-slate-800">{selectedApp.reviewedBy?.name || '-'}</p>
                </div>

                {selectedApp.status === 'rejected' && (
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Rejection Reason</p>
                    <p className="mt-1 text-rose-700">{selectedApp.rejectionReason || '-'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FacilitiesLayout>
  );
};

export default ApplicationReviews;
