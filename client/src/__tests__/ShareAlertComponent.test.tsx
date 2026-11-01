// @vitest-environment jsdom
import './setup.js';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ShareAlert } from '../components/results/ShareAlert.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import type { IntelMatch } from '@jaanch/shared';

describe('ShareAlert Component (Phase 9 UI)', () => {
  const confirmedIntelMatch: IntelMatch = {
    tier: 'exact_text',
    status: 'confirmed',
    confidenceBand: 'very_high',
    explanation: 'Matches a confirmed scam record',
    publicId: 'JNC-INTEL-1234ABCD',
    confirmedAt: '2026-11-01T12:00:00.000Z',
    matchedIndicators: ['fakehr@okaxis'],
  };

  const suspiciousIntelMatch: IntelMatch = {
    ...confirmedIntelMatch,
    status: 'suspicious',
  };

  const reportedIntelMatch: IntelMatch = {
    ...confirmedIntelMatch,
    status: 'reported',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (props: { intelMatch?: IntelMatch; originalText?: string }) => {
    return render(
      <LanguageProvider>
        <ShareAlert {...props} />
      </LanguageProvider>
    );
  };

  describe('Status Guard Invariant', () => {
    it('does NOT render when status is suspicious', () => {
      const { container } = renderComponent({ intelMatch: suspiciousIntelMatch });
      expect(container.firstChild).toBeNull();
    });

    it('does NOT render when status is reported', () => {
      const { container } = renderComponent({ intelMatch: reportedIntelMatch });
      expect(container.firstChild).toBeNull();
    });

    it('does NOT render when intelMatch is undefined', () => {
      const { container } = renderComponent({ intelMatch: undefined });
      expect(container.firstChild).toBeNull();
    });

    it('renders trigger card when intelMatch status is confirmed', () => {
      renderComponent({ intelMatch: confirmedIntelMatch });
      expect(screen.getByText(/Share WhatsApp Scam Alert/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Share on WhatsApp/i })).toBeInTheDocument();
    });
  });

  describe('Modal Interaction & Preview Editing', () => {
    it('opens preview modal when trigger button is clicked', () => {
      renderComponent({
        intelMatch: confirmedIntelMatch,
        originalText: 'Deposit ₹5,000 laptop security deposit.',
      });

      const button = screen.getByRole('button', { name: /Share on WhatsApp/i });
      fireEvent.click(button);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('JNC-INTEL-1234ABCD')).toBeInTheDocument();
      expect(screen.getByText(/You must tap send inside WhatsApp/i)).toBeInTheDocument();
    });

    it('allows editing alert text in the textarea and updates the WhatsApp link dynamically', () => {
      renderComponent({
        intelMatch: confirmedIntelMatch,
        originalText: 'Deposit ₹5,000 laptop security deposit.',
      });

      fireEvent.click(screen.getByRole('button', { name: /Share on WhatsApp/i }));

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toContain('JNC-INTEL-1234ABCD');

      // Edit text in textarea
      fireEvent.change(textarea, { target: { value: 'Custom Warning: Do not pay anything!' } });
      expect(textarea.value).toBe('Custom Warning: Do not pay anything!');

      // Link href must update with the edited text
      const openWhatsAppLink = screen.getByRole('link', { name: /Open WhatsApp/i });
      expect(openWhatsAppLink).toHaveAttribute(
        'href',
        'https://wa.me/?text=Custom%20Warning%3A%20Do%20not%20pay%20anything!'
      );
      expect(openWhatsAppLink).toHaveAttribute('target', '_blank');
      expect(openWhatsAppLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('toggles redacted message excerpt on and off', () => {
      renderComponent({
        intelMatch: confirmedIntelMatch,
        originalText: 'Deposit ₹5,000 caution fee.',
      });

      fireEvent.click(screen.getByRole('button', { name: /Share on WhatsApp/i }));

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toContain('caution fee');

      // Uncheck excerpt toggle
      const excerptToggle = screen.getByLabelText(/Include redacted message excerpt/i);
      fireEvent.click(excerptToggle);

      expect(textarea.value).not.toContain('caution fee');
    });

    it('copies alert message to clipboard and displays Copied! feedback', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      renderComponent({ intelMatch: confirmedIntelMatch });
      fireEvent.click(screen.getByRole('button', { name: /Share on WhatsApp/i }));

      const copyBtn = screen.getByRole('button', { name: /Copy Message/i });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
      });
    });

    it('dispatches zero automated messages to external network or WhatsApp API', () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      renderComponent({ intelMatch: confirmedIntelMatch });
      fireEvent.click(screen.getByRole('button', { name: /Share on WhatsApp/i }));

      // Clicking Open WhatsApp opens link locally without automated outbound dispatch
      const openLink = screen.getByRole('link', { name: /Open WhatsApp/i });
      fireEvent.click(openLink);

      // Verify no automated external WhatsApp API calls were made
      const whatsappApiCalls = fetchSpy.mock.calls.filter((call) =>
        String(call[0]).includes('graph.facebook.com')
      );
      expect(whatsappApiCalls.length).toBe(0);
    });
  });
});
