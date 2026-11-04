/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import type { VerificationStatus } from '@jaanch/shared';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import { WhatsAppShareButton } from '../components/results/WhatsAppShareButton.js';
import {
  formatWhatsAppShareText,
  buildWhatsAppShareUrl,
} from '../lib/whatsappShare.js';

describe('WhatsApp Sharing & Invariants', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatWhatsAppShareText & buildWhatsAppShareUrl', () => {
    it('produces confirmed scam alert with publicId and 1930 helpline', () => {
      const text = formatWhatsAppShareText({
        status: 'CONFIRMED_SCAM',
        publicId: 'JNC-INTEL-12345678',
        matchedIndicators: ['fake-tcs-careers.com', '+91 99999 11111'],
        claimedOrg: 'Tata Consultancy Services',
        language: 'en',
      });

      expect(text).toContain('SCAM ALERT [Jaanch Verification JNC-INTEL-12345678]');
      expect(text).toContain('Tata Consultancy Services');
      expect(text).toContain('Indicators: fake-tcs-careers.com, +91 99999 11111');
      expect(text).toContain('1930');
      expect(text).toContain('cybercrime.gov.in');
      expect(text).toContain('https://jaanch.ai');
    });

    it('formats localized Hindi and Kannada confirmed scam alerts', () => {
      const hindiText = formatWhatsAppShareText({
        status: 'CONFIRMED_SCAM',
        publicId: 'JNC-INTEL-8888',
        claimedOrg: 'Infosys',
        language: 'hi',
      });
      expect(hindiText).toContain('धोखाधड़ी चेतावनी');
      expect(hindiText).toContain('1930');

      const kannadaText = formatWhatsAppShareText({
        status: 'CONFIRMED_SCAM',
        publicId: 'JNC-INTEL-8888',
        claimedOrg: 'Infosys',
        language: 'kn',
      });
      expect(kannadaText).toContain('ವಂಚನೆ ಎಚ್ಚರಿಕೆ');
      expect(kannadaText).toContain('1930');
    });

    it('produces high concern safety advisory without raw student message', () => {
      const text = formatWhatsAppShareText({
        status: 'HIGH_CONCERN',
        language: 'en',
      });

      expect(text).toContain('SAFETY ADVISORY [Jaanch AI]');
      expect(text).toContain('1930');
      expect(text).toContain('https://jaanch.ai');
      // Invariant: zero user raw message or sensitive unredacted submission text
      expect(text).not.toContain('confidential');
      expect(text).not.toContain('My name is');
    });

    it('builds a valid https://api.whatsapp.com/send URL', () => {
      const url = buildWhatsAppShareUrl({
        status: 'CONFIRMED_SCAM',
        publicId: 'JNC-INTEL-TEST',
        language: 'en',
      });

      expect(url.startsWith('https://api.whatsapp.com/send?text=')).toBe(true);
      const decoded = decodeURIComponent(url.split('text=')[1]);
      expect(decoded).toContain('JNC-INTEL-TEST');
      expect(decoded).toContain('1930');
    });
  });

  describe('WhatsAppShareButton Component', () => {
    it('renders button and opens safe share URL in new window on click', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(
        <LanguageProvider defaultLang="en">
          <WhatsAppShareButton
            status="CONFIRMED_SCAM"
            publicId="JNC-INTEL-9999"
            claimedOrg="Acme Corp"
          />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /share warning on whatsapp/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const [url, target, rel] = windowOpenSpy.mock.calls[0];
      expect(url).toContain('https://api.whatsapp.com/send?text=');
      expect(url).toContain(encodeURIComponent('JNC-INTEL-9999'));
      expect(target).toBe('_blank');
      expect(rel).toBe('noopener,noreferrer');
    });

    it('renders disclaimer about confirmed indicators only for CONFIRMED_SCAM', () => {
      render(
        <LanguageProvider defaultLang="en">
          <WhatsAppShareButton status="CONFIRMED_SCAM" />
        </LanguageProvider>
      );

      expect(
        screen.getByText(/only verified warnings and helplines are shared/i)
      ).toBeInTheDocument();
    });

    it('returns null and does NOT render for any non-confirmed status (LIKELY_GENUINE, NEEDS_REVIEW, HIGH_CONCERN)', () => {
      const nonConfirmedStatuses: VerificationStatus[] = [
        'LIKELY_GENUINE',
        'NEEDS_REVIEW',
        'HIGH_CONCERN',
      ];

      for (const status of nonConfirmedStatuses) {
        const { container } = render(
          <LanguageProvider defaultLang="en">
            <WhatsAppShareButton status={status} />
          </LanguageProvider>
        );

        expect(container.firstChild).toBeNull();
        cleanup();
      }
    });

    it('renders normally only when status is CONFIRMED_SCAM', () => {
      const { container } = render(
        <LanguageProvider defaultLang="en">
          <WhatsAppShareButton
            status="CONFIRMED_SCAM"
            publicId="JNC-INTEL-TEST"
            claimedOrg="Example Corp"
          />
        </LanguageProvider>
      );

      expect(container.firstChild).not.toBeNull();
      expect(screen.getByRole('button', { name: /share warning on whatsapp/i })).toBeInTheDocument();
      expect(
        screen.getByText(/only verified warnings and helplines are shared/i)
      ).toBeInTheDocument();
    });
  });
});
