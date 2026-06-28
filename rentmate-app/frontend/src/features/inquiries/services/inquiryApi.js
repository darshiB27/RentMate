// Inquiries endpoint mapping
// Purpose: Maps inquiry posts and lists calls.
import apiClient from '../../../config/axios.js';

export const postInquiry = (data) => apiClient.post('/inquiries', data);
export const getMyInquiries = (params) => apiClient.get('/inquiries/me', { params });
export const cancelInquiry = (id, notes) => apiClient.patch(`/inquiries/${id}/cancel`, { notes });
export const getInquiryStats = () => apiClient.get('/inquiries/stats/dashboard');
export const acceptInquiryRequest = (id, notes) => apiClient.patch(`/inquiries/${id}/accept`, { notes });
export const rejectInquiryRequest = (id, notes) => apiClient.patch(`/inquiries/${id}/reject`, { notes });
export const scheduleVisitRequest = (id, visitDate, notes) => apiClient.patch(`/inquiries/${id}/schedule`, { visitDate, notes });

