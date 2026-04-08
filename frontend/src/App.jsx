import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// 1. Import Public Pages
import Home from './pages/Home';

// 2. Import Auth & Dashboards
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// 3. Import Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import CanteenSelection from './pages/Canteen/CanteenSelection'; 
import StudentMenu from './pages/Canteen/StudentMenu'; 
import Checkout from './pages/Canteen/Checkout';
import OrderHistory from './pages/Student/OrderHistory';
import CanteenReviews from './pages/Canteen/CanteenReviews';
import StudentShuttleDashboard from './pages/Shuttle/StudentShuttleDashboard';

// 4. Import Admin & Manager Dashboards
import AdminDashboard from './pages/Admin/AdminDashboard';
import CanteenDashboard from './pages/Canteen/CanteenDashboard';
import CanteenAdminManagement from './pages/Canteen/CanteenAdminManagement'; 
import ShuttleDashboard from './pages/Shuttle/ShuttleDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import FacilityDashboard from './pages/Facility/FacilityDashboard';

// 5. Import Route Protectors
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './pages/Auth/AdminRoute';
import AppFooter from './components/AppFooter';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* --- PROTECTED ROUTES (Requires Login) --- */}
            <Route element={<ProtectedRoute />}>
              
              {/* Student Routes */}
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/my-orders" element={<OrderHistory />} />
              <Route path="/canteen-reviews" element={<CanteenReviews />} />

    
              
              {/*Canteen Flow for Students */}
              <Route path="/canteen-selection" element={<CanteenSelection />} />
              <Route path="/canteen-menu/:canteenName" element={<StudentMenu />} /> {/* 👈 Updated to be dynamic */}
              <Route path="/checkout" element={<Checkout />} />

              {/* Canteen Manager */}
              <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
              
              {/* Canteen Super Admin - Manage Admins */}
              <Route path="/canteen-admin-management" element={<CanteenAdminManagement />} />
              
              {/* Shuttle*/}
              <Route path="/student-shuttle-dashboard" element={<StudentShuttleDashboard />} />
              <Route path="/shuttle-dashboard" element={<ShuttleDashboard />} />
              {/* Other Service Managers */}
              
              <Route path="/library-dashboard" element={<LibraryDashboard />} />
              <Route path="/facility-dashboard" element={<FacilityDashboard />} />
              
            </Route>

            {/* SYSTEM ADMIN ONLY  */}
            <Route element={<AdminRoute />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

          </Routes>
        </div>
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;