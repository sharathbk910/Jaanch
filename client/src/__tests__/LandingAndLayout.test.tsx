/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileNavDrawer } from '../components/layout/MobileNavDrawer.js';
import { Navbar } from '../components/layout/Navbar.js';
import { Footer } from '../components/layout/Footer.js';
import { SubmissionCard, SCENARIO_GENUINE, SCENARIO_FEE_SCAM, SCENARIO_OTP_SCAM } from '../components/landing/SubmissionCard.js';
import { Hero } from '../components/landing/Hero.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import { ThemeProvider } from '../theme/ThemeContext.js';

describe('Phase 6A – Layout & Landing Page Components', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.style.overflow = '';
  });

  describe('MobileNavDrawer Accessibility & Focus Management', () => {
    it('renders accessible dialog with scroll lock and closes on Escape', () => {
      const handleClose = vi.fn();
      const { unmount } = render(
        <MemoryRouter>
          <LanguageProvider>
            <ThemeProvider>
              <MobileNavDrawer isOpen={true} onClose={handleClose} />
            </ThemeProvider>
          </LanguageProvider>
        </MemoryRouter>
      );

      const dialog = screen.getByRole('dialog', { name: /Navigation menu/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      // Scroll lock applied to body
      expect(document.body.style.overflow).toBe('hidden');

      // Press Escape to close
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      unmount();
      // Body overflow restored on unmount
      expect(document.body.style.overflow).toBe('');
    });

    it('enforces 44px minimum touch targets on navigation items', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <ThemeProvider>
              <MobileNavDrawer isOpen={true} onClose={() => {}} />
            </ThemeProvider>
          </LanguageProvider>
        </MemoryRouter>
      );

      const links = screen.getAllByRole('link');
      for (const link of links) {
        expect(link.className).toMatch(/min-h-\[44px\]/);
      }
    });
  });

  describe('Navbar & Language Switcher', () => {
    it('renders sticky navbar with terracotta JAANCH logo, links, and switcher', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <ThemeProvider>
              <Navbar />
            </ThemeProvider>
          </LanguageProvider>
        </MemoryRouter>
      );

      // Serif Brand Logo & Tagline
      const logo = screen.getByText(/Jaanch/i);
      expect(logo.className).toMatch(/font-serif/);
      expect(screen.getByText('CHECK BEFORE YOU TRUST')).toBeInTheDocument();

      // Language Switcher Options
      expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'HI' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'KN' })).toBeInTheDocument();

      // Theme toggle button
      expect(screen.getAllByRole('button', { name: /Switch to (dark|light) mode/i })[0]).toBeInTheDocument();
    });
  });

  describe('SubmissionCard 25-Character Validation & Test Scenarios', () => {
    it('enforces 25-character minimum input validation', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <SubmissionCard />
          </LanguageProvider>
        </MemoryRouter>
      );

      const textarea = screen.getByTestId('offer-textarea');
      const counter = screen.getByTestId('char-counter');
      const submitBtn = screen.getByTestId('check-offer-btn');

      // Initial state: 0 / 25, submit disabled
      expect(counter).toHaveTextContent('0 / 25');
      expect(submitBtn).toBeDisabled();

      // Enter short text (10 characters)
      fireEvent.change(textarea, { target: { value: 'Short text' } });
      expect(counter).toHaveTextContent('10 / 25');
      expect(submitBtn).toBeDisabled();

      // Enter 25+ characters
      fireEvent.change(textarea, { target: { value: 'This offer is 25 characters long!' } });
      expect(counter).toHaveTextContent('33 / 25');
      expect(submitBtn).not.toBeDisabled();
    });

    it('populates textarea and satisfies minimum characters on selecting test scenarios', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <SubmissionCard />
          </LanguageProvider>
        </MemoryRouter>
      );

      const textarea = screen.getByTestId('offer-textarea') as HTMLTextAreaElement;
      const submitBtn = screen.getByTestId('check-offer-btn');

      // Click Scenario 1 (Genuine)
      fireEvent.click(screen.getByTestId('scenario-genuine'));
      expect(textarea.value).toBe(SCENARIO_GENUINE);
      expect(textarea.value.length).toBeGreaterThanOrEqual(25);
      expect(submitBtn).not.toBeDisabled();

      // Click Scenario 2 (Fee Scam)
      fireEvent.click(screen.getByTestId('scenario-fee'));
      expect(textarea.value).toBe(SCENARIO_FEE_SCAM);
      expect(textarea.value.length).toBeGreaterThanOrEqual(25);
      expect(submitBtn).not.toBeDisabled();

      // Click Scenario 3 (OTP Scam)
      fireEvent.click(screen.getByTestId('scenario-otp'));
      expect(textarea.value).toBe(SCENARIO_OTP_SCAM);
      expect(textarea.value.length).toBeGreaterThanOrEqual(25);
      expect(submitBtn).not.toBeDisabled();
    });

    it('displays audit output preview on the left side of the audit button when offer is selected', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <SubmissionCard />
          </LanguageProvider>
        </MemoryRouter>
      );

      const outputContainer = screen.getByTestId('audit-output-left');
      expect(outputContainer).toBeInTheDocument();

      // Click Fee Scam scenario
      fireEvent.click(screen.getByTestId('scenario-fee'));

      expect(outputContainer).toHaveTextContent(/High Concern/i);
      expect(outputContainer).toHaveTextContent(/OUTPUT:/i);
    });
  });

  describe('Security & Official URLs', () => {
    it('verifies all external portal links in Hero have rel="noopener noreferrer" and target="_blank"', () => {
      const { container } = render(
        <MemoryRouter>
          <LanguageProvider>
            <Hero />
          </LanguageProvider>
        </MemoryRouter>
      );

      const externalLinks = [
        'https://www.mca.gov.in',
        'https://www.ncs.gov.in',
        'https://scholarships.gov.in',
        'https://internship.aicte-india.org',
      ];

      for (const url of externalLinks) {
        const link = container.querySelector(`a[href="${url}"]`);
        expect(link, `Missing link for ${url}`).not.toBeNull();
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
      }
    });

    it('verifies 1930 Cybercrime Helpline link in Footer has rel="noopener noreferrer" and target="_blank"', () => {
      render(
        <MemoryRouter>
          <LanguageProvider>
            <Footer />
          </LanguageProvider>
        </MemoryRouter>
      );

      const cybercrimeLink = screen.getByRole('link', { name: /cybercrime\.gov\.in/i });
      expect(cybercrimeLink).toHaveAttribute('href', 'https://cybercrime.gov.in');
      expect(cybercrimeLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(cybercrimeLink).toHaveAttribute('target', '_blank');
    });
  });
});
