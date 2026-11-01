import React, { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={twMerge(
          clsx(
            'w-full px-3 py-2 text-xs bg-surface text-primary border rounded-input placeholder:text-placeholder transition-colors focus:outline-none focus:ring-1 focus:ring-accent',
            error ? 'border-status-concern-border focus:ring-status-concern-border' : 'border-control',
            className
          )
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={twMerge(
          clsx(
            'w-full p-3 text-xs bg-surface text-primary border rounded-input placeholder:text-placeholder transition-colors focus:outline-none focus:ring-1 focus:ring-accent resize-y',
            error ? 'border-status-concern-border focus:ring-status-concern-border' : 'border-control',
            className
          )
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

