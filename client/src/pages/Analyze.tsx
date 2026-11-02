import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Clipboard,
  Check,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck,
  Loader2,
  Lock,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  type OpportunityDomain,
  redactText,
  validateOfferInput,
} from '@jaanch/shared';
import { useLanguage } from '../i18n/LanguageContext.js';
import { useAuth } from '../lib/AuthContext.js';
import { apiClient } from '../lib/apiClient.js';
import { saveGuestAnalysis } from '../lib/guestSession.js';
import {
  extractTextFromFile,
  type ExtractionResult,
} from '../lib/pdfExtractor.js';
import type { OcrLanguage, OcrProgress } from '../lib/ocrExtractor.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import {
  SCENARIO_GENUINE,
  SCENARIO_FEE_SCAM,
  SCENARIO_OTP_SCAM,
} from '../components/landing/SubmissionCard.js';

export type OpportunityChannel =
  | 'email'
  | 'whatsapp'
  | 'telegram'
  | 'sms'
  | 'linkedin'
  | 'website'
  | 'other';

const DOMAIN_OPTIONS: Array<{ value: OpportunityDomain; key: string }> = [
  { value: 'internship', key: 'internship' },
  { value: 'job', key: 'job' },
  { value: 'scholarship', key: 'scholarship' },
  { value: 'freelance', key: 'freelance' },
  { value: 'competition', key: 'competition' },
  { value: 'general_message', key: 'general_message' },
  { value: 'other', key: 'other' },
];

const CHANNEL_OPTIONS: Array<{ value: OpportunityChannel; key: string }> = [
  { value: 'email', key: 'email' },
  { value: 'whatsapp', key: 'whatsapp' },
  { value: 'telegram', key: 'telegram' },
  { value: 'sms', key: 'sms' },
  { value: 'linkedin', key: 'linkedin' },
  { value: 'website', key: 'website' },
  { value: 'other', key: 'other' },
];

const KNOWN_ORGANIZATIONS = [
  'Tata Consultancy Services (TCS)',
  'Infosys Technologies',
  'Wipro Limited',
  'HCL Technologies',
  'Tech Mahindra',
  'Larsen & Toubro (L&T)',
  'Reliance Industries',
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Amazon India',
  'Google India',
  'Microsoft India',
  'Flipkart',
  'AICTE (All India Council for Technical Education)',
  'NCS (National Career Service)',
  'NSP (National Scholarship Portal)',
  'Other / Unlisted Organization',
];

export function Analyze() {
  const { dictionary } = useLanguage();
  const t = dictionary;
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab & Core Text State
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [offerText, setOfferText] = useState<string>('');
  const [domain, setDomain] = useState<OpportunityDomain>('other');
  const [channel, setChannel] = useState<OpportunityChannel>('other');
  const [claimedOrg, setClaimedOrg] = useState<string>('');
  const [customOrg, setCustomOrg] = useState<string>('');

  // Contact & Advanced Options
  const [showSenderFields, setShowSenderFields] = useState<boolean>(false);
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [senderDomain, setSenderDomain] = useState<string>('');
  const [showHeaders, setShowHeaders] = useState<boolean>(false);
  const [emailHeaders, setEmailHeaders] = useState<string>('');

  // Consent Toggles (All strictly default to FALSE per specification)
  const [aiAnalysis, setAiAnalysis] = useState<boolean>(false);
  const [shareIndicators, setShareIndicators] = useState<boolean>(false);
  const [saveToHistory, setSaveToHistory] = useState<boolean>(false);

  // File Upload & OCR State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedPageCount, setUploadedPageCount] = useState<number | undefined>(undefined);
  const [isOcrFallback, setIsOcrFallback] = useState<boolean>(false);
  const [isExtractingFile, setIsExtractingFile] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [ocrLang, setOcrLang] = useState<OcrLanguage>('eng');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrAbortControllerRef = useRef<AbortController | null>(null);

  // Redaction Preview State
  const [showRedactionPreview, setShowRedactionPreview] = useState<boolean>(true);

  // Clipboard & Notification Feedback
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // In-Flight Heuristic Progress State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(1);

  const charCount = offerText.length;
  const isMinMet = charCount >= 25;

  // Compute client-side redaction preview live
  const redactionPreview = useMemo(() => {
    if (!offerText.trim()) {
      return { redactedText: '', redactionCount: 0 };
    }
    return redactText(offerText);
  }, [offerText]);

  // Read location.state if redirected from landing page
  useEffect(() => {
    if (location.state && typeof location.state === 'object') {
      const state = location.state as {
        offerText?: string;
        autoRun?: boolean;
        domain?: OpportunityDomain;
      };
      if (state.offerText) {
        setOfferText(state.offerText);
      }
      if (state.domain) {
        setDomain(state.domain);
      }
      if (state.autoRun && state.offerText && state.offerText.trim().length >= 25) {
        triggerAnalysis(state.offerText, state.domain || 'other');
      }
    }
  }, [location.state]);

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setOfferText(text);
          setCopiedNotice(true);
          setTimeout(() => setCopiedNotice(false), 2500);
        }
      } else {
        alert('Clipboard access not supported. Please paste directly into the box.');
      }
    } catch {
      alert('Unable to read clipboard. Please paste manually.');
    }
  };

  const processFile = async (file: File) => {
    setFileError(null);
    setIsOcrFallback(false);
    setOcrProgress(null);

    // Cancel any ongoing OCR extraction
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    ocrAbortControllerRef.current = abortController;

    setIsExtractingFile(true);

    try {
      const result: ExtractionResult = await extractTextFromFile(file, {
        ocrLang,
        signal: abortController.signal,
        onOcrProgress: (prog) => {
          setOcrProgress(prog);
        },
      });

      setOfferText(result.text);
      setUploadedFileName(result.fileName);
      setUploadedPageCount(result.pageCount);
      setIsOcrFallback(Boolean(result.isOcrFallback));
      setFileError(null);
      setActiveTab('paste'); // Switch to editor so user can review/edit extracted text
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFileError(err.message);
      } else {
        setFileError('Failed to read document. Please check the file and try again.');
      }
    } finally {
      setIsExtractingFile(false);
      setOcrProgress(null);
      ocrAbortControllerRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const cancelOcr = () => {
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
      ocrAbortControllerRef.current = null;
      setIsExtractingFile(false);
      setOcrProgress(null);
      setFileError('OCR extraction was cancelled.');
    }
  };

  const clearFile = () => {
    setUploadedFileName(null);
    setUploadedPageCount(undefined);
    setIsOcrFallback(false);
    setFileError(null);
    setOfferText('');
  };

  const effectiveOrganization =
    claimedOrg === 'Other / Unlisted Organization' ? customOrg : claimedOrg;

  const triggerAnalysis = async (
    textToAnalyze = offerText,
    domainToUse = domain
  ) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 25) {
      setError(t.analyzer.charMinAlert);
      return;
    }

    // Complete deterministic rule-based input test
    const validation = validateOfferInput(textToAnalyze);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid input: The text provided is not a valid offer or recruitment message.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setProgressStep(1);

    // Animated heuristic stepper
    const stepTimer1 = setTimeout(() => setProgressStep(2), 350);
    const stepTimer2 = setTimeout(() => setProgressStep(3), 750);
    const stepTimer3 = setTimeout(() => setProgressStep(4), 1150);

    try {
      // 1. Client-side PII redaction: only sanitized text is transmitted
      const clientRedacted = redactText(textToAnalyze);

      // 2. Prepare payload
      const consentPayload = {
        aiAnalysis: true,
        shareIndicators: false,
      };

      const payload = {
        text: clientRedacted.redactedText,
        domain: domainToUse,
        channel,
        consentFlags: consentPayload,
        inputType: uploadedFileName ? 'document_extract' : 'raw_text',
        saveToHistory: Boolean(user),
      };

      // 3. Dispatch typed API request with Zod-validated response
      const result = await apiClient.analyzeOffer(payload);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      // Save to guest storage if unauthenticated or not saving to history
      if (!user || !saveToHistory) {
        saveGuestAnalysis({
          inputText: textToAnalyze,
          domain: domainToUse,
          channel,
          result,
          timestamp: new Date().toISOString(),
        });
        navigate('/results/local');
      } else {
        navigate(`/results/${result.auditId}`);
      }
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsAnalyzing(false);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.errors.serverError);
      }
    }
  };

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-2">
          {t.analyzer.title}
        </h1>
        <p className="text-sm sm:text-base text-body max-w-2xl leading-relaxed">
          {t.analyzer.subtitle}
        </p>
      </div>

      {/* Main Analyzer Card */}
      <Card padding="lg" className="mb-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-neo-border text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-neo-sky text-foreground shadow-neo-sm'
                : 'bg-surface text-body hover:bg-neo-sky-light hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>{t.analyzer.tabPaste}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-neo-border text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-neo-sky text-foreground shadow-neo-sm'
                : 'bg-surface text-body hover:bg-neo-sky-light hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>{t.analyzer.tabUpload}</span>
            {uploadedFileName && (
              <span className="w-2 h-2 rounded-full bg-terracotta" title={t.analyzer.extractedFile} />
            )}
          </button>
        </div>

        {/* Tab 1: Paste Text Mode */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="analyzer-text-input" className="block text-sm font-medium text-primary">
                {t.analyzer.textLabel} <span className="text-terracotta">*</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-body hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-terracotta rounded px-2 py-1"
                >
                  <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{copiedNotice ? t.analyzer.copiedNotice : t.analyzer.pasteClipboard}</span>
                </button>
                {offerText && (
                  <button
                    type="button"
                    onClick={() => setOfferText('')}
                    className="text-xs text-muted hover:text-terracotta transition-colors"
                  >
                    {t.analyzer.clearBtn}
                  </button>
                )}
              </div>
            </div>

            {/* Scanned PDF Notification Banner */}
            {isOcrFallback && (
              <div
                role="status"
                className="flex items-start gap-2.5 p-3 rounded-md bg-surface border border-terracotta/40 text-xs text-primary"
              >
                <Sparkles className="w-4 h-4 text-terracotta shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-terracotta">
                    {t.analyzer.ocrScannedPdfNotice}
                  </p>
                  <p className="text-muted mt-0.5">
                    Selectable text layer was absent. Content was recognized locally page-by-page. Please review for accuracy.
                  </p>
                </div>
              </div>
            )}

            {/* Document Attached Banner */}
            {uploadedFileName && (
              <div className="flex items-center justify-between p-2.5 rounded-md bg-surface border border-border text-xs text-body">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-terracotta shrink-0" aria-hidden="true" />
                  <span className="font-medium text-primary truncate">{uploadedFileName}</span>
                  {uploadedPageCount && (
                    <span className="text-muted">({uploadedPageCount} pages)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-muted hover:text-terracotta flex items-center gap-1 ml-2 shrink-0"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.analyzer.removeFile}</span>
                </button>
              </div>
            )}

            {/* Main Textarea */}
            <div className="relative">
              <Textarea
                id="analyzer-text-input"
                rows={9}
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder={t.analyzer.textPlaceholder}
                className="w-full font-sans text-sm resize-y leading-relaxed"
                aria-describedby="char-counter char-alert"
              />
            </div>

            {/* Character Counter & Minimum Validation Alert */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div id="char-alert">
                {!isMinMet && charCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-terracotta font-medium">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {charCount} / 25 {t.analyzer.charCounter} (needs {25 - charCount} more)
                  </span>
                ) : (
                  <span className="text-muted">
                    {t.analyzer.charMinAlert}
                  </span>
                )}
              </div>
              <div
                id="char-counter"
                className={`font-mono text-xs ${
                  isMinMet ? 'text-muted' : charCount > 0 ? 'text-terracotta font-semibold' : 'text-muted'
                }`}
              >
                {charCount} {t.analyzer.charCounter}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload Document & OCR Mode */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* OCR Language Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-surface border border-border">
              <label htmlFor="ocr-lang-select" className="text-xs font-medium text-primary">
                {t.analyzer.ocrLanguageLabel}:
              </label>
              <select
                id="ocr-lang-select"
                value={ocrLang}
                onChange={(e) => setOcrLang(e.target.value as OcrLanguage)}
                className="px-2.5 py-1 text-xs rounded border border-border bg-background text-primary focus:outline-none focus:ring-1 focus:ring-terracotta"
              >
                <option value="eng">English (eng)</option>
                <option value="hin">हिंदी - Hindi (hin)</option>
                <option value="kan">ಕನ್ನಡ - Kannada (kan)</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              tabIndex={0}
              role="button"
              aria-label="Upload document dropzone"
              className={`border-2 border-dashed rounded-lg p-8 sm:p-10 text-center cursor-pointer transition-colors ${
                isExtractingFile
                  ? 'border-terracotta bg-surface/50 pointer-events-none'
                  : 'border-border hover:border-terracotta hover:bg-surface/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.bmp"
                onChange={handleFileChange}
                className="hidden"
                aria-label="File upload input"
              />

              {isExtractingFile ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-terracotta animate-spin" aria-hidden="true" />
                  <p className="text-sm font-medium text-primary">
                    {ocrProgress?.status || t.analyzer.extractingPdf}
                  </p>
                  {ocrProgress && typeof ocrProgress.progress === 'number' && (
                    <div className="w-full max-w-xs bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-terracotta h-2 transition-all duration-300"
                        style={{ width: `${Math.round(ocrProgress.progress * 100)}%` }}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelOcr();
                    }}
                    className="mt-2 text-xs"
                  >
                    {t.analyzer.ocrCancelBtn}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-terracotta">
                    <Upload className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">
                      {t.analyzer.dropzoneTitle}
                    </p>
                    <p className="text-xs text-muted">
                      {t.analyzer.dropzoneSub}
                    </p>
                  </div>
                  <p className="text-xs text-muted font-mono">
                    PDF, PNG, JPG, WEBP, TXT (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {fileError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-md bg-surface border border-terracotta text-xs text-terracotta font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{fileError}</span>
              </div>
            )}

            <div className="p-3 rounded-md bg-surface border border-border text-xs text-muted flex items-start gap-2">
              <Lock className="w-4 h-4 text-terracotta shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.analyzer.privacyNotice}</span>
            </div>
          </div>
        )}

        {/* Live Redaction Preview: What Jaanch Sends Before Submit */}
        {offerText.trim().length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-terracotta" aria-hidden="true" />
                <span className="text-xs font-semibold text-primary">
                  {t.analyzer.redactionPreviewTitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-muted">
                  {redactionPreview.redactionCount > 0
                    ? `${redactionPreview.redactionCount} ${t.analyzer.redactionPreviewCount}`
                    : t.analyzer.redactionPreviewZero}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRedactionPreview(!showRedactionPreview)}
                className="text-xs text-muted hover:text-primary"
              >
                {showRedactionPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            <p className="text-xs text-muted mb-3">
              {t.analyzer.redactionPreviewSub}
            </p>

            {showRedactionPreview && (
              <div className="p-3 rounded-md bg-surface border border-border font-mono text-xs text-body whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed select-all">
                {redactionPreview.redactedText}
              </div>
            )}
          </div>
        )}

        {/* In-Flight Multi-Step Heuristic Progress */}
        {isAnalyzing && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 p-4 rounded-md bg-surface border border-border space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono text-muted">
              <span>HEURISTIC PIPELINE EXECUTION</span>
              <span className="font-bold text-terracotta">STEP {progressStep} OF 4</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs">
                {progressStep > 1 ? (
                  <Check className="w-4 h-4 text-terracotta shrink-0" aria-hidden="true" />
                ) : (
                  <Loader2 className="w-4 h-4 text-terracotta animate-spin shrink-0" aria-hidden="true" />
                )}
                <span className={progressStep === 1 ? 'font-semibold text-primary' : 'text-muted'}>
                  {t.analyzer.progressStep1}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {progressStep > 2 ? (
                  <Check className="w-4 h-4 text-terracotta shrink-0" aria-hidden="true" />
                ) : progressStep === 2 ? (
                  <Loader2 className="w-4 h-4 text-terracotta animate-spin shrink-0" aria-hidden="true" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className={progressStep === 2 ? 'font-semibold text-primary' : 'text-muted'}>
                  {t.analyzer.progressStep2}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {progressStep > 3 ? (
                  <Check className="w-4 h-4 text-terracotta shrink-0" aria-hidden="true" />
                ) : progressStep === 3 ? (
                  <Loader2 className="w-4 h-4 text-terracotta animate-spin shrink-0" aria-hidden="true" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className={progressStep === 3 ? 'font-semibold text-primary' : 'text-muted'}>
                  {t.analyzer.progressStep3}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {progressStep === 4 ? (
                  <Loader2 className="w-4 h-4 text-terracotta animate-spin shrink-0" aria-hidden="true" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className={progressStep === 4 ? 'font-semibold text-primary' : 'text-muted'}>
                  {t.analyzer.progressStep4}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert with Retry */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
          >
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerAnalysis()}
              className="text-xs shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Retry Analysis
            </Button>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="mt-6 pt-6 border-t border-border flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!isMinMet || isAnalyzing || isExtractingFile}
            onClick={() => triggerAnalysis()}
            className="w-full sm:w-auto font-medium"
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t.analyzer.verifyingBtn}</span>
              </span>
            ) : (
              <span>{t.analyzer.verifyBtn}</span>
            )}
          </Button>
        </div>
      </Card>

      {/* Sample Scenarios for Testing */}
      <div className="p-4 rounded-lg bg-surface border border-border">
        <p className="text-xs font-semibold text-primary mb-3">
          {t.analyzer.samplesPrompt}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setOfferText(SCENARIO_GENUINE);
              setDomain('internship');
              setChannel('email');
              setClaimedOrg('Tata Consultancy Services (TCS)');
              setActiveTab('paste');
            }}
            className="px-3 py-1.5 border-2 border-neo-border shadow-neo-sm bg-neo-sky text-foreground text-xs font-bold uppercase tracking-wider hover:bg-neo-sky-light hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            1. {t.analyzer.sampleGenuine}
          </button>
          <button
            type="button"
            onClick={() => {
              setOfferText(SCENARIO_FEE_SCAM);
              setDomain('job');
              setChannel('whatsapp');
              setClaimedOrg('Other / Unlisted Organization');
              setCustomOrg('Apex Tech Careers');
              setActiveTab('paste');
            }}
            className="px-3 py-1.5 border-2 border-neo-border shadow-neo-sm bg-neo-sky text-foreground text-xs font-bold uppercase tracking-wider hover:bg-neo-sky-light hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            2. {t.analyzer.sampleFeeScam}
          </button>
          <button
            type="button"
            onClick={() => {
              setOfferText(SCENARIO_OTP_SCAM);
              setDomain('scholarship');
              setChannel('sms');
              setClaimedOrg('State Bank of India (SBI)');
              setActiveTab('paste');
            }}
            className="px-3 py-1.5 border-2 border-neo-border shadow-neo-sm bg-neo-sky text-foreground text-xs font-bold uppercase tracking-wider hover:bg-neo-sky-light hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            3. {t.analyzer.sampleOtpScam}
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-export as AnalyzePage for backwards compatibility with router and tests
export { Analyze as AnalyzePage };
