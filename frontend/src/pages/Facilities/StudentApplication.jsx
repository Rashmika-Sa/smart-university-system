import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../api/axios';
import StudentTopNav from '../../components/StudentTopNav';

const StudentApplication = () => {
  const [applyFor, setApplyFor] = useState('team_captain');
  const [teamName, setTeamName] = useState('');
  const [sportName, setSportName] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasPending, setHasPending] = useState(false);

  const refreshPendingStatus = useCallback(async () => {
    try {
      const { data } = await axios.get('/facilities/applications/my');
      const pendingExists = Array.isArray(data) && data.some((item) => item.status === 'pending');
      setHasPending(pendingExists);
    } catch {
      setHasPending(false);
    }
  }, []);

  useEffect(() => {
    refreshPendingStatus();
  }, [refreshPendingStatus]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (applyFor === 'team_captain' && (!teamName.trim() || !sportName.trim())) {
      setError('Team name and sport are required for Team Captain application.');
      return;
    }

    if (applyFor === 'society' && !societyName.trim()) {
      setError('Society name is required for Society application.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/facilities/applications', {
        applyFor,
        teamName: teamName.trim(),
        sportName: sportName.trim(),
        societyName: societyName.trim(),
        statement: statement.trim(),
      });

      setMessage('Application submitted successfully. Please wait for review.');
      setTeamName('');
      setSportName('');
      setSocietyName('');
      setStatement('');
      await refreshPendingStatus();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <StudentTopNav active="Application" />

      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Student Access</span>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
            Role <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Application</span>
          </h1>
          <p className="text-white/70 text-sm mt-2">Apply to become a Team Captain or a Society account holder.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">Application Form</p>

          {message && <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{message}</div>}
          {error && <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
          {hasPending && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              You already have a pending application. You can submit a new one after review.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Apply For</label>
              <select
                value={applyFor}
                onChange={(e) => setApplyFor(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800"
              >
                <option value="team_captain">Team Captain</option>
                <option value="society">Society</option>
              </select>
            </div>

            {applyFor === 'team_captain' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Team Name</label>
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
                    placeholder="e.g. SLIIT Basketball Team A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sport</label>
                  <input
                    value={sportName}
                    onChange={(e) => setSportName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
                    placeholder="e.g. Basketball"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Society Name</label>
                <input
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
                  placeholder="e.g. SLIIT Robotics Society"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Why are you applying? (optional)</label>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none"
                placeholder="Tell us why you are a good fit..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || hasPending}
              className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">Guidelines</p>
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4 mb-3">
            <p className="text-sm font-semibold text-slate-900">Before You Apply</p>
            <p className="text-xs text-slate-600 mt-1">Make sure your details are accurate to avoid review delays.</p>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              Use your official team or society name exactly as recognized by the university.
            </li>
            <li className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              Team Captain applications must include both Team Name and Sport.
            </li>
            <li className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              Society applications must include the full Society Name.
            </li>
            <li className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              Only one pending application is allowed at a time.
            </li>
            <li className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              After approval, your role and privileges are updated automatically.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentApplication;
