/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeedbackPill } from '../components/layout/FeedbackPill.js';
import { I18nProvider } from '../i18n/I18nContext.js';
import { apiClient } from '../lib/apiClient.js';

vi.mock('../lib/apiClient.js', () => ({
  apiClient: {
    submitPageFeedback: vi.fn().mockResolvedValue({ id: 'fb-123' }),
  },
}));

describe('FeedbackPill Component (FeedbackPill.test.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating feedback question pill', () => {
    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <I18nProvider>
          <FeedbackPill />
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Was this page helpful\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /No/i })).toBeInTheDocument();
  });

  it('submits rating 5 when clicking Yes and displays confirmation', async () => {
    render(
      <MemoryRouter initialEntries={['/analyze']}>
        <I18nProvider>
          <FeedbackPill />
        </I18nProvider>
      </MemoryRouter>
    );

    const yesBtn = screen.getByRole('button', { name: /Yes/i });
    fireEvent.click(yesBtn);

    await waitFor(() => {
      expect(apiClient.submitPageFeedback).toHaveBeenCalledWith({
        page: '/analyze',
        rating: 5,
      });
      expect(screen.getByText(/Thank you for helping keep Indian students safe!/i)).toBeInTheDocument();
    });
  });

  it('submits rating 1 when clicking No', async () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <I18nProvider>
          <FeedbackPill />
        </I18nProvider>
      </MemoryRouter>
    );

    const noBtn = screen.getByRole('button', { name: /No/i });
    fireEvent.click(noBtn);

    await waitFor(() => {
      expect(apiClient.submitPageFeedback).toHaveBeenCalledWith({
        page: '/resources',
        rating: 1,
      });
      expect(screen.getByText(/Thank you for helping keep Indian students safe!/i)).toBeInTheDocument();
    });
  });
});
