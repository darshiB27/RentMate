// Auth Service client endpoints calls
// Purpose: Maps login, register, and refresh requests to axios clients.
import apiClient from '../../../config/axios.js';

export const loginRequest = (data) => apiClient.post('/auth/login', data);
export const registerRequest = (data) => apiClient.post('/auth/register', data);
export const forgotPasswordRequest = (data) => apiClient.post('/auth/forgot-password', data);
export const resetPasswordRequest = (data) => apiClient.post('/auth/reset-password', data);
export const logoutRequest = () => apiClient.post('/auth/logout');
export const updateProfileRequest = (data) => apiClient.patch('/auth/profile', data);

