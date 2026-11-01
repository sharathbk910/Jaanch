/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, beforeEach } from 'vitest';
import { translations, getTranslation } from '../i18n/translations';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useLanguage, LANGUAGE_STORAGE_KEY } from '../i18n/LanguageContext';

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) {
      keys = keys.concat(getAllKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('Internationalization & Translations (Phase 5)', () => {
  const enKeys = getAllKeys(translations.en);

  it('contains complete dictionary keys in English', () => {
    expect(enKeys.length).toBeGreaterThan(30);
    const requiredSections = [
      'navigation',
      'hero',
      'features',
      'submissionCard',
      'auditSteps',
      'guidelines',
      'footer',
      'auth',
      'errors',
      'statusLabels',
    ];
    for (const section of requiredSections) {
      expect(translations.en).toHaveProperty(section);
      expect(translations.hi).toHaveProperty(section);
      expect(translations.kn).toHaveProperty(section);
    }
  });

  it('ensures every key exists in all three languages (en, hi, kn) with non-empty text', () => {
    for (const key of enKeys) {
      const enVal = getTranslation('en', key);
      const hiVal = getTranslation('hi', key);
      const knVal = getTranslation('kn', key);

      expect(enVal, `Missing EN value for ${key}`).toBeTruthy();
      expect(hiVal, `Missing HI value for ${key}`).toBeTruthy();
      expect(knVal, `Missing KN value for ${key}`).toBeTruthy();

      expect(typeof enVal).toBe('string');
      expect(typeof hiVal).toBe('string');
      expect(typeof knVal).toBe('string');
    }
  });

  it('getTranslation falls back gracefully to English when key is missing in target language', () => {
    // Non-existent key falls back to the key string
    expect(getTranslation('hi', 'unknown.nonexistent.key')).toBe('unknown.nonexistent.key');
    // Valid key returns valid translation
    expect(getTranslation('hi', 'navigation.brand')).toBe('जांच.');
    expect(getTranslation('kn', 'navigation.brand')).toBe('ಜಾಂಚ್.');
  });
});

describe('LanguageContext & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  const TestConsumer = () => {
    const { currentLang, setLang, t } = useLanguage();
    return (
      <div>
        <span data-testid="current-lang">{currentLang}</span>
        <span data-testid="brand">{t('navigation.brand')}</span>
        <button onClick={() => setLang('hi')}>Switch to HI</button>
        <button onClick={() => setLang('kn')}>Switch to KN</button>
      </div>
    );
  };

  it('language switch persists to localStorage and updates document.documentElement.lang', async () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(document.documentElement.lang).toBe('en');

    // Switch to Hindi
    act(() => {
      screen.getByText('Switch to HI').click();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('hi');
    expect(screen.getByTestId('brand').textContent).toBe('जांच.');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');

    // Switch to Kannada
    act(() => {
      screen.getByText('Switch to KN').click();
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('kn');
    expect(screen.getByTestId('brand').textContent).toBe('ಜಾಂಚ್.');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('kn');
    expect(document.documentElement.lang).toBe('kn');
  });
});
