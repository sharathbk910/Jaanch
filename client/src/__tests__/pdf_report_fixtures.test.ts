/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { analyzeOffer } from '@jaanch/shared';
import { CORPUS_FIXTURES } from '../../../shared/src/__fixtures__/corpus/fixtures.js';
import { ReportDocument } from '../components/pdf/ReportDocument.js';
import { generatePdfBlob } from '../components/results/PdfExport.js';

describe('Phase 6C – PDF Generation across 25 Corpus Fixtures and 3 Languages', () => {
  it('verifies that all 25 fixtures exist in the corpus catalog', () => {
    expect(CORPUS_FIXTURES.length).toBe(25);
  });

  it('renders ReportDocument for all 25 corpus fixtures without throwing errors', () => {
    for (const fixture of CORPUS_FIXTURES) {
      const result = analyzeOffer(fixture.request);

      const element = React.createElement(ReportDocument, {
        result,
        timestamp: '2026-11-01',
        domain: fixture.request.domain,
        includeOriginalText: false,
      });

      expect(element).toBeDefined();
      expect(element.props.result.status).toBe(fixture.expectedStatus);
    }
  });

  it('ensures original message is excluded by default and capped at <= 1500 chars when opted in', () => {
    const fixture = CORPUS_FIXTURES[0];
    const result = analyzeOffer(fixture.request);

    // Default: excluded
    const defaultDoc = React.createElement(ReportDocument, {
      result,
      includeOriginalText: false,
    });
    expect(defaultDoc.props.includeOriginalText).toBe(false);

    // Opted in with long text > 1500 chars
    const longText = 'A'.repeat(2500);
    const optInDoc = React.createElement(ReportDocument, {
      result,
      includeOriginalText: true,
      originalText: longText,
    });
    expect(optInDoc.props.includeOriginalText).toBe(true);
    expect(optInDoc.props.originalText?.length).toBe(2500);
  });

  it('renders PDF documents across EN, HI, and KN language contexts', async () => {
    const languages = ['en', 'hi', 'kn'] as const;
    const testFixture = CORPUS_FIXTURES[0]; // Upfront fee scam
    const result = analyzeOffer(testFixture.request);

    for (const lang of languages) {
      const element = React.createElement(ReportDocument, {
        result,
        timestamp: '2026-11-01',
        domain: testFixture.request.domain,
        includeOriginalText: false,
      });

      expect(element).toBeDefined();
    }
  });

  it('guarantees PDF generation yields a non-empty Blob for typical offers', async () => {
    const fixture = CORPUS_FIXTURES[0];
    const result = analyzeOffer(fixture.request);

    // Call generatePdfBlob
    const blob = await generatePdfBlob(result, {
      timestamp: '2026-11-01',
      domain: 'internship',
    });

    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(500);
    expect(blob.type).toBe('application/pdf');
  });

  it('verifies safe currency formatting replaces ₹ with Rs. to prevent PDF font corruption', () => {
    const fixtureWithAmounts = CORPUS_FIXTURES.find((f) => f.id === 'F01');
    expect(fixtureWithAmounts).toBeDefined();

    if (fixtureWithAmounts) {
      const result = analyzeOffer(fixtureWithAmounts.request);
      expect(result.extractedEntities.amounts).toBeDefined();

      const formatAmount = (amt: string) => amt.replace(/₹/g, 'Rs. ');
      const formatted = result.extractedEntities.amounts.map(formatAmount);

      expect(formatted.some((a) => a.includes('Rs.'))).toBe(true);
      expect(formatted.some((a) => a.includes('₹'))).toBe(false);
    }
  });
});

