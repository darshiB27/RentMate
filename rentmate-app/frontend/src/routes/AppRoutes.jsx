// Application core client routers setup
// Purpose: Mounts public and private routes, loading paths matching root shells.
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { ROLES } from '../constants/roles.js';

// Page Imports
import Home from '../pages/Home.jsx';
import SearchResults from '../pages/SearchResults.jsx';
import PropertyList from '../pages/PropertyList.jsx';
import PropertyDetails from '../pages/PropertyDetails.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import NotFound from '../pages/NotFound.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import GoogleSuccessCallback from '../pages/GoogleSuccessCallback.jsx';
import WishlistPage from '../pages/WishlistPage.jsx';
import MyInquiries from '../pages/MyInquiries.jsx';
import Notifications from '../pages/Notifications.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import ManageUsers from '../pages/ManageUsers.jsx';
import ManageProperties from '../pages/ManageProperties.jsx';
import Reports from '../pages/Reports.jsx';
import TenantDashboard from '../pages/TenantDashboard.jsx';
import Profile from '../pages/Profile.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import OwnerDashboard from '../pages/OwnerDashboard.jsx';
import MyProperties from '../pages/MyProperties.jsx';
import AddProperty from '../pages/AddProperty.jsx';
import EditProperty from '../pages/EditProperty.jsx';
import PropertyAnalytics from '../pages/PropertyAnalytics.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>


      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleSuccessCallback />} />
      </Route>


      {/* Generic dashboard router */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Tenant Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/wishlist" element={<WishlistPage />} />
        <Route path="/tenant/inquiries" element={<MyInquiries />} />
        <Route path="/tenant/notifications" element={<Notifications />} />
        <Route path="/tenant/profile" element={<Profile />} />
      </Route>

      {/* Shared Chat Route */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.TENANT, ROLES.OWNER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Owner Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/properties" element={<MyProperties />} />
        <Route path="/owner/properties/add" element={<AddProperty />} />
        <Route path="/owner/properties/edit/:id" element={<EditProperty />} />
        <Route path="/owner/analytics" element={<PropertyAnalytics />} />
        <Route path="/owner/inquiries" element={<OwnerDashboard />} />
        <Route path="/owner/notifications" element={<Notifications />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/properties" element={<ManageProperties />} />
        <Route path="/admin/analytics" element={<Reports />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

