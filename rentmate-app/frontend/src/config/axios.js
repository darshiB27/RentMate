// Custom Axios Instance config
// Purpose: Configures API base URL, triggers credential cookie forwarding, and mounts refresh token interceptors.
import axios from 'axios';
import { store } from '../store/store.js';
import { logout } from '../features/auth/authSlice.js';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
});

// Request Interceptor: Attach the JWT token from Redux store
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized errors to auto-logout
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout the user if unauthorized/token expired
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

