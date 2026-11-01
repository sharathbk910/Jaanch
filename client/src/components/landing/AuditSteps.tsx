import React from 'react';
import { EyeOff, Cpu, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';

export function AuditSteps() {
  const { t } = useLanguage();

  const steps = [
    {
      num: '01',
      icon: EyeOff,
      title: t('auditSteps.step1Title'),
      desc: t('auditSteps.step1Desc'),
      highlight: false,
    },
    {
      num: '02',
      icon: Cpu,
      title: t('auditSteps.step2Title'),
      desc: t('auditSteps.step2Desc'),
      highlight: true, // MotherDuck highlighted card in soft pink
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: t('auditSteps.step3Title'),
      desc: t('auditSteps.step3Desc'),
      highlight: false,
    },
  ];

  return (
    <section className="w-full py-16 border-y-2 border-neo-border bg-neo-sky/35 relative overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds */}
      <DoodleCloud size={160} className="absolute right-8 -top-6 opacity-75 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={110} className="absolute left-6 -bottom-4 opacity-75 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={80} className="absolute right-1/3 bottom-2 opacity-50 hidden md:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-neo-yellow border-2 border-neo-border px-3 py-1 shadow-neo-sm inline-block text-foreground">
            Transparent Heuristic Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-3">
            How Jaanch Audits an Offer in 3 Steps
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-foreground/80 font-medium">
            No black-box hallucinations. Fast, deterministic, and privacy-preserving verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`relative p-6 sm:p-7 border-2 border-neo-border flex flex-col justify-between transition-all ${
                  step.highlight
                    ? 'bg-neo-pink shadow-neo-xl -translate-y-1'
                    : 'bg-surface shadow-neo hover:shadow-neo-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold bg-background border-2 border-neo-border px-3 py-1 shadow-neo-sm text-foreground">
                      {step.num}
                    </span>
                    <div className="p-2 bg-background border-2 border-neo-border shadow-neo-sm text-foreground">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-neo-border/20 flex items-center justify-between text-[11px] font-mono text-foreground/75 font-semibold">
                  <span>STEP {step.num}</span>
                  <span>DETERMINISTIC</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AuditSteps;
