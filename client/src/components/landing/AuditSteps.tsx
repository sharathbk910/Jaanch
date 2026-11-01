import React from 'react';
import { EyeOff, Cpu, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

export function AuditSteps() {
  const { t } = useLanguage();

  const steps = [
    {
      num: '01',
      icon: EyeOff,
      title: t('auditSteps.step1Title'),
      desc: t('auditSteps.step1Desc'),
    },
    {
      num: '02',
      icon: Cpu,
      title: t('auditSteps.step2Title'),
      desc: t('auditSteps.step2Desc'),
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: t('auditSteps.step3Title'),
      desc: t('auditSteps.step3Desc'),
    },
  ];

  return (
    <section className="w-full py-14 border-t border-border bg-surface">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
            Transparent Heuristic Architecture
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            How Jaanch Audits an Offer in 3 Steps
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            No black-box hallucinations. Fast, deterministic, and privacy-preserving verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 rounded-card border border-border bg-background shadow-sm hover:border-terracotta/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-terracotta">
                      {step.num}
                    </span>
                    <div className="p-2 bg-surface border border-border rounded-chip text-foreground">
                      <Icon size={18} aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
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

