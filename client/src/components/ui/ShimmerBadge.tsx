import React from 'react';

interface ShimmerBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerBadge({ children, className = '', ...props }: ShimmerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border-2 border-neo-border bg-neo-yellow text-foreground shadow-neo-sm relative overflow-hidden group select-none ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
    </span>
  );
}

export default ShimmerBadge;
