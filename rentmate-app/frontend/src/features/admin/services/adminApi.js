// Admin Service API Endpoints Collection
// Purpose: Maps user and property listing management queries, approval updates, and statistics aggregations.
import apiClient from '../../../config/axios.js';

export const getDashboardStats = (params) => apiClient.get('/admin/dashboard', { params });
export const getUsers = (params) => apiClient.get('/admin/users', { params });
export const getProperties = (params) => apiClient.get('/admin/properties', { params });

export const verifyOwner = (id) => apiClient.patch(`/admin/users/${id}/verify-owner`);
export const blockUser = (id) => apiClient.patch(`/admin/users/${id}/block`);
export const unblockUser = (id) => apiClient.patch(`/admin/users/${id}/unblock`);
export const softDeleteUser = (id) => apiClient.delete(`/admin/users/${id}`);

export const approveProperty = (id) => apiClient.patch(`/admin/properties/${id}/approve`);
export const rejectProperty = (id, reason) => apiClient.patch(`/admin/properties/${id}/reject`, { reason });
export const softDeleteProperty = (id) => apiClient.delete(`/admin/properties/${id}`);
