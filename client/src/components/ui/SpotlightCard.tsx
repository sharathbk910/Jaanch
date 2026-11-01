import React, { useRef, useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface SpotlightCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className = '', ...props }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative overflow-hidden border-2 border-neo-border bg-surface shadow-neo hover:shadow-neo-lg transition-shadow ${className}`}
      {...props}
    >
      {/* Animated Subtle Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isFocused ? 1 : 0,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, var(--color-neo-sky-light), transparent 80%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

export default SpotlightCard;
