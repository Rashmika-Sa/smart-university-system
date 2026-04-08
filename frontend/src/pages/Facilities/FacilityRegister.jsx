import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

// ── small reusable input ────────────────────────────────────────────────────
const Field = ({ label, type = 'text', placeholder, value, onChange, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-transparent border-b border-gray-300 focus:border-[#1a2e6c] pb-2.5 pt-1 text-gray-800 text-sm placeholder-gray-400 outline-none transition-colors duration-200"
      />
      {children}
    </div>
  </div>
);

// ── success screen ──────────────────────────────────────────────────────────
const SuccessScreen = () => (
  <div className="text-center max-w-sm mx-auto">
    <div className="w-16 h-16 rounded-full bg-[#1a2e6c]/10 flex items-center justify-center mx-auto mb-5">
      <svg className="w-8 h-8 text-[#1a2e6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted</h2>
    <p className="text-gray-500 text-sm leading-relaxed mb-6">
      Your registration is under review. You'll be notified once approved.
    </p>
    <Link
      to="/login"
      className="inline-block px-6 py-2.5 rounded-lg bg-[#1a2e6c] text-white text-sm font-semibold hover:bg-[#15266b] transition-colors"
    >
      Back to Login
    </Link>
  </div>
);

// ── main component ──────────────────────────────────────────────────────────
const FacilityRegister = () => {
  const [role, setRole]           = useState('team_captain');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [teamName, setTeamName]   = useState('');
  const [sportName, setSportName] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'team_captain') {
        payload.teamName  = teamName;
        payload.sportName = sportName;
      } else {
        payload.societyName = societyName;
      }
      await axios.post('/facilities/auth/register', payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#0d1b3e] flex-col justify-between p-12 relative overflow-hidden">

        {/* background texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />

        {/* top — logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CampusReserve</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Join the Academic<br />Inner Circle
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Book premium sports facilities and event spaces for your team or society — all in one place.
          </p>
        </div>

        {/* middle — feature list */}
        <div className="relative z-10 space-y-5">
          {[
            { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: 'Instant booking for sports courts & event halls' },
            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Real-time availability — no double-booking' },
            { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', text: 'Email confirmations for every booking' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/8 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
              </div>
              <p className="text-white/60 text-sm leading-snug pt-1">{item.text}</p>
            </div>
          ))}
        </div>

        {/* bottom — trust badges */}
        <div className="relative z-10 flex gap-3 flex-wrap">
          {['University Verified', 'Secure Registration'].map(badge => (
            <span key={badge} className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────── */}
      <div className="flex-1 bg-[#f4f6f9] flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {success ? <SuccessScreen /> : (
            <>
              {/* heading */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
                <p className="text-gray-400 text-sm">Select your role to personalise your experience</p>
              </div>

              {/* role selector */}
              <div className="flex rounded-lg border border-gray-200 bg-white p-1 mb-7">
                {[
                  { value: 'team_captain', label: 'Team Captain' },
                  { value: 'society',      label: 'Society'       },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setRole(opt.value); setError(''); }}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200
                      ${role === opt.value
                        ? 'bg-[#0d1b3e] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* error */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field
                  label="Full Name"
                  placeholder="e.g. Alexander Hamilton"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <Field
                  label="University Email"
                  type="email"
                  placeholder="itXXXXXXXX@my.sliit.lk"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                {/* conditional role fields */}
                {role === 'team_captain' ? (
                  <>
                    <Field
                      label="Team Name"
                      placeholder="e.g. SLIIT Volleyball Team A"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      required
                    />
                    <Field
                      label="Sport"
                      placeholder="e.g. Volleyball"
                      value={sportName}
                      onChange={e => setSportName(e.target.value)}
                      required
                    />
                  </>
                ) : (
                  <Field
                    label="Society Name"
                    placeholder="e.g. SLIIT Drama Society"
                    value={societyName}
                    onChange={e => setSocietyName(e.target.value)}
                    required
                  />
                )}

                {/* password with toggle */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-transparent border-b border-gray-300 focus:border-[#1a2e6c] pb-2.5 pt-1 pr-8 text-gray-800 text-sm placeholder-gray-400 outline-none transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-0 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-9C6.268 3 2.478 5.943 1.203 10c1.275 4.057 5.065 7 9.797 7s8.522-2.943 9.797-7C19.522 5.943 15.732 3 12 3z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-between px-6 py-3.5 rounded-xl bg-[#0d1b3e] hover:bg-[#162244] text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-60 group mt-2"
                >
                  <span>{loading ? 'Submitting…' : 'Submit Registration'}</span>
                  {!loading && (
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0d1b3e] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityRegister;
