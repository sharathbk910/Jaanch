import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Option<T extends string> {
  value: T;
  label: string;
  ariaLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className={twMerge(
        clsx(
          'inline-flex items-center bg-background border border-border rounded-chip p-0.5 select-none',
          className
        )
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-label={opt.ariaLabel || opt.label}
            aria-pressed={isSelected}
            onClick={() => onChange(opt.value)}
            className={twMerge(
              clsx(
                'rounded-chip font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-transparent',
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
                isSelected
                  ? 'bg-neo-sky text-foreground border-neo-border shadow-neo-sm'
                  : 'bg-transparent text-muted-foreground hover:bg-surface hover:text-foreground hover:border-neo-border/40'
              )
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
