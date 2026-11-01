import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle, FileSearch, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { type AnalyzeResult, type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../i18n/LanguageContext.js';
import { getGuestAnalysis } from '../lib/guestSession.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { StatusBanner } from '../components/results/StatusBanner.js';
import { PaymentAlert } from '../components/results/PaymentAlert.js';
import { WhyThisStatus } from '../components/results/WhyThisStatus.js';
import { SignalCard } from '../components/results/SignalCard.js';
import { UnverifiedPanel } from '../components/results/UnverifiedPanel.js';
import { ExtractedEntitiesCard } from '../components/results/ExtractedEntitiesCard.js';
import { NextSteps } from '../components/results/NextSteps.js';
import { ResultsActions } from '../components/results/ResultsActions.js';

// Realistic sample scenarios for /sample walkthrough
export const SAMPLE_GENUINE_RESULT: AnalyzeResult = {
  status: 'LIKELY_GENUINE',
  confidenceScore: 94,
  signals: [],
  unverified: [],
  extractedEntities: {
    urls: ['https://springboard.infosys.com'],
    domains: ['springboard.infosys.com'],
    emails: ['internships@infosys.com'],
    phones: ['+91 80 2852 0261'],
    upiHandles: [],
    amounts: ['₹25,000/month'],
    organization: 'Infosys',
  },
  recommendedActions: [
    'Log in to the official portal (springboard.infosys.com) to review project placement details.',
    'Confirm onboarding requirements with your assigned academic coordinator.',
    'Remember that legitimate employers never request any training or equipment deposits.',
  ],
  auditId: 'audit_sample_genuine',
};

export const SAMPLE_REVIEW_RESULT: AnalyzeResult = {
  status: 'NEEDS_REVIEW',
  confidenceScore: 68,
  signals: [
    {
      id: 'sig_unverified_contact',
      ruleId: 'RULE_FREE_EMAIL_CLAIMING_ORG',
      title: 'Informal Communication Channel',
      whyItMatters: 'Recruiter contacted from an unverified free mail address without corporate corroboration.',
      evidence: 'Contact us on apex.recruiting@gmail.com or Telegram @apex_writers',
      severity: 'medium',
    },
  ],
  unverified: [
    'Company website domain whois record was registered less than 90 days ago.',
    'Recruiter identity is not listed on LinkedIn or company switchboard.',
    'Payment terms do not provide an escrow or formal contract.',
  ],
  extractedEntities: {
    urls: ['https://apex-writers-portal.xyz'],
    domains: ['apex-writers-portal.xyz'],
    emails: ['apex.recruiting@gmail.com'],
    phones: ['+91 91234 56789'],
    upiHandles: [],
    amounts: ['₹15,000'],
    organization: 'Apex Content Solutions',
  },
  recommendedActions: [
    'Request a formal written contract with company tax ID (GSTIN/CIN) before submitting work.',
    'Do not share PAN, bank account details, or Aadhaar without verified credentials.',
    'Search the company registration on Ministry of Corporate Affairs (mca.gov.in).',
  ],
  auditId: 'audit_sample_review',
};

export const SAMPLE_CONCERN_RESULT: AnalyzeResult = {
  status: 'HIGH_CONCERN',
  confidenceScore: 96,
  signals: [
    {
      id: 'sig_fee',
      ruleId: 'RULE_UPFRONT_FEE',
      title: 'Upfront Security Deposit Demanded',
      whyItMatters: 'Legitimate employers never demand payment for laptops, training, or job offers.',
      evidence: 'Deposit ₹3,500 refundable laptop security deposit within 2 hours via UPI to tcs.hr@okaxis',
      severity: 'critical',
    },
    {
      id: 'sig_urgency',
      ruleId: 'RULE_COERCIVE_DEADLINE',
      title: 'Coercive Time Pressure Tactics',
      whyItMatters: 'Fraudsters create artificial 2-hour urgency to prevent candidates from verifying with real employers.',
      evidence: 'within 2 hours via UPI or your job offer stands cancelled',
      severity: 'high',
    },
    {
      id: 'sig_domain',
      ruleId: 'RULE_LOOKALIKE_DOMAIN',
      title: 'Lookalike Typosquat Domain',
      whyItMatters: 'Domain mimics Tata Consultancy Services but is registered under an unofficial registrar.',
      evidence: 'http://tcs-careers.net/appointment',
      severity: 'high',
    },
  ],
  unverified: [
    'Email address is not an official @tcs.com corporate email.',
    'Appointment letter is not corroborated in TCS Careers portal.',
  ],
  extractedEntities: {
    urls: ['http://tcs-careers.net/appointment'],
    domains: ['tcs-careers.net'],
    emails: ['careers@tcs-careers.net'],
    phones: ['+91 98765 43210'],
    upiHandles: ['tcs.hr@okaxis'],
    amounts: ['₹3,500'],
    organization: 'TCS',
  },
  recommendedActions: [
    'Do not transfer any money or pay via UPI. This pattern matches known job recruitment scams.',
    'Block the recruiter on WhatsApp, Telegram, and email immediately.',
    'If you have already paid, dial 1930 immediately or file a report at cybercrime.gov.in.',
  ],
  auditId: 'audit_sample_concern',
};

export function ResultsPage() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [result, setResult] = useState<AnalyzeResult | null>(() => {
    // 1. Check navigation location.state
    if (location.state && typeof location.state === 'object' && 'result' in location.state) {
      return (location.state as { result: AnalyzeResult }).result;
    }
    // 2. Check guest session storage
    const guestSession = getGuestAnalysis();
    if (guestSession?.result) {
      return guestSession.result;
    }
    return null;
  });

  const isLocal = !id || id === 'local';

  // Has upfront fee or OTP signals
  const hasFeeOrOtp = Boolean(
    result?.signals?.some(
      (s) => s.ruleId === 'RULE_UPFRONT_FEE' || s.ruleId === 'RULE_BANK_OTP_DEBIT'
    ) ||
      (result?.extractedEntities?.amounts && result.extractedEntities.amounts.length > 0) ||
      (result?.extractedEntities?.upiHandles && result.extractedEntities.upiHandles.length > 0)
  );

  const amount = result?.extractedEntities?.amounts?.[0];
  const upi = result?.extractedEntities?.upiHandles?.[0];
  const hasOtpDemand = result?.signals?.some((s) => s.ruleId === 'RULE_BANK_OTP_DEBIT');

  if (!result) {
    return (
      <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="pb-2 border-b border-border/60">
            <span className="font-mono text-[11px] text-muted-foreground uppercase font-medium">
              {isLocal ? 'LOCAL GUEST AUDIT' : `SAVED AUDIT / ${id}`}
            </span>
          </div>

          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 rounded-pill bg-surface border border-border flex items-center justify-center mx-auto text-muted-foreground shadow-sm">
              <FileSearch size={22} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {t('results.emptyTitle') || 'No Audit Result Loaded'}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('results.emptyDesc') ||
                'Please enter offer text on the Analyze page to view deterministic verification results.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button onClick={() => navigate('/analyze')} size="sm">
                {t('results.emptyCta') || 'Audit an Offer'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/sample')}>
                {t('results.sampleWalkthroughTitle') || 'Explore Sample Reports'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Eyebrow & Navigation Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              <ArrowLeft size={14} />
              <span>{t('results.checkAnother') || 'Back to Analyzer'}</span>
            </button>
            <span className="text-border">/</span>
            <span className="font-mono text-[11px] text-muted-foreground uppercase">
              {isLocal ? 'LOCAL GUEST AUDIT' : `SAVED AUDIT / ${result.auditId}`}
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        {/* Mobile Sticky Section Chips */}
        <div className="flex sm:hidden overflow-x-auto gap-2 py-2 sticky top-[53px] z-20 bg-background/95 backdrop-blur border-b border-border text-xs select-none">
          <a href="#status-banner" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
            Status
          </a>
          {hasFeeOrOtp && (
            <a href="#payment-alert" className="px-2.5 py-1 bg-status-high-concern-bg text-status-high-concern-fg border border-status-high-concern-border rounded-chip text-[11px] font-semibold shrink-0">
              Payment Alert
            </a>
          )}
          <a href="#why-this-status" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
            Why Bullets
          </a>
          <a href="#next-steps" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
            Next Steps
          </a>
          <a href="#observed-signals" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
            Signals ({result.signals.length})
          </a>
        </div>

        {/* 1. Status Banner */}
        <StatusBanner
          status={result.status}
          confidenceScore={result.confidenceScore}
          checksEvaluatedCount={8}
          totalChecks={8}
        />

        {/* 2. Payment Alert (if fee or OTP demand detected) */}
        {hasFeeOrOtp && (
          <PaymentAlert
            amount={amount}
            upiHandle={upi}
            hasOtpDemand={hasOtpDemand}
          />
        )}

        {/* 3. Why this Status (Evidence Bullets) */}
        <WhyThisStatus
          status={result.status}
          signals={result.signals}
          unverified={result.unverified}
        />

        {/* 4. Actionable Next Steps (What Jaanch checked, Student checklist, Emergency) */}
        <NextSteps
          status={result.status}
          recommendedActions={result.recommendedActions}
        />

        {/* 5. Unverified Details Panel */}
        <UnverifiedPanel unverified={result.unverified} />

        {/* 6. Observed Signals List */}
        <div id="observed-signals" className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
              {t('results.signalsTitle') || 'Observed Risk Indicators & Signals'} ({result.signals.length})
            </h3>
          </div>

          {result.signals.length === 0 ? (
            <div className="p-5 bg-surface border border-border rounded-card text-xs text-muted-foreground text-center">
              {t('results.signalsEmpty') || 'No hard scam indicators detected in the submitted communication.'}
            </div>
          ) : (
            <div className="space-y-3">
              {result.signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
        </div>

        {/* 7. Extracted Opportunity Indicators */}
        <ExtractedEntitiesCard entities={result.extractedEntities} />

        {/* 8. Export Actions (PDF, Print, JSON, Audit Another) */}
        <ResultsActions result={result} />
      </div>
    </main>
  );
}

/**
 * Fictional sample report walkthrough page (/sample)
 */
export function SamplePage() {
  const { t } = useLanguage();
  const [activeScenario, setActiveScenario] = useState<'genuine' | 'review' | 'concern'>('genuine');

  const scenarioMap = {
    genuine: {
      result: SAMPLE_GENUINE_RESULT,
      label: 'Likely Genuine',
      icon: CheckCircle2,
      subtitle: 'Verified corporate internship offer with transparent terms and no upfront fees.',
    },
    review: {
      result: SAMPLE_REVIEW_RESULT,
      label: 'Needs Review',
      icon: AlertTriangle,
      subtitle: 'Informal freelance opportunity using free email without official corporate verification.',
    },
    concern: {
      result: SAMPLE_CONCERN_RESULT,
      label: 'High Concern',
      icon: AlertOctagon,
      subtitle: 'Impersonation scam demanding an upfront refundable laptop security deposit via personal UPI.',
    },
  };

  const current = scenarioMap[activeScenario];
  const result = current.result;

  const hasFeeOrOtp = Boolean(
    result.signals.some((s) => s.ruleId === 'RULE_UPFRONT_FEE' || s.ruleId === 'RULE_BANK_OTP_DEBIT') ||
      (result.extractedEntities.amounts && result.extractedEntities.amounts.length > 0) ||
      (result.extractedEntities.upiHandles && result.extractedEntities.upiHandles.length > 0)
  );

  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2 font-medium">
            {t('results.eyebrow') || 'REFERENCE SCENARIOS'}
          </span>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {t('results.sampleWalkthroughTitle') || 'Sample Report Walkthrough'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('results.sampleWalkthroughSubtitle') ||
              'Interactive reference reports illustrating the four-verdict model and evidence architecture.'}
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex p-1 bg-background border border-border rounded-chip justify-center gap-1.5 select-none">
          <button
            type="button"
            onClick={() => setActiveScenario('genuine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-xs font-semibold transition-all ${
              activeScenario === 'genuine'
                ? 'bg-status-genuine-bg text-status-genuine-fg border border-status-genuine-border shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>{t('results.sampleTabGenuine') || 'Genuine Offer'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario('review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-xs font-semibold transition-all ${
              activeScenario === 'review'
                ? 'bg-status-review-bg text-status-review-fg border border-status-review-border shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle size={13} />
            <span>{t('results.sampleTabReview') || 'Needs Review'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario('concern')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-xs font-semibold transition-all ${
              activeScenario === 'concern'
                ? 'bg-status-concern-bg text-status-concern-fg border border-status-concern-border shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertOctagon size={13} />
            <span>{t('results.sampleTabConcern') || 'Fee Scam'}</span>
          </button>
        </div>

        {/* Subtitle description for selected sample */}
        <p className="text-center text-xs text-muted-foreground italic -mt-2">
          {current.subtitle}
        </p>

        {/* Render Selected Result */}
        <StatusBanner
          status={result.status}
          confidenceScore={result.confidenceScore}
          checksEvaluatedCount={8}
          totalChecks={8}
        />

        {hasFeeOrOtp && (
          <PaymentAlert
            amount={result.extractedEntities.amounts?.[0]}
            upiHandle={result.extractedEntities.upiHandles?.[0]}
            hasOtpDemand={result.signals.some((s) => s.ruleId === 'RULE_BANK_OTP_DEBIT')}
          />
        )}

        <WhyThisStatus
          status={result.status}
          signals={result.signals}
          unverified={result.unverified}
        />

        <NextSteps
          status={result.status}
          recommendedActions={result.recommendedActions}
        />

        <UnverifiedPanel unverified={result.unverified} />

        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
            {t('results.signalsTitle') || 'Observed Risk Indicators & Signals'} ({result.signals.length})
          </h3>
          {result.signals.length === 0 ? (
            <div className="p-5 bg-surface border border-border rounded-card text-xs text-muted-foreground text-center">
              {t('results.signalsEmpty') || 'No hard scam indicators detected in the submitted communication.'}
            </div>
          ) : (
            <div className="space-y-3">
              {result.signals.map((sig) => (
                <SignalCard key={sig.id} signal={sig} />
              ))}
            </div>
          )}
        </div>

        <ExtractedEntitiesCard entities={result.extractedEntities} />

        <ResultsActions result={result} />
      </div>
    </main>
  );
}

/**
 * LinkCheckPage placeholder for link verification
 */
export function LinkCheckPage() {
  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-xs text-muted-foreground block mb-1 font-medium">
          HYPERLINK INSPECTION
        </span>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-4">
          Link Inspector
        </h1>
        <Card padding="md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Inspect suspicious links, punycode typosquats, and newly registered domains before clicking.
          </p>
        </Card>
      </div>
    </main>
  );
}
