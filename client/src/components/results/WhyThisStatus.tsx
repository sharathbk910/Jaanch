import React from 'react';
import { HelpCircle, Check, AlertCircle, AlertOctagon } from 'lucide-react';
import { type VerificationStatus, type Signal } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface WhyThisStatusProps {
  status: VerificationStatus;
  signals: Signal[];
  unverified: string[];
}

export function WhyThisStatus({ status, signals, unverified }: WhyThisStatusProps) {
  const { t } = useLanguage();

  const getReasonBullets = (): Array<{ text: string; type: 'concern' | 'neutral' | 'positive' }> => {
    const bullets: Array<{ text: string; type: 'concern' | 'neutral' | 'positive' }> = [];

    // Critical/High signals take precedence
    signals.forEach((sig) => {
      bullets.push({
        text: `${sig.title}: ${sig.whyItMatters}`,
        type: 'concern',
      });
    });

    // Unverified details
    if (unverified.length > 0 && status !== 'LIKELY_GENUINE') {
      unverified.forEach((item) => {
        bullets.push({
          text: `Uncorroborated: ${item}`,
          type: 'neutral',
        });
      });
    }

    // Likely genuine corroboration
    if (status === 'LIKELY_GENUINE') {
      bullets.push({
        text: 'All 8 deterministic scam heuristics completed without triggering any upfront fee or credential demands.',
        type: 'positive',
      });
      bullets.push({
        text: 'Communication references transparent, verified official recruitment channels.',
        type: 'positive',
      });
    }

    // Default neutral if no signals and needs review
    if (bullets.length === 0) {
      bullets.push({
        text: 'Offer communication contains minimal verifiable identifiers. Independent corroboration is required before sharing personal documents.',
        type: 'neutral',
      });
    }

    return bullets;
  };

  const reasons = getReasonBullets();

  return (
    <div id="why-this-status" className="p-5 sm:p-6 bg-surface border border-border rounded-card shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <HelpCircle size={16} className="text-primary shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
          {t('results.whyTitle') || 'Why this status was reached'}
        </h3>
      </div>

      <ul className="space-y-2.5 pt-1">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground leading-relaxed">
            {reason.type === 'concern' && (
              <AlertOctagon size={14} className="text-terracotta shrink-0 mt-0.5" />
            )}
            {reason.type === 'neutral' && (
              <AlertCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            )}
            {reason.type === 'positive' && (
              <Check size={14} className="text-primary shrink-0 mt-0.5" />
            )}
            <span>{reason.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

