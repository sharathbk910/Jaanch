import React from 'react';
import { Send, BookOpen, BarChart3, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';

export function AuditSteps() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-16 sm:py-20 border-y-2 border-neo-border bg-background relative overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds with Gentle Parallax Motion */}
      <DoodleCloud size={160} className="absolute right-8 top-4 opacity-75 hidden sm:block pointer-events-none select-none text-foreground animate-float" />
      <DoodleCloud size={110} className="absolute left-6 bottom-8 opacity-75 hidden sm:block pointer-events-none select-none text-foreground animate-float-delayed" />
      <DoodleCloud size={80} className="absolute right-1/3 bottom-4 opacity-50 hidden md:block pointer-events-none select-none text-foreground animate-float" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-block px-3 py-1 bg-neo-yellow border-2 border-neo-border shadow-neo-sm font-mono text-xs font-bold uppercase tracking-wider mb-3">
            VERIFICATION PIPELINE
          </div>
          <h2 className="font-sans font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-foreground">
            How Jaanch Audits an Offer in 3 Steps
          </h2>
        </div>

        {/* 3-Card MotherDuck Grid (Peach, Blue, Mint) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: Warm Peach Card ("FLIGHTS" Style) */}
          <div className="relative p-6 sm:p-7 border-2 border-neo-border bg-neo-peach shadow-neo hover:shadow-neo-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold bg-background border border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                      01
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/75">
                      INGEST & REDACT
                    </span>
                  </div>
                  <h3 className="font-sans font-bold tracking-tight text-xl sm:text-2xl text-foreground">
                    {t('auditSteps.step1Title')}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center shrink-0 text-foreground">
                  <Send size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal">
                {t('auditSteps.step1Desc')}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t-2 border-neo-border/20 flex items-center justify-between text-xs font-mono font-bold text-foreground/70">
              <span>Client-Side PII Scrubbing</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 2: Light Blue Card ("GUIDES" Style) */}
          <div className="relative p-6 sm:p-7 border-2 border-neo-border bg-neo-blue shadow-neo hover:shadow-neo-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold bg-background border border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                      02
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/75">
                      CROSS-REFERENCE
                    </span>
                  </div>
                  <h3 className="font-sans font-bold tracking-tight text-xl sm:text-2xl text-foreground">
                    {t('auditSteps.step2Title')}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center shrink-0 text-foreground">
                  <BookOpen size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal">
                {t('auditSteps.step2Desc')}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t-2 border-neo-border/20 flex items-center justify-between text-xs font-mono font-bold text-foreground/70">
              <span>MCA21 & EPFO Registry Check</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 3: Light Mint Card ("DIVES" Style) */}
          <div className="relative p-6 sm:p-7 border-2 border-neo-border bg-neo-mint shadow-neo hover:shadow-neo-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold bg-background border border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                      03
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/75">
                      VERDICT & ACTION
                    </span>
                  </div>
                  <h3 className="font-sans font-bold tracking-tight text-xl sm:text-2xl text-foreground">
                    {t('auditSteps.step3Title')}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center shrink-0 text-foreground">
                  <BarChart3 size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal">
                {t('auditSteps.step3Desc')}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t-2 border-neo-border/20 flex items-center justify-between text-xs font-mono font-bold text-foreground/70">
              <span>Actionable Next Steps & Defense</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuditSteps;
