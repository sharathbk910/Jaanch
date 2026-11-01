import React from 'react';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface UnverifiedPanelProps {
  unverified: string[];
}

export function UnverifiedPanel({ unverified }: UnverifiedPanelProps) {
  const { t } = useLanguage();

  if (!unverified || unverified.length === 0) {
    return null;
  }

  return (
    <div
      id="unverified-panel"
      className="p-5 sm:p-6 bg-status-needs-review-bg/40 border border-status-needs-review-border rounded-card shadow-sm space-y-3"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-status-needs-review-border/60">
        <HelpCircle size={16} className="text-status-needs-review-fg shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-status-needs-review-fg uppercase tracking-wide">
          {t('results.unverifiedTitle') || 'Pending & Unverified Details'}
        </h3>
      </div>

      <p className="text-xs text-foreground/90 leading-relaxed">
        {t('results.unverifiedDesc') ||
          'The following critical details could not be corroborated from official sources. Exercise caution until independently verified:'}
      </p>

      <ul className="space-y-2 pt-1">
        {unverified.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-status-needs-review-fg shrink-0 mt-1.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

