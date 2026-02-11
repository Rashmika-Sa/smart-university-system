import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. Get User Info from Local Storage
  const userString = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  // Parse user data safely
  const user = userString ? JSON.parse(userString) : null;

  // 2. Check if not logged in (No token or No user data)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Check if Role matches
  // If allowedRoles is provided, check if the user's role is in the list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a student tries to go to /admin-dashboard, send them to unauthorized or home
    return <Navigate to="/" replace />; 
  }

  // 4. If all checks pass, show the page (Outlet renders the child route)
  return <Outlet />;
};

export default ProtectedRoute;