import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, ExternalLink } from 'lucide-react';
import { useT } from '../../i18n/I18nContext.js';

export function Footer() {
  const { t } = useT();

  return (
    <footer className="w-full bg-page border-t border-hairline mt-auto">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Helpline Advisory Card */}
        <div className="bg-surface border border-hairline rounded-card p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-page border border-hairline rounded-btn text-accent shrink-0">
              <Phone size={18} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold text-primary">
                  {t('footer.helplineTitle', 'National Cybercrime Reporting Portal')}
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {t('footer.helplineNumber', '1930')}
                </span>
              </div>
              <p className="text-xs text-body mt-0.5">
                {t('footer.helplineSub', 'Call 1930 immediately if you have transferred money to a fraudulent recruiter.')}
              </p>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline shrink-0"
          >
            <span>{t('footer.govUrl', 'cybercrime.gov.in')}</span>
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>

        {/* Footer Meta & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-hairline">
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm font-bold tracking-tight text-primary">
              JAANCH<span className="text-accent">.</span>
            </span>
            <span className="text-xs text-muted">
              {t('footer.tagline', 'A non-profit digital safety initiative for Indian students.')}
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-muted">
            <Link to="/resources" className="hover:text-primary transition-colors">
              {t('footer.resources', 'Resources')}
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              {t('footer.about', 'About')}
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              {t('footer.privacy', 'Privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
