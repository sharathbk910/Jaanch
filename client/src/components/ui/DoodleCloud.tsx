import React from 'react';

export interface DoodleCloudProps {
  className?: string;
  size?: number;
}

/**
 * Retro-editorial doodle cloud SVG inspired by MotherDuck design system.
 */
export function DoodleCloud({ className = '', size = 120 }: DoodleCloudProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.55)}
      viewBox="0 0 100 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none text-neo-border ${className}`}
      aria-hidden="true"
    >
      <path
        d="M20 45 C10 45 4 37 6 28 C7 20 15 15 22 17 C26 9 37 4 47 8 C54 3 67 4 72 11 C80 9 89 15 91 23 C97 27 97 38 91 43 C87 47 80 46 76 45 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

