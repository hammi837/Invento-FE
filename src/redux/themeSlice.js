import { createSlice } from '@reduxjs/toolkit';

const THEMES = {
  light: {
    key: 'light',
    label: 'Light',
    icon: '☀️',
  },
  dark: {
    key: 'dark',
    label: 'Dark',
    icon: '🌙',
  },
  orange: {
    key: 'orange',
    label: 'Sunset',
    icon: '🔥',
  },
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    current: localStorage.getItem('invento-theme') || 'light',
    themes: THEMES,
  },
  reducers: {
    setTheme: (state, action) => {
      state.current = action.payload;
      localStorage.setItem('invento-theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    initializeTheme: (state) => {
      const savedTheme = localStorage.getItem('invento-theme') || 'light';
      state.current = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    },
  },
});

export const { setTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
