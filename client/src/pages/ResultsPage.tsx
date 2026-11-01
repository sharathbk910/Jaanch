import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card.js';
import { VerdictBadge } from '../components/ui/Badge.js';

export function ResultsPage() {
  const { id } = useParams<{ id?: string }>();
  const isLocal = !id;

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="font-mono text-xs text-muted block mb-1">
            {isLocal ? 'LOCAL GUEST AUDIT' : `SAVED AUDIT / ${id}`}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
            Verification Assessment
          </h1>
        </div>

        <Card padding="md" className="mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
            <span className="text-xs font-semibold text-primary">Evaluation Verdict</span>
            <VerdictBadge status="NEEDS_REVIEW" />
          </div>
          <p className="text-xs text-body leading-relaxed">
            Offer analysis results will be displayed here with evidence report, why bullets, and next steps.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function SamplePage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-xs text-muted block mb-1">REFERENCE SCENARIOS</span>
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">Sample Report Walkthrough</h1>
        <Card padding="md">
          <p className="text-xs text-body leading-relaxed">
            Inspect fictional sample scenarios illustrating Likely Genuine, Needs Review, and High Concern offer patterns.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function LinkCheckPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-xs text-muted block mb-1">HYPERLINK INSPECTION</span>
        <h1 className="font-serif text-2xl font-bold text-primary mb-4">Link Inspector</h1>
        <Card padding="md">
          <p className="text-xs text-body leading-relaxed">
            Inspect suspicious links, punycode typosquats, and newly registered domains before clicking.
          </p>
        </Card>
      </div>
    </div>
  );
}

