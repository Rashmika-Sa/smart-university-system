import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const CanteenAdminManagement = () => {
  const navigate = useNavigate();
  
  // 👤 User checking
  const [userInfo, setUserInfo] = useState(null);
  
  // 📦 Data States
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 📋 Form States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    managedCanteen: ''
  });

  const canteenOptions = [
    '',
    'Main Canteen',
    'Birdnest Canteen',
    'Perera & Sons (P&S)',
    'Barista'
  ];

  // 🔄 Initialize and check permissions
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is super admin (canteen_admin with no managedCanteen)
    if (user.role !== 'canteen_admin' || user.managedCanteen) {
      alert('Access Denied: Only super admin can manage canteen admins');
      navigate('/canteen-dashboard');
      return;
    }

    setUserInfo(user);
    fetchAdmins();
  }, [navigate]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/auth/canteen-admin/all', {
        headers: { 'x-auth-token': token }
      });
      setAdmins(response.data);
      setError('');
      setLoading(false);
    } catch (err) {
      setError('Failed to load admins: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        // Update existing admin
        await axios.put(
          `/auth/canteen-admin/${editingId}`,
          { managedCanteen: formData.managedCanteen || null },
          { headers: { 'x-auth-token': token } }
        );
        alert('Admin updated successfully!');
      } else {
        // Create new admin
        await axios.post(
          '/auth/canteen-admin/create',
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            managedCanteen: formData.managedCanteen || null
          },
          { headers: { 'x-auth-token': token } }
        );
        alert('Admin created successfully!');
      }

      // Reset form and refresh
      setFormData({ name: '', email: '', password: '', managedCanteen: '' });
      setShowForm(false);
      setEditingId(null);
      fetchAdmins();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin._id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      managedCanteen: admin.managedCanteen || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/auth/canteen-admin/${id}`, {
        headers: { 'x-auth-token': token }
      });
      alert('Admin deleted successfully!');
      fetchAdmins();
    } catch (err) {
      alert('Error deleting admin: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', managedCanteen: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* TOP BAR */}
      <div className="bg-[#002147] sticky top-0 z-40 shadow-xl border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2.5 rounded-xl text-[#002147] shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h1 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Super Admin</h1>
              <h2 className="text-white text-xl font-bold">Canteen Admin Management</h2>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-red-300 hover:text-white hover:bg-red-500/20 px-5 py-2.5 rounded-xl transition border border-transparent hover:border-red-500/30"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Button & Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-3xl font-bold text-[#002147]">Manage Canteen Admins</h3>
            <p className="text-slate-500 mt-1">Create and assign admins to specific canteens</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#002147] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition shadow-lg"
          >
            + Create Admin
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
            <h4 className="text-2xl font-bold text-[#002147] mb-6">
              {editingId ? 'Edit Admin' : 'Create New Admin'}
            </h4>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Admin Name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] outline-none transition"
                  disabled={editingId !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@sliit.lk"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] outline-none transition"
                  disabled={editingId !== null}
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Strong password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Managed Canteen</label>
                <select
                  name="managedCanteen"
                  value={formData.managedCanteen}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002147] outline-none transition"
                >
                  {canteenOptions.map((canteen) => (
                    <option key={canteen} value={canteen}>
                      {canteen === '' ? 'Super Admin (All Canteens)' : canteen}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Leave empty for super admin access</p>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  {editingId ? 'Update Admin' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ADMINS LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-12 h-12 border-4 border-blue-900 border-t-amber-400 rounded-full animate-spin mb-4"></div>
            <p className="animate-pulse font-medium">Loading admins...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            <p className="font-bold">Error loading admins</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {admins.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <p className="text-slate-500">No canteen admins created yet.</p>
              </div>
            ) : (
              admins.map((admin) => (
                <div key={admin._id} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-[#002147]">{admin.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">{admin.email}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          {admin.managedCanteen ? `Manages: ${admin.managedCanteen}` : 'Super Admin'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-bold hover:bg-amber-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenAdminManagement;
