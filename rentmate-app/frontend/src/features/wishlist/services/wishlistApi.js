// Wishlist Service API Endpoints Collection
// Purpose: Connects wishlist additions, removals, and active checks to the axios client.
import apiClient from '../../../config/axios.js';

export const toggleWishlist = (propertyId) => apiClient.patch(`/wishlist/toggle/${propertyId}`);
export const getUserWishlist = (params) => apiClient.get('/wishlist/me', { params });
export const checkIsWishlisted = (propertyId) => apiClient.get(`/wishlist/check/${propertyId}`);
export const getPropertyWishlistCount = (propertyId) => apiClient.get(`/wishlist/count/${propertyId}`);
