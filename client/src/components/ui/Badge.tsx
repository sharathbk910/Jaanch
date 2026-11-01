import React, { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertTriangle, XCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';

export interface VerdictBadgeProps {
  status: VerificationStatus;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function VerdictBadge({ status, label, className, size = 'md' }: VerdictBadgeProps) {
  const configs = {
    LIKELY_GENUINE: {
      defaultLabel: 'Likely Genuine',
      icon: CheckCircle2,
      style: 'bg-status-genuine-bg text-status-genuine-fg border-status-genuine-border',
    },
    NEEDS_REVIEW: {
      defaultLabel: 'Needs Review',
      icon: AlertTriangle,
      style: 'bg-status-review-bg text-status-review-fg border-status-review-border',
    },
    HIGH_CONCERN: {
      defaultLabel: 'High Concern',
      icon: AlertOctagon,
      style: 'bg-status-concern-bg text-status-concern-fg border-status-concern-border',
    },
    CONFIRMED_SCAM: {
      defaultLabel: 'Confirmed Scam',
      icon: XCircle,
      style: 'bg-status-scam-bg text-status-scam-fg border-status-scam-border',
    },
  }[status];

  const IconComponent = configs.icon;
  const displayText = label || configs.defaultLabel;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium border rounded-chip select-none',
          configs.style,
          sizeClasses,
          className
        )
      )}
    >
      <IconComponent size={iconSize} aria-hidden="true" className="shrink-0" />
      <span>{displayText}</span>
    </span>
  );
}

export interface OutcomeChipProps {
  outcome: 'pass' | 'fail' | 'unknown' | 'neutral';
  label: string;
  className?: string;
  icon?: ReactNode;
}

export function OutcomeChip({ outcome, label, className, icon }: OutcomeChipProps) {
  const outcomeStyles = {
    pass: 'bg-outcome-pass-bg text-outcome-pass-fg border-outcome-pass-border',
    fail: 'bg-outcome-fail-bg text-outcome-fail-fg border-outcome-fail-border',
    unknown: 'bg-outcome-unknown-bg text-outcome-unknown-fg border-outcome-unknown-border',
    neutral: 'bg-outcome-neutral-bg text-outcome-neutral-fg border-outcome-neutral-border',
  }[outcome];

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono border rounded-chip select-none',
          outcomeStyles,
          className
        )
      )}
    >
      {icon ? (
        icon
      ) : outcome === 'pass' ? (
        <CheckCircle2 size={11} aria-hidden="true" />
      ) : outcome === 'fail' ? (
        <XCircle size={11} aria-hidden="true" />
      ) : (
        <HelpCircle size={11} aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}
