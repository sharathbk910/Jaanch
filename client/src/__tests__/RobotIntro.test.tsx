/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router-dom';
import {
  RobotIntro,
  INTRO_SEEN_KEY,
  hasSeenBrandIntro,
  markBrandIntroSeen,
} from '../components/intro/RobotIntro.js';
import { LandingPage } from '../pages/LandingPage.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import { ThemeProvider } from '../theme/ThemeContext.js';

describe('Phase 14 – Animated Brand Intro (RobotIntro)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  describe('Session Storage & Replay Prevention', () => {
    it('marks brand intro as seen in sessionStorage upon mounting', () => {
      expect(hasSeenBrandIntro()).toBe(false);
      expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBeNull();

      render(<RobotIntro />);

      expect(hasSeenBrandIntro()).toBe(true);
      expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('true');
    });

    it('prevents replay when sessionStorage flag is already set', () => {
      markBrandIntroSeen();
      expect(hasSeenBrandIntro()).toBe(true);

      const { container } = render(
        <MemoryRouter>
          <LanguageProvider>
            <ThemeProvider>
              <LandingPage />
            </ThemeProvider>
          </LanguageProvider>
        </MemoryRouter>
      );

      // Robot intro should NOT be rendered when already seen in session
      expect(container.querySelector('[data-testid="robot-intro"]')).toBeNull();
    });
  });

  describe('Animation Sequence & Keyframe States', () => {
    it('starts in walking phase and transitions through exhausted to resting', () => {
      render(<RobotIntro autoDismiss={false} />);

      const introEl = screen.getByTestId('robot-intro');
      expect(introEl).toHaveAttribute('data-phase', 'walking');

      // Fast-forward to 1.5s -> exhaustion beat
      act(() => {
        vi.advanceTimersByTime(1600);
      });
      expect(introEl).toHaveAttribute('data-phase', 'exhausted');

      // Fast-forward to 2.6s -> rest pose
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(introEl).toHaveAttribute('data-phase', 'resting');
    });

    it('renders forced phases deterministically (walking, exhausted, resting)', () => {
      const { rerender } = render(<RobotIntro forcedPhase="walking" />);
      expect(screen.getByTestId('robot-intro')).toHaveAttribute('data-phase', 'walking');

      rerender(<RobotIntro forcedPhase="exhausted" />);
      expect(screen.getByTestId('robot-intro')).toHaveAttribute('data-phase', 'exhausted');

      rerender(<RobotIntro forcedPhase="resting" />);
      expect(screen.getByTestId('robot-intro')).toHaveAttribute('data-phase', 'resting');
    });

    it('respects prefers-reduced-motion by immediately jumping to resting phase', () => {
      // Mock matchMedia to report prefers-reduced-motion: reduce
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<RobotIntro />);
      const introEl = screen.getByTestId('robot-intro');
      expect(introEl).toHaveAttribute('data-phase', 'resting');

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('Interactivity & Dismissal', () => {
    it('is non-blocking with pointer-events-none and has accessible skip button', () => {
      const handleComplete = vi.fn();
      render(<RobotIntro onComplete={handleComplete} autoDismiss={false} />);

      const introEl = screen.getByTestId('robot-intro');
      expect(introEl.className).toContain('pointer-events-none');

      const skipBtn = screen.getByRole('button', { name: /skip brand intro/i });
      expect(skipBtn).toBeInTheDocument();

      fireEvent.click(skipBtn);
      expect(handleComplete).toHaveBeenCalledTimes(1);
    });

    it('dismisses when Escape key is pressed', () => {
      const handleComplete = vi.fn();
      render(<RobotIntro onComplete={handleComplete} autoDismiss={false} />);

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleComplete).toHaveBeenCalledTimes(1);
    });

    it('auto-dismisses after 4.2s in normal playback', () => {
      const handleComplete = vi.fn();
      render(<RobotIntro onComplete={handleComplete} autoDismiss={true} />);

      act(() => {
        vi.advanceTimersByTime(4300);
      });

      expect(handleComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility & Axe Audit', () => {
    it('marks the decorative SVG scene with aria-hidden="true"', () => {
      const { container } = render(<RobotIntro forcedPhase="resting" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('passes axe accessibility audit with 0 critical or serious violations', async () => {
      vi.useRealTimers();
      const { container } = render(<RobotIntro forcedPhase="resting" />);

      const results = await axe.run(container, {
        rules: {
          'color-contrast': { enabled: false }, // CSS variables not parsed in JSDOM
        },
      });

      const seriousViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(seriousViolations).toEqual([]);
    });
  });
});

