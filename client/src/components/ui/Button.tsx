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
      'inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variantClasses = {
      primary: 'bg-btn text-foreground border-2 border-neo-border shadow-neo hover:bg-btn-hover hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none cursor-pointer',
      outline: 'bg-surface text-foreground border border-hairline shadow-neo-sm hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none cursor-pointer',
      ghost: 'bg-transparent text-body hover:text-primary hover:bg-page active:bg-hairline rounded-none',
      neo: 'bg-neo-sky text-foreground border-2 border-neo-border shadow-neo hover:bg-neo-sky-light hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none cursor-pointer',
      'neo-secondary': 'bg-surface text-foreground border-2 border-neo-border shadow-neo hover:bg-neo-sky hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none cursor-pointer',
      'neo-yellow': 'bg-neo-sky text-foreground border-2 border-neo-border shadow-neo hover:bg-neo-sky-light hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all rounded-none cursor-pointer',
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
