import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import Public Pages
import Home from './pages/Home';

// 2. Import Auth & Dashboards
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// 3. Import Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import CanteenSelection from './pages/Canteen/CanteenSelection'; // 👈 Import Selection Page
import StudentMenu from './pages/Canteen/StudentMenu'; 
import Checkout from './pages/Canteen/Checkout';

// 4. Import Admin & Manager Dashboards
import AdminDashboard from './pages/Admin/AdminDashboard';
import CanteenDashboard from './pages/Canteen/CanteenDashboard';
import CanteenAdminManagement from './pages/Canteen/CanteenAdminManagement'; // 👈 New Super Admin Page
import ShuttleDashboard from './pages/Shuttle/ShuttleDashboard';
import AcedmicSpaceDashboard from './pages/Academic/AcedmicSpaceDashboard';
import FacilityDashboard from './pages/Facility/FacilityDashboard';

// 5. Import Route Protectors
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

        {/* --- PROTECTED ROUTES (Requires Login) --- */}
        <Route element={<ProtectedRoute />}>
          
          {/* 🎓 Student Routes */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          
          {/* 👇 Canteen Flow for Students */}
          <Route path="/canteen-selection" element={<CanteenSelection />} />
          <Route path="/canteen-menu/:canteenName" element={<StudentMenu />} /> {/* 👈 Updated to be dynamic */}
          <Route path="/checkout" element={<Checkout />} />

          {/* 🍔 Canteen Manager */}
          <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
          
          {/* 🍔 Canteen Super Admin - Manage Admins */}
          <Route path="/canteen-admin-management" element={<CanteenAdminManagement />} />

          {/* 🚌 Other Service Managers */}
          <Route path="/shuttle-dashboard" element={<ShuttleDashboard />} />
          <Route path="/academic-space-dashboard" element={<AcedmicSpaceDashboard />} />
          <Route path="/facility-dashboard" element={<FacilityDashboard />} />
          
        </Route>

        {/* --- SYSTEM ADMIN ONLY --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;