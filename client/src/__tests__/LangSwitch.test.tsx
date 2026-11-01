/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LangSwitch } from '../components/layout/LangSwitch.js';
import { I18nProvider, useT } from '../i18n/I18nContext.js';

function TestConsumer() {
  const { t } = useT();
  return (
    <div>
      <LangSwitch />
      <span data-testid="translated-text">{t('nav.checkOffer')}</span>
    </div>
  );
}

describe('LangSwitch & Multilingual Scaffolding (LangSwitch.test.tsx)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('renders all three language options EN, HI, KN', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'HI' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'KN' })).toBeInTheDocument();
  });

  it('switches to Hindi on click, updates document.documentElement.lang and persists', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    expect(screen.getByTestId('translated-text')).toHaveTextContent('Check Offer');

    const hiButton = screen.getByRole('button', { name: 'HI' });
    fireEvent.click(hiButton);

    expect(document.documentElement.lang).toBe('hi');
    expect(localStorage.getItem('jaanch_language')).toBe('hi');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('ऑफ़र जाँचें');
  });

  it('switches to Kannada on click and updates translations', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    const knButton = screen.getByRole('button', { name: 'KN' });
    fireEvent.click(knButton);

    expect(document.documentElement.lang).toBe('kn');
    expect(localStorage.getItem('jaanch_language')).toBe('kn');
    expect(screen.getByTestId('translated-text')).toHaveTextContent('ಆಫರ್ ಪರಿಶೀಲಿಸಿ');
  });
});
