import React, { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, AlertCircle, PhoneCall, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface NextStepsProps {
  status: VerificationStatus;
  recommendedActions: string[];
}

export function NextSteps({ status, recommendedActions }: NextStepsProps) {
  const { t } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showEmergency, setShowEmergency] = useState<boolean>(false);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isScamOrHighRisk = status === 'HIGH_CONCERN' || status === 'CONFIRMED_SCAM';

  // Standard student action checklist
  const studentChecklist = isScamOrHighRisk
    ? [
        {
          id: 'step_stop',
          title: 'Cease all communication immediately',
          desc: 'Do not transfer money, do not purchase gift cards, and do not provide bank OTPs or Aadhaar copies.',
        },
        {
          id: 'step_block',
          title: 'Block and preserve evidence',
          desc: 'Take screenshots of WhatsApp chats, appointment letters, and UPI payment requests before blocking the sender.',
        },
        {
          id: 'step_report',
          title: 'Report fraud indicators',
          desc: 'Dial 1930 or lodge an incident complaint on the National Cyber Crime Reporting Portal at cybercrime.gov.in.',
        },
      ]
    : [
        {
          id: 'step_domain',
          title: 'Verify official corporate domain',
          desc: 'Check that email headers match the verified corporate domain and not a free mail provider or typosquat.',
        },
        {
          id: 'step_careers',
          title: 'Check company careers portal',
          desc: 'Cross-reference the job or internship title on the employer’s official website or National Career Service (NCS).',
        },
        {
          id: 'step_written',
          title: 'Insist on transparent written terms',
          desc: 'Ensure stipend, duration, job duties, and reporting manager are explicitly documented on company letterhead with zero payment clauses.',
        },
      ];

  return (
    <div id="next-steps" className="p-5 sm:p-6 bg-surface border border-border rounded-card shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <ShieldCheck size={18} className="text-primary shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
          {t('results.nextStepsTitle') || 'Actionable Next Steps'}
        </h3>
      </div>

      {/* Part 1: Recommended Actions from Detection Engine */}
      {recommendedActions && recommendedActions.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-medium">
            {t('results.stepCheckedTitle') || '1. What Jaanch Checked & Advises'}
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

      {/* Part 2: Interactive Student Verification Checklist */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-medium">
          {t('results.stepYourTurnTitle') || '2. Your Turn: Student Action Checklist'}
        </span>
        <div className="space-y-2">
          {studentChecklist.map((item) => {
            const isChecked = Boolean(checkedItems[item.id]);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full text-left p-3.5 border rounded-card transition-all flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-background/80 border-border opacity-70'
                    : 'bg-surface border-border hover:border-primary'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isChecked ? (
                    <CheckSquare size={17} className="text-primary" />
                  ) : (
                    <Square size={17} className="text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className={`text-xs font-semibold ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 3: Emergency & Fraud Prevention ("I already paid" toggle, default OFF) */}
      <div className="pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={() => setShowEmergency((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 bg-background/40 hover:bg-background border border-border rounded-card text-left transition-colors text-xs font-semibold text-terracotta"
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

