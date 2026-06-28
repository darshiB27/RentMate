// Redux UI slice
// Purpose: Handles global interface states such as sidebar visibility, theme settings, and modal controls.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: true,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
