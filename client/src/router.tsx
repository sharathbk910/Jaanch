import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Shell } from './components/layout/Shell.js';
import { LandingPage } from './pages/LandingPage.js';
import { AnalyzePage } from './pages/AnalyzePage.js';
import { ResultsPage, SamplePage, LinkCheckPage } from './pages/ResultsPage.js';
import { ResourcesPage, AboutPage, PrivacyPage, NotFoundPage } from './pages/StaticPages.js';
import {
  LoginPage,
  SignupPage,
  HistoryPage,
  SettingsPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  LogoutPage,
  ProtectedRoute,
} from './pages/AuthPages.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'analyze', element: <AnalyzePage /> },
      { path: 'results/:id', element: <ResultsPage /> },
      { path: 'results/local', element: <ResultsPage /> },
      { path: 'sample', element: <SamplePage /> },
      { path: 'link-check', element: <LinkCheckPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'dashboard', element: <ProtectedRoute><HistoryPage /></ProtectedRoute> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'logout', element: <LogoutPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

