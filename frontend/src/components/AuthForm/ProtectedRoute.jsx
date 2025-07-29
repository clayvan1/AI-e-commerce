import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not allowed, redirect to shop
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/Home" replace />;
  }

  // Authorized → render children
  return children;
};

export default ProtectedRoute;
