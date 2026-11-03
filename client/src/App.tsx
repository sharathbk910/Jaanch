import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext.js';
import { ThemeProvider } from './theme/ThemeContext.js';
import { AuthProvider } from './lib/AuthContext.js';
import { ErrorBoundary } from './components/layout/ErrorBoundary.js';
import { router } from './router.js';
import { apiClient } from './lib/apiClient.js';

export function App() {
  useEffect(() => {
    // Initiate silent background warmup so Render backend wakes up before user submits
    apiClient.warmupBackend();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
