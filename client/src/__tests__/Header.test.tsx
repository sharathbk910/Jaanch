/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { I18nProvider } from '../i18n/I18nContext.js';
import { AuthProvider } from '../lib/AuthContext.js';

function renderHeader() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('Header Component (Header.test.tsx)', () => {
  it('renders the header with exact Part G 53px height metric', () => {
    renderHeader();
    const header = screen.getByTestId('app-header');
    expect(header).toBeInTheDocument();
    expect(header.className).toContain('h-[53px]');
  });

  it('renders brand wordmark JAANCH with display accent', () => {
    renderHeader();
    const brandLink = screen.getByRole('link', { name: /JAANCH/i });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.getAttribute('href')).toBe('/');
  });

  it('renders all required desktop navigation links per Part G §4.1 & Decision D5', () => {
    renderHeader();
    const checkOfferLink = screen.getAllByRole('link', { name: /Check Offer/i })[0];
    const linkInspectorLink = screen.getAllByRole('link', { name: /Link Inspector/i })[0];
    const verificationGuideLink = screen.getAllByRole('link', { name: /Verification Guide/i })[0];
    const aboutLink = screen.getAllByRole('link', { name: /About/i })[0];

    expect(checkOfferLink).toHaveAttribute('href', '/analyze');
    expect(linkInspectorLink).toHaveAttribute('href', '/link-check');
    expect(verificationGuideLink).toHaveAttribute('href', '/resources'); // Decision D5
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('includes language switcher and authentication links', () => {
    renderHeader();
    expect(screen.getAllByRole('button', { name: 'EN' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'HI' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'KN' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Sign In/i })[0]).toHaveAttribute('href', '/login');
  });
});
