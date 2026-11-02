import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  speed?: number; // duration in seconds for one full loop
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
  const animationClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  return (
    <div
      className={`group flex overflow-hidden select-none relative w-full [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] ${className}`}
      style={{
        ['--marquee-duration' as string]: `${speed}s`,
        ['--duration' as string]: `${speed}s`,
      }}
    >
      <div
        className={`flex shrink-0 w-max transform-gpu will-change-transform ${animationClass} ${
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {Array.from({ length: repeat }).map((_, idx) => (
          <div
            key={idx}
            aria-hidden={idx > 0 ? 'true' : undefined}
            className="flex shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;

