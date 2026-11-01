import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Option<T extends string> {
  value: T;
  label: string;
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
          'inline-flex items-center bg-page border border-hairline rounded-chip p-0.5 select-none',
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
            onClick={() => onChange(opt.value)}
            className={twMerge(
              clsx(
                'rounded-chip font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
                isSelected
                  ? 'bg-btn text-surface'
                  : 'bg-transparent text-body hover:text-primary'
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
