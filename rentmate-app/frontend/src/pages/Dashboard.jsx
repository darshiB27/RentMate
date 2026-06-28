// User Dashboard Home
// Purpose: Displays list actions, inquiries statistics, analytics graphs, or wishlists matching active user roles.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLE_DASHBOARDS } from '../constants/roles.js';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  if (user && user.role) {
    return <Navigate to={ROLE_DASHBOARDS[user.role] || '/'} replace />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Your Account Dashboard</h1>
      <p className="text-gray-500">Configure listings, reviews, and inquiries analytics.</p>
    </div>
  );
}

