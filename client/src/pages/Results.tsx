import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  Printer,
  FileJson,
  RotateCcw,
  PhoneCall,
  ExternalLink,
  Compass,
  Layers,
  HelpCircle,
  Shield,
  ShieldAlert,
  FileText,
  Building,
} from 'lucide-react';
import { type AnalyzeResult, type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../i18n/LanguageContext.js';
import { getGuestAnalysis } from '../lib/guestSession.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { StatusBanner } from '../components/results/StatusBanner.js';
import { PaymentAlert } from '../components/results/PaymentAlert.js';
import { StopProtectCallout } from '../components/results/StopProtectCallout.js';
import { WhyThisStatus } from '../components/results/WhyThisStatus.js';
import { SignalCard } from '../components/results/SignalCard.js';
import { UnverifiedPanel } from '../components/results/UnverifiedPanel.js';
import { PortalChecklist } from '../components/results/PortalChecklist.js';
import { ResponseGenerators } from '../components/results/ResponseGenerators.js';
import { LinkInspector } from '../components/results/LinkInspector.js';
import { ExtractedEntitiesCard } from '../components/results/ExtractedEntitiesCard.js';
import { ReportEntityDialog } from '../components/results/ReportEntityDialog.js';
import { IntelMatchCard } from '../components/results/IntelMatchCard.js';
import { ReportMessageDialog } from '../components/results/ReportMessageDialog.js';
import { NextSteps } from '../components/results/NextSteps.js';
import { downloadPdfReport } from '../components/results/PdfExport.js';
import { WhatsAppShareButton } from '../components/results/WhatsAppShareButton.js';

// Realistic reference scenarios for /sample walkthrough
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

export function Results() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportMessageOpen, setReportMessageOpen] = useState(false);
  const [reportEntityType, setReportEntityType] = useState<'email' | 'domain' | 'phone' | 'upi' | 'bank_account'>('upi');
  const [reportEntityValue, setReportEntityValue] = useState('');

  const rawText =
    (location.state && typeof location.state === 'object' && 'text' in location.state
      ? (location.state as { text?: string }).text
      : null) ||
    getGuestAnalysis()?.inputText ||
    '';

  const handleOpenReport = (type: 'email' | 'domain' | 'phone' | 'upi' | 'bank_account' = 'upi', val = '') => {
    setReportEntityType(type);
    setReportEntityValue(val);
    setReportDialogOpen(true);
  };

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
  const isHighConcern = result?.status === 'HIGH_CONCERN' || result?.status === 'CONFIRMED_SCAM';
  const hasFeeOrOtp = Boolean(
    isHighConcern ||
    result?.signals?.some(
      (s) => s.ruleId === 'RULE_UPFRONT_FEE' || s.ruleId === 'RULE_BANK_OTP_DEBIT'
    ) ||
    (result?.extractedEntities?.amounts && result.extractedEntities.amounts.length > 0) ||
    (result?.extractedEntities?.upiHandles && result.extractedEntities.upiHandles.length > 0)
  );

  const amount = result?.extractedEntities?.amounts?.[0];
  const upi = result?.extractedEntities?.upiHandles?.[0];

  const handleDownloadPdf = async () => {
    if (!result) return;
    try {
      setDownloadingPdf(true);
      await downloadPdfReport(result);
    } catch {
      // Graceful error handling
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jaanch-audit-${result.auditId || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
              {t('results.emptyTitle')}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('results.emptyDesc')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button onClick={() => navigate('/analyze')} size="sm">
                {t('results.emptyCta')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/sample')}>
                {t('results.sampleWalkthroughTitle')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Eyebrow & Top Navigation Bar */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            <ArrowLeft size={14} />
            <span>{t('results.checkAnother')}</span>
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

      {/* Mobile Sticky Section Chips (< lg) */}
      <div className="flex lg:hidden overflow-x-auto gap-2 py-2 sticky top-[53px] z-20 bg-background/95 backdrop-blur border-b border-border text-xs select-none mb-6">
        <a href="#verdict" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Verdict
        </a>
        {hasFeeOrOtp && (
          <a href="#stop-protect" className="px-2.5 py-1 bg-status-high-concern-bg text-status-high-concern-fg border border-status-high-concern-border rounded-chip text-[11px] font-semibold shrink-0">
            Stop & Protect
          </a>
        )}
        <a href="#why-status" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Why Status
        </a>
        <a href="#signals" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Signals ({result.signals.length})
        </a>
        <a href="#portal-checklist" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Portals
        </a>
        <a href="#response-generators" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Inquiries
        </a>
        <a href="#link-inspector" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Link Check
        </a>
        <a href="#next-steps" className="px-2.5 py-1 bg-surface border border-border rounded-chip text-[11px] font-medium shrink-0">
          Next Steps
        </a>
      </div>

      {/* Two-Column Responsive Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Verdict Disclaimer */}
          <div className="p-3 bg-surface border border-border/80 rounded-card text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <HelpCircle size={15} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="font-normal italic">
              {t('results.disclaimer')}
            </p>
          </div>

          {/* 1. Verdict Banner */}
          <div id="verdict">
            <StatusBanner
              status={result.status}
              confidenceScore={result.confidenceScore}
              checksEvaluatedCount={8}
              totalChecks={8}
            />
          </div>

          {/* 1b. Shared Threat Intelligence Match Card */}
          {result.intelMatch && (
            <div id="intel-match">
              <IntelMatchCard intelMatch={result.intelMatch} />
            </div>
          )}

          {/* 2. Stop & Protect Callout (High Concern / Payment signals) */}
          {isHighConcern && (
            <StopProtectCallout
              amount={amount}
              upiHandle={upi}
            />
          )}

          {/* 2b. Payment & Banking Alert */}
          {hasFeeOrOtp && (
            <PaymentAlert
              amount={amount}
              upiHandle={upi}
              hasOtpDemand={result.signals?.some((s) => s.ruleId === 'RULE_BANK_OTP_DEBIT')}
            />
          )}

          {/* 3. Why this Status (Evidence Bullets) */}
          <div id="why-status">
            <WhyThisStatus
              status={result.status}
              signals={result.signals}
              unverified={result.unverified}
            />
          </div>

          {/* 4. Observed Signals List */}
          <div id="signals" className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
                {t('results.signalsTitle')} ({result.signals.length})
              </h3>
            </div>

            {result.signals.length === 0 ? (
              <div className="p-5 bg-surface border border-border rounded-card text-xs text-muted-foreground text-center">
                {t('results.signalsEmpty')}
              </div>
            ) : (
              <div className="space-y-3">
                {result.signals.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </div>

          {/* 5. Unverified Details Panel */}
          <div id="unverified">
            <UnverifiedPanel unverified={result.unverified} />
          </div>

          {/* 6. Official Portal Verification Checklist */}
          <div id="portal-checklist">
            <PortalChecklist />
          </div>

          {/* 7. Safe Reply & Challenge Email Generators */}
          <div id="response-generators">
            <ResponseGenerators
              status={result.status}
              claimedOrg={result.extractedEntities.organization || undefined}
              senderEmail={result.extractedEntities.emails?.[0]}
              domain={result.extractedEntities.domains?.[0]}
            />
          </div>

          {/* 8. Link Inspector UI */}
          <div id="link-inspector">
            <LinkInspector detectedUrls={result.extractedEntities.urls} />
          </div>

          {/* 9. Extracted Opportunity Indicators */}
          <div id="extracted-entities">
            <ExtractedEntitiesCard
              entities={result.extractedEntities}
              onReportEntity={handleOpenReport}
            />
          </div>

          {/* 10. Actionable Next Steps */}
          <div id="next-steps">
            <NextSteps
              status={result.status}
              recommendedActions={result.recommendedActions}
            />
          </div>
        </div>

        {/* Sticky Sidebar Column (4 cols) */}
        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          {/* Jump Navigation Card */}
          <div className="p-4 bg-surface border border-border rounded-card space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Compass size={14} className="text-foreground" />
              <span className="font-mono text-xs uppercase font-bold text-foreground tracking-wider">
                {t('results.jumpNavTitle')}
              </span>
            </div>

            <nav className="flex flex-col space-y-1 text-xs">
              <a
                href="#verdict"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-foreground/90 hover:text-foreground font-medium transition-colors flex items-center justify-between"
              >
                <span>{t('results.verdictLabel')}</span>
                <span className="font-mono text-[10px] text-muted-foreground uppercase">{result.status}</span>
              </a>

              {hasFeeOrOtp && (
                <a
                  href="#stop-protect"
                  className="px-2.5 py-1.5 rounded-chip bg-status-high-concern-bg/40 text-status-high-concern-fg font-semibold transition-colors flex items-center justify-between"
                >
                  <span>{t('results.stopProtectTitle')}</span>
                  <AlertOctagon size={12} />
                </a>
              )}

              <a
                href="#why-status"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('results.whyTitle')}
              </a>

              <a
                href="#signals"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between"
              >
                <span>{t('results.signalsTitle')}</span>
                <span className="font-mono text-[10px] bg-background border border-border px-1.5 py-0.5 rounded-pill">
                  {result.signals.length}
                </span>
              </a>

              <a
                href="#unverified"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('results.unverifiedTitle')}
              </a>

              <a
                href="#portal-checklist"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('results.portalChecklistTitle')}
              </a>

              <a
                href="#response-generators"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('results.responseGeneratorsTitle')}
              </a>

              <a
                href="#link-inspector"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('results.linkInspectorTitle')}
              </a>

              <a
                href="#next-steps"
                className="px-2.5 py-1.5 rounded-chip hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('results.nextStepsTitle')}
              </a>
            </nav>
          </div>

          {/* Quick Actions Card */}
          <div id="actions" className="p-4 bg-surface border border-border rounded-card space-y-3">
            <span className="font-mono text-[11px] uppercase text-muted-foreground block font-bold">
              ACTIONS & EXPORT
            </span>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full justify-center"
              >
                <Download size={13} className="mr-1.5" />
                <span>{downloadingPdf ? 'Generating PDF...' : t('results.exportPdf')}</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="w-full justify-center text-xs"
                >
                  <Printer size={13} className="mr-1" />
                  <span>{t('results.exportPrint')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="w-full justify-center text-xs"
                >
                  <FileJson size={13} className="mr-1" />
                  <span>{t('results.exportJson')}</span>
                </Button>
              </div>

              <WhatsAppShareButton
                status={result.status}
                publicId={result.intelMatch?.publicId}
                matchedIndicators={result.intelMatch?.matchedIndicators}
                claimedOrg={result.extractedEntities.organization || undefined}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportMessageOpen(true)}
                className="w-full justify-center text-xs text-foreground border-border hover:bg-background"
              >
                <ShieldAlert size={13} className="mr-1.5 text-primary" />
                <span>{t('results.reportMessageBtn') || 'Report This Offer'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReport('upi', '')}
                className="w-full justify-center text-xs text-terracotta border-border hover:bg-background"
              >
                <ShieldAlert size={13} className="mr-1.5 text-terracotta" />
                <span>{t('reportDialog.triggerBtn')}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/analyze')}
                className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw size={13} className="mr-1.5" />
                <span>{t('results.checkAnother')}</span>
              </Button>
            </div>
          </div>

          {/* Helpline Quick Card */}
          <div className="p-4 bg-status-high-concern-bg/20 border border-status-high-concern-border/40 rounded-card space-y-2">
            <div className="flex items-center gap-1.5">
              <PhoneCall size={14} className="text-status-high-concern-fg" />
              <span className="font-mono text-xs font-bold text-status-high-concern-fg uppercase">
                EMERGENCY 1930
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              If money was transferred, call 1930 within 2 hours or file a formal complaint at cybercrime.gov.in.
            </p>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1 text-xs font-bold text-status-high-concern-fg hover:underline"
            >
              <span>Call 1930 Now</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </aside>
      </div>

      <ReportEntityDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        initialEntityType={reportEntityType}
        initialValue={reportEntityValue}
      />

      <ReportMessageDialog
        isOpen={reportMessageOpen}
        onClose={() => setReportMessageOpen(false)}
        text={rawText}
        category={result?.status === 'CONFIRMED_SCAM' ? 'fake_job' : 'other'}
        indicators={[
          ...(result?.extractedEntities?.urls || []).map((u) => ({ type: 'url' as const, value: u })),
          ...(result?.extractedEntities?.domains || []).map((d) => ({ type: 'domain' as const, value: d })),
          ...(result?.extractedEntities?.phones || []).map((p) => ({ type: 'phone' as const, value: p })),
          ...(result?.extractedEntities?.upiHandles || []).map((upi) => ({ type: 'upi' as const, value: upi })),
        ]}
      />
    </main>
  );
}

/**
 * Fictional sample report walkthrough page (/sample)
 */
export function SamplePage() {
  const { t } = useLanguage();
  const [activeScenario, setActiveScenario] = useState<'genuine' | 'review' | 'concern'>('genuine');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportMessageOpen, setReportMessageOpen] = useState(false);
  const [reportEntityType, setReportEntityType] = useState<'email' | 'domain' | 'phone' | 'upi' | 'bank_account'>('upi');
  const [reportEntityValue, setReportEntityValue] = useState('');
  const rawText = '';

  const handleOpenReport = (type: 'email' | 'domain' | 'phone' | 'upi' | 'bank_account' = 'upi', val = '') => {
    setReportEntityType(type);
    setReportEntityValue(val);
    setReportDialogOpen(true);
  };

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

  const isHighConcern = result.status === 'HIGH_CONCERN' || result.status === 'CONFIRMED_SCAM';
  const hasFeeOrOtp = Boolean(
    isHighConcern ||
    result.signals.some((s) => s.ruleId === 'RULE_UPFRONT_FEE' || s.ruleId === 'RULE_BANK_OTP_DEBIT') ||
    (result.extractedEntities.amounts && result.extractedEntities.amounts.length > 0) ||
    (result.extractedEntities.upiHandles && result.extractedEntities.upiHandles.length > 0)
  );

  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2 font-medium">
          {t('results.eyebrow')}
        </span>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {t('results.sampleWalkthroughTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t('results.sampleWalkthroughSubtitle')}
        </p>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="flex p-1 bg-background border border-border rounded-chip justify-center gap-1.5 select-none mb-4 max-w-md mx-auto">
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
          <span>{t('results.sampleTabGenuine')}</span>
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
          <span>{t('results.sampleTabReview')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveScenario('concern')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-xs font-semibold transition-all ${
            activeScenario === 'concern'
              ? 'bg-status-high-concern-bg text-status-high-concern-fg border border-status-high-concern-border shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertOctagon size={13} />
          <span>{t('results.sampleTabConcern')}</span>
        </button>
      </div>

      {/* Subtitle description for selected sample */}
      <p className="text-center text-xs text-muted-foreground italic mb-6">
        {current.subtitle}
      </p>

      {/* Two-Column Display for Sample */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-3 bg-surface border border-border/80 rounded-card text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <HelpCircle size={15} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="font-normal italic">
              {t('results.disclaimer')}
            </p>
          </div>

          <StatusBanner
            status={result.status}
            confidenceScore={result.confidenceScore}
            checksEvaluatedCount={8}
            totalChecks={8}
          />

          {isHighConcern && (
            <StopProtectCallout
              amount={result.extractedEntities.amounts?.[0]}
              upiHandle={result.extractedEntities.upiHandles?.[0]}
            />
          )}

          {hasFeeOrOtp && (
            <PaymentAlert
              amount={result.extractedEntities.amounts?.[0]}
              upiHandle={result.extractedEntities.upiHandles?.[0]}
              hasOtpDemand={result.signals?.some((s) => s.ruleId === 'RULE_BANK_OTP_DEBIT')}
            />
          )}

          <WhyThisStatus
            status={result.status}
            signals={result.signals}
            unverified={result.unverified}
          />

          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
              {t('results.signalsTitle')} ({result.signals.length})
            </h3>
            {result.signals.length === 0 ? (
              <div className="p-5 bg-surface border border-border rounded-card text-xs text-muted-foreground text-center">
                {t('results.signalsEmpty')}
              </div>
            ) : (
              <div className="space-y-3">
                {result.signals.map((sig) => (
                  <SignalCard key={sig.id} signal={sig} />
                ))}
              </div>
            )}
          </div>

          <UnverifiedPanel unverified={result.unverified} />

          <PortalChecklist />

          <ResponseGenerators
            status={result.status}
            claimedOrg={result.extractedEntities.organization || undefined}
            senderEmail={result.extractedEntities.emails?.[0]}
            domain={result.extractedEntities.domains?.[0]}
          />

          <LinkInspector detectedUrls={result.extractedEntities.urls} />

          <ExtractedEntitiesCard
            entities={result.extractedEntities}
            onReportEntity={handleOpenReport}
          />

          <NextSteps
            status={result.status}
            recommendedActions={result.recommendedActions}
          />
        </div>

        {/* Sidebar for Sample */}
        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="p-4 bg-surface border border-border rounded-card space-y-3">
            <span className="font-mono text-[11px] uppercase text-muted-foreground block font-bold">
              REFERENCE ACTIONS
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => downloadPdfReport(result)}
              className="w-full justify-center"
            >
              <Download size={13} className="mr-1.5" />
              <span>{t('results.exportPdf')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenReport('upi', '')}
              className="w-full justify-center text-xs text-terracotta border-border hover:bg-background"
            >
              <ShieldAlert size={13} className="mr-1.5 text-terracotta" />
              <span>{t('reportDialog.triggerBtn')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="w-full justify-center text-xs"
            >
              <Printer size={13} className="mr-1.5" />
              <span>{t('results.exportPrint')}</span>
            </Button>
          </div>
        </aside>
      </div>

      <ReportEntityDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        initialEntityType={reportEntityType}
        initialValue={reportEntityValue}
      />

      <ReportMessageDialog
        isOpen={reportMessageOpen}
        onClose={() => setReportMessageOpen(false)}
        text={rawText}
        category={result?.status === 'CONFIRMED_SCAM' ? 'fake_job' : 'other'}
        indicators={[
          ...(result?.extractedEntities?.urls || []).map((u) => ({ type: 'url' as const, value: u })),
          ...(result?.extractedEntities?.domains || []).map((d) => ({ type: 'domain' as const, value: d })),
          ...(result?.extractedEntities?.phones || []).map((p) => ({ type: 'phone' as const, value: p })),
          ...(result?.extractedEntities?.upiHandles || []).map((upi) => ({ type: 'upi' as const, value: upi })),
        ]}
      />
    </main>
  );
}

/**
 * Dedicated Link Check page (/link-check)
 */
export function LinkCheckPage() {
  const { t } = useLanguage();

  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <span className="font-mono text-xs text-muted-foreground block mb-1 font-medium uppercase">
            HEURISTIC SAFETY TOOL
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {t('results.linkInspectorTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Analyze untrusted links, numeric IP hosts, Punycode deceptiveness, and lookalike domains before clicking.
          </p>
        </div>

        <LinkInspector />
      </div>
    </main>
  );
}

export const ResultsPage = Results;

export default Results;
