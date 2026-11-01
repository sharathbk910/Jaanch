import React from 'react';
import { Hero } from '../components/landing/Hero.js';
import { TrustMarquee } from '../components/ui/TrustMarquee.js';
import { SubmissionCard } from '../components/landing/SubmissionCard.js';
import { AuditSteps } from '../components/landing/AuditSteps.js';
import { FeatureMatrix } from '../components/landing/FeatureMatrix.js';
import { GuidelinesAndHelpline } from '../components/landing/GuidelinesAndHelpline.js';

export function LandingPage() {
  return (
    <div className="w-full">
      {/* 1. MotherDuck Hero Section */}
      <Hero />

      {/* 2. Magic UI Infinite Trust Marquee */}
      <TrustMarquee />

      {/* 3. Interactive Submission Card */}
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
