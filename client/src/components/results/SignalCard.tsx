import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { type Signal, type SignalSeverity } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const { t } = useLanguage();

  const severityBadgeConfig: Record<
    SignalSeverity,
    { label: string; bg: string; text: string; border: string; icon: typeof AlertTriangle }
  > = {
    critical: {
      label: 'Critical Risk',
      bg: 'bg-status-high-concern-bg',
      text: 'text-status-high-concern-fg',
      border: 'border-status-high-concern-border',
      icon: ShieldAlert,
    },
    high: {
      label: 'High Concern',
      bg: 'bg-status-high-concern-bg',
      text: 'text-status-high-concern-fg',
      border: 'border-status-high-concern-border',
      icon: AlertTriangle,
    },
    medium: {
      label: 'Caution',
      bg: 'bg-status-needs-review-bg',
      text: 'text-status-needs-review-fg',
      border: 'border-status-needs-review-border',
      icon: AlertCircle,
    },
    low: {
      label: 'Minor',
      bg: 'bg-background',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: Info,
    },
    info: {
      label: 'Observation',
      bg: 'bg-background',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: Info,
    },
  };

  const badge = severityBadgeConfig[signal.severity] || severityBadgeConfig.info;
  const IconComponent = badge.icon;

  return (
    <div className="p-4 sm:p-5 bg-surface border border-border rounded-card shadow-sm space-y-3">
      {/* Title & Severity Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            {signal.title}
          </h4>
          {signal.category && signal.category !== 'other' && (
            <span className="px-2 py-0.5 rounded-chip text-[10px] font-mono uppercase bg-background border border-border text-muted-foreground">
              {signal.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold border rounded-chip uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <IconComponent size={11} className="shrink-0" />
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Quoted Evidence */}
      {signal.evidence && (
        <div className="p-3 bg-background/60 border-l-2 border-primary rounded text-xs font-mono text-foreground space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
            {t('results.evidenceQuote') || 'Extracted Evidence'}
          </span>
          <p className="italic leading-relaxed break-words">"{signal.evidence}"</p>
        </div>
      )}

      {/* Why it Matters */}
      <div className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
        <span className="font-semibold text-foreground mr-1">
          {t('results.whyItMatters') || 'Why it matters'}:
        </span>
        <span>{signal.whyItMatters}</span>
      </div>
    </div>
  );
}

