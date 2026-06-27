// Authentication routing shield
// Purpose: Guards dashboard routes from non-logged-in users.
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLE_DASHBOARDS } from '../constants/roles.js';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    // Redirect to login, saving the original path to navigate back afterwards
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's default role dashboard if unauthorized
    const defaultDashboard = ROLE_DASHBOARDS[user.role] || '/';
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
}

