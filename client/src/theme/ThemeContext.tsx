import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export const THEME_STORAGE_KEY = 'jaanch_theme';

export const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // Storage unavailable
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Storage error
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      const next = theme === 'system' ? 'light' : theme;
      setResolvedTheme(next);
      applyTheme(next);
      return;
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
          const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
          setResolvedTheme(nextResolved);
          applyTheme(nextResolved);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemChange);
      }

      const nextResolved = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(nextResolved);
      applyTheme(nextResolved);

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemChange);
        }
      };
    } catch {
      const next = theme === 'system' ? 'light' : theme;
      setResolvedTheme(next);
      applyTheme(next);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: () => {},
    };
  }
  return context;
};
