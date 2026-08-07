import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * Premium black theme — dark only. The provider forces the `dark` class on
 * mount so every component's dark: styles apply. No light mode, no toggle.
 */
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <ThemeContext.Provider value={{ theme: 'dark' }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
