import React, { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    }[padding];

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'bg-surface border border-hairline rounded-card transition-all',
            paddingClasses,
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
