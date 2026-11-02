/** @vitest-environment jsdom */
import './setup.js';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AnalyzePage } from '../pages/AnalyzePage.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import { apiClient } from '../lib/apiClient.js';
import * as guestSession from '../lib/guestSession.js';
import * as pdfExtractor from '../lib/pdfExtractor.js';
import { SCENARIO_GENUINE, SCENARIO_FEE_SCAM, SCENARIO_OTP_SCAM } from '../components/landing/SubmissionCard.js';

// Mock apiClient and guestSession
vi.mock('../lib/apiClient.js', () => ({
  apiClient: {
    analyzeOffer: vi.fn(),
  },
}));

vi.mock('../lib/pdfExtractor.js', () => ({
  extractTextFromFile: vi.fn(),
}));

function renderAnalyzePage(initialEntries = ['/analyze']) {
  return render(
    <LanguageProvider defaultLang="en">
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/results/local" element={<div data-testid="results-local">Results Local View</div>} />
          <Route path="/results/:id" element={<div data-testid="results-saved">Results Saved View</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('Phase 6B – Analyzer Page (AnalyzePage.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header, tabs, textarea, and action buttons', () => {
    renderAnalyzePage();

    expect(screen.getByRole('heading', { level: 1, name: /Verify Offer Legitimacy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paste Message Text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Document/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Offer Message or Email Text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify Offer Now/i })).toBeDisabled();
  });

  it('enforces strict 25-character minimum input validation', async () => {
    const user = userEvent.setup();
    renderAnalyzePage();

    const textarea = screen.getByRole('textbox', { name: /Offer Message or Email Text/i });
    const submitBtn = screen.getByRole('button', { name: /Verify Offer Now/i });

    // Under 25 characters (e.g. 15 chars)
    await user.type(textarea, 'Short fake job');
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/14 \/ 25 characters/i)).toBeInTheDocument();

    // Reaching 25 characters
    await user.clear(textarea);
    await user.type(textarea, 'This is a message with over twenty-five characters.');
    expect(submitBtn).toBeEnabled();
    expect(screen.queryByText(/min 25/i)).not.toBeInTheDocument();
  });

  it('populates scenario text and domain when sample chips are clicked', async () => {
    const user = userEvent.setup();
    renderAnalyzePage();

    const genuineBtn = screen.getByRole('button', { name: /Genuine Internship/i });
    await user.click(genuineBtn);

    const textarea = screen.getByRole('textbox', { name: /Offer Message or Email Text/i }) as HTMLTextAreaElement;
    expect(textarea.value).toBe(SCENARIO_GENUINE);

    // Test fee scam scenario
    const feeBtn = screen.getByRole('button', { name: /Upfront Fee Scam/i });
    await user.click(feeBtn);
    expect(textarea.value).toBe(SCENARIO_FEE_SCAM);

    // Test OTP scam scenario
    const otpBtn = screen.getByRole('button', { name: /OTP Phishing Scam/i });
    await user.click(otpBtn);
    expect(textarea.value).toBe(SCENARIO_OTP_SCAM);
  });

  it('renders a streamlined analyzer interface without redundant form controls', () => {
    renderAnalyzePage();

    expect(screen.queryByLabelText(/Recruiter \/ Sender Email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Company Website \/ Domain/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Privacy & Threat Intelligence Controls/i)).not.toBeInTheDocument();
  });

  it('submits valid analysis, calls apiClient, and navigates to local results for guest', async () => {
    const user = userEvent.setup();
    const saveGuestSpy = vi.spyOn(guestSession, 'saveGuestAnalysis');

    const mockResult = {
      status: 'HIGH_CONCERN' as const,
      signals: [
        {
          id: 'sig_1',
          ruleId: 'RULE_UPFRONT_FEE',
          title: 'Upfront Registration Fee Demanded',
          whyItMatters: 'Legitimate employers never demand payment.',
          evidence: 'Deposit ₹3,500 security deposit',
          severity: 'critical' as const,
        },
      ],
      unverified: [],
      extractedEntities: {
        urls: [],
        domains: [],
        emails: [],
        phones: [],
        upiHandles: ['tcs.hr@okaxis'],
        amounts: ['₹3,500'],
        organization: 'TCS',
      },
      confidenceScore: 92,
      recommendedActions: ['Do not send any funds.'],
      auditId: 'audit_test_12345',
    };

    vi.mocked(apiClient.analyzeOffer).mockResolvedValue(mockResult);

    renderAnalyzePage();

    // Select fee scam scenario
    await user.click(screen.getByRole('button', { name: /Upfront Fee Scam/i }));

    const submitBtn = screen.getByRole('button', { name: /Verify Offer Now/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.analyzeOffer).toHaveBeenCalled();
    });

    const interceptedCall = vi.mocked(apiClient.analyzeOffer).mock.calls[0][0];
    console.log('\n--- REAL INTERCEPTED NETWORK PAYLOAD ---');
    console.log(JSON.stringify(interceptedCall, null, 2));

    expect(interceptedCall.domain).toBe('job');
    expect(interceptedCall.text).toContain('[UPI]');
    expect(interceptedCall.text).not.toContain('tcs.hr@okaxis');
    expect(interceptedCall.consentFlags).toEqual({
      aiAnalysis: true,
      shareIndicators: false,
    });
    expect(interceptedCall.saveToHistory).toBe(false);

    expect(saveGuestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        inputText: SCENARIO_FEE_SCAM,
        domain: 'job',
        result: mockResult,
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId('results-local')).toBeInTheDocument();
    });
  });

  it('handles in-browser PDF extraction tab without file upload to server', async () => {
    const user = userEvent.setup();
    vi.mocked(pdfExtractor.extractTextFromFile).mockResolvedValue({
      text: 'Extracted appointment letter from client PDF parser with sufficient length.',
      fileName: 'offer_letter.pdf',
      pageCount: 2,
      fileSizeBytes: 10240,
    });

    renderAnalyzePage();

    // Switch to Upload Document tab
    await user.click(screen.getByRole('button', { name: /Upload Document/i }));

    expect(screen.getByText(/Drop your PDF or TXT offer document here/i)).toBeInTheDocument();

    const file = new File(['dummy-pdf-content'], 'offer_letter.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByRole('button', { name: /Upload document dropzone/i });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(pdfExtractor.extractTextFromFile).toHaveBeenCalledWith(file, expect.anything());
    });

    // Automatically switched to paste tab with extracted text loaded
    await waitFor(() => {
      expect(screen.getByText(/offer_letter.pdf/i)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(/Extracted appointment letter from client PDF parser/i)
      ).toBeInTheDocument();
    });
  });

  it('clears all input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    renderAnalyzePage();

    await user.click(screen.getByRole('button', { name: /Genuine Internship/i }));
    const textarea = screen.getByRole('textbox', { name: /Offer Message or Email Text/i });
    expect(textarea).toHaveValue(SCENARIO_GENUINE);

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    await user.click(clearBtn);

    expect(textarea).toHaveValue('');
    expect(screen.getByRole('button', { name: /Verify Offer Now/i })).toBeDisabled();
  });

  it('guarantees client-side PII redaction and never transmits raw personal identifiers', async () => {
    const user = userEvent.setup();
    renderAnalyzePage();

    // Input text containing Aadhaar and Phone
    const textarea = screen.getByRole('textbox', { name: /Offer Message or Email Text/i });
    await user.type(
      textarea,
      'Offer letter for Rahul. Contact WhatsApp +91 91234 56789 or provide Aadhaar 9999 8888 7777 to finalize.'
    );

    // Live redaction preview is visible
    expect(screen.getByText(/Client Redaction Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/2 personal details redacted client-side/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Verify Offer Now/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.analyzeOffer).toHaveBeenCalled();
    });

    const callPayload = vi.mocked(apiClient.analyzeOffer).mock.calls[0][0];
    console.log('\n--- VERIFIED NETWORK PAYLOAD WITH PII REDACTION ---');
    console.log(JSON.stringify(callPayload, null, 2));

    expect(callPayload.consentFlags).toEqual({
      aiAnalysis: true,
      shareIndicators: false,
    });
    expect(callPayload.saveToHistory).toBe(false);
    expect(callPayload.text).toContain('[PHONE]');
    expect(callPayload.text).toContain('[AADHAAR]');
    expect(callPayload.text).not.toContain('91234 56789');
    expect(callPayload.text).not.toContain('9999 8888 7777');
  });

  it('handles API error gracefully and presents retry button without losing input text', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.analyzeOffer).mockRejectedValueOnce(
      new Error('Network connection timeout. Analysis service unreachable.')
    );

    renderAnalyzePage();

    await user.click(screen.getByRole('button', { name: /Genuine Internship/i }));
    const submitBtn = screen.getByRole('button', { name: /Verify Offer Now/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Network connection timeout/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Analysis/i })).toBeInTheDocument();
    });

    // Input is preserved in editor
    const textarea = screen.getByRole('textbox', { name: /Offer Message or Email Text/i });
    expect(textarea).toHaveValue(SCENARIO_GENUINE);

    // Mock successful recovery on retry
    vi.mocked(apiClient.analyzeOffer).mockResolvedValueOnce({
      status: 'LIKELY_GENUINE',
      signals: [],
      unverified: [],
      extractedEntities: {
        urls: [],
        domains: [],
        emails: [],
        phones: [],
        upiHandles: [],
        amounts: [],
        organization: 'TCS',
      },
      confidenceScore: 95,
      recommendedActions: [],
      auditId: 'audit_recovered_789',
    });

    await user.click(screen.getByRole('button', { name: /Retry Analysis/i }));

    await waitFor(() => {
      expect(screen.getByTestId('results-local')).toBeInTheDocument();
    });
  });
});
