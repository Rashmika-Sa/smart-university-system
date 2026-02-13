import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import Public Pages
import Home from './pages/Home';

// 2. Import Auth & Dashboards (from AuthFunction folder)
import Login from './pages/AuthFunction/Login';
import Register from './pages/AuthFunction/Register';
import StudentDashboard from './pages/AuthFunction/StudentDashboard';
import AdminDashboard from './pages/AuthFunction/AdminDashboard';

// 3. Import Sub-Admin Dashboards (The new ones you created)
import CanteenDashboard from './pages/AuthFunction/CanteenDashboard';
import ShuttleDashboard from './pages/AuthFunction/ShuttleDashboard';
import LibraryDashboard from './pages/AuthFunction/LibraryDashboard';
import FacilityDashboard from './pages/AuthFunction/FacilityDashboard';

// 4. Import Route Protectors
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './pages/AuthFunction/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- STUDENT ROUTES --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* --- SYSTEM ADMIN (The Boss) --- */}
        {/* Only the main 'admin' role can enter here */}
        <Route element={<AdminRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* --- SUB-ADMINS (Service Managers) --- */}
        {/* For now, we use ProtectedRoute. Later we can add specific checks if needed. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
          <Route path="/shuttle-dashboard" element={<ShuttleDashboard />} />
          <Route path="/library-dashboard" element={<LibraryDashboard />} />
          <Route path="/facility-dashboard" element={<FacilityDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;