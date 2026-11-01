import React from 'react';
import { Database, CreditCard, Phone, Globe, DollarSign, Building } from 'lucide-react';
import { type ExtractedEntities } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface ExtractedEntitiesCardProps {
  entities: ExtractedEntities;
}

export function ExtractedEntitiesCard({ entities }: ExtractedEntitiesCardProps) {
  const { t } = useLanguage();

  const hasEntities =
    (entities.upiHandles && entities.upiHandles.length > 0) ||
    (entities.phones && entities.phones.length > 0) ||
    (entities.domains && entities.domains.length > 0) ||
    (entities.amounts && entities.amounts.length > 0) ||
    Boolean(entities.organization);

  if (!hasEntities) {
    return null;
  }

  return (
    <div id="extracted-entities" className="p-5 sm:p-6 bg-surface border border-border rounded-card shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <Database size={16} className="text-primary shrink-0" />
        <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
          {t('results.entitiesTitle') || 'Extracted Opportunity Indicators'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {entities.organization && (
          <div className="p-3 bg-background/50 border border-border/70 rounded flex items-start gap-2.5">
            <Building size={15} className="text-terracotta shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                {t('results.orgLabel') || 'Claimed Organization'}
              </span>
              <span className="font-semibold text-foreground">{entities.organization}</span>
            </div>
          </div>
        )}

        {entities.amounts && entities.amounts.length > 0 && (
          <div className="p-3 bg-background/50 border border-border/70 rounded flex items-start gap-2.5">
            <DollarSign size={15} className="text-terracotta shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                {t('results.amountsLabel') || 'Mentioned Amounts'}
              </span>
              <span className="font-semibold text-foreground font-mono">
                {entities.amounts.join(', ')}
              </span>
            </div>
          </div>
        )}

        {entities.upiHandles && entities.upiHandles.length > 0 && (
          <div className="p-3 bg-background/50 border border-border/70 rounded flex items-start gap-2.5">
            <CreditCard size={15} className="text-terracotta shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                {t('results.upiLabel') || 'UPI / Payment Handles'}
              </span>
              <span className="font-semibold text-foreground font-mono break-all">
                {entities.upiHandles.join(', ')}
              </span>
            </div>
          </div>
        )}

        {entities.phones && entities.phones.length > 0 && (
          <div className="p-3 bg-background/50 border border-border/70 rounded flex items-start gap-2.5">
            <Phone size={15} className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                {t('results.phonesLabel') || 'Phone Numbers'}
              </span>
              <span className="font-semibold text-foreground font-mono">
                {entities.phones.join(', ')}
              </span>
            </div>
          </div>
        )}

        {entities.domains && entities.domains.length > 0 && (
          <div className="p-3 bg-background/50 border border-border/70 rounded flex items-start gap-2.5 sm:col-span-2">
            <Globe size={15} className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                {t('results.domainsLabel') || 'Websites & Domains'}
              </span>
              <span className="font-semibold text-foreground font-mono break-all">
                {entities.domains.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

