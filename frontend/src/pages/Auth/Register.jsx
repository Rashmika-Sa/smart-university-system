import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { FaUserGraduate, FaEnvelope, FaLock, FaKey, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  
  const navigate = useNavigate();

  // --- HANDLERS ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await axios.post('/auth/send-code', { email });
      setStep(2);
      setMsg(`Code sent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/auth/verify-code', { email, code: otp });
      setStep(3);
      setMsg('Email verified! Please complete your profile.');
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', { name, email, password, role: 'student' });
      
      // Auto Login
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Registration Successful!');
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary relative overflow-hidden">
      
      {/* Subtle Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 shadow-sm">
            <FaUserGraduate className="text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Student Portal</h2>
          <p className="text-gray-500 text-sm mt-1">Join the Smart University System</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-6 relative">
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-gray-200 -z-10 rounded"></div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 
              ${step >= num ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
              {num}
            </div>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center text-sm border border-red-100 flex items-center justify-center gap-2">
            <FaExclamationCircle /> {error}
          </div>
        )}
        {msg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-center text-sm border border-green-100 flex items-center justify-center gap-2">
            <FaCheckCircle /> {msg}
          </div>
        )}

        {/* --- STEP 1: EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full bg-secondary border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="itXXXXXX@my.sliit.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5 flex items-center justify-center gap-2">
              {loading ? 'Sending...' : <>Send Verification Code <FaArrowRight /></>}
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 6-Digit Code</label>
              <div className="relative">
                <FaKey className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="w-full bg-secondary border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-800 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">Check your inbox (and spam folder)</p>
            </div>
            <button disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-primary transition mt-2">
              Back to Email
            </button>
          </form>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <FaUserGraduate className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full bg-secondary border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full bg-secondary border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {/* Final Register Button - Uses Orange Accent for maximum pop! */}
            <button disabled={loading} className="w-full bg-accent hover:bg-[#E85A28] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5">
              {loading ? 'Registering...' : 'Initialize Account'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;