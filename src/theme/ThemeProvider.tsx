import { useMemo, useState, useCallback, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import type { ThemeOptions } from '@mui/material/styles';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { palette } from './palette';
import { shadows } from './shadows';
import { typography } from './typography';
import { customShadows } from './custom-shadows';
import { componentsOverrides } from './overrides';
import { ThemeContext, type ThemeMode } from './theme-context';

// Import type augmentations
import './types';

// ----------------------------------------------------------------------

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'light';
  });

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  }, []);

  const handleSetThemeMode = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
  }, []);

  const theme = useMemo(() => {
    const themeOptions: ThemeOptions = {
      palette: {
        ...palette(themeMode),
        mode: themeMode,
      },
      customShadows: customShadows(themeMode),
      shadows: shadows(themeMode),
      shape: { borderRadius: 8 },
      typography,
    };

    const baseTheme = createTheme(themeOptions);
    
    // Get component overrides - cast to any to avoid MUI's strict typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overrides = componentsOverrides(baseTheme as any) as any;
    
    // Create final theme with overrides
    return createTheme(baseTheme, { components: overrides });
  }, [themeMode]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      toggleThemeMode,
      setThemeMode: handleSetThemeMode,
    }),
    [themeMode, toggleThemeMode, handleSetThemeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
