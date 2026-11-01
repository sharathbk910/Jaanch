import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { useAuth } from '../../lib/AuthContext.js';
import { apiClient } from '../../lib/apiClient.js';
import { Button } from '../ui/Button.js';
import { Input, Textarea } from '../ui/Input.js';

export interface ReportEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntityType?: 'email' | 'domain' | 'phone' | 'upi' | 'bank_account';
  initialValue?: string;
  channel?: string;
}

export function ReportEntityDialog({
  isOpen,
  onClose,
  initialEntityType = 'upi',
  initialValue = '',
  channel: initialChannel = 'whatsapp',
}: ReportEntityDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [entityType, setEntityType] = useState<'email' | 'domain' | 'phone' | 'upi' | 'bank_account'>(initialEntityType);
  const [value, setValue] = useState(initialValue);
  const [channel, setChannel] = useState(initialChannel);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setEntityType(initialEntityType);
      setValue(initialValue);
      setChannel(initialChannel);
      setDescription('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialEntityType, initialValue, initialChannel]);

  // Handle escape key
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

    if (!value.trim()) {
      setError('Please provide the indicator value.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.reportEntity({
        entityType,
        value: value.trim(),
        channel,
        description: description.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="w-full max-w-lg bg-surface border border-border rounded-card shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-background/50">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-terracotta shrink-0" />
            <h2 id="report-dialog-title" className="text-sm sm:text-base font-bold text-foreground">
              {t('reportDialog.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('reportDialog.closeBtn')}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-status-likely-genuine-bg/30 text-status-likely-genuine-fg mx-auto flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">{t('reportDialog.successTitle')}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {t('reportDialog.successDesc')}
                </p>
              </div>
              <Button variant="primary" onClick={onClose} className="mt-4 px-6">
                {t('reportDialog.closeBtn')}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">{t('reportDialog.subtitle')}</p>

              {!user && (
                <div className="p-3.5 bg-status-high-concern-bg/20 border border-status-high-concern-border/40 rounded flex items-start gap-3">
                  <Lock size={16} className="text-status-high-concern-fg shrink-0 mt-0.5" />
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground leading-relaxed">{t('reportDialog.authNotice')}</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/login')}
                      className="inline-flex"
                    >
                      {t('reportDialog.signInBtn')}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-status-high-concern-bg/30 border border-status-high-concern-border/60 rounded text-xs text-status-high-concern-fg flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Entity Type */}
                <div className="space-y-1.5">
                  <label htmlFor="entity-type-select" className="text-xs font-semibold text-foreground block">
                    {t('reportDialog.typeLabel')}
                  </label>
                  <select
                    id="entity-type-select"
                    value={entityType}
                    disabled={!user || submitting}
                    onChange={(e) =>
                      setEntityType(e.target.value as 'email' | 'domain' | 'phone' | 'upi' | 'bank_account')
                    }
                    className="w-full px-3 py-2 text-xs bg-surface text-foreground border border-border rounded transition-colors focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                  >
                    <option value="upi">{t('reportDialog.types.upi')}</option>
                    <option value="phone">{t('reportDialog.types.phone')}</option>
                    <option value="email">{t('reportDialog.types.email')}</option>
                    <option value="domain">{t('reportDialog.types.domain')}</option>
                    <option value="bank_account">{t('reportDialog.types.bank_account')}</option>
                  </select>
                </div>

                {/* Value */}
                <div className="space-y-1.5">
                  <label htmlFor="indicator-value-input" className="text-xs font-semibold text-foreground block">
                    {t('reportDialog.valueLabel')}
                  </label>
                  <Input
                    id="indicator-value-input"
                    type="text"
                    required
                    disabled={!user || submitting}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. recruit@fraudulent-domain.xyz or hr.pay@okhdfc"
                  />
                </div>

                {/* Channel */}
                <div className="space-y-1.5">
                  <label htmlFor="report-channel-select" className="text-xs font-semibold text-foreground block">
                    {t('reportDialog.channelLabel')}
                  </label>
                  <select
                    id="report-channel-select"
                    value={channel}
                    disabled={!user || submitting}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface text-foreground border border-border rounded transition-colors focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="job_portal">Job Portal / LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="report-desc-input" className="text-xs font-semibold text-foreground block">
                    {t('reportDialog.descLabel')}
                  </label>
                  <Textarea
                    id="report-desc-input"
                    rows={3}
                    disabled={!user || submitting}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('reportDialog.descPlaceholder')}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
                  <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
                    {t('reportDialog.closeBtn')}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!user || submitting || !value.trim()}
                  >
                    {submitting ? t('reportDialog.submittingBtn') : t('reportDialog.submitBtn')}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

