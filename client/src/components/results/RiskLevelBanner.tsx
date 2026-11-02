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
  const isHigh = status === 'HIGH_CONCERN' || status === 'CONFIRMED_SCAM';
  const isCaution = status === 'NEEDS_REVIEW';

  const effectiveMl = mlScore ?? mlProbability;

  const config = isHigh
    ? {
        containerClass:
          'bg-red-50 text-red-700 border-2 border-red-200 dark:bg-status-high-concern-bg dark:text-status-high-concern-fg dark:border-status-high-concern-border',
        badgeClass:
          'bg-red-100 text-red-800 border border-red-300 dark:bg-status-high-concern-border/30 dark:text-status-high-concern-fg dark:border-status-high-concern-border',
        pillClass:
          'bg-red-200/70 text-red-900 border border-red-300 dark:bg-status-high-concern-border/40 dark:text-status-high-concern-fg dark:border-status-high-concern-border',
        arcColorClass: 'text-red-600 dark:text-red-500',
        textColorClass: 'text-red-700 dark:text-red-400',
        statusLabel: t('riskBanner.statusLabelHigh'),
        icon: ShieldAlert,
        iconClass: 'text-red-600 dark:text-status-high-concern-fg',
        title: t('riskBanner.highTitle'),
        subLabel: t('riskBanner.highSub'),
        urgency: t('riskBanner.highUrgency'),
        protocol: t('riskBanner.highProtocol'),
        defaultExplanation: t('riskBanner.highDesc'),
      }
    : isCaution
      ? {
          containerClass:
            'bg-amber-50 text-amber-700 border-2 border-amber-200 dark:bg-status-review-bg dark:text-status-review-fg dark:border-status-review-border',
          badgeClass:
            'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-status-review-border/30 dark:text-status-review-fg dark:border-status-review-border',
          pillClass:
            'bg-amber-200/70 text-amber-900 border border-amber-300 dark:bg-status-review-border/40 dark:text-status-review-fg dark:border-status-review-border',
          arcColorClass: 'text-amber-500 dark:text-amber-400',
          textColorClass: 'text-amber-700 dark:text-amber-400',
          statusLabel: t('riskBanner.statusLabelCaution'),
          icon: AlertTriangle,
          iconClass: 'text-amber-600 dark:text-status-review-fg',
          title: t('riskBanner.cautionTitle'),
          subLabel: t('riskBanner.cautionSub'),
          urgency: t('riskBanner.cautionUrgency'),
          protocol: t('riskBanner.cautionProtocol'),
          defaultExplanation: t('riskBanner.cautionDesc'),
        }
      : {
          containerClass:
            'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 dark:bg-status-likely-genuine-bg dark:text-status-likely-genuine-fg dark:border-status-likely-genuine-border',
          badgeClass:
            'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-status-likely-genuine-border/30 dark:text-status-likely-genuine-fg dark:border-status-likely-genuine-border',
          pillClass:
            'bg-emerald-200/70 text-emerald-900 border border-emerald-300 dark:bg-status-likely-genuine-border/40 dark:text-status-likely-genuine-fg dark:border-status-likely-genuine-border',
          arcColorClass: 'text-teal-600 dark:text-teal-400',
          textColorClass: 'text-teal-700 dark:text-teal-400',
          statusLabel: t('riskBanner.statusLabelSafe'),
          icon: CheckCircle2,
          iconClass: 'text-emerald-600 dark:text-status-likely-genuine-fg',
          title: t('riskBanner.safeTitle'),
          subLabel: t('riskBanner.safeSub'),
          urgency: t('riskBanner.safeUrgency'),
          protocol: t('riskBanner.safeProtocol'),
          defaultExplanation: t('riskBanner.safeDesc'),
        };

  const IconComponent = config.icon;
  const explanation = summary || config.defaultExplanation;

  // Percentage value for the circular donut meter
  const rawPercent = effectiveMl !== undefined ? effectiveMl * 100 : confidenceScore;
  const boundedPercent = Math.min(100, Math.max(0, rawPercent));
  const circumference = 238.76; // 2 * Math.PI * 38
  const dashOffset = circumference - (boundedPercent / 100) * circumference;
  const percentDisplay =
    boundedPercent % 1 === 0 ? boundedPercent.toFixed(0) : boundedPercent.toFixed(1);

  return (
    <div
      id="risk-level-banner"
      data-testid="risk-level-banner"
      className={`${config.containerClass} rounded-card p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all`}
    >
      {/* Top Meta Bar: Severity Badge + Urgency Text */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-current/20">
        <div className="flex items-center gap-2">
          <span className={`${config.badgeClass} px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm`}>
            {config.subLabel}
          </span>
          <span className="font-mono text-[11px] font-semibold opacity-75 uppercase tracking-wide">
            {config.urgency}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] font-semibold opacity-70 uppercase tracking-wider">
          <span>{config.protocol}</span>
        </div>
      </div>

      {/* Main Section: Left = Icon + Title + Explanation; Right = Circular Donut Meter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-2.5 rounded-chip bg-white/70 dark:bg-black/20 border border-current/20 shrink-0 mt-0.5 shadow-sm">
            <IconComponent size={30} className={config.iconClass} aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {config.title}
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed opacity-90 max-w-2xl">
              {explanation}
            </p>
          </div>
        </div>

        {/* Circular Donut Gauge Meter (Radial Percentage Display) */}
        <div
          data-testid="ml-confidence-score"
          className="flex items-center gap-3.5 sm:gap-4 bg-white/85 dark:bg-black/30 border border-current/20 px-4 py-3 rounded-card shadow-sm shrink-0 self-start lg:self-center"
        >
          {/* Radial Donut Gauge */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              {/* Background circular track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="13"
                className="text-black/10 dark:text-white/15"
              />
              {/* Active progress arc */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="13"
                strokeDasharray="238.76"
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                className={`transition-all duration-700 ease-out ${config.arcColorClass}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`font-mono font-bold text-xs sm:text-sm tracking-tight ${config.textColorClass}`}>
                {percentDisplay}%
              </span>
            </div>
          </div>

          {/* Telemetry info */}
          <div className="flex flex-col pr-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="shrink-0 opacity-80" />
              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase opacity-75">
                {effectiveMl !== undefined ? t('riskBanner.mlTelemetry') : t('riskBanner.ruleTelemetry')}
              </span>
            </div>

            <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-foreground/90 mt-0.5">
              {effectiveMl !== undefined
                ? `${t('riskBanner.mlScamProbability')} ${(effectiveMl * 100).toFixed(1)}%`
                : `${t('riskBanner.ruleConfidence')} ${confidenceScore}%`}
            </span>

            <span className="text-[11px] font-semibold opacity-75 mt-0.5">
              {config.statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskLevelBanner;
