<<<<<<< Updated upstream
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
>>>>>>> Stashed changes

// 1. Import Public Pages
import Home from "./pages/Home";

// 2. Import Auth & Dashboards
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// 3. Import Student Pages
import StudentDashboard from "./pages/Student/StudentDashboard";
import CanteenSelection from "./pages/Canteen/CanteenSelection";
import StudentMenu from "./pages/Canteen/StudentMenu";
import Checkout from "./pages/Canteen/Checkout";
import OrderHistory from "./pages/Student/OrderHistory";
import CanteenReviews from "./pages/Canteen/CanteenReviews";

// 4. Import Admin & Manager Dashboards
<<<<<<< HEAD
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CanteenDashboard from "./pages/Canteen/CanteenDashboard";
import CanteenAdminManagement from "./pages/Canteen/CanteenAdminManagement";
import ShuttleDashboard from "./pages/Shuttle/ShuttleDashboard";
import AcedmicSpaceDashboard from "./pages/Academic/AcedmicSpaceDashboard";
import FacilityDashboard from "./pages/Facility/FacilityDashboard";
import RegistrationList from "./pages/Facilities/RegistrationList";
import RegistrationDetail from "./pages/Facilities/RegistrationDetail";
import FacilityHome from "./pages/Facilities/FacilityHome";
import ManageSpaces from "./pages/Facilities/ManageSpaces";
import SpaceForm from "./pages/Facilities/SpaceForm";
import NewBooking from "./pages/Facilities/NewBooking";
import MyBookings from "./pages/Facilities/MyBookings";
import FacilitiesCalendar from "./pages/Facilities/FacilitiesCalendar";
import BookingRequests from "./pages/Facilities/BookingRequests";
import StudentApplication from "./pages/Facilities/StudentApplication";
import ApplicationReviews from "./pages/Facilities/ApplicationReviews";
=======
import AdminDashboard from './pages/Admin/AdminDashboard';
import CanteenDashboard from './pages/Canteen/CanteenDashboard';
import CanteenAdminManagement from './pages/Canteen/CanteenAdminManagement'; 
import ShuttleDashboard from './pages/Shuttle/ShuttleDashboard';
<<<<<<< Updated upstream
import LibraryDashboard from './pages/Library/LibraryDashboard';
=======
>>>>>>> Stashed changes
import FacilityDashboard from './pages/Facility/FacilityDashboard';
>>>>>>> main

<<<<<<< Updated upstream
// 5. Import Route Protectors
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./pages/Auth/AdminRoute";
import AppFooter from "./components/AppFooter";
=======
// 5. Import Library Pages
import LibraryDashboard        from './pages/Library/LibraryDashboard';
import LibraryStudentDashboard from './pages/Library/LibraryStudentDashboard';
import LibraryAdminDashboard   from './pages/Library/LibraryAdminDashboard';

// 6. Import Route Protectors
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './pages/Auth/AdminRoute';
import AppFooter from './components/AppFooter';
>>>>>>> Stashed changes

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

            {/* Facilities — facility_admin only */}
            <Route element={<ProtectedRoute allowedRoles={["facility_admin"]} />}>
              <Route path="/facilities/spaces" element={<ManageSpaces />} />
              <Route path="/facilities/spaces/new" element={<SpaceForm />} />
              <Route path="/facilities/spaces/:id/edit" element={<SpaceForm />} />
            </Route>

            {/* Facilities — reviewers */}
            <Route element={<ProtectedRoute allowedRoles={["sports_council", "facility_admin", "admin"]} />}>
              <Route path="/facilities/registrations" element={<RegistrationList />} />
              <Route path="/facilities/registrations/:id" element={<RegistrationDetail />} />
              <Route path="/facilities/booking-requests" element={<BookingRequests />} />
              <Route path="/facilities/application-reviews" element={<ApplicationReviews />} />
            </Route>

            {/* Facilities — bookers */}
            <Route element={<ProtectedRoute allowedRoles={["team_captain", "society"]} />}>
              <Route path="/facilities/home" element={<FacilityHome />} />
              <Route path="/facilities/bookings" element={<MyBookings />} />
              <Route path="/facilities/bookings/new" element={<NewBooking />} />
            </Route>

            {/* Facilities — calendar (all authenticated users except sports_council) */}
            <Route element={<ProtectedRoute allowedRoles={["team_captain", "society", "facility_admin", "student"]} />}>
              <Route path="/facilities/calendar" element={<FacilitiesCalendar />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/facilities/application" element={<StudentApplication />} />
            </Route>

            {/* --- PROTECTED ROUTES (Requires Login) --- */}
            <Route element={<ProtectedRoute />}>
              {/* Student Routes */}
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/my-orders" element={<OrderHistory />} />
              <Route path="/canteen-reviews" element={<CanteenReviews />} />
<<<<<<< Updated upstream
              {/*Canteen Flow for Students */}
=======
              
              {/* Canteen Flow for Students */}
>>>>>>> Stashed changes
              <Route path="/canteen-selection" element={<CanteenSelection />} />
              <Route path="/canteen-menu/:canteenName" element={<StudentMenu />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Canteen Manager */}
              <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
              {/* Canteen Super Admin - Manage Admins */}
              <Route path="/canteen-admin-management" element={<CanteenAdminManagement />} />
              {/* Other Service Managers */}
              <Route path="/shuttle-dashboard" element={<ShuttleDashboard />} />
<<<<<<< Updated upstream
<<<<<<< HEAD
              <Route path="/academic-space-dashboard" element={<AcedmicSpaceDashboard />} />
              {/* <Route path="/facility-dashboard" element={<FacilityDashboard />} /> */}
=======
              <Route path="/library-dashboard" element={<LibraryDashboard />} />
              <Route path="/facility-dashboard" element={<FacilityDashboard />} />
              
>>>>>>> main
=======
              <Route path="/facility-dashboard" element={<FacilityDashboard />} />

              {/* Library Routes */}
              <Route path="/library-dashboard" element={<LibraryDashboard />} />
              <Route path="/library-student"   element={<LibraryStudentDashboard />} />
              <Route path="/library-admin"     element={<LibraryAdminDashboard />} />

>>>>>>> Stashed changes
            </Route>

            {/* SYSTEM ADMIN ONLY */}
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
