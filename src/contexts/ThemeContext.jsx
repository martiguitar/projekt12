import { createContext, useContext } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

// Create Emotion cache
const cache = createCache({
  key: 'css',
  prepend: true,
});

export function ThemeProvider({ children }) {
  const theme = createTheme({
    typography: {
      fontFamily: 'GeistSans, sans-serif',
    },
    palette: {
      mode: 'dark',
      primary: {
        main: '#ffa726',
      },
      background: {
        default: '#1a1c23',
        paper: '#232936',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
  });

  const value = {
    darkMode: true
  };

  return (
    <CacheProvider value={cache}>
      <ThemeContext.Provider value={value}>
        <MUIThemeProvider theme={theme}>
          {children}
        </MUIThemeProvider>
      </ThemeContext.Provider>
    </CacheProvider>
  );
}
