import React from 'react';
import { Card } from '../components/ui/Card.js';

export function ResourcesPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-xs text-muted block mb-1">VERIFICATION GUIDE</span>
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">Official Verification Resources</h1>
        <Card padding="md">
          <p className="text-xs text-body leading-relaxed">
            Direct directories for AICTE internship portal, National Scholarship Portal (NSP), UGC apex notices, and verified company portals.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-xs text-muted block mb-1">ABOUT JAANCH</span>
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">Digital Trust & Safety for Indian Students</h1>
        <Card padding="md">
          <p className="text-xs text-body leading-relaxed">
            Jaanch is a non-profit technology initiative built to protect Indian students and early-career jobseekers from predatory employment scams.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-xs text-muted block mb-1">PRIVACY POLICY</span>
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">Privacy Architecture & Data Practices</h1>
        <Card padding="md">
          <p className="text-xs text-body leading-relaxed">
            Deterministic PII redaction by default. Unauthenticated guests store nothing on the server. Authenticated users retain full control with private history and complete data erasure.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <span className="font-mono text-sm text-muted mb-2 block">404 / NOT FOUND</span>
      <h1 className="font-serif text-3xl font-bold text-primary mb-4">Page Not Found</h1>
      <p className="text-xs text-body max-w-md mx-auto mb-6">
        The page you requested could not be found or has been moved.
      </p>
      <a href="/" className="inline-flex px-4 py-2 bg-btn text-surface text-xs font-medium rounded-btn hover:bg-btn-hover">
        Return to Safety Hub
      </a>
    </div>
  );
}
