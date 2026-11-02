import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INTRO_SEEN_KEY, hasSeenBrandIntro, markBrandIntroSeen } from '../../lib/introState.js';

export { INTRO_SEEN_KEY, hasSeenBrandIntro, markBrandIntroSeen };

export type IntroPhase = 'walking' | 'exhausted' | 'resting';

export interface RobotIntroProps {
  forcedPhase?: IntroPhase;
  autoDismiss?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function RobotIntro({
  forcedPhase,
  autoDismiss = true,
  onComplete,
  className = '',
}: RobotIntroProps) {
  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    : false;

  const [phase, setPhase] = useState<IntroPhase>(() => {
    if (forcedPhase) return forcedPhase;
    if (prefersReducedMotion) return 'resting';
    return 'walking';
  });

  const [isDismissed, setIsDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync forcedPhase if prop changes (for test assertions / screenshot capture)
  useEffect(() => {
    if (forcedPhase) {
      setPhase(forcedPhase);
    }
  }, [forcedPhase]);

  // Mark intro as seen in sessionStorage upon mounting
  useEffect(() => {
    markBrandIntroSeen();
  }, []);

  // Sequence controller (2.5s - 3.5s sequence)
  useEffect(() => {
    if (forcedPhase || prefersReducedMotion) {
      return;
    }

    const t1 = setTimeout(() => {
      setPhase('exhausted');
    }, 1500);

    const t2 = setTimeout(() => {
      setPhase('resting');
    }, 2600);

    let t3: ReturnType<typeof setTimeout> | undefined;
    if (autoDismiss) {
      t3 = setTimeout(() => {
        setIsDismissed(true);
        onComplete?.();
      }, 4200);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [forcedPhase, prefersReducedMotion, autoDismiss, onComplete]);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDismissed(true);
        onComplete?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const handleSkip = () => {
    setIsDismissed(true);
    onComplete?.();
  };

  if (isDismissed) {
    return null;
  }

  // Coordinate configurations for the 3 key phases
  // ViewBox: 0 0 1000 360
  // Centered Wordmark position: x = 360, y = 250
  const wordmarkTargetX = phase === 'walking' ? 580 : phase === 'exhausted' ? 400 : 360;
  const robotTargetX = phase === 'walking' ? 320 : phase === 'exhausted' ? 240 : 285;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        data-testid="robot-intro"
        data-phase={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center bg-background/92 backdrop-blur-[2px] ${className}`}
      >
        {/* Accessible Skip Button (interactive with pointer-events-auto) */}
        <div className="absolute top-12 right-6 sm:top-14 sm:right-8 z-50 pointer-events-auto">
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip brand intro"
            className="px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-surface border-2 border-neo-border shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip Intro [Esc]
          </button>
        </div>

        {/* Self-contained Decorative 2D SVG Scene */}
        <div className="w-full max-w-4xl px-4 flex items-center justify-center">
          <svg
            viewBox="0 0 1000 360"
            className="w-full h-auto select-none"
            aria-hidden="true"
            role="presentation"
          >
            {/* Ground Baseline & Subtle Shadow */}
            <line
              x1="60"
              y1="280"
              x2="940"
              y2="280"
              stroke="var(--color-neo-border)"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.35"
            />
            <ellipse
              cx={wordmarkTargetX + 140}
              cy="282"
              rx="180"
              ry="5"
              fill="var(--color-neo-shadow)"
              opacity="0.12"
            />
            <ellipse
              cx={robotTargetX}
              cy="282"
              rx="24"
              ry="4"
              fill="var(--color-neo-shadow)"
              opacity="0.2"
            />

            {/* JAANCH Serif Wordmark */}
            <motion.g
              animate={{
                x: wordmarkTargetX,
              }}
              transition={
                prefersReducedMotion || forcedPhase
                  ? { duration: 0 }
                  : { type: 'spring', damping: 26, stiffness: 70 }
              }
            >
              <text
                x="0"
                y="255"
                fill="var(--color-terracotta)"
                className="font-serif font-black tracking-widest text-[84px]"
                style={{
                  fontFamily: 'Newsreader, Georgia, serif',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                }}
              >
                JAANCH
              </text>
            </motion.g>

            {/* Rope Connecting Robot Hand to "J" Left Edge */}
            {phase === 'resting' ? (
              // Phase (d): Rope goes slack, drops to the ground
              <path
                d={`M ${robotTargetX + 10} 240 Q ${robotTargetX + 35} 278 ${wordmarkTargetX - 10} 280 Q ${wordmarkTargetX + 5} 280 ${wordmarkTargetX + 12} 240`}
                fill="none"
                stroke="var(--color-neo-border)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />
            ) : (
              // Phase (a), (b), (c): Taut rope under pulling tension
              <line
                x1={robotTargetX + 22}
                y1={phase === 'exhausted' ? 228 : 220}
                x2={wordmarkTargetX + 10}
                y2={225}
                stroke="var(--color-neo-border)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}

            {/* 2D Blocky/Voxel-Style Robot Character */}
            <motion.g
              animate={{
                x: robotTargetX,
              }}
              transition={
                prefersReducedMotion || forcedPhase
                  ? { duration: 0 }
                  : { type: 'spring', damping: 26, stiffness: 70 }
              }
            >
              {/* Exhaustion Sweat Droplet (Phase c only) */}
              {phase === 'exhausted' && (
                <motion.g
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={
                    forcedPhase || prefersReducedMotion
                      ? { opacity: 1, y: 12, scale: 1.1 }
                      : {
                          opacity: [1, 1, 1, 0.4, 1],
                          y: [0, 14, 26, 34, 0],
                          scale: [1, 1.15, 1, 0.6, 1],
                        }
                  }
                  transition={
                    forcedPhase || prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  <path
                    d="M 24 150 C 24 144 28 138 28 138 C 28 138 32 144 32 150 C 32 155 30 157 28 157 C 26 157 24 155 24 150 Z"
                    fill="var(--color-neo-sky)"
                    stroke="var(--color-neo-border)"
                    strokeWidth="1.5"
                  />
                </motion.g>
              )}

              {/* Robot Body Group with dynamic rotation & stance */}
              <motion.g
                animate={{
                  rotate:
                    phase === 'walking'
                      ? -14 // Leaned forward pulling with effort
                      : phase === 'exhausted'
                      ? 6 // Hunched / slumping forward
                      : 0, // Confident resting pose
                  y:
                    phase === 'exhausted'
                      ? [0, 3, 0] // Heavy-breathing wobble
                      : 0,
                }}
                transition={
                  prefersReducedMotion || forcedPhase
                    ? { duration: 0 }
                    : phase === 'exhausted'
                    ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.3 }
                }
              >
                {/* Robot Antenna */}
                <rect
                  x="-3"
                  y="126"
                  width="6"
                  height="10"
                  rx="2"
                  fill="var(--color-foreground)"
                />
                <circle
                  cx="0"
                  cy="124"
                  r="3.5"
                  fill="var(--color-terracotta)"
                  stroke="var(--color-neo-border)"
                  strokeWidth="1.5"
                />

                {/* Robot Head (Rounded dark rectangular voxel) */}
                <rect
                  x="-20"
                  y="136"
                  width="40"
                  height="34"
                  rx="6"
                  fill="var(--color-foreground)"
                  stroke="var(--color-neo-border)"
                  strokeWidth="2"
                />

                {/* Robot Eyes (Two white dots) */}
                {phase === 'resting' ? (
                  // Facing right towards the "J"
                  <>
                    <circle cx="2" cy="152" r="3" fill="var(--color-surface)" />
                    <circle cx="12" cy="152" r="3" fill="var(--color-surface)" />
                  </>
                ) : (
                  // Facing left in walking / pulling direction
                  <>
                    <circle cx="-12" cy="152" r="3" fill="var(--color-surface)" />
                    <circle cx="-2" cy="152" r="3" fill="var(--color-surface)" />
                  </>
                )}

                {/* Robot Neck */}
                <rect
                  x="-6"
                  y="170"
                  width="12"
                  height="5"
                  rx="1"
                  fill="var(--color-foreground)"
                />

                {/* Robot Torso / Rectangular Body */}
                <rect
                  x="-22"
                  y="175"
                  width="44"
                  height="48"
                  rx="4"
                  fill="var(--color-foreground)"
                  stroke="var(--color-neo-border)"
                  strokeWidth="2"
                />

                {/* Torso Chest Detail Screen */}
                <rect
                  x="-14"
                  y="182"
                  width="28"
                  height="20"
                  rx="3"
                  fill="var(--color-surface)"
                  opacity="0.2"
                />
                <line
                  x1="-10"
                  y1="192"
                  x2="10"
                  y2="192"
                  stroke="var(--color-neo-sky)"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Pelvis / Hip Connector */}
                <rect
                  x="-16"
                  y="223"
                  width="32"
                  height="8"
                  rx="2"
                  fill="var(--color-foreground)"
                />

                {/* LEGS & FEET ANIMATION */}
                {phase === 'walking' ? (
                  // Alternating step poses
                  <g>
                    {/* Front Leg (stepping forward left) */}
                    <rect
                      x="-18"
                      y="231"
                      width="11"
                      height="44"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(-18 -18 231)"
                    />
                    <rect
                      x="-36"
                      y="268"
                      width="18"
                      height="7"
                      rx="2"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />

                    {/* Back Leg (driving back right) */}
                    <rect
                      x="7"
                      y="231"
                      width="11"
                      height="44"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(22 7 231)"
                    />
                    <rect
                      x="18"
                      y="268"
                      width="18"
                      height="7"
                      rx="2"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                  </g>
                ) : phase === 'exhausted' ? (
                  // Exhausted stance: legs slightly bent, feet flat
                  <g>
                    <rect
                      x="-16"
                      y="231"
                      width="12"
                      height="43"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="-22"
                      y="271"
                      width="18"
                      height="7"
                      rx="2"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="4"
                      y="231"
                      width="12"
                      height="43"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="-2"
                      y="271"
                      width="18"
                      height="7"
                      rx="2"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                  </g>
                ) : (
                  // Phase (d): Resting Pose with CROSSED LEGS!
                  <g>
                    {/* Standing support leg (straight down) */}
                    <rect
                      x="-14"
                      y="231"
                      width="11"
                      height="43"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="-18"
                      y="271"
                      width="17"
                      height="7"
                      rx="2"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />

                    {/* Crossed leg (angled over the standing leg, relaxed toe tap) */}
                    <rect
                      x="2"
                      y="231"
                      width="11"
                      height="44"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(-26 2 231)"
                    />
                    <rect
                      x="-22"
                      y="266"
                      width="16"
                      height="7"
                      rx="2"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(10 -22 266)"
                    />
                  </g>
                )}

                {/* ARMS & HANDS ANIMATION */}
                {phase === 'walking' ? (
                  // Walking/Pulling: Rear arm holds rope, front arm swings
                  <g>
                    {/* Left Arm (swinging forward) */}
                    <rect
                      x="-30"
                      y="180"
                      width="10"
                      height="34"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(-30 -30 180)"
                    />
                    {/* Right Arm (reaching back holding rope) */}
                    <rect
                      x="16"
                      y="180"
                      width="10"
                      height="38"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(48 16 180)"
                    />
                    {/* Hand gripping rope */}
                    <circle
                      cx="22"
                      cy="220"
                      r="5"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                  </g>
                ) : phase === 'exhausted' ? (
                  // Exhausted: Shoulders slumped, arms dangling tiredly
                  <g>
                    <rect
                      x="-28"
                      y="182"
                      width="10"
                      height="38"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(8 -28 182)"
                    />
                    <rect
                      x="18"
                      y="182"
                      width="10"
                      height="38"
                      rx="3"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                      transform="rotate(-8 18 182)"
                    />
                  </g>
                ) : (
                  // Resting: One arm casually leaned onto the top of the "J"!
                  <g>
                    {/* Left arm hanging relaxed or on hip */}
                    <path
                      d="M -22 185 L -34 202 L -24 212"
                      fill="none"
                      stroke="var(--color-foreground)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Right arm extended leaning casually onto the top of "J" */}
                    <path
                      d="M 18 186 L 46 195 L 75 198"
                      fill="none"
                      stroke="var(--color-foreground)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Hand resting squarely on the J */}
                    <circle
                      cx="75"
                      cy="198"
                      r="6"
                      fill="var(--color-foreground)"
                      stroke="var(--color-neo-border)"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </motion.g>
            </motion.g>
          </svg>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RobotIntro;
