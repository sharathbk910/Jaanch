/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { Shell } from '../components/layout/Shell.js';
import { LandingPage } from '../pages/LandingPage.js';
import { AnalyzePage } from '../pages/AnalyzePage.js';
import { ResultsPage, SamplePage, LinkCheckPage } from '../pages/ResultsPage.js';
import { ResourcesPage, AboutPage, PrivacyPage, NotFoundPage } from '../pages/StaticPages.js';
import { LoginPage, SignupPage, HistoryPage, SettingsPage } from '../pages/AuthPages.js';
import { I18nProvider } from '../i18n/I18nContext.js';
import { AuthProvider } from '../lib/AuthContext.js';

const testRoutes = [
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
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(testRoutes, {
    initialEntries: [initialEntry],
  });

  return render(
    <I18nProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nProvider>
  );
}

describe('Application Routing (Decision D5)', () => {
  it('renders LandingPage at "/"', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { level: 1, name: /Know it's real/i })).toBeInTheDocument();
  });

  it('renders AnalyzePage at "/analyze"', () => {
    renderRoute('/analyze');
    expect(screen.getByRole('heading', { level: 1, name: /Verify Offer Legitimacy/i })).toBeInTheDocument();
  });

  it('renders ResultsPage at "/results/local"', () => {
    renderRoute('/results/local');
    expect(screen.getByText('LOCAL GUEST AUDIT')).toBeInTheDocument();
  });

  it('renders ResultsPage at "/results/123"', () => {
    renderRoute('/results/123');
    expect(screen.getByText(/SAVED AUDIT \/ 123/i)).toBeInTheDocument();
  });

  it('renders SamplePage at "/sample"', () => {
    renderRoute('/sample');
    expect(screen.getByRole('heading', { level: 1, name: /Sample Report/i })).toBeInTheDocument();
  });

  it('renders LinkCheckPage at "/link-check"', () => {
    renderRoute('/link-check');
    expect(screen.getByRole('heading', { level: 1, name: /Link Inspector/i })).toBeInTheDocument();
  });

  it('renders ResourcesPage at "/resources"', () => {
    renderRoute('/resources');
    expect(screen.getByRole('heading', { level: 1, name: /Official Verification Resources/i })).toBeInTheDocument();
  });

  it('renders NotFoundPage at unmatched route "*"', () => {
    renderRoute('/some-unknown-path');
    expect(screen.getByText('404 / NOT FOUND')).toBeInTheDocument();
  });
});
