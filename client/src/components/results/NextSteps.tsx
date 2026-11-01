import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, PhoneCall, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface NextStepsProps {
  status: VerificationStatus;
  recommendedActions: string[];
}

export function NextSteps({ status: _status, recommendedActions }: NextStepsProps) {
  const { t } = useLanguage();
  const [showEmergency, setShowEmergency] = useState<boolean>(false);

  return (
    <div id="next-steps" className="p-5 sm:p-6 bg-surface border border-border rounded-card shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <ShieldCheck size={18} className="text-primary shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
          {t('results.nextStepsTitle') || 'Actionable Next Steps'}
        </h3>
      </div>

      {/* Recommended Actions from Detection Engine */}
      {recommendedActions && recommendedActions.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-medium">
            {t('results.stepCheckedTitle') || 'What Jaanch Advises'}
          </span>
          <div className="space-y-1.5">
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

      {/* Emergency & Fraud Prevention ("I already paid" toggle, default OFF) */}
      <div className="pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={() => setShowEmergency((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 bg-background/40 hover:bg-background border border-border rounded-card text-left transition-colors text-xs font-semibold text-terracotta cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{t('results.iPaidToggle') || 'I already transferred money or shared sensitive documents'}</span>
          </div>
          {showEmergency ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showEmergency && (
          <div className="p-4 mt-2 bg-status-high-concern-bg border border-status-high-concern-border rounded-card text-status-high-concern-fg space-y-3 text-xs leading-relaxed">
            <p className="font-semibold">
              {t('results.iPaidNotice') ||
                'Emergency Action: Call 1930 (National Cyber Crime Helpline) within the golden hour to freeze the beneficiary account. Lodge an official complaint at cybercrime.gov.in and block the recruiter on all platforms.'}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-status-high-concern-fg text-surface rounded text-xs font-semibold hover:opacity-90"
              >
                <PhoneCall size={13} />
                <span>Call Helpline 1930</span>
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-status-high-concern-border text-foreground rounded text-xs font-semibold hover:bg-background"
              >
                <span>Report on cybercrime.gov.in</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NextSteps;
