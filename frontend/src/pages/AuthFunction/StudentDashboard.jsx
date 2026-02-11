import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
       <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">🎓 Student Dashboard</h1>
        <button onClick={handleLogout} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Logout</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">My Labs</h2>
        <p className="text-gray-600">Welcome, Student. Book labs and check availability here.</p>
      </div>
    </div>
  );
};

export default StudentDashboard;