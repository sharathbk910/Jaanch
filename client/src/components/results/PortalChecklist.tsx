import React, { useState } from 'react';
import { ExternalLink, CheckSquare, Square, Building2, GraduationCap, Briefcase, Award, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';

interface PortalItem {
  id: 'nsp' | 'aicte' | 'mca' | 'ncs';
  titleKey: 'portalNspTitle' | 'portalAicteTitle' | 'portalMcaTitle' | 'portalNcsTitle';
  descKey: 'portalNspDesc' | 'portalAicteDesc' | 'portalMcaDesc' | 'portalNcsDesc';
  url: string;
  icon: LucideIcon;
  tag: string;
}

const PORTALS: PortalItem[] = [
  {
    id: 'mca',
    titleKey: 'portalMcaTitle',
    descKey: 'portalMcaDesc',
    url: 'https://www.mca.gov.in',
    icon: Building2,
    tag: 'Corporate Verification',
  },
  {
    id: 'aicte',
    titleKey: 'portalAicteTitle',
    descKey: 'portalAicteDesc',
    url: 'https://internship.aicte-india.org',
    icon: Briefcase,
    tag: 'Internship Portal',
  },
  {
    id: 'nsp',
    titleKey: 'portalNspTitle',
    descKey: 'portalNspDesc',
    url: 'https://scholarships.gov.in',
    icon: Award,
    tag: 'Scholarships Portal',
  },
  {
    id: 'ncs',
    titleKey: 'portalNcsTitle',
    descKey: 'portalNcsDesc',
    url: 'https://www.ncs.gov.in',
    icon: GraduationCap,
    tag: 'National Career Service',
  },
];

export function PortalChecklist() {
  const { t } = useLanguage();
  const [checkedPortals, setCheckedPortals] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedPortals((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="portal-checklist" className="p-5 sm:p-6 bg-surface border-2 border-neo-border rounded-card shadow-neo space-y-4">
      <div>
        <div className="flex items-center justify-between pb-1">
          <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            REGULATORY VERIFICATION
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            {Object.values(checkedPortals).filter(Boolean).length} / {PORTALS.length} Checked
          </span>
        </div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          {t('results.portalChecklistTitle')}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {t('results.portalChecklistSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {PORTALS.map((portal) => {
          const isChecked = Boolean(checkedPortals[portal.id]);
          const Icon = portal.icon;

          return (
            <div
              key={portal.id}
              className={`p-3.5 border-2 rounded-card transition-all flex flex-col justify-between ${
                isChecked
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-neo-sm'
                  : 'bg-background border-neo-border hover:shadow-neo-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-muted-foreground">
                    <Icon size={14} className="text-foreground shrink-0" />
                    <span>{portal.tag}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCheck(portal.id)}
                    aria-label={`Mark ${t(`results.${portal.titleKey}`)} as checked`}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    {isChecked ? (
                      <CheckSquare size={18} className="text-emerald-600" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                  {t(`results.${portal.titleKey}`)}
                </h4>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t(`results.${portal.descKey}`)}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-neo-border/40 flex items-center justify-between">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground hover:underline"
                >
                  <span>Open Portal</span>
                  <ExternalLink size={11} className="text-muted-foreground" />
                </a>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new URL(portal.url).hostname}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PortalChecklist;
