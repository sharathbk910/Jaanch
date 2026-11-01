import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Shield,
} from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { VerdictBadge } from '../ui/Badge.js';

export interface StatusBannerProps {
  status: VerificationStatus;
  confidenceScore: number;
  checksEvaluatedCount?: number;
  totalChecks?: number;
}

export function StatusBanner({
  status,
  confidenceScore,
  checksEvaluatedCount = 8,
  totalChecks = 8,
}: StatusBannerProps) {
  const { t } = useLanguage();

  const statusConfig = {
    LIKELY_GENUINE: {
      leftBorderClass: 'border-l-4 border-l-status-genuine-border',
      bgClass: 'bg-surface',
      icon: CheckCircle2,
      iconColor: 'text-status-genuine-fg',
      title: t('statusLabels.likelyGenuine') || 'Likely Genuine',
      desc:
        t('statusLabels.likelyGenuineDesc') ||
        'No hard scam indicators detected; corroborated by positive evidence.',
    },
    NEEDS_REVIEW: {
      leftBorderClass: 'border-l-4 border-l-status-review-border',
      bgClass: 'bg-surface',
      icon: AlertTriangle,
      iconColor: 'text-status-review-fg',
      title: t('statusLabels.needsReview') || 'Needs Review',
      desc:
        t('statusLabels.needsReviewDesc') ||
        'Incomplete information or unverified contact channels. Exercise caution.',
    },
    HIGH_CONCERN: {
      leftBorderClass: 'border-l-4 border-l-status-concern-border',
      bgClass: 'bg-surface',
      icon: AlertOctagon,
      iconColor: 'text-status-concern-fg',
      title: t('statusLabels.highConcern') || 'High Concern',
      desc:
        t('statusLabels.highConcernDesc') ||
        'Hard disqualifiers found (upfront fee, OTP request, lookalike domain).',
    },
    CONFIRMED_SCAM: {
      leftBorderClass: 'border-l-4 border-l-status-scam-border',
      bgClass: 'bg-surface',
      icon: XCircle,
      iconColor: 'text-status-scam-fg',
      title: t('statusLabels.confirmedScam') || 'Confirmed Fraud',
      desc:
        t('statusLabels.confirmedScamDesc') ||
        'Matched a verified fraudulent entity in the student safety database.',
    },
  }[status];

  const IconComponent = statusConfig.icon;
  const progressPercent = Math.min(100, Math.round((checksEvaluatedCount / totalChecks) * 100));

  return (
    <div
      id="status-banner"
      className={`border border-border ${statusConfig.leftBorderClass} ${statusConfig.bgClass} rounded-card p-5 sm:p-7 shadow-sm transition-all`}
    >
      {/* Eyebrow & Badges */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border/60">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {t('results.eyebrow') || 'VERIFICATION RESULT'}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">
            {t('results.confidenceLabel') || 'Confidence'}: {confidenceScore}%
          </span>
          <VerdictBadge status={status} size="sm" />
        </div>
      </div>

      {/* Main Status Headline */}
      <div className="flex items-start gap-3.5 mb-3">
        <IconComponent size={28} className={`${statusConfig.iconColor} shrink-0 mt-0.5`} />
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {statusConfig.title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            {statusConfig.desc}
          </p>
        </div>
      </div>

      {/* Coverage MeterBar */}
      <div className="pt-3 border-t border-border/40 mt-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
          <span>
            {t('results.meterLabel') || 'Independent checks evaluated'}: {checksEvaluatedCount} of {totalChecks}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-background rounded-pill overflow-hidden border border-border/50">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-pill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

