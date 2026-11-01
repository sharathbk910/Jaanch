import React from 'react';
import { Phone, ExternalLink, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

export function GuidelinesAndHelpline() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-14 border-t border-border bg-background">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Guidelines Card */}
          <div className="p-6 sm:p-8 bg-surface border border-border rounded-card shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={20} className="text-terracotta" aria-hidden="true" />
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {t('guidelines.title')}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                Core defense principles for Indian students encountering campus recruiters, freelance offers, or scholarship announcements.
              </p>

              <ul className="space-y-4 text-xs sm:text-sm">
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-terracotta mt-0.5">01</span>
                  <span className="text-foreground leading-relaxed">{t('guidelines.rule1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-terracotta mt-0.5">02</span>
                  <span className="text-foreground leading-relaxed">{t('guidelines.rule2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-terracotta mt-0.5">03</span>
                  <span className="text-foreground leading-relaxed">{t('guidelines.rule3')}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
              <HelpCircle size={14} className="text-terracotta" />
              <span>Doubtful about a job posting? Paste the entire text in Jaanch above.</span>
            </div>
          </div>

          {/* 1930 National Helpline Card */}
          <div className="p-6 sm:p-8 bg-status-high-concern-bg/40 border border-status-high-concern-border rounded-card shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-status-high-concern-fg" aria-hidden="true" />
                <h3 className="font-serif text-xl font-bold text-status-high-concern-fg">
                  Transferred Money to a Scammer?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-6">
                Financial fraud in India has a critical <strong>"Golden Hour"</strong> window. Reporting within 2 to 4 hours of a fraudulent UPI or IMPS transaction gives cyber police the best chance of freezing the fraudster’s bank account.
              </p>

              <div className="p-4 bg-surface border border-status-high-concern-border rounded-card mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      National Cybercrime Helpline
                    </span>
                    <a
                      href="tel:1930"
                      className="font-mono text-2xl sm:text-3xl font-bold text-status-high-concern-fg hover:underline min-h-[44px] flex items-center"
                    >
                      1930
                    </a>
                  </div>
                  <div className="p-3 bg-status-high-concern-bg rounded-btn text-status-high-concern-fg">
                    <Phone size={24} aria-hidden="true" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Toll-free 24x7 helpline operated by Indian Cyber Crime Coordination Centre (I4C), MHA.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-status-high-concern-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-foreground/80">Lodge formal digital cyber complaints online:</span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-status-high-concern-fg hover:underline min-h-[44px] sm:min-h-0 flex items-center"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GuidelinesAndHelpline;
