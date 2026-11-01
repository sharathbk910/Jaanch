import React from 'react';
import { Link } from 'react-router-dom';
import { Send, BookOpen, BarChart3, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';

export function AuditSteps() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-16 sm:py-20 border-y-2 border-neo-border bg-background relative overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds */}
      <DoodleCloud size={160} className="absolute right-8 top-4 opacity-75 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={110} className="absolute left-6 bottom-8 opacity-75 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={80} className="absolute right-1/3 bottom-4 opacity-50 hidden md:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-neo-yellow border-2 border-neo-border px-3 py-1 shadow-neo-sm inline-block text-foreground">
            Transparent Heuristic Architecture
          </span>
          <h2 className="font-sans font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-foreground mt-4">
            How Jaanch Audits an Offer in 3 Steps
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium max-w-xl mx-auto">
            No black-box hallucinations. Fast, deterministic, and privacy-preserving verification across three isolated layers.
          </p>
        </div>

        {/* 3-Card MotherDuck Grid (Peach, Blue, Mint) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: Warm Peach Card ("FLIGHTS" Style) */}
          <div className="relative p-6 sm:p-7 border-2 border-neo-border bg-neo-peach shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/70 block mb-1">
                    FLIGHTS
                  </span>
                  <h3 className="font-sans font-bold tracking-tight text-xl sm:text-2xl text-foreground">
                    {t('auditSteps.step1Title')}
                  </h3>
                </div>
                <div className="w-9 h-9 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center shrink-0 text-foreground">
                  <Send size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal mb-5">
                {t('auditSteps.step1Desc')}
              </p>

              {/* Inner Mini Mock Panel */}
              <div className="bg-surface border-2 border-neo-border shadow-neo-sm p-3.5 my-3 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-muted-foreground pb-1.5 border-b border-neo-border/20 text-xs uppercase font-bold">
                  <span>Audit Task</span>
                  <span>Latest Status</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>pii_sanitization</span>
                  <span className="bg-neo-blue/40 border border-neo-border px-1.5 py-0.5 text-xs font-bold">12ms RUNNING</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>fee_pattern_scan</span>
                  <span className="bg-neo-mint border border-neo-border px-1.5 py-0.5 text-xs font-bold text-foreground">2m 18s CLEAN</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>qr_seal_audit</span>
                  <span className="bg-neo-pink border border-neo-border px-1.5 py-0.5 text-xs font-bold text-foreground">48.3s VERIFIED</span>
                </div>
                <div className="pt-2 border-t border-neo-border/20 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Deterministic checks active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-neo-border/20 flex items-center justify-between">
              <Link to="/link-check" className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary flex items-center gap-1.5 group">
                <span>LEARN MORE</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="font-mono text-xs font-bold uppercase bg-surface border border-neo-border px-2 py-0.5">01 / LOCAL</span>
            </div>
          </div>

          {/* Card 2: Light Blue Card ("GUIDES" Style) */}
          <div className="relative p-6 sm:p-7 border-2 border-neo-border bg-neo-blue shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/70 block mb-1">
                    GUIDES
                  </span>
                  <h3 className="font-sans font-bold tracking-tight text-xl sm:text-2xl text-foreground">
                    {t('auditSteps.step2Title')}
                  </h3>
                </div>
                <div className="w-9 h-9 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center shrink-0 text-foreground">
                  <BookOpen size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal mb-5">
                {t('auditSteps.step2Desc')}
              </p>

              {/* Inner Mini Mock Panel */}
              <div className="bg-surface border-2 border-neo-border shadow-neo-sm p-3.5 my-3 font-mono text-xs space-y-2">
                <div className="text-xs text-muted-foreground font-semibold">
                  Guides &gt; Regulatory Definitions
                </div>
                <div className="font-sans font-bold text-xs text-foreground">
                  Official Verification Directives
                </div>
                <div className="text-xs text-muted-foreground">
                  How we classify legitimate hiring in India:
                </div>
                <div className="p-2 bg-neo-yellow/30 border border-neo-border text-xs font-mono">
                  <code>UPFRONT_FEE == ZERO_TOLERANCE</code>
                </div>
                <div className="text-xs text-foreground/80 flex items-center gap-1.5">
                  <span className="text-terracotta font-bold">•</span>
                  <span>Always cross-reference CIN against MCA21 master registry</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-neo-border/20 flex items-center justify-between">
              <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary flex items-center gap-1.5 group">
                <span>LEARN MORE</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <span className="font-mono text-xs font-bold uppercase bg-surface border border-neo-border px-2 py-0.5">02 / REGISTRY</span>
            </div>
          </div>

          {/* Card 3: Light Mint Card ("DIVES" Style) */}
          <div className="relative p-6 sm:p-7 border-2 border-neo-border bg-neo-mint shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/70 block mb-1">
                    DIVES
                  </span>
                  <h3 className="font-sans font-bold tracking-tight text-xl sm:text-2xl text-foreground">
                    {t('auditSteps.step3Title')}
                  </h3>
                </div>
                <div className="w-9 h-9 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center shrink-0 text-foreground">
                  <BarChart3 size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-normal mb-5">
                {t('auditSteps.step3Desc')}
              </p>

              {/* Inner Mini Mock Panel */}
              <div className="bg-surface border-2 border-neo-border shadow-neo-sm p-3.5 my-3 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-muted-foreground pb-1 border-b border-neo-border/20 text-xs">
                  <span>Telemetry alerts flagged / day</span>
                  <span className="text-emerald-700 font-bold">▲ 18% WoW</span>
                </div>
                {/* Visual SVG Wave Graph */}
                <div className="h-14 w-full bg-background border border-neo-border p-1 flex items-end">
                  <svg viewBox="0 0 100 40" className="w-full h-full stroke-primary fill-neo-mint/40" preserveAspectRatio="none">
                    <path d="M0,35 Q20,30 35,22 T70,18 T100,6 L100,40 L0,40 Z" strokeWidth="2" />
                  </svg>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Break this down by recruiter domain...
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-neo-border/20 flex items-center justify-between">
              <Link to="/about" className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary flex items-center gap-1.5 group">
                <span>LEARN MORE</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="font-mono text-xs font-bold uppercase bg-surface border border-neo-border px-2 py-0.5">03 / VERDICT</span>
            </div>
          </div>
        </div>

        {/* Wide Testimonial / Story Card (Exact MotherDuck Layout under the 3 cards) */}
        <div className="mt-12 sm:mt-16 bg-surface border-2 border-neo-border shadow-neo-xl p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-start gap-4 sm:gap-6 flex-1">
            <span className="font-serif text-5xl sm:text-6xl text-terracotta leading-none shrink-0 select-none">
              “
            </span>
            <p className="text-sm sm:text-base md:text-lg text-foreground font-medium leading-relaxed">
              We were seeing students hit with forged appointment letters and fake fee requests every campus season. Deploying Jaanch across our placement cell stopped 100% of upfront security deposit traps on day one. It is the essential safety layer for Indian higher education.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 md:pl-8 md:border-l-2 md:border-neo-border flex items-center gap-4">
            <div className="w-12 h-12 bg-neo-yellow border-2 border-neo-border shadow-neo-sm flex items-center justify-center font-bold text-foreground font-mono text-base">
              IIT
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-foreground font-sans">
                Prof. R. Ramanathan
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Head of Training & Placements, National Campus Forum
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuditSteps;
