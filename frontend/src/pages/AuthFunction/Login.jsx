import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/auth/login', formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Login Success:', user);

      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'canteen_admin':
          navigate('/canteen-dashboard');
          break;
        case 'library_admin':
          navigate('/library-dashboard');
          break;
        case 'shuttle_admin':
          navigate('/shuttle-dashboard');
          break;
        case 'facility_admin':
          navigate('/facility-dashboard');
          break;
        default:
          navigate('/student-dashboard');
      }

    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        <div className="bg-[#0f172a] p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">System Login</h2>
          <p className="text-gray-400 text-sm">Access the SLIIT Management Portal</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* 1. Added autoComplete="off" to the form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Ex: it123@my.sliit.lk OR canteen@sliit.lk"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                value={formData.email}
                onChange={handleChange}
                required
                // 2. Disable autocomplete for email
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                value={formData.password}
                onChange={handleChange}
                required
                // 3. Disable autocomplete for password (new-password trick works best)
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-blue-900 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Secure Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            First time here?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create Student Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;