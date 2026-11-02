import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface RiskLevelBannerProps {
  status: VerificationStatus;
  confidenceScore: number;
  mlScore?: number;
  mlProbability?: number;
  riskLevel?: string;
  summary?: string;
}

export function RiskLevelBanner({
  status,
  confidenceScore,
  mlScore,
  mlProbability,
  summary,
}: RiskLevelBannerProps) {
  const { t } = useLanguage();
  const isConfirmedScam = status === 'CONFIRMED_SCAM';
  const isHighConcern = status === 'HIGH_CONCERN';
  const isCaution = status === 'NEEDS_REVIEW';

  const effectiveMl = mlScore ?? mlProbability;

  const config = isConfirmedScam
    ? {
        stripeClass: 'border-l-4 border-l-status-confirmed-scam-fg',
        badgeClass:
          'bg-status-high-concern-bg/40 text-status-high-concern-fg border border-status-high-concern-border/60',
        statusLabel: t('riskBanner.statusLabelHigh'),
        icon: ShieldAlert,
        iconClass: 'text-status-high-concern-fg',
        title: t('riskBanner.highTitle'),
        subLabel: 'CONFIRMED SCAM / DANGER',
        urgency: t('riskBanner.highUrgency'),
        protocol: t('riskBanner.highProtocol'),
        defaultExplanation: t('riskBanner.highDesc'),
      }
    : isHighConcern
      ? {
          stripeClass: 'border-l-4 border-l-status-high-concern-fg',
          badgeClass:
            'bg-status-high-concern-bg/40 text-status-high-concern-fg border border-status-high-concern-border/60',
          statusLabel: t('riskBanner.statusLabelHigh'),
          icon: ShieldAlert,
          iconClass: 'text-status-high-concern-fg',
          title: t('riskBanner.highTitle'),
          subLabel: t('riskBanner.highSub'),
          urgency: t('riskBanner.highUrgency'),
          protocol: t('riskBanner.highProtocol'),
          defaultExplanation: t('riskBanner.highDesc'),
        }
      : isCaution
        ? {
            stripeClass: 'border-l-4 border-l-status-needs-review-fg',
            badgeClass:
              'bg-status-needs-review-bg/50 text-status-needs-review-fg border border-status-needs-review-border/60',
            statusLabel: t('riskBanner.statusLabelCaution'),
            icon: AlertTriangle,
            iconClass: 'text-status-needs-review-fg',
            title: t('riskBanner.cautionTitle'),
            subLabel: t('riskBanner.cautionSub'),
            urgency: t('riskBanner.cautionUrgency'),
            protocol: t('riskBanner.cautionProtocol'),
            defaultExplanation: t('riskBanner.cautionDesc'),
          }
        : {
            stripeClass: 'border-l-4 border-l-status-likely-genuine-fg',
            badgeClass:
              'bg-status-likely-genuine-bg/50 text-status-likely-genuine-fg border border-status-likely-genuine-border/60',
            statusLabel: t('riskBanner.statusLabelSafe'),
            icon: CheckCircle2,
            iconClass: 'text-status-likely-genuine-fg',
            title: t('riskBanner.safeTitle'),
            subLabel: t('riskBanner.safeSub'),
            urgency: t('riskBanner.safeUrgency'),
            protocol: t('riskBanner.safeProtocol'),
            defaultExplanation: t('riskBanner.safeDesc'),
          };

  const IconComponent = config.icon;
  const explanation = summary || config.defaultExplanation;

  const displayTitle =
    config.title === 'RISK LEVEL: HIGH RISK'
      ? 'Risk Level: High Risk'
      : config.title === 'RISK LEVEL: CAUTION'
        ? 'Risk Level: Caution'
        : config.title === 'RISK LEVEL: LIKELY GENUINE'
          ? 'Risk Level: Likely Genuine'
          : config.title;

  return (
    <div
      id="risk-level-banner"
      data-testid="risk-level-banner"
      className={`bg-surface border border-border ${config.stripeClass} rounded-card p-6 sm:p-7 shadow-sm relative overflow-hidden transition-all`}
    >
      {/* Top Meta Bar: Eyebrow-style label row using --color-muted-subtle, mono text, right-aligned secondary text */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-5 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          {/* Status badge: small pill, subdued fill (10-15% opacity) with status color text */}
          <span className={`${config.badgeClass} px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider rounded-pill`}>
            {config.subLabel}
          </span>
          <span className="font-mono text-xs font-semibold text-muted-subtle uppercase tracking-wider">
            {config.urgency}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs font-semibold text-muted-subtle uppercase tracking-wider text-right">
          <span>{config.protocol}</span>
        </div>
      </div>

      {/* Main Section: Left = Icon in square bordered box + Editorial Serif Title + Constrained Paragraph; Right = Separate Bordered Sub-card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          {/* Status Icon in a small bordered square box */}
          <div className="w-11 h-11 rounded-chip bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <IconComponent size={22} className={config.iconClass} aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Editorial Serif Headline in sentence case */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug line-clamp-2">
              {displayTitle}
            </h2>

            {/* Constrained Supporting Paragraph */}
            <p className="mt-2 text-xs sm:text-sm font-normal text-muted-foreground leading-relaxed max-w-xl">
              {explanation}
            </p>
          </div>
        </div>

        {/* Secondary Info Box: Separate bordered sub-card placed beside headline block */}
        <div
          data-testid="ml-confidence-score"
          className="bg-surface border border-border rounded-card p-3.5 sm:p-4 flex items-center gap-3.5 shrink-0 self-start lg:self-center shadow-sm"
        >
          <div className="w-9 h-9 rounded-chip bg-muted-subtle/10 border border-border flex items-center justify-center shrink-0 text-muted-foreground">
            <Sparkles size={16} aria-hidden="true" />
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[10px] sm:text-xs font-semibold text-muted-subtle uppercase tracking-wider">
              {effectiveMl !== undefined ? t('riskBanner.mlTelemetry') : t('riskBanner.ruleTelemetry')}
            </span>

            <span className="font-mono text-xs sm:text-sm font-bold text-foreground mt-0.5">
              {effectiveMl !== undefined
                ? `${t('riskBanner.mlScamProbability')} ${(effectiveMl * 100).toFixed(1)}%`
                : `${t('riskBanner.ruleConfidence')} ${confidenceScore}%`}
            </span>

            <span className="text-[11px] font-normal text-muted-foreground mt-0.5">
              {config.statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskLevelBanner;
