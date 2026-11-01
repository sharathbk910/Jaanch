import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2, ShieldCheck, Building, GraduationCap, Briefcase, FileCheck, CheckCircle2, Volume2, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';
import { ShimmerBadge } from '../ui/ShimmerBadge.js';
import { sound } from '../../lib/sound.js';

export function Hero() {
  const { t, currentLang } = useLanguage();

  const getHeadline = () => {
    if (currentLang === 'hi') return 'जवाब देने से पहले जान लें कि यह वास्तविक है।';
    if (currentLang === 'kn') return 'ಪ್ರತಿಕ್ರಿಯಿಸುವ ಮುನ್ನ ಇದು ನೈಜವೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.';
    return "Know it's real before you reply.";
  };

  const handlePreviewAudit = () => {
    sound.playPreviewChime();
    const el = document.getElementById('submission-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCard = () => {
    const el = document.getElementById('submission-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full pt-20 sm:pt-24 lg:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds with Gentle Motion */}
      <DoodleCloud size={150} className="absolute right-8 top-12 opacity-80 hidden sm:block pointer-events-none select-none text-foreground animate-float" />
      <DoodleCloud size={95} className="absolute left-6 top-32 opacity-60 hidden md:block pointer-events-none select-none text-foreground animate-float-delayed" />
      <DoodleCloud size={70} className="absolute right-1/3 top-6 opacity-50 hidden lg:block pointer-events-none select-none text-foreground animate-float" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two-Column MotherDuck Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Subtitle, Neo-Brutalist Buttons, Trusted By Strip */}
          <div className="lg:col-span-7">
            {/* Bold Sans-Serif Headline */}
            <h1 className="font-sans font-extrabold tracking-tight text-3xl sm:text-5xl lg:text-6xl text-foreground leading-[1.08]">
              {getHeadline()}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-sans font-normal">
              {t('hero.subtitle')}
            </p>

            {/* The Two Neo-Brutalist CTAs: Blue Primary + Outline Secondary */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                variant="neo"
                size="lg"
                onClick={scrollToCard}
                className="group border-2 border-neo-border shadow-neo bg-neo-sky text-foreground font-bold uppercase tracking-wider hover:bg-neo-sky-light hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none px-6 py-3.5 h-auto cursor-pointer"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight size={16} className="ml-2.5 group-hover:translate-x-1 group-hover:text-foreground transition-transform" />
              </Button>

              <Link to="/link-check">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-neo-border shadow-neo bg-surface text-foreground font-bold uppercase tracking-wider hover:bg-neo-sky hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all rounded-none px-6 py-3.5 h-auto cursor-pointer"
                >
                  <Link2 size={16} className="mr-2 text-foreground" />
                  <span>{t('hero.secondaryCta')}</span>
                </Button>
              </Link>
            </div>

            {/* MotherDuck Style: TRUSTED BY BUILDERS / STUDENTS Strip */}
            <div className="mt-10 pt-6 border-t-2 border-neo-border/20">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                TRUSTED BY STUDENTS • CROSS-REFERENCED WITH OFFICIAL PORTALS
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-neo-border shadow-neo-sm text-xs font-mono font-bold text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-likely-genuine-fg shrink-0" />
                  MCA21 CIN
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-neo-border shadow-neo-sm text-xs font-mono font-bold text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-likely-genuine-fg shrink-0" />
                  1930 HELPLINE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-neo-border shadow-neo-sm text-xs font-mono font-bold text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-likely-genuine-fg shrink-0" />
                  AICTE ACCREDITED
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-neo-border shadow-neo-sm text-xs font-mono font-bold text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-likely-genuine-fg shrink-0" />
                  EPFO RECON
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-neo-border shadow-neo-sm text-xs font-mono font-bold text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-likely-genuine-fg shrink-0" />
                  DIGILOCKER
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Video/Preview Terminal (MotherDuck Right Card & Tap Button) */}
          <div className="lg:col-span-5">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border-2 border-neo-border shadow-neo-xl relative overflow-hidden flex flex-col justify-between p-5 sm:p-6 min-h-[300px]"
            >
              <div>
                {/* Traffic Light Terminal Window Header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-neo-border mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-terracotta border border-neo-border" />
                    <div className="w-3 h-3 bg-neo-yellow border border-neo-border" />
                    <div className="w-3 h-3 bg-neo-sky border border-neo-border" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    jaanch-audit // live-scan
                  </span>
                </div>

                {/* Simulated Scan Log */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-background border border-neo-border shadow-inner">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles size={11} className="text-terracotta" />
                      <span>Input Sample Analysis:</span>
                    </div>
                    <p className="text-foreground font-sans text-xs leading-relaxed line-clamp-2">
                      "URGENT: Selected as Associate. Deposit ₹3,500 security deposit within 2 hours or job offer cancelled."
                    </p>
                  </div>

                  <div className="p-2.5 bg-status-high-concern-bg border-2 border-status-high-concern-border text-status-high-concern-fg font-bold text-xs flex items-center gap-2 shadow-sm">
                    <span className="text-base shrink-0">⚠️</span>
                    <div className="truncate">
                      <span className="block truncate">FLAGGED: Upfront Fee Demand Detected</span>
                      <span className="text-[10px] font-normal opacity-85 block">Direct violation of Indian Model Apprenticeship rules</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MotherDuck Style "TAP FOR SOUND" Pill Button */}
              <div className="mt-5 pt-3 border-t-2 border-neo-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePreviewAudit}
                  className="bg-neo-yellow text-foreground border-2 border-neo-border shadow-neo-sm px-3.5 py-2 font-mono font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all group cursor-pointer"
                >
                  <Volume2 size={14} className="text-foreground shrink-0 group-hover:scale-110 transition-transform" />
                  <span>TAP FOR SOUND</span>
                </button>
                <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wide">
                  Zero Hallucinations
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Verified Portals Strip ("TRUSTED BY BUILDERS" Style from MotherDuck image) */}
        <div className="mt-12 pt-8 border-t-2 border-neo-border">
          <div className="flex items-center justify-between pb-3 mb-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Official Indian Verification Portals
            </span>
            <ShimmerBadge>
              GOVT VERIFIED
            </ShimmerBadge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="https://www.mca.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <Building size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>MCA Portal</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">mca.gov.in</div>
              </div>
            </a>

            <a
              href="https://www.ncs.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <Briefcase size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>NCS India</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">ncs.gov.in</div>
              </div>
            </a>

            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <GraduationCap size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>NSP Portal</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">scholarships.gov.in</div>
              </div>
            </a>

            <a
              href="https://internship.aicte-india.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <ShieldCheck size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>AICTE Portal</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">aicte-india.org</div>
              </div>
            </a>
          </div>
        </div>

        {/* 3-Card Pastel Feature Strip (MotherDuck 3-Card Layout: Peach, Sky, Mint) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t-2 border-neo-border">
          {/* Card 1: Peach */}
          <div className="bg-neo-peach border-2 border-neo-border shadow-neo p-5 flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
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
          <div className="bg-neo-blue border-2 border-neo-border shadow-neo p-5 flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
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
            <div className="mt-4 p-2.5 bg-background border border-neo-border shadow-sm text-xs font-mono space-y-1">
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
          <div className="bg-neo-mint border-2 border-neo-border shadow-neo p-5 flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
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
