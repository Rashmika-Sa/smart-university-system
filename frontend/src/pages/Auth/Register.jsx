import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

const STEPS = [
  { num: 1, label: 'Email',   icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' },
  { num: 2, label: 'Verify',  icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { num: 3, label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const InputField = ({ label, icon, type = 'text', placeholder, value, onChange, children, ...rest }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <svg className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition-all duration-200"
        {...rest}
      />
      {children}
    </div>
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError]       = useState('');
  const [msg, setMsg]           = useState('');
  const navigate = useNavigate();

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.msg === 'string' && data.msg.trim()) {
      return data.msg;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]?.message || fallback;
    }

    return fallback;
  };

  const validateStudentEmail = (value) => {
    const normalizedEmail = (value || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return 'Please add an email';
    }

    if (!/@my\.sliit\.lk$/i.test(normalizedEmail)) {
      return 'Email must end with @my.sliit.lk.';
    }

    if (!/^[a-z]{2}\d{8}@my\.sliit\.lk$/i.test(normalizedEmail)) {
      return 'Email must start with 2 letters and 8 digits (example: it12345678@my.sliit.lk).';
    }

    return '';
  };

  const handleSendCode = async (e) => {
    e.preventDefault(); setError(''); setMsg(''); setLoading(true);

    const emailValidationError = validateStudentEmail(email);
    if (emailValidationError) {
      setError(emailValidationError);
      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await axios.post('/auth/send-code', { email: normalizedEmail });
      setStep(2);
      setMsg(`Verification code sent to ${normalizedEmail}`);
      setEmail(normalizedEmail);
    } catch (err) { setError(getApiErrorMessage(err, 'Failed to send code')); }
    finally { setLoading(false); }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault(); setError(''); setMsg(''); setLoading(true);
    try {
      await axios.post('/auth/verify-code', { email: email.trim().toLowerCase(), code: otp });
      setStep(3); setMsg('Identity confirmed. Complete your profile.');
    } catch (err) { setError(getApiErrorMessage(err, 'Invalid code. Please try again.')); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setMsg(''); setLoading(true);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await axios.post('/auth/register', { name, email: normalizedEmail, password, role: 'student' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/student-dashboard');
    } catch (err) { setError(getApiErrorMessage(err, 'Registration failed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <img
            src="/sliit-official-logo.png"
            alt="SLIIT Logo"
            className="h-14 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Student{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Registration</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-mono tracking-widest uppercase"><span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent font-bold">SLIIT Smart University Portal</span></p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-4 left-8 right-8 h-px bg-white/10" />
            {STEPS.map(({ num, label }) => {
              const done    = step > num;
              const current = step === num;
              return (
                <div key={num} className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500
                    ${ done    ? 'bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                       : current ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                       : 'bg-white/5 border-white/10 text-slate-600' }`}>
                    {done ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : num}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${ current ? 'text-cyan-400' : done ? 'text-slate-500' : 'text-slate-700' }`}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Scan line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent mb-6" />

          {/* Messages */}
          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold">!</span>
              {error}
            </div>
          )}
          {msg && (
            <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
              <svg className="shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {msg}
            </div>
          )}

          {/* STEP 1 — Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <InputField
                label="Academic Email"
                icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                type="email"
                placeholder="it12345678@my.sliit.lk"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button disabled={loading} className="relative w-full overflow-hidden py-3.5 rounded-xl font-bold text-sm text-white bg-accent shadow-[0_0_30px_rgba(255,107,53,0.35)] hover:shadow-[0_0_45px_rgba(255,107,53,0.55)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Sending...' : <>Send Verification Code <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
                </span>
                <span className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="— — — — — —"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-cyan-300 placeholder-slate-700 text-center text-2xl font-mono tracking-[0.6em] focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition-all duration-200"
                />
                <p className="text-xs text-center text-slate-600">Check your inbox and spam folder</p>
              </div>
              <button disabled={loading} className="relative w-full overflow-hidden py-3.5 rounded-xl font-bold text-sm text-white bg-accent shadow-[0_0_30px_rgba(255,107,53,0.35)] hover:shadow-[0_0_45px_rgba(255,107,53,0.55)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 group">
                <span className="relative z-10">{loading ? 'Verifying...' : 'Confirm Identity'}</span>
                <span className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); setMsg(''); }} className="w-full text-slate-600 text-sm hover:text-cyan-400 transition-colors">
                ← Back to Email
              </button>
            </form>
          )}

          {/* STEP 3 — Profile */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <InputField
                label="Full Name"
                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition-all duration-200"
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors">
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-9C6.268 3 2.478 5.943 1.203 10c1.275 4.057 5.065 7 9.797 7s8.522-2.943 9.797-7C19.522 5.943 15.732 3 12 3z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition-all duration-200 ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-500/50'
                        : confirmPassword && confirmPassword === password
                        ? 'border-cyan-400/50'
                        : 'border-white/10'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPass((v) => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors">
                    {showConfirmPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-9C6.268 3 2.478 5.943 1.203 10c1.275 4.057 5.065 7 9.797 7s8.522-2.943 9.797-7C19.522 5.943 15.732 3 12 3z" /></svg>
                    )}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-cyan-400">Passwords match</p>
                )}
              </div>

              <button disabled={loading} className="relative w-full overflow-hidden py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:shadow-[0_0_45px_rgba(34,211,238,0.55)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Initializing...</>
                  ) : (
                    <>Initialize Account <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>
          )}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-8 mb-5" />
          <p className="text-center text-sm text-slate-500">
            Already enrolled?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6 font-mono">SLIIT · SMART UNIVERSITY SYSTEM · v2.0</p>
      </div>
    </div>
  );
};

export default Register;