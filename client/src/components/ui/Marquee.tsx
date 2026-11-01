import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  speed?: number; // duration in seconds
}

export function Marquee({
  children,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  speed = 30,
}: MarqueeProps) {
  return (
    <div
      className={`group flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,var(--color-foreground)_10%,var(--color-foreground)_90%,transparent)] ${className}`}
    >
      <div
        className={`flex shrink-0 items-center justify-around gap-8 min-w-full ${
          direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-around gap-8 min-w-full ${
          direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}

export default Marquee;

