import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none select-none';

    const variantClasses = {
      primary: 'bg-btn text-surface hover:bg-btn-hover active:bg-btn',
      outline: 'bg-surface text-primary border border-hairline hover:bg-page active:bg-hairline',
      ghost: 'bg-transparent text-body hover:text-primary hover:bg-page active:bg-hairline',
    }[variant];

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-xs',
      lg: 'h-10 px-5 text-sm',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(baseClasses, variantClasses, sizeClasses, className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
