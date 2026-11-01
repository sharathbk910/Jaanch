import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { LangSwitch } from './LangSwitch.js';
import { FeedbackPill } from './FeedbackPill.js';

export function Footer() {
  const { t } = useLanguage();

  return (
    <>
      <footer className="w-full bg-background border-t border-border mt-auto select-none">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* 1930 Helpline Advisory Card */}
          <div className="bg-surface border border-border rounded-card p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-status-high-concern-bg border border-status-high-concern-border rounded-btn text-status-high-concern-fg shrink-0">
                <Phone size={20} aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm font-bold text-foreground">
                    {t('footer.helplineTitle')}
                  </span>
                  <span className="font-mono text-xs font-bold text-terracotta bg-muted-subtle/10 px-2 py-0.5 rounded">
                    1930
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  {t('footer.helplineDesc')}
                </p>
              </div>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline shrink-0 min-h-[44px] sm:min-h-0 flex items-center"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>

          {/* Educational Disclaimer */}
          <div className="p-4 bg-muted-subtle/5 border border-border rounded-card mb-8 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2 font-medium text-foreground mb-1">
              <ShieldCheck size={14} className="text-terracotta" aria-hidden="true" />
              <span>Public Service Safety Advisory</span>
            </div>
            <p>
              JAANCH is an independent public trust initiative for Indian students. All heuristic evaluations are deterministic and privacy-preserving. Neither government entities nor legitimate private employers charge security deposits, training fees, or demand banking OTPs for job offers.
            </p>
          </div>

          {/* Footer Navigation & Language Switcher */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <span className="font-serif text-base font-bold tracking-tight text-terracotta">
                JAANCH.
              </span>
              <span className="text-xs text-muted-foreground">
                {t('footer.copyright')}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <Link to="/resources" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">
                {t('navigation.resources')}
              </Link>
              <Link to="/about" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">
                {t('navigation.about')}
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">
                {t('footer.privacy')}
              </Link>
              <div className="pl-2 border-l border-border">
                <LangSwitch size="sm" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Feedback Pill on all pages */}
      <FeedbackPill />
    </>
  );
}

export default Footer;
