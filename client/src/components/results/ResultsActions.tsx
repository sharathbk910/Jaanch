import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { type AnalyzeResult } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';

export interface ResultsActionsProps {
  result: AnalyzeResult;
  timestamp?: string;
  domain?: string;
}

export function ResultsActions({ result: _result, timestamp: _timestamp, domain: _domain }: ResultsActionsProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    </div>
  );
}

export default ResultsActions;
