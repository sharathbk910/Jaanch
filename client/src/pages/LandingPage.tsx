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
        title="Internship Scam Detector & Verification Tool | Jaanch"
        description="Free online internship scam detector and fake job offer verification tool for Indian students. Instantly check offer letters for deposit traps, fake recruiters, and advance fees using 15 explainable heuristic rules and official portal cross-checks."
        keywords="internship scam detector, internship scam checker, fake internship detection, internship verification India, fake job offer detector, verify internship offer online, internship fraud detection, fake internship website checker, online internship verification, job scam detection India"
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
