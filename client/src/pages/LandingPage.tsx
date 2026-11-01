import React from 'react';
import { Hero } from '../components/landing/Hero.js';
import { SubmissionCard } from '../components/landing/SubmissionCard.js';
import { FeatureMatrix } from '../components/landing/FeatureMatrix.js';
import { AuditSteps } from '../components/landing/AuditSteps.js';
import { GuidelinesAndHelpline } from '../components/landing/GuidelinesAndHelpline.js';

export function LandingPage() {
  return (
    <div className="w-full">
      {/* 1. Hero Section (pt-20 sm:pt-24 lg:pt-24, headline, 2 CTAs, 3-feature strip, verified channels) */}
      <Hero />

      {/* 2. Interactive Submission Card (Paste/Upload tabs, clipboard paste, 25-char minimum, 3 scenarios) */}
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <SubmissionCard />
      </div>

      {/* 3. Feature Matrix: Legitimate vs Scam Signals */}
      <FeatureMatrix />

      {/* 4. Three-Step Heuristic Audit Walkthrough */}
      <AuditSteps />

      {/* 5. Safety Guidelines & 1930 National Helpline Card */}
      <GuidelinesAndHelpline />
    </div>
  );
}

export default LandingPage;
