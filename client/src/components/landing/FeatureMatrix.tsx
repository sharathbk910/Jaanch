import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';

export function FeatureMatrix() {
  const { t } = useLanguage();

  const rows = [
    {
      aspect: t('featureMatrix.row1Title'),
      legitimate: t('featureMatrix.row1Legit'),
      scam: t('featureMatrix.row1Scam'),
    },
    {
      aspect: t('featureMatrix.row2Title'),
      legitimate: t('featureMatrix.row2Legit'),
      scam: t('featureMatrix.row2Scam'),
    },
    {
      aspect: t('featureMatrix.row3Title'),
      legitimate: t('featureMatrix.row3Legit'),
      scam: t('featureMatrix.row3Scam'),
    },
    {
      aspect: t('featureMatrix.row4Title'),
      legitimate: t('featureMatrix.row4Legit'),
      scam: t('featureMatrix.row4Scam'),
    },
    {
      aspect: t('featureMatrix.row5Title'),
      legitimate: t('featureMatrix.row5Legit'),
      scam: t('featureMatrix.row5Scam'),
    },
  ];

  return (
    <section className="w-full py-16 border-t-2 border-neo-border bg-background relative overflow-hidden">
      {/* Decorative MotherDuck Floating Cloud */}
      <DoodleCloud size={100} className="absolute right-12 top-6 opacity-60 hidden sm:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t('featureMatrix.heading')}
          </h2>
        </div>

        <div className="overflow-x-auto border-2 border-neo-border bg-surface shadow-neo-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-neo-border bg-neo-yellow/30">
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-foreground w-1/4 border-r-2 border-neo-border">
                  {t('featureMatrix.colFactor')}
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-status-likely-genuine-fg w-3/8 bg-status-likely-genuine-bg/50 border-r-2 border-neo-border">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>{t('featureMatrix.colLegit')}</span>
                  </div>
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-status-high-concern-fg w-3/8 bg-status-high-concern-bg/50">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={16} aria-hidden="true" />
                    <span>{t('featureMatrix.colScam')}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neo-border">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted-subtle/5 transition-colors">
                  <td className="py-4 px-4 font-bold text-foreground align-top border-r-2 border-neo-border">
                    {row.aspect}
                  </td>
                  <td className="py-4 px-4 text-foreground/90 align-top bg-status-likely-genuine-bg/20 border-r-2 border-neo-border">
                    <div className="flex items-start gap-2">
                      <div className="p-0.5 bg-status-likely-genuine-bg border border-status-likely-genuine-border mt-0.5 shrink-0">
                        <Check size={14} className="text-status-likely-genuine-fg" aria-hidden="true" />
                      </div>
                      <span className="leading-relaxed">{row.legitimate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground/90 align-top bg-status-high-concern-bg/20">
                    <div className="flex items-start gap-2">
                      <div className="p-0.5 bg-status-high-concern-bg border border-status-high-concern-border mt-0.5 shrink-0">
                        <X size={14} className="text-status-high-concern-fg" aria-hidden="true" />
                      </div>
                      <span className="leading-relaxed">{row.scam}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default FeatureMatrix;
