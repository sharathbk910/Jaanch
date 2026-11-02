import React from 'react';
import { SEOHead } from '../components/seo/SEOHead.js';
import { Hero } from '../components/landing/Hero.js';
import { SubmissionCard } from '../components/landing/SubmissionCard.js';
import { AuditSteps } from '../components/landing/AuditSteps.js';
import { FeatureMatrix } from '../components/landing/FeatureMatrix.js';
import { GuidelinesAndHelpline } from '../components/landing/GuidelinesAndHelpline.js';

export function LandingPage() {
  return (
    <div className="w-full">
      <SEOHead
        canonicalPath="/"
        title="Jaanch AI – Digital Trust & Safety Platform for Indian Students | Scam Verification"
        description="Free, privacy-first scam verification for Indian students and job seekers. Instantly verify internship offer letters, fake recruiters, upfront deposit traps, and scholarship fraud across MCA, AICTE, and NCS official portals."
      />
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
