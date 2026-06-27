// Property API Endpoint integrations
// Purpose: Connects properties lookup queries, searches, and creation methods.
import apiClient from '../../../config/axios.js';

export const getProperties = (params) => apiClient.get('/properties', { params });
export const getFeaturedProperties = (params) => apiClient.get('/search/featured', { params });
export const getTrendingProperties = (params) => apiClient.get('/properties/trending', { params });
export const getTrendingLocalities = (city) => apiClient.get('/search/trending', { params: { city } });
export const getPropertyById = (id) => apiClient.get(`/properties/${id}`);
export const searchProperties = (params, config = {}) => apiClient.get('/search', { params, ...config });
export const getFilterCounts = (params, config = {}) => apiClient.get('/search/filter-counts', { params, ...config });
export const getPropertySuggestions = (params, config = {}) => apiClient.get('/search/suggestions', { params, ...config });

export const createPropertyRequest = (data) => apiClient.post('/properties', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getOwnerPropertiesRequest = (params) => apiClient.get('/properties/me', { params });
export const updatePropertyRequest = (id, data) => apiClient.put(`/properties/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePropertyRequest = (id) => apiClient.delete(`/properties/${id}`);
export const updateAvailabilityRequest = (id, availabilityStatus) => apiClient.patch(`/properties/${id}/availability`, { availabilityStatus });

