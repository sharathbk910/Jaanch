import React, { useState, Suspense } from 'react';
import { Hero } from '../components/landing/Hero.js';
import { SubmissionCard } from '../components/landing/SubmissionCard.js';
import { AuditSteps } from '../components/landing/AuditSteps.js';
import { FeatureMatrix } from '../components/landing/FeatureMatrix.js';
import { GuidelinesAndHelpline } from '../components/landing/GuidelinesAndHelpline.js';
import { hasSeenBrandIntro } from '../lib/introState.js';
import type { IntroPhase } from '../components/intro/RobotIntro.js';

const RobotIntro = React.lazy(() => import('../components/intro/RobotIntro.js'));

export function LandingPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const forcedPhase = (searchParams?.get('introPhase') as IntroPhase | null) || undefined;
  const forceIntro = searchParams?.get('introForce') === 'true' || Boolean(forcedPhase);
  const [showIntro, setShowIntro] = useState(() => forceIntro || !hasSeenBrandIntro());

  return (
    <div className="w-full">
      {/* Phase 14: Non-blocking Animated Brand Intro (lazy-loaded, session-scoped) */}
      {showIntro && (
        <Suspense fallback={null}>
          <RobotIntro
            forcedPhase={forcedPhase}
            autoDismiss={!forcedPhase}
            onComplete={() => setShowIntro(false)}
          />
        </Suspense>
      )}

      {/* 1. MotherDuck Hero Section */}
      <Hero />

      {/* 2. Interactive Submission Card */}
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <SubmissionCard />
      </div>

      {/* 4. MotherDuck 3-Colored Cards (Flights/Guides/Dives) & Wide Testimonial Block */}
      <AuditSteps />

      {/* 5. Heuristic Comparison Feature Matrix */}
      <FeatureMatrix />

      {/* 6. Safety Guidelines & 1930 National Helpline Card */}
      <GuidelinesAndHelpline />
    </div>
  );
}

export default LandingPage;
