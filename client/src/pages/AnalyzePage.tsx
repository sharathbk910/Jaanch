import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Clipboard,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { type OpportunityDomain } from '@jaanch/shared';
import { useLanguage } from '../i18n/LanguageContext.js';
import { useAuth } from '../lib/AuthContext.js';
import { apiClient } from '../lib/apiClient.js';
import { saveGuestAnalysis } from '../lib/guestSession.js';
import { extractTextFromFile } from '../lib/pdfExtractor.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import {
  SCENARIO_GENUINE,
  SCENARIO_FEE_SCAM,
  SCENARIO_OTP_SCAM,
} from '../components/landing/SubmissionCard.js';

const DOMAIN_OPTIONS: Array<{ value: OpportunityDomain; key: string }> = [
  { value: 'internship', key: 'internship' },
  { value: 'job', key: 'job' },
  { value: 'scholarship', key: 'scholarship' },
  { value: 'freelance', key: 'freelance' },
  { value: 'competition', key: 'competition' },
  { value: 'general_message', key: 'general_message' },
  { value: 'other', key: 'other' },
];

export function AnalyzePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab & Core Text State
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [offerText, setOfferText] = useState<string>('');
  const [domain, setDomain] = useState<OpportunityDomain>('other');

  // Contact & Advanced Options
  const [showSenderFields, setShowSenderFields] = useState<boolean>(false);
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [senderDomain, setSenderDomain] = useState<string>('');
  const [senderOrg, setSenderOrg] = useState<string>('');
  const [showHeaders, setShowHeaders] = useState<boolean>(false);
  const [emailHeaders, setEmailHeaders] = useState<string>('');

  // Privacy & Consent Toggles
  const [aiAnalysis, setAiAnalysis] = useState<boolean>(false);
  const [shareIndicators, setShareIndicators] = useState<boolean>(false);

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedPageCount, setUploadedPageCount] = useState<number | undefined>(undefined);
  const [isExtractingFile, setIsExtractingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard & Notification Feedback
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Analysis In-Flight Progress State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(1);

  const charCount = offerText.length;
  const isMinMet = charCount >= 25;

  // Read location.state if redirected from landing page
  useEffect(() => {
    if (location.state && typeof location.state === 'object') {
      const state = location.state as { offerText?: string; autoRun?: boolean; domain?: OpportunityDomain };
      if (state.offerText) {
        setOfferText(state.offerText);
      }
      if (state.domain) {
        setDomain(state.domain);
      }
      if (state.autoRun && state.offerText && state.offerText.trim().length >= 25) {
        // Automatically trigger analysis
        triggerAnalysis(state.offerText, state.domain || 'other');
      }
    }
  }, [location.state]);

  // Handle Clipboard Paste
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setOfferText(text);
          setError(null);
          setCopiedNotice(true);
          setTimeout(() => setCopiedNotice(false), 2000);
        }
      } else {
        setError('Clipboard access not supported by browser. Please paste manually.');
      }
    } catch {
      setError('Unable to read clipboard. Please paste directly into the box.');
    }
  };

  // Sample Scenarios
  const handleSelectScenario = (scenarioText: string, scenarioDomain: OpportunityDomain) => {
    setOfferText(scenarioText);
    setDomain(scenarioDomain);
    setError(null);
    setActiveTab('paste');
  };

  // File Extraction Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsExtractingFile(true);
    setFileError(null);
    try {
      const result = await extractTextFromFile(file);
      setOfferText(result.text);
      setUploadedFileName(result.fileName);
      setUploadedPageCount(result.pageCount);
      setError(null);
      // Auto-switch to review extracted text
      setActiveTab('paste');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract text from file.';
      setFileError(msg);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setUploadedPageCount(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear All Fields
  const handleClear = () => {
    setOfferText('');
    setUploadedFileName(null);
    setUploadedPageCount(undefined);
    setError(null);
    setFileError(null);
    setSenderEmail('');
    setSenderPhone('');
    setSenderDomain('');
    setSenderOrg('');
    setEmailHeaders('');
  };

  // Main Submit & Analysis Trigger
  const triggerAnalysis = async (textToAnalyze: string, targetDomain: OpportunityDomain) => {
    if (textToAnalyze.trim().length < 25) {
      setError(t('analyzer.charMinAlert') || 'Minimum 25 characters required to analyze reliably');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgressStep(1);

    // Heuristic multi-step animation timing
    const step2Timer = setTimeout(() => setProgressStep(2), 350);
    const step3Timer = setTimeout(() => setProgressStep(3), 700);
    const step4Timer = setTimeout(() => setProgressStep(4), 1050);

    try {
      // Append raw headers if provided and not already in text
      const fullText = emailHeaders.trim()
        ? `${emailHeaders.trim()}\n\n--- OFFER BODY ---\n${textToAnalyze}`
        : textToAnalyze;

      const senderPayload =
        senderEmail.trim() || senderPhone.trim() || senderDomain.trim() || senderOrg.trim()
          ? {
              email: senderEmail.trim() || undefined,
              phone: senderPhone.trim() || undefined,
              domain: senderDomain.trim() || undefined,
              organization: senderOrg.trim() || undefined,
            }
          : undefined;

      const result = await apiClient.analyzeOffer({
        text: fullText,
        domain: targetDomain,
        sender: senderPayload,
        consentFlags: {
          aiAnalysis,
          shareIndicators,
        },
        saveToHistory: Boolean(user),
      });

      // Save to guest session storage if unauthenticated
      if (!user) {
        saveGuestAnalysis({
          inputText: fullText,
          domain: targetDomain,
          channel: 'web_form',
          result,
          timestamp: new Date().toISOString(),
        });
        navigate('/results/local', { state: { result } });
      } else {
        const resultTarget = result.auditId ? `/results/${result.auditId}` : '/results/local';
        navigate(resultTarget, { state: { result } });
      }
    } catch (err: unknown) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
      const msg =
        err instanceof Error
          ? err.message
          : (t('errors.serverError') || 'An error occurred while analyzing the offer. Please try again.');
      setError(msg);
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAnalysis(offerText, domain);
  };

  return (
    <main className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Section */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2 font-medium">
          {t('analyzer.badge') || 'ANALYSIS ENGINE'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          {t('analyzer.title') || 'Verify Offer Legitimacy'}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {t('analyzer.subtitle') ||
            'Inspect appointment letters, WhatsApp recruitment messages, and scholarships before you pay or share documents.'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Main Analysis Card */}
        <Card padding="none" className="overflow-hidden border border-border shadow-sm">
          {/* Navigation Tabs: Paste Text vs Upload Document */}
          <div className="flex border-b border-border bg-background/50">
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 px-6 py-3.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'paste'
                  ? 'border-primary text-primary bg-surface'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText size={15} />
              <span>{t('analyzer.tabPaste') || 'Paste Message Text'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-6 py-3.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-primary text-primary bg-surface'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload size={15} />
              <span>{t('analyzer.tabUpload') || 'Upload Document'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
            {/* Uploaded File Pill Indicator (if document was extracted) */}
            {uploadedFileName && (
              <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-pill text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <FileCheck size={16} className="text-terracotta" />
                  <span>
                    {uploadedFileName}{' '}
                    {uploadedPageCount ? `(${uploadedPageCount} page${uploadedPageCount > 1 ? 's' : ''})` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground px-2 py-0.5 rounded text-xs"
                  aria-label={t('analyzer.removeFile') || 'Remove file'}
                >
                  <X size={14} />
                  <span>{t('analyzer.removeFile') || 'Remove'}</span>
                </button>
              </div>
            )}

            {/* TAB 1: Paste Text */}
            {activeTab === 'paste' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="offer-text" className="text-xs font-semibold text-foreground">
                    {t('analyzer.textLabel') || 'Offer Message or Email Text'}
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex items-center gap-1.5 text-xs font-medium text-terracotta hover:underline focus:outline-none"
                  >
                    {copiedNotice ? <Check size={13} /> : <Clipboard size={13} />}
                    <span>{copiedNotice ? t('analyzer.copiedNotice') || 'Pasted!' : t('analyzer.pasteClipboard') || 'Paste Clipboard'}</span>
                  </button>
                </div>

                <Textarea
                  id="offer-text"
                  rows={8}
                  value={offerText}
                  onChange={(e) => {
                    setOfferText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    t('analyzer.textPlaceholder') ||
                    'Paste the full message, email body, job description, or WhatsApp message here (minimum 25 characters)...'
                  }
                  className="font-sans text-xs sm:text-sm leading-relaxed"
                />

                {/* Character Counter & Minimum Validation */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className={charCount > 0 && !isMinMet ? 'text-terracotta font-medium' : 'text-muted-foreground'}>
                    {charCount > 0 && !isMinMet
                      ? `${charCount} / 25 ${t('analyzer.charCounter') || 'characters'} (${t('analyzer.charMinAlert') || 'min 25'})`
                      : `${charCount} ${t('analyzer.charCounter') || 'characters'}`}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {t('submissionCard.charMin') || 'Minimum 25 characters required'}
                  </span>
                </div>
              </div>
            ) : (
              /* TAB 2: Upload Document (Zero server upload; in-browser pdfjs-dist) */
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary rounded-card p-8 sm:p-12 text-center cursor-pointer transition-colors bg-background/30 flex flex-col items-center justify-center space-y-3"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Upload document dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isExtractingFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={32} className="animate-spin text-terracotta" />
                      <p className="text-xs font-semibold text-foreground">
                        {t('analyzer.extractingPdf') || 'Extracting text locally in browser...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-pill bg-surface border border-border flex items-center justify-center text-primary shadow-sm">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {t('analyzer.dropzoneTitle') || 'Drop your PDF or TXT offer document here'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('analyzer.dropzoneSub') || 'or click to browse your device'}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {t('analyzer.dropzoneSupported') || 'Supports PDF (.pdf) and text (.txt) up to 10MB'}
                      </span>
                    </>
                  )}
                </div>

                {fileError && (
                  <div className="flex items-center gap-2 text-xs text-terracotta bg-surface border border-border p-3 rounded-card">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Opportunity Domain Selector */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="domain-select" className="text-xs font-semibold text-foreground block">
                {t('analyzer.domainLabel') || 'Opportunity Category'}
              </label>
              <select
                id="domain-select"
                value={domain}
                onChange={(e) => setDomain(e.target.value as OpportunityDomain)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-input text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DOMAIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`analyzer.domains.${opt.key}`) || opt.value}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                {t('analyzer.domainHelp') || 'Select the type of offer for targeted heuristic checks'}
              </p>
            </div>

            {/* Collapsible: Sender & Recruiter Details (Optional) */}
            <div className="border border-border rounded-card overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSenderFields((prev) => !prev)}
                className="w-full flex items-center justify-between p-3.5 bg-background/40 hover:bg-surface text-left transition-colors text-xs font-semibold text-foreground"
              >
                <span>{t('analyzer.senderToggle') || 'Add Sender & Contact Details (Optional)'}</span>
                {showSenderFields ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showSenderFields && (
                <div className="p-4 bg-surface border-t border-border space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="sender-email" className="block text-[11px] font-medium text-muted-foreground mb-1">
                        {t('analyzer.senderEmail') || 'Recruiter / Sender Email'}
                      </label>
                      <Input
                        id="sender-email"
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder={t('analyzer.senderEmailPlaceholder') || 'e.g. hr@company-careers.org'}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="sender-phone" className="block text-[11px] font-medium text-muted-foreground mb-1">
                        {t('analyzer.senderPhone') || 'Recruiter Phone / WhatsApp'}
                      </label>
                      <Input
                        id="sender-phone"
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder={t('analyzer.senderPhonePlaceholder') || 'e.g. +91 98765 43210'}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="sender-domain" className="block text-[11px] font-medium text-muted-foreground mb-1">
                        {t('analyzer.senderDomain') || 'Company Website / Domain'}
                      </label>
                      <Input
                        id="sender-domain"
                        type="text"
                        value={senderDomain}
                        onChange={(e) => setSenderDomain(e.target.value)}
                        placeholder={t('analyzer.senderDomainPlaceholder') || 'e.g. company.com'}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="sender-org" className="block text-[11px] font-medium text-muted-foreground mb-1">
                        {t('analyzer.senderOrg') || 'Claimed Organization'}
                      </label>
                      <Input
                        id="sender-org"
                        type="text"
                        value={senderOrg}
                        onChange={(e) => setSenderOrg(e.target.value)}
                        placeholder={t('analyzer.senderOrgPlaceholder') || 'e.g. Infosys, TCS, Wipro'}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible: Raw Email Headers (Optional) */}
            <div className="border border-border rounded-card overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHeaders((prev) => !prev)}
                className="w-full flex items-center justify-between p-3.5 bg-background/40 hover:bg-surface text-left transition-colors text-xs font-semibold text-foreground"
              >
                <span>{t('analyzer.headersToggle') || 'Raw Email Headers (Optional, for SPF/DKIM inspection)'}</span>
                {showHeaders ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showHeaders && (
                <div className="p-4 bg-surface border-t border-border">
                  <Textarea
                    rows={4}
                    value={emailHeaders}
                    onChange={(e) => setEmailHeaders(e.target.value)}
                    placeholder={
                      t('analyzer.headersPlaceholder') ||
                      'Paste RFC 822 email headers (Received, From, Return-Path, DKIM-Signature)...'
                    }
                    className="font-mono text-[11px]"
                  />
                </div>
              )}
            </div>

            {/* Privacy & Consent Checkboxes */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aiAnalysis}
                  onChange={(e) => setAiAnalysis(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">
                    {t('analyzer.consentAi') || 'Allow AI Deep Analysis (Zero PII transmitted)'}
                  </span>
                  <span className="text-muted-foreground text-[11px] block mt-0.5">
                    {t('analyzer.consentAiSub') ||
                      'Runs secondary linguistic nuance evaluation with personal details redacted client-side.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shareIndicators}
                  onChange={(e) => setShareIndicators(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">
                    {t('analyzer.consentShare') || 'Contribute Anonymous Threat Indicators'}
                  </span>
                  <span className="text-muted-foreground text-[11px] block mt-0.5">
                    {t('analyzer.consentShareSub') ||
                      'Shares non-PII salted cryptographic hashes of scam phone numbers, domains, or UPI IDs to warn other students.'}
                  </span>
                </div>
              </label>
            </div>

            {/* Privacy Architecture Notice */}
            <div className="p-3 bg-background/50 border border-border rounded-card flex items-start gap-2.5 text-[11px] text-muted-foreground">
              <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t('analyzer.privacyNotice') ||
                  'Privacy Guarantee: All text is sanitized and all personal information (names, phones, emails, Aadhaar) is redacted before evaluation. Uploaded documents are read strictly in your browser and never sent to a server.'}
              </p>
            </div>

            {/* Sample Scenarios for Fast Testing */}
            <div className="pt-2">
              <span className="text-xs text-muted-foreground block mb-2 font-medium">
                {t('analyzer.samplesPrompt') || 'Or test with a sample scenario:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectScenario(SCENARIO_GENUINE, 'internship')}
                  className="px-3 py-1.5 bg-surface hover:bg-background border border-border text-xs rounded-pill transition-colors text-foreground focus:outline-none"
                >
                  {t('analyzer.sampleGenuine') || 'Genuine Internship'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectScenario(SCENARIO_FEE_SCAM, 'job')}
                  className="px-3 py-1.5 bg-surface hover:bg-background border border-border text-xs rounded-pill transition-colors text-foreground focus:outline-none"
                >
                  {t('analyzer.sampleFeeScam') || 'Upfront Fee Scam'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectScenario(SCENARIO_OTP_SCAM, 'scholarship')}
                  className="px-3 py-1.5 bg-surface hover:bg-background border border-border text-xs rounded-pill transition-colors text-foreground focus:outline-none"
                >
                  {t('analyzer.sampleOtpScam') || 'OTP Phishing Scam'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-card text-xs text-terracotta">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress Stepper when analyzing */}
            {isAnalyzing && (
              <div className="p-4 bg-surface border border-border rounded-card space-y-2.5 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Loader2 size={16} className="animate-spin text-terracotta" />
                  <span>{t('analyzer.verifyingBtn') || 'Running Safety Analysis...'}</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-muted-foreground">
                  <div className={progressStep >= 1 ? 'text-primary font-medium' : 'opacity-40'}>
                    ✓ {t('analyzer.progressStep1') || 'Redacting sensitive student PII locally...'}
                  </div>
                  <div className={progressStep >= 2 ? 'text-primary font-medium' : 'opacity-40'}>
                    {progressStep >= 2 ? '✓' : '○'}{' '}
                    {t('analyzer.progressStep2') || 'Scanning 8 deterministic scam detection rules...'}
                  </div>
                  <div className={progressStep >= 3 ? 'text-primary font-medium' : 'opacity-40'}>
                    {progressStep >= 3 ? '✓' : '○'}{' '}
                    {t('analyzer.progressStep3') || 'Analyzing URLs, punycode & lookalike domains...'}
                  </div>
                  <div className={progressStep >= 4 ? 'text-primary font-medium' : 'opacity-40'}>
                    {progressStep >= 4 ? '✓' : '○'}{' '}
                    {t('analyzer.progressStep4') || 'Synthesizing transparent evidence assessment...'}
                  </div>
                </div>
              </div>
            )}

            {/* Submit & Action Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={isAnalyzing || (!offerText && !uploadedFileName)}
                className="text-xs"
              >
                {t('analyzer.clearBtn') || 'Clear'}
              </Button>

              <Button
                type="submit"
                disabled={!isMinMet || isAnalyzing}
                className="px-6 py-2.5 text-xs font-semibold shadow-sm"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t('submissionCard.analyzing') || 'Running Checks...'}</span>
                  </span>
                ) : (
                  <span>{t('analyzer.verifyBtn') || 'Verify Offer Now'}</span>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
