import React, { useState, useEffect, useRef } from 'react';
import { X, Flag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { apiClient } from '../../lib/apiClient.js';
import { Button } from '../ui/Button.js';
import { Input, Textarea } from '../ui/Input.js';

export interface DisputeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  publicId: string;
}

export function DisputeDialog({ isOpen, onClose, publicId }: DisputeDialogProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setContactEmail('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

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
    if (reason.trim().length < 10) {
      setError('Please explain in at least 10 characters why this record should be contested.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.disputeIntelRecord({
        publicId,
        reason: reason.trim(),
        contactEmail: contactEmail.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-dialog-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden animate-scale-up"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted-subtle/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg">
              <Flag className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="dispute-dialog-title" className="text-lg font-bold text-foreground">
                {t('disputeDialog.title') || 'Contest Threat Record'}
              </h2>
              <span className="text-xs text-muted-foreground font-mono font-medium">
                {publicId}
              </span>
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
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                {t('disputeDialog.successTitle') || 'Dispute Received'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('disputeDialog.successMessage') ||
                  'This record has been marked as disputed and queued for moderator investigation.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-muted-subtle/50 rounded-xl border border-border/80 text-xs text-muted-foreground">
                {t('disputeDialog.guideline') ||
                  'If you represent the organization or believe this message was flagged mistakenly, provide official domain credentials or clarification. Submissions are reviewed by human moderators.'}
              </div>

              {error && (
                <div
                  className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="dispute-reason"
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
                >
                  {t('disputeDialog.reasonLabel') || 'Reason for Contest *'}
                </label>
                <Textarea
                  id="dispute-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this record is in error (e.g. verified corporate domain, legitimate internship program)..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="dispute-email"
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
                >
                  {t('disputeDialog.emailLabel') || 'Official Contact Email (Optional)'}
                </label>
                <Input
                  id="dispute-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@organization.com"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : t('disputeDialog.submit') || 'Submit Contest'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
