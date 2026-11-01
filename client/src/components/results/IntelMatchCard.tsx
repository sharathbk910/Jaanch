import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, ExternalLink, Flag } from 'lucide-react';
import { type IntelMatch } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { DisputeDialog } from './DisputeDialog.js';

export interface IntelMatchCardProps {
  intelMatch: IntelMatch;
}

export function IntelMatchCard({ intelMatch }: IntelMatchCardProps) {
  const { t } = useLanguage();
  const [disputeOpen, setDisputeOpen] = useState(false);

  const isConfirmed = intelMatch.status === 'confirmed';
  const isSuspicious = intelMatch.status === 'suspicious' || intelMatch.status === 'ai_flagged';

  return (
    <div
      className={`rounded-xl border p-5 mb-6 transition-all ${
        isConfirmed
          ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/20 dark:border-rose-900/60'
          : 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/60'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg mt-0.5 ${
              isConfirmed
                ? 'bg-rose-600 text-white dark:bg-rose-700'
                : 'bg-amber-600 text-white dark:bg-amber-700'
            }`}
          >
            {isConfirmed ? (
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isConfirmed
                    ? 'bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200'
                    : 'bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                }`}
              >
                {isConfirmed
                  ? t('intelMatch.confirmedBadge') || 'Confirmed Scam Match'
                  : t('intelMatch.suspiciousBadge') || 'Community Threat Match'}
              </span>
              <span className="text-xs text-muted-foreground font-mono font-medium">
                {intelMatch.publicId}
              </span>
            </div>

            <h3 className="text-base font-semibold text-foreground mt-1.5">
              {intelMatch.explanation}
            </h3>

            {intelMatch.matchedIndicators && intelMatch.matchedIndicators.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t('intelMatch.matchedIndicatorsLabel') || 'Matching Contact / Payment Indicators:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {intelMatch.matchedIndicators.map((ind, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-foreground"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              {isConfirmed
                ? t('intelMatch.confirmedFooter') ||
                  'This pattern has been investigated and validated by authorized moderators. Do not pay any money or share sensitive documents.'
                : t('intelMatch.suspiciousFooter') ||
                  'Similar messages have been reported by students. Always corroborate credentials directly on official portals before taking action.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDisputeOpen(true)}
          className="self-start sm:self-auto text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border/80 rounded-lg px-2.5 py-1.5 bg-surface hover:bg-muted-subtle transition-colors"
        >
          <Flag className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('intelMatch.contestButton') || 'Contest this record'}</span>
        </button>
      </div>

      <DisputeDialog
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        publicId={intelMatch.publicId}
      />
    </div>
  );
}
