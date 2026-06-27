// Notifications Service API Endpoints Collection
// Purpose: Maps alerts fetching, unread counters, read updates, and deletion methods.
import apiClient from '../../../config/axios.js';

export const getNotifications = (params) => apiClient.get('/notifications', { params });
export const getUnreadCount = () => apiClient.get('/notifications/unread/count');
export const markAllRead = () => apiClient.patch('/notifications/read-all');
export const markRead = (id) => apiClient.patch(`/notifications/${id}/read`);
export const deleteNotification = (id) => apiClient.delete(`/notifications/${id}`);
