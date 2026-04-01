import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const normalizedFormData = { ...formData, email: formData.email.trim().toLowerCase() };
      const response = await axios.post('/auth/login', normalizedFormData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      switch (user.role) {
        case 'admin': navigate('/admin-dashboard'); break;
        case 'canteen_admin': navigate('/canteen-dashboard'); break;
        case 'library_admin': navigate('/library-dashboard'); break;
        case 'shuttle_admin': navigate('/shuttle-dashboard'); break;
        case 'facility_admin': navigate('/facility-dashboard'); break;
        default: navigate('/student-dashboard');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">

      <div className="relative w-full max-w-md">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <img
            src="/sliit-official-logo.png"
            alt="SLIIT Logo"
            className="h-14 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">SLIIT Smart University Portal</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-mono tracking-widest uppercase">Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">

          {/* Scan line accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent mb-8" />

          <h2 className="text-xl font-bold text-white mb-1">Secure Login</h2>
          <p className="text-slate-500 text-sm mb-8">Enter your credentials to access the system</p>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="it12345678@my.sliit.lk"
                  autoComplete="username"
                  spellCheck={false}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm caret-white focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition-all duration-200"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm caret-white focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 outline-none transition-all duration-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3-9C6.268 3 2.478 5.943 1.203 10c1.275 4.057 5.065 7 9.797 7s8.522-2.943 9.797-7C19.522 5.943 15.732 3 12 3z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden py-3.5 rounded-xl font-bold text-sm text-white bg-accent shadow-[0_0_30px_rgba(255,107,53,0.35)] hover:shadow-[0_0_45px_rgba(255,107,53,0.55)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Authenticating...</>
                ) : (
                  <>Initiate Login <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                )}
              </span>
              <span className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-500">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </button>
            </p>
            <p className="text-sm text-slate-500">
              New to the system?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
              >
                Create Student Account
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6 font-mono">SLIIT · SMART UNIVERSITY SYSTEM · v2.0</p>
      </div>
    </div>
  );
};

export default Login;