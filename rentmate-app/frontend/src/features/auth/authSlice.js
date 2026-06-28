// Redux Auth Slice definitions
// Purpose: Stores current verified user models and transient JWT tokens in memory state.
import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('rentmate_user');
const tokenFromStorage = localStorage.getItem('rentmate_token');

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('rentmate_user', JSON.stringify(action.payload.user));
      localStorage.setItem('rentmate_token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('rentmate_user');
      localStorage.removeItem('rentmate_token');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('rentmate_user', JSON.stringify(state.user));
      }
    }
  }
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

