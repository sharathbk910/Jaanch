import React from 'react';
import { AlertOctagon, PhoneCall, ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface StopProtectCalloutProps {
  amount?: string;
  upiHandle?: string;
}

export function StopProtectCallout({ amount, upiHandle }: StopProtectCalloutProps) {
  const { t } = useLanguage();

  return (
    <section
      id="stop-protect"
      role="alert"
      className="p-5 sm:p-6 bg-status-high-concern-bg border-2 border-status-high-concern-border rounded-card space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-chip bg-status-high-concern-border/20 text-status-high-concern-fg shrink-0 mt-0.5">
          <AlertOctagon size={24} className="stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-[11px] font-bold text-status-high-concern-fg tracking-wider uppercase">
            CRITICAL FRAUD ALERT – 1930 HELPLINE
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-status-high-concern-fg leading-tight">
            {t('results.stopProtectTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-status-high-concern-fg/90 leading-relaxed font-medium">
            {t('results.stopProtectDesc')}
          </p>
        </div>
      </div>

      {(amount || upiHandle) && (
        <div className="p-3 bg-surface border border-status-high-concern-border/40 rounded-chip text-xs text-foreground flex flex-wrap gap-4 items-center">
          {amount && (
            <div>
              <span className="text-muted-foreground font-mono text-[11px] block uppercase">
                {t('results.amountsLabel')}
              </span>
              <strong className="font-mono text-status-high-concern-fg">{amount}</strong>
            </div>
          )}
          {upiHandle && (
            <div>
              <span className="text-muted-foreground font-mono text-[11px] block uppercase">
                {t('results.upiLabel')}
              </span>
              <strong className="font-mono text-status-high-concern-fg">{upiHandle}</strong>
            </div>
          )}
        </div>
      )}

      {/* Golden hour notice */}
      <div className="flex items-center gap-2 p-2.5 bg-surface/80 border border-status-high-concern-border/30 rounded-chip text-xs text-foreground">
        <Clock size={16} className="text-status-high-concern-fg shrink-0" />
        <span className="font-medium text-[11px] leading-tight text-foreground">
          {t('results.goldenHourNotice')}
        </span>
      </div>

      {/* Direct helpline buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <a
          href="tel:1930"
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-semibold rounded-chip text-xs hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
        >
          <PhoneCall size={14} />
          <span>{t('results.call1930Btn')}</span>
        </a>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface text-foreground font-semibold border border-border rounded-chip text-xs hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
        >
          <span>{t('results.cybercrimePortalBtn')}</span>
          <ExternalLink size={13} className="text-muted-foreground" />
        </a>
      </div>
    </section>
  );
}

