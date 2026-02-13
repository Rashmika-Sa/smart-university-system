import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import Public Pages
import Home from './pages/Home';

// 2. Import Auth & Dashboards
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/StudentDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

// 3. Import Sub-Admin Dashboards (The new ones you created)
import CanteenDashboard from './pages/Canteen/CanteenDashboard';
import ShuttleDashboard from './pages/Shuttle/ShuttleDashboard';
import AcedmicSpaceDashboard from './pages/Academic/AcedmicSpaceDashboard';
import FacilityDashboard from './pages/Facility/FacilityDashboard';

// 4. Import Route Protectors
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './pages/Auth/AdminRoute';

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

       
        {/* Only the main 'admin' role can enter here */}
        <Route element={<AdminRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* --- SUB-ADMINS (Service Managers) --- */}
        {/* For now, we use ProtectedRoute. Later we can add specific checks if needed. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
          <Route path="/shuttle-dashboard" element={<ShuttleDashboard />} />
          <Route path="/academic-space-dashboard" element={<AcedmicSpaceDashboard />} />
          <Route path="/facility-dashboard" element={<FacilityDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;