import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Flag, Sparkles, Hash, Link2, Search } from 'lucide-react';
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

  const tierLabels: Record<string, { label: string; icon: typeof Hash }> = {
    exact_text: { label: 'Exact Normalized Match', icon: Hash },
    indicator_match: { label: 'Indicator Match', icon: Link2 },
    similarity: { label: 'Text Similarity Match', icon: Search },
    semantic: { label: 'Semantic AI Match', icon: Sparkles },
  };

  const currentTier = tierLabels[intelMatch.tier] || { label: intelMatch.tier, icon: Search };
  const TierIcon = currentTier.icon;

  return (
    <div
      className={`rounded-card border-2 p-5 mb-6 transition-all ${
        isConfirmed
          ? 'bg-status-high-concern-bg border-status-high-concern-border'
          : 'bg-status-needs-review-bg border-status-needs-review-border'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-chip shrink-0 mt-0.5 ${
              isConfirmed
                ? 'bg-status-high-concern-border/20 text-status-high-concern-fg'
                : 'bg-status-needs-review-border/20 text-status-needs-review-fg'
            }`}
          >
            {isConfirmed ? (
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-chip ${
                  isConfirmed
                    ? 'bg-status-high-concern-border/30 text-status-high-concern-fg'
                    : 'bg-status-needs-review-border/30 text-status-needs-review-fg'
                }`}
              >
                {isConfirmed
                  ? t('intelMatch.confirmedBadge') || 'Confirmed Scam Match'
                  : t('intelMatch.suspiciousBadge') || 'Community Threat Match'}
              </span>

              {/* Match Tier Badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-chip bg-surface border border-border text-foreground">
                <TierIcon size={10} className="shrink-0" />
                <span>{currentTier.label}</span>
              </span>

              {/* Confidence Band Badge */}
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-chip bg-surface border border-border text-muted-foreground">
                Confidence: {intelMatch.confidenceBand.replace('_', ' ')}
              </span>

              {/* Similarity Score Badge if present */}
              {typeof intelMatch.similarityScore === 'number' && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-chip bg-surface border border-primary/40 text-primary">
                  {Math.round(intelMatch.similarityScore * 100)}% Match
                </span>
              )}

              <span className="text-xs text-muted-foreground font-mono font-medium">
                {intelMatch.publicId}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
              {intelMatch.explanation}
            </h3>

            {/* Matched Shingle Tokens */}
            {intelMatch.matchedTokens && intelMatch.matchedTokens.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Matched Tokens / Keywords:
                </span>
                <div className="flex flex-wrap gap-1">
                  {intelMatch.matchedTokens.map((tok, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-foreground"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Indicators */}
            {intelMatch.matchedIndicators && intelMatch.matchedIndicators.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t('intelMatch.matchedIndicatorsLabel') || 'Matching Contact / Payment Indicators:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {intelMatch.matchedIndicators.map((ind, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-surface border border-border text-foreground font-bold"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground pt-1">
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
          className="self-start sm:self-auto text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded-chip px-2.5 py-1.5 bg-surface hover:bg-background transition-colors shrink-0"
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
