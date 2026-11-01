import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert, CheckCircle2, Lock, AlertTriangle, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { useAuth } from '../../lib/AuthContext.js';
import { apiClient } from '../../lib/apiClient.js';
import { Button } from '../ui/Button.js';

export type IndicatorType = 'url' | 'domain' | 'phone' | 'upi';

export interface ReportMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  category?: string;
  indicators?: Array<{ type: 'url' | 'domain' | 'phone' | 'upi'; value: string }>;
}

export function ReportMessageDialog({
  isOpen,
  onClose,
  text,
  category: initialCategory = 'fake_job',
  indicators = [],
}: ReportMessageDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState(initialCategory);
  const [shareConsent, setShareConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ publicId: string; deduplicated: boolean } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setShareConsent(false);
      setError(null);
      setResult(null);
    }
  }, [isOpen, initialCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!shareConsent) {
      setError('You must consent to indicator sharing to contribute to community threat intelligence.');
      return;
    }

    if (!text || text.trim().length < 25) {
      setError('Original message must be at least 25 characters to report.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.submitIntelReport({
        text,
        category,
        indicators,
        shareIndicators: true,
      });

      setResult({
        publicId: res.publicId,
        deduplicated: res.deduplicated,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit scam report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-message-dialog-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden animate-scale-up"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted-subtle/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="report-message-dialog-title" className="text-lg font-bold text-foreground">
                {t('reportMessage.title') || 'Report to Community Intelligence'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('reportMessage.subtitle') || 'Protect fellow students across India'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted-subtle rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {result ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                {result.deduplicated
                  ? t('reportMessage.dedupeTitle') || 'Report Confirmed & Deduplicated'
                  : t('reportMessage.successTitle') || 'Report Added to Intelligence Queue'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {result.deduplicated
                  ? 'Your report adds vital corroborated evidence to an existing community record.'
                  : 'Your submission has been securely scrubbed, hashed, and queued for human moderator review.'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted-subtle font-mono text-xs text-foreground font-semibold">
                <span>{result.publicId}</span>
              </div>

              <div className="mt-6">
                <Button type="button" variant="primary" onClick={onClose}>
                  {t('common.done') || 'Done'}
                </Button>
              </div>
            </div>
          ) : !user ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {t('reportMessage.authRequiredTitle') || 'Account Required to Report'}
              </h3>
              <p className="text-xs text-muted-foreground mb-6 max-w-sm mx-auto">
                {t('reportMessage.authRequiredDesc') ||
                  'To prevent false reporting and spam, threat reports require an authenticated student account.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" onClick={onClose}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button variant="primary" onClick={() => navigate('/login')}>
                  {t('auth.login') || 'Sign In to Report'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-muted-subtle/50 rounded-xl border border-border/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>Privacy & Scrubbing Protection</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your raw submission will <strong>never</strong> be published. All student names, personal emails,
                  phone numbers, and sensitive credentials are automatically redacted before hashing. Only extracted
                  suspicious payment handles, URLs, and domains will be shared to warn other students.
                </p>
              </div>

              {error && (
                <div
                  className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="report-category"
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
                >
                  {t('reportMessage.categoryLabel') || 'Scam Category'}
                </label>
                <select
                  id="report-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="fake_job">Fake Job / Internship Offer</option>
                  <option value="upfront_fee">Upfront Registration / Laptop Fee</option>
                  <option value="task_scam">Part-Time / Telegram Task Scam</option>
                  <option value="scholarship_fraud">Scholarship / Grant Scheme Fraud</option>
                  <option value="phishing">OTP / Sensitive Data Phishing</option>
                  <option value="other">Other Fraudulent Pattern</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl cursor-pointer hover:bg-muted-subtle/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={shareConsent}
                    onChange={(e) => setShareConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-foreground font-medium leading-relaxed">
                    I consent to sharing scrubbed threat indicators with the Jaanch community queue to protect other
                    students across India.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" disabled={submitting || !shareConsent}>
                  {submitting ? 'Submitting...' : t('reportMessage.submitButton') || 'Submit Threat Report'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
