// Localities queries integrations
// Purpose: Integrates trending/featured localities query lookups.
import apiClient from '../../../config/axios.js';
export const getTrendingLocalities = () => apiClient.get('/localities/trending');
