import React from 'react';
import { Navigate } from 'react-router-dom';

const LibraryDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'library_admin' || user.role === 'admin')
    return <Navigate to="/library-admin" replace />;
  return <Navigate to="/library-student" replace />;
};

export default LibraryDashboard;
