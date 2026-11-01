import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, FileCode, ArrowLeft, Loader2 } from 'lucide-react';
import { type AnalyzeResult } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';
import { downloadPdfReport } from './PdfExport.js';

export interface ResultsActionsProps {
  result: AnalyzeResult;
  timestamp?: string;
  domain?: string;
}

export function ResultsActions({ result, timestamp, domain }: ResultsActionsProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadPdfReport(result, timestamp, domain);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jaanch-audit-${result.auditId || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="results-actions" className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/analyze')}
        className="flex items-center gap-1.5 text-xs"
      >
        <ArrowLeft size={14} />
        <span>{t('results.checkAnother') || 'Audit Another Offer'}</span>
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <FileCode size={14} />
          <span>{t('results.exportJson') || 'Export JSON'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs"
        >
          <Printer size={14} />
          <span>{t('results.exportPrint') || 'Print'}</span>
        </Button>

        <Button
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          className="flex items-center gap-1.5 text-xs font-semibold shadow-sm"
        >
          {isExportingPdf ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>{t('results.exportPdf') || 'Download PDF Report'}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

