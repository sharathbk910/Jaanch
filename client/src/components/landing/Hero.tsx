import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2, ShieldCheck, CheckCircle2, Building, GraduationCap, Briefcase, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';

export function Hero() {
  const { t, currentLang } = useLanguage();

  const getHeadline = () => {
    if (currentLang === 'hi') return 'जवाब देने से पहले जान लें कि यह वास्तविक है।';
    if (currentLang === 'kn') return 'ಪ್ರತಿಕ್ರಿಯಿಸುವ ಮುನ್ನ ಇದು ನೈಜವೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.';
    return "Know it's real before you reply.";
  };

  const scrollToCard = () => {
    const el = document.getElementById('submission-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full pt-20 sm:pt-24 lg:pt-24 pb-12 sm:pb-16 overflow-hidden">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Pill / Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-muted-subtle/10 border border-border text-xs font-medium text-foreground mb-6">
          <ShieldCheck size={14} className="text-terracotta" aria-hidden="true" />
          <span>{t('hero.notice')}</span>
        </div>

        {/* Hero Headline (Exact copy register per spec) */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15] max-w-3xl">
          {getHeadline()}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-sans">
          {t('hero.subtitle')}
        </p>

        {/* The Two CTAs */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={scrollToCard}
            className="group"
          >
            <span>{t('hero.cta')}</span>
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>

          <Link to="/link-check">
            <Button variant="outline" size="lg">
              <Link2 size={16} className="mr-2 text-muted-foreground" />
              <span>{t('hero.secondaryCta')}</span>
            </Button>
          </Link>
        </div>

        {/* 3-Item Feature Strip */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-surface border border-border rounded-card text-terracotta shrink-0 mt-0.5">
              <span className="font-mono text-xs font-bold">01</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t('features.zeroFeesTitle')}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                {t('features.zeroFeesDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-surface border border-border rounded-card text-terracotta shrink-0 mt-0.5">
              <span className="font-mono text-xs font-bold">02</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t('features.noOtpTitle')}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                {t('features.noOtpDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-surface border border-border rounded-card text-terracotta shrink-0 mt-0.5">
              <span className="font-mono text-xs font-bold">03</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t('features.officialDomainsTitle')}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                {t('features.officialDomainsDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Channels Card (MCA, NCS, NSP, AICTE) */}
        <div className="mt-10 p-5 bg-surface border border-border rounded-card shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-border gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-status-likely-genuine-fg" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Official Indian Verification Portals
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Always cross-reference through certified portals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="https://www.mca.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-chip border border-border hover:border-terracotta/50 hover:bg-muted-subtle/5 transition-all text-xs font-medium text-foreground group"
            >
              <Building size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-semibold truncate">MCA Portal</div>
                <div className="text-[10px] text-muted-foreground truncate">mca.gov.in</div>
              </div>
              <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-terracotta shrink-0" />
            </a>

            <a
              href="https://www.ncs.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-chip border border-border hover:border-terracotta/50 hover:bg-muted-subtle/5 transition-all text-xs font-medium text-foreground group"
            >
              <Briefcase size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-semibold truncate">NCS India</div>
                <div className="text-[10px] text-muted-foreground truncate">ncs.gov.in</div>
              </div>
              <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-terracotta shrink-0" />
            </a>

            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-chip border border-border hover:border-terracotta/50 hover:bg-muted-subtle/5 transition-all text-xs font-medium text-foreground group"
            >
              <GraduationCap size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-semibold truncate">NSP Portal</div>
                <div className="text-[10px] text-muted-foreground truncate">scholarships.gov.in</div>
              </div>
              <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-terracotta shrink-0" />
            </a>

            <a
              href="https://internship.aicte-india.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-chip border border-border hover:border-terracotta/50 hover:bg-muted-subtle/5 transition-all text-xs font-medium text-foreground group"
            >
              <ShieldCheck size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-semibold truncate">AICTE Portal</div>
                <div className="text-[10px] text-muted-foreground truncate">aicte-india.org</div>
              </div>
              <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-terracotta shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
