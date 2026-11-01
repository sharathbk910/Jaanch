import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2, ShieldCheck, Building, GraduationCap, Briefcase, FileCheck, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';

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
      {/* Decorative MotherDuck Floating Clouds */}
      <DoodleCloud size={150} className="absolute right-8 top-12 opacity-80 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={95} className="absolute left-6 top-32 opacity-60 hidden md:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={70} className="absolute right-1/3 top-6 opacity-50 hidden lg:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two-Column MotherDuck Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline, Subtitle, Neo-Brutalist Buttons */}
          <div className="lg:col-span-7">
            {/* Bold All-Caps Sans-Serif Headline (Exact MotherDuck Display Typography) */}
            <h1 className="font-sans font-extrabold uppercase tracking-tight text-3xl sm:text-5xl lg:text-6xl text-foreground leading-[1.08]">
              {getHeadline()}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-sans font-normal">
              {t('hero.subtitle')}
            </p>

            {/* The Two Neo-Brutalist CTAs: Blue Button that transitions from Sky Blue to Deep Blue with White Text */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToCard}
                className="group border-2 border-neo-border shadow-neo bg-neo-sky text-foreground font-bold uppercase tracking-wider hover:bg-neo-sky-hover hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none px-6 py-3.5 h-auto"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight size={16} className="ml-2.5 group-hover:translate-x-1 group-hover:text-white transition-transform" />
              </Button>

              <Link to="/link-check">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-neo-border shadow-neo bg-surface text-foreground font-bold uppercase tracking-wider hover:bg-neo-sky hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none px-6 py-3.5 h-auto"
                >
                  <Link2 size={16} className="mr-2 text-foreground" />
                  <span>{t('hero.secondaryCta')}</span>
                </Button>
              </Link>
            </div>

            {/* Quick Prompt below CTAs (MotherDuck sub-button prompt style) */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Sparkles size={13} className="text-terracotta" />
              <span>Or inspect suspicious domains directly:</span>
              <Link to="/link-check" className="font-bold text-foreground hover:underline">
                URL Inspector →
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Video/Preview Card (MotherDuck Right Card & Tap Button) */}
          <div className="lg:col-span-5">
            <div className="bg-surface border-2 border-neo-border shadow-neo-xl relative overflow-hidden flex flex-col justify-between p-5 sm:p-6 min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-neo-border mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-terracotta border border-neo-border" />
                    <div className="w-3 h-3 bg-neo-yellow border border-neo-border" />
                    <div className="w-3 h-3 bg-neo-sky border border-neo-border" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider ml-1 text-foreground">
                      Offer Audit Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-neo-peach border border-neo-border px-2 py-0.5 shadow-neo-sm">
                    DETERMINISTIC
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-background border border-neo-border shadow-inner">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Input Sample Analysis:</div>
                    <p className="mt-1 text-foreground font-sans text-xs line-clamp-2">
                      "URGENT: Selected as Associate. Deposit ₹3,500 security deposit within 2 hours or job offer cancelled."
                    </p>
                  </div>

                  <div className="p-2.5 bg-status-high-concern-bg border-2 border-status-high-concern-border text-status-high-concern-fg font-bold text-xs flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>FLAGGED: Upfront Fee Demand Detected</span>
                  </div>
                </div>
              </div>

              {/* Tap Button with Blue Hover Transition */}
              <div className="mt-5 pt-3 border-t-2 border-neo-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={scrollToCard}
                  className="bg-neo-yellow border-2 border-neo-border shadow-neo-sm px-3.5 py-2 font-sans font-bold uppercase tracking-wider text-xs text-foreground flex items-center gap-2 hover:bg-neo-sky-hover hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all group"
                >
                  <Volume2 size={14} className="group-hover:text-white" />
                  <span>Audit Your Offer Now</span>
                </button>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                  Zero Hallucinations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Portals Strip ("TRUSTED BY BUILDERS" Style from MotherDuck image) */}
        <div className="mt-12 pt-8 border-t-2 border-neo-border">
          <div className="flex items-center justify-between pb-3 mb-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Official Indian Verification Portals
            </span>
            <span className="text-[10px] font-mono bg-neo-yellow border border-neo-border px-2 py-0.5 shadow-neo-sm font-bold">
              GOVT VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="https://www.mca.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <Building size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate">MCA Portal</div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">mca.gov.in</div>
              </div>
            </a>

            <a
              href="https://www.ncs.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <Briefcase size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate">NCS India</div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">ncs.gov.in</div>
              </div>
            </a>

            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <GraduationCap size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate">NSP Portal</div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">scholarships.gov.in</div>
              </div>
            </a>

            <a
              href="https://internship.aicte-india.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <ShieldCheck size={16} className="text-terracotta shrink-0" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate">AICTE Portal</div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">aicte-india.org</div>
              </div>
            </a>
          </div>
        </div>

        {/* 3-Card Pastel Feature Strip (MotherDuck 3-Card Layout: Peach, Sky, Mint) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t-2 border-neo-border">
          {/* Card 1: Peach */}
          <div className="bg-neo-peach border-2 border-neo-border shadow-neo p-5 flex flex-col justify-between hover:shadow-neo-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold bg-background border border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  01
                </span>
                <div className="p-1.5 bg-background border border-neo-border shadow-neo-sm text-foreground">
                  <ShieldCheck size={16} aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-sm font-bold text-foreground">
                {t('features.zeroFeesTitle')}
              </h2>
              <p className="text-xs text-foreground/85 mt-1.5 leading-relaxed">
                {t('features.zeroFeesDesc')}
              </p>
            </div>
            {/* Inner Wireframe Preview Box (MotherDuck visual signature) */}
            <div className="mt-4 p-2.5 bg-background border border-neo-border shadow-sm text-[11px] font-mono space-y-1">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Registration Fee</span>
                <span className="text-status-likely-genuine-fg font-bold">₹0 (Free)</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Laptop Security</span>
                <span className="text-status-likely-genuine-fg font-bold">₹0 Required</span>
              </div>
            </div>
          </div>

          {/* Card 2: Sky Blue */}
          <div className="bg-neo-blue border-2 border-neo-border shadow-neo p-5 flex flex-col justify-between hover:shadow-neo-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold bg-background border border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  02
                </span>
                <div className="p-1.5 bg-background border border-neo-border shadow-neo-sm text-foreground">
                  <FileCheck size={16} aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-sm font-bold text-foreground">
                {t('features.noOtpTitle')}
              </h2>
              <p className="text-xs text-foreground/85 mt-1.5 leading-relaxed">
                {t('features.noOtpDesc')}
              </p>
            </div>
            {/* Inner Wireframe Preview Box */}
            <div className="mt-4 p-2.5 bg-background border border-neo-border shadow-sm text-[11px] font-mono space-y-1">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Stipend Disbursement</span>
                <span className="text-foreground font-semibold">Direct NEFT</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Banking OTP / PIN</span>
                <span className="text-status-high-concern-fg font-bold">Never Shared</span>
              </div>
            </div>
          </div>

          {/* Card 3: Mint Green */}
          <div className="bg-neo-mint border-2 border-neo-border shadow-neo p-5 flex flex-col justify-between hover:shadow-neo-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold bg-background border border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  03
                </span>
                <div className="p-1.5 bg-background border border-neo-border shadow-neo-sm text-foreground">
                  <CheckCircle2 size={16} aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-sm font-bold text-foreground">
                {t('features.officialDomainsTitle')}
              </h2>
              <p className="text-xs text-foreground/85 mt-1.5 leading-relaxed">
                {t('features.officialDomainsDesc')}
              </p>
            </div>
            {/* Inner Wireframe Preview Box */}
            <div className="mt-4 p-2.5 bg-background border border-neo-border shadow-sm text-[11px] font-mono space-y-1">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Sender Domain</span>
                <span className="text-status-likely-genuine-fg font-bold">@company.com</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Free Webmail (@gmail)</span>
                <span className="text-status-high-concern-fg font-bold">Flagged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
