import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import FacilitiesLayout from './FacilitiesLayout';

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  pending:  'bg-amber-50  text-amber-700  border border-amber-200',
  approved: 'bg-green-50  text-green-700  border border-green-200',
  rejected: 'bg-red-50    text-red-600    border border-red-200',
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

// ── detail row ────────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────
const RegistrationDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [reg, setReg]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [actionLoading, setAction]  = useState('');   // 'approve' | 'reject' | ''
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason]         = useState('');
  const [actionError, setActionErr] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/facilities/registrations/${id}`);
        setReg(data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load registration');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    setAction('approve');
    setActionErr('');
    try {
      await axios.put(`/facilities/registrations/${id}/approve`);
      setReg(prev => ({ ...prev, status: 'approved' }));
    } catch (err) {
      setActionErr(err.response?.data?.msg || 'Failed to approve');
    } finally {
      setAction('');
    }
  };

  const handleReject = async () => {
    setAction('reject');
    setActionErr('');
    try {
      await axios.put(`/facilities/registrations/${id}/reject`, { reason });
      setReg(prev => ({ ...prev, status: 'rejected', rejectionReason: reason }));
      setShowReject(false);
    } catch (err) {
      setActionErr(err.response?.data?.msg || 'Failed to reject');
    } finally {
      setAction('');
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <FacilitiesLayout>
        <div className="p-8 max-w-3xl space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
      </FacilitiesLayout>
    );
  }

  if (error || !reg) {
    return (
      <FacilitiesLayout>
        <div className="p-8">
          <p className="text-red-500 text-sm">{error || 'Registration not found'}</p>
          <button onClick={() => navigate('/facilities/registrations')}
            className="mt-4 text-sm text-[#0d1b3e] underline">
            ← Back to Registrations
          </button>
        </div>
      </FacilitiesLayout>
    );
  }

  const isPending  = reg.status === 'pending';
  const roleLabel  = reg.role === 'team_captain' ? 'Team Captain' : 'Society';

  return (
    <FacilitiesLayout>
      <div className="p-8 max-w-3xl">

        {/* breadcrumb */}
        <button
          onClick={() => navigate('/facilities/registrations')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Registrations
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium">{reg.user?.name}</span>
        </button>

        {/* page title */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-[#0d1b3e]">Review Application</h1>
            <p className="text-sm text-gray-400 mt-0.5">{roleLabel} registration request</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_BADGE[reg.status]}`}>
            {reg.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── Left: applicant details ──────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* applicant card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Applicant</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0d1b3e]/10 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-[#0d1b3e]">
                    {(reg.user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{reg.user?.name}</p>
                  <p className="text-sm text-gray-400">{reg.user?.email}</p>
                </div>
              </div>
            </div>

            {/* role-specific details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                {reg.role === 'team_captain' ? 'Team Details' : 'Society Details'}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {reg.role === 'team_captain' ? (
                  <>
                    <DetailRow label="Team Name" value={reg.teamName} />
                    <DetailRow label="Sport"     value={reg.sportName} />
                  </>
                ) : (
                  <DetailRow label="Society Name" value={reg.societyName} />
                )}
                <DetailRow label="Role"      value={roleLabel} />
                <DetailRow label="Submitted" value={fmtDate(reg.createdAt)} />
              </div>
            </div>

            {/* review info (if already reviewed) */}
            {!isPending && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Review Outcome</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <DetailRow label="Decision"    value={reg.status.charAt(0).toUpperCase() + reg.status.slice(1)} />
                  <DetailRow label="Reviewed On" value={fmtDate(reg.reviewedAt)} />
                  {reg.reviewedBy?.name && (
                    <DetailRow label="Reviewed By" value={reg.reviewedBy.name} />
                  )}
                  {reg.rejectionReason && (
                    <div className="col-span-2">
                      <DetailRow label="Rejection Reason" value={reg.rejectionReason} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: actions ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {isPending ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Actions</p>

                {actionError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                    {actionError}
                  </div>
                )}

                {/* approve */}
                {!showReject && (
                  <button
                    onClick={handleApprove}
                    disabled={!!actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#0d1b3e] text-white text-sm font-semibold hover:bg-[#162244] transition-colors disabled:opacity-60 mb-3"
                  >
                    {actionLoading === 'approve' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                    Approve Registration
                  </button>
                )}

                {/* reject toggle */}
                {!showReject ? (
                  <button
                    onClick={() => setShowReject(true)}
                    disabled={!!actionLoading}
                    className="w-full py-3 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    Reject Registration
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                        Rejection Reason <span className="normal-case text-gray-300">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Briefly explain the reason for rejection…"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg p-3 outline-none focus:border-red-300 resize-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleReject}
                      disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === 'reject' ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                      ) : null}
                      Confirm Rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowReject(false); setReason(''); setActionErr(''); }}
                      className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* already reviewed — show outcome summary */
              <div className={`rounded-xl border p-5 ${reg.status === 'approved'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {reg.status === 'approved' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                  <p className={`text-sm font-semibold capitalize ${reg.status === 'approved' ? 'text-green-700' : 'text-red-600'}`}>
                    {reg.status === 'approved' ? 'Approved — account is active' : 'Registration was rejected'}
                  </p>
                </div>
                {reg.status === 'approved' && (
                  <p className="text-xs text-green-600">This account can now log in and make bookings.</p>
                )}
              </div>
            )}

            {/* meta */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Metadata</p>
              <DetailRow label="Registration ID" value={reg._id} />
              <DetailRow label="Submitted"       value={fmtDate(reg.createdAt)} />
              <DetailRow label="Role Requested"  value={roleLabel} />
            </div>
          </div>
        </div>
      </div>
    </FacilitiesLayout>
  );
};

export default RegistrationDetail;
