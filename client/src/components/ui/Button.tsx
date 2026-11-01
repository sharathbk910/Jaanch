import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'neo' | 'neo-secondary' | 'neo-yellow';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-bold tracking-wider uppercase rounded-btn transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none select-none';

    const variantClasses = {
      primary: 'bg-btn text-surface hover:bg-btn-hover active:bg-btn',
      outline: 'bg-surface text-primary border border-hairline hover:bg-page active:bg-hairline',
      ghost: 'bg-transparent text-body hover:text-primary hover:bg-page active:bg-hairline',
      neo: 'bg-neo-sky text-foreground border-2 border-neo-border shadow-neo hover:bg-neo-sky-hover hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none',
      'neo-secondary': 'bg-surface text-foreground border-2 border-neo-border shadow-neo hover:bg-neo-sky hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none',
      'neo-yellow': 'bg-neo-yellow text-foreground border-2 border-neo-border shadow-neo-sm hover:bg-neo-sky-hover hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all rounded-none',
    }[variant];

    const sizeClasses = {
      sm: 'h-8 px-3.5 text-xs',
      md: 'h-10 px-5 text-xs sm:text-sm',
      lg: 'h-12 px-6 text-sm',
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
