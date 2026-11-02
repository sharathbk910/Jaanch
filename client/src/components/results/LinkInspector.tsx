import React, { useState } from 'react';
import { ExternalLink, Search, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Globe, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { apiClient } from '../../lib/apiClient.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

export interface LinkInspectorProps {
  initialUrl?: string;
  detectedUrls?: string[];
}

interface LinkCheckData {
  url: string;
  hostname: string;
  protocol: string;
  pathname: string;
  riskLevel: 'NO_MAJOR_WARNING_SIGNS' | 'NEEDS_VERIFICATION' | 'HIGH_RISK';
  observed: string[];
  unverified: string[];
  signals: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
  }>;
}

export function LinkInspector({ initialUrl, detectedUrls = [] }: LinkInspectorProps) {
  const { t } = useLanguage();
  const [urlInput, setUrlInput] = useState(initialUrl || (detectedUrls[0] || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkCheckData | null>(null);

  const handleInspect = async (targetUrl?: string) => {
    const urlToTest = targetUrl || urlInput.trim();
    if (!urlToTest) return;

    setLoading(true);
    setError(null);

    try {
      // Add scheme if missing
      const formatted = urlToTest.match(/^https?:\/\//i) ? urlToTest : `https://${urlToTest}`;
      const res = await apiClient.checkLink(formatted);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to inspect link. Please check formatting.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLabel = (riskLevel: LinkCheckData['riskLevel']) => {
    switch (riskLevel) {
      case 'NO_MAJOR_WARNING_SIGNS':
        return {
          label: t('results.linkCleanLabel') || 'Clean (No Major Warning Signs)',
          classes: 'bg-status-genuine-bg text-status-genuine-fg border-status-genuine-border',
          icon: ShieldCheck,
        };
      case 'NEEDS_VERIFICATION':
        return {
          label: t('results.linkCautionLabel') || 'Needs Caution (Unverified / Warning)',
          classes: 'bg-status-review-bg text-status-review-fg border-status-review-border',
          icon: AlertTriangle,
        };
      case 'HIGH_RISK':
      default:
        return {
          label: t('results.linkHighRiskLabel') || 'High Risk (Typosquat / Suspicious)',
          classes: 'bg-status-high-concern-bg text-status-high-concern-fg border-status-high-concern-border',
          icon: AlertOctagon,
        };
    }
  };

  return (
    <section id="link-inspector" className="p-5 sm:p-6 bg-surface border border-border rounded-card space-y-4">
      <div>
        <div className="flex items-center justify-between pb-1">
          <span className="font-mono text-[11px] text-muted-foreground uppercase font-medium">
            URL INTEGRITY & TYPOSQUATTING
          </span>
        </div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          {t('results.linkInspectorTitle')}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          Inspect suspicious domains, typosquats, raw numeric IPs, and newly registered domains before clicking.
        </p>
      </div>

      {/* Quick chips for detected URLs */}
      {detectedUrls.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-muted-foreground block uppercase">
            Detected URLs in offer:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {detectedUrls.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setUrlInput(u);
                  handleInspect(u);
                }}
                className="px-2.5 py-1 bg-background border border-border hover:border-foreground/40 rounded-chip text-xs font-mono text-foreground transition-colors flex items-center gap-1"
              >
                <Globe size={11} className="text-muted-foreground" />
                <span className="max-w-[200px] truncate">{u}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleInspect();
        }}
        className="flex flex-col sm:flex-row gap-2 pt-1"
      >
        <div className="flex-1">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('results.linkInspectorPlaceholder') || 'Paste any link (e.g. https://...)...'}
            className="w-full text-xs font-mono"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !urlInput.trim()}
          size="sm"
          className="shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw size={13} className="animate-spin" />
              <span>{t('results.inspectingLinkBtn')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Search size={13} />
              <span>{t('results.inspectLinkBtn')}</span>
            </span>
          )}
        </Button>
      </form>

      {/* Error state */}
      {error && (
        <div role="alert" className="p-3 bg-status-high-concern-bg/40 border border-status-high-concern-border rounded-chip text-xs text-status-high-concern-fg">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="p-4 bg-background border border-border rounded-card space-y-3 pt-3">
          {/* Risk Level Badge */}
          {(() => {
            const risk = getRiskLabel(result.riskLevel);
            const RiskIcon = risk.icon;
            return (
              <div className={`p-3 rounded-card border flex items-center justify-between ${risk.classes}`}>
                <div className="flex items-center gap-2">
                  <RiskIcon size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">{risk.label}</span>
                </div>
                <span className="font-mono text-[11px] font-semibold">{result.hostname}</span>
              </div>
            );
          })()}

          {/* Triggered Link Signals */}
          {result.signals.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase block font-medium">
                {t('results.observedLinkSignals')} ({result.signals.length})
              </span>
              <div className="space-y-1.5">
                {result.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-surface border border-border/80 rounded-chip text-xs flex items-start gap-2"
                  >
                    <span className="font-mono text-[10px] uppercase font-bold text-status-high-concern-fg mt-0.5 shrink-0">
                      [{sig.severity}]
                    </span>
                    <span className="text-foreground leading-relaxed">{sig.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observed metadata */}
          {result.observed.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase block font-medium">
                Corroborated Heuristics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.observed.map((obs, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-surface border border-border rounded-chip text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <CheckCircle2 size={11} className="text-status-genuine-fg" />
                    <span>{obs}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unverified metadata */}
          {result.unverified.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase block font-medium">
                {t('results.unverifiedLinkNotes')}:
              </span>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                {result.unverified.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
