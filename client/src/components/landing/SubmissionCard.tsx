import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clipboard, ArrowRight, Upload, AlertCircle, Sparkles, Check, FileText } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';

export const SCENARIO_GENUINE =
  'Subject: Infosys Springboard Internship Selection. Dear Candidate, you have been selected for the 8-week software engineering internship program. There are no registration or training fees. Stipend is ₹25,000/month. Access details at https://springboard.infosys.com.';

export const SCENARIO_FEE_SCAM =
  'URGENT: TCS Careers Offer Letter. Congratulations! You are selected as Associate Software Engineer. Deposit ₹3,500 refundable laptop security deposit within 2 hours via UPI to tcs.hr@okaxis or your job offer stands cancelled.';

export const SCENARIO_OTP_SCAM =
  'Dear Student, National Merit Scholarship ₹50,000 is approved. To disburse funds directly to your bank account, kindly provide your 6-digit bank OTP immediately for Aadhaar verification.';

export function SubmissionCard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [text, setText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = text.length;
  const isMinMet = charCount >= 25;

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setText(clipText);
          setError(null);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
        }
      } else {
        setError('Clipboard access not supported by browser. Please paste manually.');
      }
    } catch {
      setError('Unable to read clipboard. Please paste directly into the box.');
    }
  };

  const handleSelectScenario = (scenarioText: string) => {
    setText(scenarioText);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMinMet) {
      setError(t('errors.validationError') || 'Please provide at least 25 characters of offer text.');
      return;
    }
    // Navigate to analyze page with the input text
    navigate('/analyze', { state: { offerText: text, autoRun: true } });
  };

  return (
    <div id="submission-card" className="w-full max-w-2xl mx-auto my-8">
      <div className="bg-surface border border-border rounded-card shadow-md overflow-hidden">
        {/* Card Tabs: Paste Text vs Upload File */}
        <div className="flex border-b border-border bg-background/50">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-primary text-foreground bg-surface'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText size={14} />
            <span>Paste Message Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-primary text-foreground bg-surface'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload size={14} />
            <span>Upload Document</span>
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === 'paste' ? (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              {/* Header inside form with Clipboard Paste Action */}
              <div className="flex items-center justify-between">
                <label htmlFor="offer-text" className="text-xs font-semibold text-foreground">
                  {t('submissionCard.title')}
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:underline font-medium min-h-[32px]"
                >
                  <Clipboard size={13} />
                  <span>Paste from clipboard</span>
                </button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  id="offer-text"
                  data-testid="offer-textarea"
                  rows={5}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (e.target.value.length >= 25 && error) {
                      setError(null);
                    }
                  }}
                  placeholder={t('submissionCard.placeholder')}
                  className={`w-full p-3.5 bg-background border rounded-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 transition-all ${
                    error ? 'border-status-high-concern-border focus:ring-status-high-concern-border' : 'border-border focus:ring-ring'
                  }`}
                />

                {copiedNotification && (
                  <div className="absolute top-2 right-2 bg-foreground text-background text-[11px] px-2 py-1 rounded-chip flex items-center gap-1 shadow">
                    <Check size={11} className="text-terracotta" />
                    <span>Pasted!</span>
                  </div>
                )}
              </div>

              {/* Live Character Counter & Minimum Validation Indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid="char-counter"
                    className={`font-mono font-bold ${
                      isMinMet ? 'text-status-likely-genuine-fg' : 'text-terracotta'
                    }`}
                  >
                    {charCount} / 25
                  </span>
                  <span>characters (minimum 25)</span>
                </div>

                {isMinMet && (
                  <span className="text-[11px] text-status-likely-genuine-fg font-medium flex items-center gap-1">
                    <Check size={12} /> Ready for audit
                  </span>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  data-testid="min-char-error"
                  className="flex items-center gap-2 p-2.5 bg-status-high-concern-bg text-status-high-concern-fg border border-status-high-concern-border rounded text-xs"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 3 Test Scenarios / Sample Chips */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Sparkles size={13} className="text-terracotta" />
                  <span>Try a real test scenario:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-testid="scenario-genuine"
                    onClick={() => handleSelectScenario(SCENARIO_GENUINE)}
                    className="px-2.5 py-1 text-xs rounded-chip border border-border bg-background hover:border-terracotta hover:bg-muted-subtle/5 transition-all text-foreground"
                  >
                    1. Genuine Internship
                  </button>
                  <button
                    type="button"
                    data-testid="scenario-fee"
                    onClick={() => handleSelectScenario(SCENARIO_FEE_SCAM)}
                    className="px-2.5 py-1 text-xs rounded-chip border border-border bg-background hover:border-terracotta hover:bg-muted-subtle/5 transition-all text-foreground"
                  >
                    2. Upfront Fee Scam
                  </button>
                  <button
                    type="button"
                    data-testid="scenario-otp"
                    onClick={() => handleSelectScenario(SCENARIO_OTP_SCAM)}
                    className="px-2.5 py-1 text-xs rounded-chip border border-border bg-background hover:border-terracotta hover:bg-muted-subtle/5 transition-all text-foreground"
                  >
                    3. OTP Phishing Scam
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-border flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isMinMet}
                  data-testid="check-offer-btn"
                  className="w-full sm:w-auto"
                >
                  <span>{t('submissionCard.analyzeBtn')}</span>
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </div>
            </form>
          ) : (
            /* Upload Tab */
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-card text-center bg-background/50">
              <Upload size={32} className="text-terracotta mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                {t('submissionCard.dropPdf')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Local in-browser PDF text extraction via pdfjs-dist. Files are never transmitted to server.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analyze')}
                className="mt-4"
              >
                Open Analyzer with PDF Support
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionCard;
