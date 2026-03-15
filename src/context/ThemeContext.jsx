import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();
const STORAGE_KEY = 'theme';

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(STORAGE_KEY);
      return storedTheme === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [isDark, theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      setTheme
    }),
    [theme, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
