import React from 'react';
import { Phone, ExternalLink, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

export function GuidelinesAndHelpline() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-16 border-t-2 border-neo-border bg-background">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Guidelines Card (MotherDuck Editorial Card) */}
          <div className="p-6 sm:p-8 bg-surface border-2 border-neo-border shadow-neo-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 bg-neo-yellow border border-neo-border shadow-neo-sm text-foreground">
                  <ShieldCheck size={20} aria-hidden="true" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {t('guidelines.title')}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 font-medium">
                Core defense principles for Indian students encountering campus recruiters, freelance offers, or scholarship announcements.
              </p>

              <ul className="space-y-3.5 text-xs sm:text-sm">
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-neo-peach border border-neo-border shadow-neo-sm px-2 py-0.5 text-foreground shrink-0 mt-0.5">
                    01
                  </span>
                  <span className="text-foreground leading-relaxed">{t('guidelines.rule1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-neo-blue border border-neo-border shadow-neo-sm px-2 py-0.5 text-foreground shrink-0 mt-0.5">
                    02
                  </span>
                  <span className="text-foreground leading-relaxed">{t('guidelines.rule2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-neo-mint border border-neo-border shadow-neo-sm px-2 py-0.5 text-foreground shrink-0 mt-0.5">
                    03
                  </span>
                  <span className="text-foreground leading-relaxed">{t('guidelines.rule3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-neo-yellow border border-neo-border shadow-neo-sm px-2 py-0.5 text-foreground shrink-0 mt-0.5">
                    04
                  </span>
                  <span className="text-foreground leading-relaxed">
                    Always cross-reference the Corporate Identification Number (CIN) on the official MCA21 portal before sharing Aadhaar or PAN.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-neo-border/20 text-xs text-muted-foreground flex items-center gap-2 font-medium">
              <HelpCircle size={15} className="text-terracotta shrink-0" />
              <span>Doubtful about a job posting? Paste the entire text in Jaanch above.</span>
            </div>
          </div>

          {/* 1930 National Helpline Card (MotherDuck Alert Callout) */}
          <div className="p-6 sm:p-8 bg-status-high-concern-bg/40 border-2 border-neo-border shadow-neo-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 bg-status-high-concern-bg border border-status-high-concern-border shadow-neo-sm text-status-high-concern-fg">
                  <AlertTriangle size={20} aria-hidden="true" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-status-high-concern-fg">
                  Transferred Money to a Scammer?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed mb-6">
                Financial fraud in India has a critical <strong>"Golden Hour"</strong> window. Reporting within 2 to 4 hours of a fraudulent UPI or IMPS transaction gives cyber police the best chance of freezing the fraudster’s bank account.
              </p>

              <div className="p-5 bg-surface border-2 border-neo-border shadow-neo mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      National Cybercrime Helpline
                    </span>
                    <a
                      href="tel:1930"
                      className="font-mono text-3xl sm:text-4xl font-bold text-status-high-concern-fg hover:underline min-h-[44px] flex items-center"
                    >
                      1930
                    </a>
                  </div>
                  <div className="p-3.5 bg-status-high-concern-bg border border-status-high-concern-border shadow-neo-sm text-status-high-concern-fg">
                    <Phone size={26} aria-hidden="true" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  Toll-free 24x7 helpline operated by Indian Cyber Crime Coordination Centre (I4C), MHA.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-neo-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-foreground/85 font-medium">Lodge formal digital cyber complaints online:</span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold border border-neo-border bg-surface px-3 py-1.5 shadow-neo-sm text-status-high-concern-fg hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all min-h-[44px] sm:min-h-0 flex items-center group"
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
