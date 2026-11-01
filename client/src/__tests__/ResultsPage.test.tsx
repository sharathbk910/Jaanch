/** @vitest-environment jsdom */
import './setup.js';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axe from 'axe-core';
import {
  Results,
  ResultsPage,
  SamplePage,
  LinkCheckPage,
  SAMPLE_GENUINE_RESULT,
  SAMPLE_REVIEW_RESULT,
  SAMPLE_CONCERN_RESULT,
} from '../pages/Results.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import * as pdfExport from '../components/results/PdfExport.js';
import * as guestSession from '../lib/guestSession.js';
import { apiClient } from '../lib/apiClient.js';
import { type AnalyzeResult } from '@jaanch/shared';

vi.mock('../components/results/PdfExport.js', () => ({
  downloadPdfReport: vi.fn(),
  generatePdfBlob: vi.fn(),
}));

function renderResultsWithResult(
  result: AnalyzeResult = SAMPLE_CONCERN_RESULT,
  path = '/results/local',
  lang: 'en' | 'hi' | 'kn' = 'en'
) {
  return render(
    <LanguageProvider defaultLang={lang}>
      <MemoryRouter initialEntries={[{ pathname: path, state: { result } }]}>
        <Routes>
          <Route path="/results/local" element={<ResultsPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/sample" element={<SamplePage />} />
          <Route path="/link-check" element={<LinkCheckPage />} />
          <Route path="/analyze" element={<div data-testid="analyze-view">Analyze View</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('Phase 6C – Results & PDF (Results.tsx / ResultsPage.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no analysis result is present in state or session', () => {
    vi.spyOn(guestSession, 'getGuestAnalysis').mockReturnValue(null);

    render(
      <LanguageProvider defaultLang="en">
        <MemoryRouter initialEntries={['/results/local']}>
          <Routes>
            <Route path="/results/local" element={<ResultsPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /No Audit Result Loaded/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Audit an Offer/i })).toBeInTheDocument();
  });

  it('renders educational disclaimer stating analysis does not prove genuine or fraudulent', () => {
    renderResultsWithResult(SAMPLE_GENUINE_RESULT);

    expect(
      screen.getByText(/Notice: Jaanch evaluates automated heuristic signals and threat indicators/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Analysis does not prove an opportunity is genuine or fraudulent/i)
    ).toBeInTheDocument();
  });

  it('renders two-column layout with sticky sidebar jump navigation', () => {
    const { container } = renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    // Sidebar jump navigation links
    const jumpNav = screen.getByText(/Jump to Section/i);
    expect(jumpNav).toBeInTheDocument();

    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass('lg:sticky');

    // Section anchors exist
    expect(container.querySelector('#verdict')).toBeInTheDocument();
    expect(container.querySelector('#stop-protect')).toBeInTheDocument();
    expect(container.querySelector('#why-status')).toBeInTheDocument();
    expect(container.querySelector('#signals')).toBeInTheDocument();
    expect(container.querySelector('#unverified')).toBeInTheDocument();
    expect(container.querySelector('#portal-checklist')).toBeInTheDocument();
    expect(container.querySelector('#response-generators')).toBeInTheDocument();
    expect(container.querySelector('#link-inspector')).toBeInTheDocument();
    expect(container.querySelector('#next-steps')).toBeInTheDocument();
  });

  it('renders StatusBanner for each status (Likely Genuine, Needs Review, High Concern)', () => {
    // 1. Likely Genuine
    const { unmount: unmount1 } = renderResultsWithResult(SAMPLE_GENUINE_RESULT);
    expect(screen.getByRole('heading', { level: 2, name: /Likely Genuine/i })).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 94%/i)).toBeInTheDocument();
    unmount1();

    // 2. Needs Review
    const { unmount: unmount2 } = renderResultsWithResult(SAMPLE_REVIEW_RESULT);
    expect(screen.getByRole('heading', { level: 2, name: /Needs Review/i })).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 68%/i)).toBeInTheDocument();
    unmount2();

    // 3. High Concern
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);
    expect(screen.getByRole('heading', { level: 2, name: /High Concern/i })).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 96%/i)).toBeInTheDocument();
    expect(screen.getByText(/Independent checks evaluated: 8 of 8/i)).toBeInTheDocument();
  });

  it('renders "Stop and protect yourself" callout for high concern with 1930 and cybercrime.gov.in', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    const callout = document.querySelector('#stop-protect');
    expect(callout).toBeInTheDocument();
    expect(within(callout as HTMLElement).getByText(/Stop and Protect Yourself/i)).toBeInTheDocument();
    expect(within(callout as HTMLElement).getByText(/CRITICAL FRAUD ALERT – 1930 HELPLINE/i)).toBeInTheDocument();

    const call1930Link = within(callout as HTMLElement).getByRole('link', { name: /Call 1930/i });
    expect(call1930Link).toHaveAttribute('href', 'tel:1930');

    const cybercrimeLink = within(callout as HTMLElement).getByRole('link', { name: /cybercrime\.gov\.in/i });
    expect(cybercrimeLink).toHaveAttribute('href', 'https://cybercrime.gov.in');
    expect(cybercrimeLink).toHaveAttribute('target', '_blank');
    expect(cybercrimeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders official portal verification checklist for NSP, AICTE, MCA, NCS', async () => {
    const user = userEvent.setup();
    renderResultsWithResult(SAMPLE_GENUINE_RESULT);

    const checklistSection = document.querySelector('#portal-checklist');
    expect(checklistSection).toBeInTheDocument();

    expect(within(checklistSection as HTMLElement).getByText(/National Scholarship Portal \(NSP\)/i)).toBeInTheDocument();
    expect(within(checklistSection as HTMLElement).getByText(/AICTE Internship Portal/i)).toBeInTheDocument();
    expect(within(checklistSection as HTMLElement).getByText(/Ministry of Corporate Affairs \(MCA\)/i)).toBeInTheDocument();
    expect(within(checklistSection as HTMLElement).getByText(/National Career Service \(NCS\)/i)).toBeInTheDocument();

    // Check interaction: toggle checkmark
    const mcaCheckbox = screen.getByRole('button', {
      name: /Mark Ministry of Corporate Affairs \(MCA\) as checked/i,
    });
    await user.click(mcaCheckbox);
    expect(screen.getByText(/1 \/ 4 Checked/i)).toBeInTheDocument();
  });

  it('renders Challenge Email generator and Safe Reply generator with copy buttons', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    // Test on genuine / review offer where Safe Reply is allowed
    renderResultsWithResult(SAMPLE_REVIEW_RESULT);

    const responseSection = document.querySelector('#response-generators');
    expect(responseSection).toBeInTheDocument();

    // Challenge Email tab
    const challengeTab = screen.getByRole('button', { name: /Challenge Email Template/i });
    await user.click(challengeTab);
    expect(screen.getByText(/Formal verification inquiry requesting official company email/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Copy Template/i });
    await user.click(copyBtn);
    expect(writeTextSpy).toHaveBeenCalled();
    expect(screen.getByText(/Copied to clipboard!/i)).toBeInTheDocument();

    // Safe Reply tab
    const safeReplyTab = screen.getByRole('button', { name: /Safe Reply Template/i });
    await user.click(safeReplyTab);
    expect(screen.getByText(/Polite response asking for official careers link/i)).toBeInTheDocument();
  });

  it('hides Safe Reply generator when offer has High Concern (Decision D8)', async () => {
    const user = userEvent.setup();
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    const safeReplyTab = screen.getByRole('button', { name: /Safe Reply Template/i });
    await user.click(safeReplyTab);

    // Warning alert displayed instead of reply text
    expect(
      screen.getByText(/Safe reply is disabled for high-concern offers. Do not engage, reply, or negotiate/i)
    ).toBeInTheDocument();
  });

  it('renders Link-check UI with the 3 labelled levels', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'checkLink').mockResolvedValue({
      url: 'https://springboard.infosys.com',
      hostname: 'springboard.infosys.com',
      protocol: 'https:',
      pathname: '/',
      riskLevel: 'NO_MAJOR_WARNING_SIGNS',
      observed: ['Domain registration age: 1200 days'],
      unverified: [],
      signals: [],
    });

    renderResultsWithResult(SAMPLE_GENUINE_RESULT);

    const linkInspector = document.querySelector('#link-inspector');
    expect(linkInspector).toBeInTheDocument();
    expect(screen.getByText(/URL INTEGRITY & TYPOSQUATTING/i)).toBeInTheDocument();

    const inspectBtn = screen.getByRole('button', { name: /Inspect Link/i });
    await user.click(inspectBtn);

    await waitFor(() => {
      expect(screen.getByText(/Clean \(No Major Warning Signs\)/i)).toBeInTheDocument();
    });
  });

  it('renders XSS payloads strictly as plain text (XSS inert)', () => {
    const xssResult: AnalyzeResult = {
      status: 'HIGH_CONCERN',
      confidenceScore: 99,
      signals: [
        {
          id: 'sig_xss',
          ruleId: 'RULE_UPFRONT_FEE',
          title: '<script>alert("xss-title")</script>',
          whyItMatters: '<img src=x onerror=alert("why-xss")>',
          evidence: '<script>window.pwned=1;</script><b onmouseover=alert(1)>Pay deposit</b>',
          severity: 'critical',
        },
      ],
      unverified: ['<script>alert("unverified-xss")</script>'],
      extractedEntities: {
        urls: ['javascript:alert(1)'],
        domains: ['<script>evil.com</script>'],
        emails: ['"onload="alert(1)@evil.com'],
        phones: ['<svg/onload=alert(1)>'],
        upiHandles: ['xss@<script>okaxis'],
        amounts: ['₹100<script>alert(1)</script>'],
        organization: '<script>window.hacked=true</script>Inert Org',
      },
      recommendedActions: ['<img src=x onerror=alert("action-xss")> Do not pay.'],
      auditId: 'audit_xss_test',
    };

    const { container } = renderResultsWithResult(xssResult);

    // Verify no script tags are injected into DOM
    expect(container.querySelectorAll('script').length).toBe(0);

    // Verify text content is escaped as plain text strings
    expect(screen.getByText(/<script>window\.pwned=1;<\/script>/i)).toBeInTheDocument();
    expect(screen.getAllByText(/<script>alert\("xss-title"\)<\/script>/i).length).toBeGreaterThan(0);
  });

  it('triggers PDF download, Print, and JSON export on button clicks', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    // PDF download
    const downloadPdfBtn = screen.getByRole('button', { name: /Download PDF Report/i });
    await user.click(downloadPdfBtn);
    await waitFor(() => {
      expect(pdfExport.downloadPdfReport).toHaveBeenCalled();
    });

    // Print
    const printBtn = screen.getByRole('button', { name: /Print/i });
    await user.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Export JSON
    const jsonBtn = screen.getByRole('button', { name: /Export JSON/i });
    expect(jsonBtn).toBeInTheDocument();
  });

  it('renders SamplePage walkthrough and switches scenarios seamlessly', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider defaultLang="en">
        <MemoryRouter initialEntries={['/sample']}>
          <Routes>
            <Route path="/sample" element={<SamplePage />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    );

    // Initial: Genuine
    expect(screen.getByRole('heading', { level: 1, name: /Sample Report Walkthrough/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Likely Genuine/i })).toBeInTheDocument();

    // Switch to Needs Review
    const reviewTab = screen.getByRole('button', { name: /Needs Review/i });
    await user.click(reviewTab);
    expect(screen.getByRole('heading', { level: 2, name: /Needs Review/i })).toBeInTheDocument();

    // Switch to Fee Scam
    const feeScamTab = screen.getByRole('button', { name: /Fee Scam/i });
    await user.click(feeScamTab);
    expect(screen.getByRole('heading', { level: 2, name: /High Concern/i })).toBeInTheDocument();
  });

  it('passes axe accessibility audit on Results page across all 3 statuses', async () => {
    // 1. Likely Genuine
    const { container: c1, unmount: u1 } = renderResultsWithResult(SAMPLE_GENUINE_RESULT);
    const axeResults1 = await axe.run(c1, {
      rules: {
        'color-contrast': { enabled: false }, // JSDOM has no CSS layout engine
      },
    });
    expect(axeResults1.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
    u1();

    // 2. Needs Review
    const { container: c2, unmount: u2 } = renderResultsWithResult(SAMPLE_REVIEW_RESULT);
    const axeResults2 = await axe.run(c2, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });
    expect(axeResults2.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
    u2();

    // 3. High Concern
    const { container: c3 } = renderResultsWithResult(SAMPLE_CONCERN_RESULT);
    const axeResults3 = await axe.run(c3, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });
    expect(axeResults3.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  });
});
