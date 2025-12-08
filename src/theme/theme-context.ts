import { createContext, useContext } from 'react';

// ----------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
}
