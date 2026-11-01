/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '../theme/ThemeContext';

/**
 * Calculates relative luminance according to WCAG 2.1 specifications:
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function parseHex(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getLuminance(hex: string): number {
  const [r8, g8, b8] = parseHex(hex);
  const [r, g, b] = [r8 / 255, g8 / 255, b8 / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractCssTokens(cssContent: string) {
  const lightBlock = cssContent.match(/:root\s*\{([^}]+)\}/)?.[1] || '';
  const darkBlock = cssContent.match(/(\.dark|\[data-theme="dark"\])[^{]*\{([^}]+)\}/)?.[2] || '';

  const parseVars = (block: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    const lines = block.split('\n');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+);/);
      if (match) {
        vars[match[1].trim()] = match[2].trim();
      }
    }
    return vars;
  };

  return {
    light: parseVars(lightBlock),
    dark: parseVars(darkBlock),
  };
}

describe('Design Tokens & WCAG AA Contrast Ratios', () => {
  const tokensCssPath = path.resolve(__dirname, '../styles/tokens.css');
  const tokensCss = fs.readFileSync(tokensCssPath, 'utf-8');
  const { light, dark } = extractCssTokens(tokensCss);

  it('contains the exact required spec variables in tokens.css', () => {
    const requiredLightTokens = [
      '--color-background',
      '--color-surface',
      '--color-foreground',
      '--color-muted-foreground',
      '--color-muted-subtle',
      '--color-terracotta',
      '--color-primary',
      '--color-border-pill',
      '--color-border',
      '--color-ring',
      '--color-status-high-concern-bg',
      '--color-status-high-concern-fg',
      '--color-status-needs-review-bg',
      '--color-status-needs-review-fg',
      '--color-status-likely-genuine-bg',
      '--color-status-likely-genuine-fg',
      '--color-status-confirmed-bg',
      '--color-status-confirmed-fg',
    ];

    for (const token of requiredLightTokens) {
      expect(light, `Expected tokens.css :root to define ${token}`).toHaveProperty(token);
    }
    const expectedBackgroundHex = String.fromCharCode(35) + 'F9F8F3';
    expect(light['--color-background']).toBe(expectedBackgroundHex);
  });

  it('contains dark mode overrides for all color tokens', () => {
    const requiredDarkTokens = [
      '--color-background',
      '--color-surface',
      '--color-foreground',
      '--color-muted-foreground',
      '--color-muted-subtle',
      '--color-terracotta',
      '--color-primary',
      '--color-border-pill',
      '--color-border',
      '--color-ring',
      '--color-status-high-concern-bg',
      '--color-status-high-concern-fg',
      '--color-status-needs-review-bg',
      '--color-status-needs-review-fg',
      '--color-status-likely-genuine-bg',
      '--color-status-likely-genuine-fg',
      '--color-status-confirmed-bg',
      '--color-status-confirmed-fg',
    ];

    for (const token of requiredDarkTokens) {
      expect(dark, `Expected dark mode block to define ${token}`).toHaveProperty(token);
    }
  });

  describe('Light Mode WCAG AA Contrast Checks (>= 4.5:1)', () => {
    const pairs: { name: string; fg: string; bg: string }[] = [
      { name: 'foreground on background', fg: light['--color-foreground'], bg: light['--color-background'] },
      { name: 'foreground on surface', fg: light['--color-foreground'], bg: light['--color-surface'] },
      { name: 'muted-foreground on background', fg: light['--color-muted-foreground'], bg: light['--color-background'] },
      { name: 'muted-foreground on surface', fg: light['--color-muted-foreground'], bg: light['--color-surface'] },
      { name: 'terracotta on background', fg: light['--color-terracotta'], bg: light['--color-background'] },
      { name: 'status high-concern text on bg', fg: light['--color-status-high-concern-fg'], bg: light['--color-status-high-concern-bg'] },
      { name: 'status needs-review text on bg', fg: light['--color-status-needs-review-fg'], bg: light['--color-status-needs-review-bg'] },
      { name: 'status likely-genuine text on bg', fg: light['--color-status-likely-genuine-fg'], bg: light['--color-status-likely-genuine-bg'] },
      { name: 'status confirmed text on bg', fg: light['--color-status-confirmed-fg'], bg: light['--color-status-confirmed-bg'] },
    ];

    for (const pair of pairs) {
      it(`evaluates ${pair.name} (${pair.fg} on ${pair.bg}) to meet WCAG AA (>= 4.5:1)`, () => {
        const ratio = getContrastRatio(pair.fg, pair.bg);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  });

  describe('Dark Mode WCAG AA Contrast Checks (>= 4.5:1)', () => {
    const pairs: { name: string; fg: string; bg: string }[] = [
      { name: 'dark foreground on dark background', fg: dark['--color-foreground'], bg: dark['--color-background'] },
      { name: 'dark foreground on dark surface', fg: dark['--color-foreground'], bg: dark['--color-surface'] },
      { name: 'dark muted-foreground on dark background', fg: dark['--color-muted-foreground'], bg: dark['--color-background'] },
      { name: 'dark muted-foreground on dark surface', fg: dark['--color-muted-foreground'], bg: dark['--color-surface'] },
      { name: 'dark terracotta on dark background', fg: dark['--color-terracotta'], bg: dark['--color-background'] },
      { name: 'dark status high-concern text on bg', fg: dark['--color-status-high-concern-fg'], bg: dark['--color-status-high-concern-bg'] },
      { name: 'dark status needs-review text on bg', fg: dark['--color-status-needs-review-fg'], bg: dark['--color-status-needs-review-bg'] },
      { name: 'dark status likely-genuine text on bg', fg: dark['--color-status-likely-genuine-fg'], bg: dark['--color-status-likely-genuine-bg'] },
      { name: 'dark status confirmed text on bg', fg: dark['--color-status-confirmed-fg'], bg: dark['--color-status-confirmed-bg'] },
    ];

    for (const pair of pairs) {
      it(`evaluates ${pair.name} (${pair.fg} on ${pair.bg}) to meet WCAG AA (>= 4.5:1)`, () => {
        const ratio = getContrastRatio(pair.fg, pair.bg);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
});

describe('ThemeProvider Functionality & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  const ThemeConsumer = () => {
    const { theme, resolvedTheme, setTheme } = useTheme();
    return (
      <div>
        <span data-testid="theme">{theme}</span>
        <span data-testid="resolved">{resolvedTheme}</span>
        <button onClick={() => setTheme('dark')}>Set Dark</button>
        <button onClick={() => setTheme('light')}>Set Light</button>
        <button onClick={() => setTheme('system')}>Set System</button>
      </div>
    );
  };

  it('toggles theme, updates DOM attributes, and persists to localStorage', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Switch to Dark
    act(() => {
      screen.getByText('Set Dark').click();
    });

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Switch to Light
    act(() => {
      screen.getByText('Set Light').click();
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
