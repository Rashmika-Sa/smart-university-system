import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Update Imports to point to the new 'AuthFunction' folder
import Login from './pages/AuthFunction/Login';
import Register from './pages/AuthFunction/Register';
import AdminDashboard from './pages/AuthFunction/AdminDashboard';
import StaffDashboard from './pages/AuthFunction/StaffDashboard';
import StudentDashboard from './pages/AuthFunction/StudentDashboard';

import Home from './pages/Home'; // Keep this one normal if you didn't move it
import ProtectedRoute from './components/ProtectedRoute'; // Keep components separate
import AdminRoute from "./pages/AuthFunction/AdminRoute";
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🛡️ ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* 👨‍🏫 STAFF ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
        </Route>

        {/* 🎓 STUDENT ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'staff', 'admin']} />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* 🔐 Admin Routes (Only Admin can enter) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>

      </Routes>
    </Router>
  );
}

export default App;