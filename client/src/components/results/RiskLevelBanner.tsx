import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { type VerificationStatus, type AnalyzeResult } from '@jaanch/shared';

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
  riskLevel,
  summary,
}: RiskLevelBannerProps) {
  const isHigh = status === 'HIGH_CONCERN' || status === 'CONFIRMED_SCAM';
  const isCaution = status === 'NEEDS_REVIEW';
  const isSafe = status === 'LIKELY_GENUINE';

  const effectiveMl = mlScore ?? mlProbability;

  const config = isHigh
    ? {
        containerClass:
          'bg-red-50 text-red-700 border-2 border-red-200 dark:bg-status-high-concern-bg dark:text-status-high-concern-fg dark:border-status-high-concern-border',
        badgeClass:
          'bg-red-100 text-red-800 border border-red-300 dark:bg-status-high-concern-border/30 dark:text-status-high-concern-fg dark:border-status-high-concern-border',
        pillClass:
          'bg-red-200/70 text-red-900 border border-red-300 dark:bg-status-high-concern-border/40 dark:text-status-high-concern-fg dark:border-status-high-concern-border',
        icon: ShieldAlert,
        iconClass: 'text-red-600 dark:text-status-high-concern-fg',
        title: 'RISK LEVEL: HIGH RISK',
        subLabel: 'HIGH RISK / DANGER',
        defaultExplanation:
          'High probability of fraudulent activity. Demanding upfront fees, unverified tasks, or off-platform recruitment detected.',
      }
    : isCaution
      ? {
          containerClass:
            'bg-amber-50 text-amber-700 border-2 border-amber-200 dark:bg-status-review-bg dark:text-status-review-fg dark:border-status-review-border',
          badgeClass:
            'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-status-review-border/30 dark:text-status-review-fg dark:border-status-review-border',
          pillClass:
            'bg-amber-200/70 text-amber-900 border border-amber-300 dark:bg-status-review-border/40 dark:text-status-review-fg dark:border-status-review-border',
          icon: AlertTriangle,
          iconClass: 'text-amber-600 dark:text-status-review-fg',
          title: 'RISK LEVEL: CAUTION',
          subLabel: 'CAUTION / NEEDS REVIEW',
          defaultExplanation:
            'Suspicious indicators or unverified contact channels detected. Independent verification recommended before proceeding.',
        }
      : {
          containerClass:
            'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 dark:bg-status-likely-genuine-bg dark:text-status-likely-genuine-fg dark:border-status-likely-genuine-border',
          badgeClass:
            'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-status-likely-genuine-border/30 dark:text-status-likely-genuine-fg dark:border-status-likely-genuine-border',
          pillClass:
            'bg-emerald-200/70 text-emerald-900 border border-emerald-300 dark:bg-status-likely-genuine-border/40 dark:text-status-likely-genuine-fg dark:border-status-likely-genuine-border',
          icon: CheckCircle2,
          iconClass: 'text-emerald-600 dark:text-status-likely-genuine-fg',
          title: 'RISK LEVEL: LIKELY GENUINE',
          subLabel: 'LIKELY GENUINE / SAFE',
          defaultExplanation:
            'High probability of legitimate communication. No predatory fee demands or credential theft patterns identified.',
        };

  const IconComponent = config.icon;
  const explanation = summary || config.defaultExplanation;

  return (
    <div
      id="risk-level-banner"
      data-testid="risk-level-banner"
      className={`${config.containerClass} rounded-card p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all`}
    >
      {/* Top Meta Bar: Severity Badge + ML Confidence Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-current/20">
        <div className="flex items-center gap-2">
          <span className={`${config.badgeClass} px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm`}>
            {config.subLabel}
          </span>
          <span className="font-mono text-[11px] font-semibold opacity-75 uppercase tracking-wide">
            {isHigh ? 'IMMEDIATE ATTENTION REQUIRED' : isCaution ? 'MANUAL RECONCILIATION NEEDED' : 'VERIFIED BENCHMARK'}
          </span>
        </div>

        {/* Prominent ML Confidence / Risk Score */}
        <div className="flex items-center gap-1.5">
          {effectiveMl !== undefined ? (
            <div
              data-testid="ml-confidence-score"
              className={`${config.pillClass} px-3 py-1 rounded-sm flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider`}
            >
              <Sparkles size={13} className="shrink-0 animate-pulse" />
              <span>
                ML Scam Probability: {(effectiveMl * 100).toFixed(1)}%
              </span>
            </div>
          ) : (
            <div
              data-testid="ml-confidence-score"
              className={`${config.pillClass} px-3 py-1 rounded-sm flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider`}
            >
              <Sparkles size={13} className="shrink-0" />
              <span>
                Rule Confidence: {confidenceScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Title & Verdict Explanation */}
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-chip bg-white/70 dark:bg-black/20 border border-current/20 shrink-0 mt-0.5 shadow-sm">
          <IconComponent size={30} className={config.iconClass} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {config.title}
          </h2>

          <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed opacity-90 max-w-3xl">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskLevelBanner;

