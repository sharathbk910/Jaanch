import React from 'react';
import { AlertCircle, PhoneCall, ExternalLink, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface PaymentAlertProps {
  amount?: string;
  upiHandle?: string;
  hasOtpDemand?: boolean;
}

export function PaymentAlert({ amount, upiHandle, hasOtpDemand }: PaymentAlertProps) {
  const { t } = useLanguage();

  return (
    <div
      id="payment-alert"
      className="p-4 sm:p-5 bg-status-high-concern-bg border border-status-high-concern-border rounded-card text-status-high-concern-fg shadow-sm space-y-3"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert size={22} className="shrink-0 mt-0.5 text-status-high-concern-fg" />
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
            {t('results.paymentAlertTitle') || 'Payment & Banking Security Advisory'}
          </h3>
          <p className="text-xs leading-relaxed opacity-95">
            {t('results.paymentAlertDesc') ||
              'This communication demands an upfront fee, deposit, or banking OTP. Legitimate employers and scholarship bodies never ask for money or OTPs.'}
          </p>

          {(amount || upiHandle || hasOtpDemand) && (
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono">
              {amount && (
                <span className="px-2 py-0.5 bg-surface border border-status-high-concern-border rounded text-foreground">
                  Fee Demanded: <strong>{amount}</strong>
                </span>
              )}
              {upiHandle && (
                <span className="px-2 py-0.5 bg-surface border border-status-high-concern-border rounded text-foreground">
                  UPI Target: <strong>{upiHandle}</strong>
                </span>
              )}
              {hasOtpDemand && (
                <span className="px-2 py-0.5 bg-surface border border-status-high-concern-border rounded text-status-high-concern-fg font-semibold">
                  Demands Banking OTP / PIN
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Golden Hour 1930 / cybercrime.gov.in notice */}
      <div className="p-3 bg-surface/90 border border-status-high-concern-border rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground">
        <div className="flex items-center gap-2 font-medium">
          <PhoneCall size={16} className="text-status-high-concern-fg shrink-0" />
          <span>
            {t('results.paymentAlertCall1930') ||
              'Dial 1930 immediately or file a complaint at cybercrime.gov.in if you have already sent funds.'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1930"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-status-high-concern-fg text-surface rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <PhoneCall size={12} />
            <span>Call 1930</span>
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface border border-border rounded text-xs font-semibold text-foreground hover:bg-background transition-colors"
          >
            <span>cybercrime.gov.in</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

