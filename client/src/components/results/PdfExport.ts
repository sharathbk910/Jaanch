import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { type AnalyzeResult } from '@jaanch/shared';
import { PdfReportDocument } from './PdfReportDocument.js';

/**
 * Generates a client-side PDF Blob from analysis results.
 * Strictly guarantees <= 4 pages and compact, high-density layout.
 */
export async function generatePdfBlob(
  result: AnalyzeResult,
  timestamp?: string,
  domain?: string
): Promise<Blob> {
  const doc = React.createElement(PdfReportDocument, {
    result,
    timestamp: timestamp || new Date().toISOString().split('T')[0],
    domain,
  });

  const pdfInstance = pdf(doc as any);
  return await pdfInstance.toBlob();
}

/**
 * Triggers an immediate browser download of the generated PDF report.
 */
export async function downloadPdfReport(
  result: AnalyzeResult,
  timestamp?: string,
  domain?: string
): Promise<void> {
  const blob = await generatePdfBlob(result, timestamp, domain);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jaanch-audit-${result.auditId || 'report'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

