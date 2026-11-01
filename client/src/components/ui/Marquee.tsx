import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  speed?: number; // duration in seconds
  gap?: string;
  repeat?: number;
}

export function Marquee({
  children,
  direction = 'right',
  pauseOnHover = false,
  className = '',
  speed = 35,
  gap = '1.5rem',
  repeat = 4,
}: MarqueeProps) {
  const animationName = direction === 'left' ? 'marquee-scroll-left' : 'marquee-scroll-right';

  return (
    <div
      className={`group flex overflow-hidden select-none relative gap-[var(--marquee-gap)] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] ${className}`}
      style={{
        ['--marquee-gap' as string]: gap,
        ['--marquee-duration' as string]: `${speed}s`,
        ['--gap' as string]: gap,
        ['--duration' as string]: `${speed}s`,
      }}
    >
      {Array.from({ length: repeat }).map((_, idx) => (
        <div
          key={idx}
          aria-hidden={idx > 0 ? 'true' : undefined}
          className={`flex shrink-0 items-center gap-[var(--marquee-gap)] will-change-transform ${
            direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
          } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export default Marquee;

