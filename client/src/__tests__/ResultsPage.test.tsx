/** @vitest-environment jsdom */
import './setup.js';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  ResultsPage,
  SamplePage,
  SAMPLE_GENUINE_RESULT,
  SAMPLE_REVIEW_RESULT,
  SAMPLE_CONCERN_RESULT,
} from '../pages/ResultsPage.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import * as pdfExport from '../components/results/PdfExport.js';
import * as guestSession from '../lib/guestSession.js';

vi.mock('../components/results/PdfExport.js', () => ({
  downloadPdfReport: vi.fn(),
  generatePdfBlob: vi.fn(),
}));

function renderResultsWithResult(result = SAMPLE_CONCERN_RESULT, path = '/results/local') {
  return render(
    <LanguageProvider defaultLang="en">
      <MemoryRouter initialEntries={[{ pathname: path, state: { result } }]}>
        <Routes>
          <Route path="/results/local" element={<ResultsPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/sample" element={<SamplePage />} />
          <Route path="/analyze" element={<div data-testid="analyze-view">Analyze View</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('Phase 6C – Results Page & PDF Export (ResultsPage.tsx)', () => {
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

  it('renders StatusBanner with High Concern verdict and confidence meter', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.getByRole('heading', { level: 2, name: /High Concern/i })).toBeInTheDocument();
    expect(screen.getByText(/Independent checks evaluated: 8 of 8/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 96%/i)).toBeInTheDocument();
  });

  it('renders PaymentAlert with 1930 Helpline and cybercrime.gov.in links for fee scam', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Payment & Banking Security Advisory/i)).toBeInTheDocument();
    expect(screen.getByText(/Fee Demanded:/i)).toBeInTheDocument();
    expect(screen.getAllByText('₹3,500').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tcs\.hr@okaxis/i).length).toBeGreaterThan(0);

    const call1930Link = screen.getByRole('link', { name: /Call 1930/i });
    expect(call1930Link).toHaveAttribute('href', 'tel:1930');

    const cybercrimeLink = screen.getByRole('link', { name: /cybercrime\.gov\.in/i });
    expect(cybercrimeLink).toHaveAttribute('href', 'https://cybercrime.gov.in');
    expect(cybercrimeLink).toHaveAttribute('target', '_blank');
    expect(cybercrimeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders WhyThisStatus evidence summary bullets', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.getByRole('heading', { level: 3, name: /Why this status was reached/i })).toBeInTheDocument();
    expect(screen.getByText(/Upfront Security Deposit Demanded:/i)).toBeInTheDocument();
  });

  it('renders all triggered SignalCards with quotes and why-it-matters', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.getByText(/Observed Risk Indicators & Signals \(3\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Upfront Security Deposit Demanded/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Deposit ₹3,500 refundable laptop security deposit/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lookalike Typosquat Domain/i).length).toBeGreaterThan(0);
  });

  it('renders UnverifiedPanel when unverified details exist', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.getByRole('heading', { level: 3, name: /Pending & Unverified Details/i })).toBeInTheDocument();
    expect(
      screen.getAllByText(/Email address is not an official @tcs\.com corporate email/i).length
    ).toBeGreaterThan(0);
  });

  it('renders ExtractedEntitiesCard with UPI, phone, amount, and domain details', () => {
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.getByRole('heading', { level: 3, name: /Extracted Opportunity Indicators/i })).toBeInTheDocument();
    expect(screen.getAllByText('tcs.hr@okaxis').length).toBeGreaterThan(0);
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('tcs-careers.net')).toBeInTheDocument();
  });

  it('renders NextSteps with checklist and emergency toggle', async () => {
    const user = userEvent.setup();
    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    expect(screen.getByRole('heading', { level: 3, name: /Actionable Next Steps/i })).toBeInTheDocument();
    expect(screen.getByText(/Cease all communication immediately/i)).toBeInTheDocument();

    // Toggle emergency button
    const emergencyToggle = screen.getByRole('button', {
      name: /I already transferred money or shared sensitive documents/i,
    });
    await user.click(emergencyToggle);

    expect(screen.getByText(/Emergency Action: Call 1930/i)).toBeInTheDocument();
  });

  it('triggers PDF download, Print, and JSON export on button clicks', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderResultsWithResult(SAMPLE_CONCERN_RESULT);

    // Test PDF export button
    const downloadPdfBtn = screen.getByRole('button', { name: /Download PDF Report/i });
    await user.click(downloadPdfBtn);

    await waitFor(() => {
      expect(pdfExport.downloadPdfReport).toHaveBeenCalled();
    });

    // Test Print button
    const printBtn = screen.getByRole('button', { name: /Print/i });
    await user.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Test JSON export button
    const jsonBtn = screen.getByRole('button', { name: /Export JSON/i });
    expect(jsonBtn).toBeInTheDocument();
  });

  it('renders SamplePage walkthrough and allows switching between genuine, review, and concern', async () => {
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

    // Initial state: Genuine
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
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
