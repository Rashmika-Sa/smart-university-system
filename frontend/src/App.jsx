import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

import StudentDashboard from './pages/Student/StudentDashboard';
import CanteenSelection from './pages/Canteen/CanteenSelection';
import StudentMenu from './pages/Canteen/StudentMenu';
import Checkout from './pages/Canteen/Checkout';
import OrderHistory from './pages/Student/OrderHistory';
import CanteenReviews from './pages/Canteen/CanteenReviews';

import AdminDashboard from './pages/Admin/AdminDashboard';
import CanteenDashboard from './pages/Canteen/CanteenDashboard';
import CanteenAdminManagement from './pages/Canteen/CanteenAdminManagement';
import ShuttleDashboard from './pages/Shuttle/ShuttleDashboard';
import AcedmicSpaceDashboard from './pages/Academic/AcedmicSpaceDashboard';
import FacilityDashboard from './pages/Facility/FacilityDashboard';

import RegistrationList from './pages/Facilities/RegistrationList';
import RegistrationDetail from './pages/Facilities/RegistrationDetail';
import FacilityHome from './pages/Facilities/FacilityHome';
import ManageSpaces from './pages/Facilities/ManageSpaces';
import SpaceForm from './pages/Facilities/SpaceForm';
import NewBooking from './pages/Facilities/NewBooking';
import MyBookings from './pages/Facilities/MyBookings';
import FacilitiesCalendar from './pages/Facilities/FacilitiesCalendar';
import BookingRequests from './pages/Facilities/BookingRequests';
import StudentApplication from './pages/Facilities/StudentApplication';
import ApplicationReviews from './pages/Facilities/ApplicationReviews';

import LibraryDashboard from './pages/Library/LibraryDashboard';
import LibraryAdminDashboard from './pages/Library/LibraryAdminDashboard';
import LibraryStudentDashboard from './pages/Library/LibraryStudentDashboard';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './pages/Auth/AdminRoute';
import AppFooter from './components/AppFooter';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute allowedRoles={['facility_admin']} />}>
              <Route path="/facilities/spaces" element={<ManageSpaces />} />
              <Route path="/facilities/spaces/new" element={<SpaceForm />} />
              <Route path="/facilities/spaces/:id/edit" element={<SpaceForm />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['sports_council', 'facility_admin', 'admin']} />}>
              <Route path="/facilities/registrations" element={<RegistrationList />} />
              <Route path="/facilities/registrations/:id" element={<RegistrationDetail />} />
              <Route path="/facilities/booking-requests" element={<BookingRequests />} />
              <Route path="/facilities/application-reviews" element={<ApplicationReviews />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['team_captain', 'society']} />}>
              <Route path="/facilities/home" element={<FacilityHome />} />
              <Route path="/facilities/bookings" element={<MyBookings />} />
              <Route path="/facilities/bookings/new" element={<NewBooking />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['team_captain', 'society', 'facility_admin', 'student']} />}>
              <Route path="/facilities/calendar" element={<FacilitiesCalendar />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/facilities/application" element={<StudentApplication />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/my-orders" element={<OrderHistory />} />
              <Route path="/canteen-reviews" element={<CanteenReviews />} />
              <Route path="/canteen-selection" element={<CanteenSelection />} />
              <Route path="/canteen-menu/:canteenName" element={<StudentMenu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/canteen-dashboard" element={<CanteenDashboard />} />
              <Route path="/canteen-admin-management" element={<CanteenAdminManagement />} />
              <Route path="/shuttle-dashboard" element={<ShuttleDashboard />} />
              <Route path="/facility-dashboard" element={<FacilityDashboard />} />
              <Route path="/academic-space-dashboard" element={<AcedmicSpaceDashboard />} />
              <Route path="/library-dashboard" element={<LibraryDashboard />} />
              <Route path="/library-admin" element={<LibraryAdminDashboard />} />
              <Route path="/library-student" element={<LibraryStudentDashboard />} />
            </Route>

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
