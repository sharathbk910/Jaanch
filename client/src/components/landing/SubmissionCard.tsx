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
    <div id="submission-card" className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-surface border-2 border-neo-border shadow-neo-xl">
        {/* Card Tabs: Paste Text vs Upload File (MotherDuck Retro Tab Bar) */}
        <div className="flex border-b-2 border-neo-border bg-background/60">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all ${
              activeTab === 'paste'
                ? 'bg-neo-yellow text-foreground border-r-2 border-neo-border'
                : 'text-muted-foreground hover:bg-foreground hover:text-background border-r border-neo-border/40'
            }`}
          >
            <FileText size={15} />
            <span className="uppercase tracking-wider">Paste Message Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-neo-yellow text-foreground border-r-2 border-neo-border'
                : 'text-muted-foreground hover:bg-foreground hover:text-background border-r border-neo-border/40'
            }`}
          >
            <Upload size={15} />
            <span className="uppercase tracking-wider">Upload Document</span>
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {activeTab === 'paste' ? (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              {/* Header inside form with Clipboard Paste Action */}
              <div className="flex items-center justify-between">
                <label htmlFor="offer-text" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('submissionCard.title')}
                </label>

                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1.5 text-xs border border-neo-border shadow-neo-sm bg-background px-2.5 py-1 text-foreground font-bold hover:bg-foreground hover:text-background hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all min-h-[32px] group"
                >
                  <Clipboard size={13} className="group-hover:text-background" />
                  <span>Paste from clipboard</span>
                </button>
              </div>

              {/* Textarea with 2px border */}
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
                  className={`w-full p-4 bg-background border-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                    error ? 'border-status-high-concern-border focus:ring-status-high-concern-border' : 'border-neo-border'
                  }`}
                />

                {copiedNotification && (
                  <div className="absolute top-2 right-2 bg-neo-yellow text-foreground border border-neo-border text-[11px] font-bold px-2.5 py-1 shadow-neo-sm flex items-center gap-1">
                    <Check size={12} className="text-status-likely-genuine-fg" />
                    <span>Pasted!</span>
                  </div>
                )}
              </div>

              {/* Live Character Counter & Minimum Validation Indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid="char-counter"
                    className={`font-mono font-bold border border-neo-border px-2 py-0.5 shadow-neo-sm bg-background ${
                      isMinMet ? 'text-status-likely-genuine-fg' : 'text-terracotta'
                    }`}
                  >
                    {charCount} / 25
                  </span>
                  <span>characters (minimum 25)</span>
                </div>

                {isMinMet && (
                  <span className="text-xs text-status-likely-genuine-fg font-bold flex items-center gap-1 bg-status-likely-genuine-bg border border-status-likely-genuine-border px-2 py-0.5">
                    <Check size={13} /> Ready for audit
                  </span>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  data-testid="min-char-error"
                  className="flex items-center gap-2 p-3 bg-status-high-concern-bg text-status-high-concern-fg border-2 border-status-high-concern-border text-xs font-medium"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 3 Test Scenarios / Sample Chips (Hover Invert) */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  <Sparkles size={13} className="text-terracotta" />
                  <span>Try a real test scenario:</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    data-testid="scenario-genuine"
                    onClick={() => handleSelectScenario(SCENARIO_GENUINE)}
                    className="px-3 py-1.5 text-xs border-2 border-neo-border shadow-neo-sm bg-neo-mint text-foreground font-bold hover:bg-foreground hover:text-background hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    1. Genuine Internship
                  </button>
                  <button
                    type="button"
                    data-testid="scenario-fee"
                    onClick={() => handleSelectScenario(SCENARIO_FEE_SCAM)}
                    className="px-3 py-1.5 text-xs border-2 border-neo-border shadow-neo-sm bg-neo-peach text-foreground font-bold hover:bg-foreground hover:text-background hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    2. Upfront Fee Scam
                  </button>
                  <button
                    type="button"
                    data-testid="scenario-otp"
                    onClick={() => handleSelectScenario(SCENARIO_OTP_SCAM)}
                    className="px-3 py-1.5 text-xs border-2 border-neo-border shadow-neo-sm bg-neo-pink text-foreground font-bold hover:bg-foreground hover:text-background hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                  >
                    3. OTP Phishing Scam
                  </button>
                </div>
              </div>

              {/* Submit CTA with Hover Invert */}
              <div className="pt-4 border-t-2 border-neo-border flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isMinMet}
                  data-testid="check-offer-btn"
                  className="w-full sm:w-auto border-2 border-neo-border shadow-neo bg-neo-blue text-foreground font-bold uppercase tracking-wider hover:bg-foreground hover:text-background hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all px-6 py-2.5 rounded-none disabled:opacity-50 disabled:pointer-events-none group"
                >
                  <span>{t('submissionCard.analyzeBtn')}</span>
                  <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 group-hover:text-background transition-transform" />
                </Button>
              </div>
            </form>
          ) : (
            /* Upload Tab */
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neo-border text-center bg-background/50">
              <Upload size={36} className="text-terracotta mb-3" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {t('submissionCard.dropPdf')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Local in-browser PDF text extraction via pdfjs-dist. Files are never transmitted to server.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analyze')}
                className="mt-4 border-2 border-neo-border shadow-neo bg-surface text-foreground font-bold hover:bg-foreground hover:text-background hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm transition-all rounded-none"
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
