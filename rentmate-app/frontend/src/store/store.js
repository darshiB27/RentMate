// Redux global store configurations
// Purpose: Registers individual slices and hooks up middlewares.
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import uiReducer from './uiSlice.js';
import notificationReducer from '../features/notifications/notificationSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
});

