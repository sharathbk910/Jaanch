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

  it('renders two-column layout with sticky sidebar actions and helpline', () => {
    const { container } = renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass('lg:sticky');

    // Section anchors exist / omitted per user request
    expect(container.querySelector('#verdict')).not.toBeInTheDocument();
    expect(container.querySelector('#stop-protect')).not.toBeInTheDocument();
    expect(container.querySelector('#why-status')).toBeInTheDocument();
    expect(container.querySelector('#signals')).not.toBeInTheDocument();
    expect(container.querySelector('#unverified')).not.toBeInTheDocument();
    expect(container.querySelector('#response-generators')).not.toBeInTheDocument();
    expect(container.querySelector('#link-inspector')).toBeInTheDocument();
    expect(container.querySelector('#next-steps')).toBeInTheDocument();
  });

  it('renders prominent Risk Level & ML Confidence Banner on Results page', () => {
    const customResult: AnalyzeResult = {
      ...SAMPLE_CONCERN_RESULT,
      riskLevel: 'HIGH RISK',
      mlScore: 0.972,
      summary: 'High probability of fraudulent activity. Demanding upfront fees and off-platform recruitment detected.',
    };

    renderResultsWithResult(customResult);
    expect(screen.getByTestId('risk-level-banner')).toBeInTheDocument();
    expect(screen.getByText(/RISK LEVEL: HIGH RISK/i)).toBeInTheDocument();
    expect(screen.getByText(/ML Scam Probability: 97.2%/i)).toBeInTheDocument();
    expect(
      screen.getByText(/High probability of fraudulent activity. Demanding upfront fees and off-platform recruitment detected./i)
    ).toBeInTheDocument();
  });

  it('does not render StatusBanner on Results page per user request', () => {
    const { container } = renderResultsWithResult(SAMPLE_GENUINE_RESULT);
    expect(container.querySelector('#status-banner')).not.toBeInTheDocument();
  });

  it('does not render "Stop and protect yourself" callout on Results page per user request', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);
    expect(document.querySelector('#stop-protect')).not.toBeInTheDocument();
  });

  it('does not render official portal verification checklist per user request', () => {
    renderResultsWithResult(SAMPLE_GENUINE_RESULT);
    expect(document.querySelector('#portal-checklist')).not.toBeInTheDocument();
  });

  it('does not render ResponseGenerators communication templates per user request', () => {
    renderResultsWithResult(SAMPLE_REVIEW_RESULT);
    expect(document.querySelector('#response-generators')).not.toBeInTheDocument();
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
    expect(screen.getByText(/<img src=x onerror=alert\("why-xss"\)>/i)).toBeInTheDocument();
    expect(screen.getAllByText(/<script>alert\("xss-title"\)<\/script>/i).length).toBeGreaterThan(0);
  });

  it('does not render PDF download, Print, JSON export, or report buttons per user request', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.queryByRole('button', { name: /Download PDF Report/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Export JSON/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Print/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Report This Offer/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Report Suspicious Indicator/i })).not.toBeInTheDocument();
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
    expect(screen.getByText(/Verified corporate internship offer with transparent terms/i)).toBeInTheDocument();

    // Switch to Needs Review
    const reviewTab = screen.getByRole('button', { name: /Needs Review/i });
    await user.click(reviewTab);
    expect(screen.getByText(/Informal freelance opportunity using free email/i)).toBeInTheDocument();

    // Switch to Fee Scam
    const feeScamTab = screen.getByRole('button', { name: /Fee Scam/i });
    await user.click(feeScamTab);
    expect(screen.getByText(/Impersonation scam demanding an upfront refundable laptop security deposit/i)).toBeInTheDocument();
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
