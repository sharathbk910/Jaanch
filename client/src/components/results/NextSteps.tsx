import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface NextStepsProps {
  status: VerificationStatus;
  recommendedActions: string[];
}

export function NextSteps({ recommendedActions }: NextStepsProps) {
  const { t } = useLanguage();

  return (
    <div className="p-5 bg-surface border border-border rounded-card space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border/60">
        <ShieldCheck size={18} className="text-foreground" />
        <h3 className="font-sans text-base font-bold text-foreground">
          {t('results.nextStepsTitle') || 'Actionable Next Steps for Students'}
        </h3>
      </div>

      {/* Recommended Priority Actions based on Verdict (National Cyber Crime Helpline 1930 reference) */}
      {recommendedActions && recommendedActions.length > 0 && (
        <div className="space-y-2">
          <div className="space-y-2">
            {recommendedActions.map((action, idx) => (
              <div
                key={idx}
                className="p-3 bg-background/50 border border-border/70 rounded text-xs text-foreground flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0 mt-1.5" />
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
