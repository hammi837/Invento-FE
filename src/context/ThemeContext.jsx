import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
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

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('invento-theme') ?? 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('invento-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
