import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  // 1. Check if logged in
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  // 2. Check if user is actually an ADMIN
  if (user.role !== 'admin') {
    // If a student tries to enter, kick them to Student Dashboard
    return <Navigate to="/student-dashboard" replace />;
  }

  // 3. Access Granted
  return <Outlet />;
};

export default AdminRoute;