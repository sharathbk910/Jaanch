import React from 'react';
import { type AnalyzeResult } from '@jaanch/shared';

export interface PdfExportOptions {
  timestamp?: string;
  domain?: string;
  includeOriginalText?: boolean;
  originalText?: string;
}

/**
 * Generates a client-side PDF Blob from analysis results.
 * Strictly guarantees <= 4 pages and compact, high-density layout.
 * Lazy-loads @react-pdf/renderer to optimize initial client bundle size.
 */
export async function generatePdfBlob(
  result: AnalyzeResult,
  optionsOrTimestamp?: string | PdfExportOptions,
  domain?: string
): Promise<Blob> {
  const [{ pdf }, { ReportDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../pdf/ReportDocument.js'),
  ]);

  let opts: PdfExportOptions = {};
  if (typeof optionsOrTimestamp === 'string') {
    opts = { timestamp: optionsOrTimestamp, domain };
  } else if (optionsOrTimestamp) {
    opts = optionsOrTimestamp;
  }

  const doc = React.createElement(ReportDocument, {
    result,
    timestamp: opts.timestamp || new Date().toISOString().split('T')[0],
    domain: opts.domain,
    includeOriginalText: opts.includeOriginalText || false,
    originalText: opts.originalText,
  });

  const pdfInstance = pdf(doc as any);
  return await pdfInstance.toBlob();
}

/**
 * Triggers an immediate browser download of the generated PDF report.
 */
export async function downloadPdfReport(
  result: AnalyzeResult,
  optionsOrTimestamp?: string | PdfExportOptions,
  domain?: string
): Promise<void> {
  const blob = await generatePdfBlob(result, optionsOrTimestamp, domain);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jaanch-audit-${result.auditId || 'report'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
