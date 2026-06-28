// Analytics Service API Endpoints Collection
// Purpose: Maps owner and admin platform-wide analytics queries to the axios client.
import apiClient from '../../../config/axios.js';

export const getOwnerAnalytics = (params) => apiClient.get('/analytics/owner', { params });
