import { logger } from '../lib/logger.js';
import {
  detectLookalikeDomain,
  isPunycode,
  isUrlShortener,
  hasExcessiveSubdomains,
  LINK_RISK_LEVELS,
  type LinkRiskLevel,
} from '@jaanch/shared';
import net from 'node:net';
import { queryRdapDomainAge } from '../routes/links.js';
import { explainLinkObservations } from '../lib/gemini.js';

export interface MLUrlSignalResponse {
  url: string;
  risk_score: number;
  risk_level: 'safe' | 'suspicious' | 'danger';
  is_phishing: boolean;
  trigger_factors: string[];
  features?: Record<string, unknown>;
}

export interface LinkSignal {
  id: string;
  type:
    | 'lookalike'
    | 'punycode'
    | 'shortener'
    | 'ip_address'
    | 'insecure_scheme'
    | 'new_domain'
    | 'excessive_subdomains'
    | 'ml_phishing_signal';
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface LinkEvaluationResult {
  url: string;
  hostname: string;
  protocol: string;
  pathname: string;
  riskLevel: LinkRiskLevel;
  observed: string[];
  unverified: string[];
  signals: LinkSignal[];
  explanation: {
    plainExplanation: string;
    whatToCheckNext: string[];
    source: 'ai' | 'template';
  };
  // ML integration fields
  mlScore?: number;
  mlRiskLevel?: 'safe' | 'suspicious' | 'danger';
  trigger_factors?: string[];
}

export class LinkService {
  /**
   * Calls the calibrated Python ML inference microservice for real-time URL phishing detection.
   * Enforces fail-open resilience: returns null on network failures, timeouts, or 5xx errors.
   */
  public static async fetchMLSignal(url: string): Promise<MLUrlSignalResponse | null> {
    const apiUrl = (process.env.ML_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
    const timeoutMs = process.env.NODE_ENV === 'test' ? 500 : parseInt(process.env.ML_TIMEOUT_MS || '3000', 10);
    const endpoint = `${apiUrl}/ml/url-signal`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!response.ok) {
        logger.warn(
          { status: response.status, endpoint },
          'ML Phishing Detection Microservice returned non-2xx status. Failing open.'
        );
        return null;
      }

      const data = (await response.json()) as MLUrlSignalResponse;
      return data;
    } catch (err) {
      logger.debug(
        { err: err instanceof Error ? err.message : String(err), endpoint },
        'ML Phishing Detection Microservice unreachable or timed out. Failing open to deterministic rules.'
      );
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Complete end-to-end URL inspection:
   * 1. Deterministic structural checks (IP, Punycode, Lookalike, Shorteners, Subdomains, HTTPS)
   * 2. RDAP domain age verification
   * 3. ML Phishing detection (calibrated probability & explainable trigger factors)
   * 4. AI explanation generation
   */
  public static async evaluateUrl(url: string, useAi = false): Promise<LinkEvaluationResult> {
    let hostname: string;
    let protocol = 'https:';
    let pathname = '/';

    try {
      const parsed = new URL(url);
      hostname = parsed.hostname.toLowerCase();
      protocol = parsed.protocol;
      pathname = parsed.pathname;
    } catch {
      const match = url.match(/^([a-z]+:)\/\/([^/?#]+)(.*)$/i);
      if (match) {
        protocol = match[1].toLowerCase();
        hostname = match[2].toLowerCase();
        pathname = match[3] || '/';
      } else {
        throw new Error('INVALID_URL');
      }
    }

    const signals: LinkSignal[] = [];
    const observed: string[] = [];
    const unverified: string[] = [];

    // 1. Structural check: IP address
    if (net.isIP(hostname)) {
      signals.push({
        id: 'LINK_IP_HOSTNAME',
        type: 'ip_address',
        message: 'Link uses a raw numeric IP address instead of an authenticated domain name.',
        severity: 'critical',
      });
      observed.push('Numeric IP host detected');
    }

    // 2. Structural check: Punycode
    if (isPunycode(hostname)) {
      signals.push({
        id: 'LINK_PUNYCODE',
        type: 'punycode',
        message: 'Link uses Punycode/IDN characters which can disguise deceptive spelling.',
        severity: 'critical',
      });
      observed.push('Punycode/IDN encoding detected');
    }

    // 3. Lookalike brand domain check
    const lookalike = detectLookalikeDomain(hostname);
    if (lookalike.isLookalike) {
      signals.push({
        id: 'LINK_LOOKALIKE',
        type: 'lookalike',
        message: `Domain appears to mimic ${lookalike.targetBrand} (official: ${lookalike.officialDomain}): ${lookalike.reason}`,
        severity: 'critical',
      });
      observed.push(`Lookalike pattern for brand ${lookalike.targetBrand}`);
    }

    // 4. Structural check: URL Shortener
    if (isUrlShortener(hostname)) {
      signals.push({
        id: 'LINK_SHORTENER',
        type: 'shortener',
        message:
          'Link uses a URL shortener service that obscures the real destination address (flagged: cannot inspect without external fetch).',
        severity: 'warning',
      });
      observed.push('URL shortener obscures destination (cannot inspect)');
    }

    // 4b. Structural check: Excessive subdomains
    if (hasExcessiveSubdomains(hostname)) {
      signals.push({
        id: 'LINK_EXCESSIVE_SUBDOMAINS',
        type: 'excessive_subdomains',
        message:
          'Link uses excessive subdomain nesting (>= 4 levels), often used to disguise deceptive landing pages.',
        severity: 'warning',
      });
      observed.push('Excessive subdomain nesting detected');
    }

    // 5. Structural check: Insecure HTTP
    if (protocol === 'http:') {
      signals.push({
        id: 'LINK_INSECURE_HTTP',
        type: 'insecure_scheme',
        message: 'Link uses unencrypted HTTP rather than modern secure HTTPS.',
        severity: 'warning',
      });
      observed.push('Unencrypted HTTP protocol');
    }

    // 6. RDAP Domain Age Check (via safeFetch) - Skip for URL shorteners
    const isShortener = isUrlShortener(hostname);
    const rdap = !isShortener
      ? await queryRdapDomainAge(hostname)
      : { status: 'unknown' as const, ageDays: null };
    if (rdap.status === 'verified' && rdap.ageDays !== null) {
      observed.push(`Domain registration age: ${rdap.ageDays} days`);
      if (rdap.ageDays < 30) {
        signals.push({
          id: 'LINK_NEW_DOMAIN',
          type: 'new_domain',
          message: `Domain was registered very recently (${rdap.ageDays} days ago). Newly created domains warrant extreme caution.`,
          severity: 'warning',
        });
      }
    } else {
      unverified.push('Domain registration age could not be verified via RDAP');
    }

    // 7. Calibrated ML Phishing Model Call
    const OFFICIAL_VERIFIED_ROOTS = [
      'gov.in',
      'nic.in',
      'aicte-india.org',
      'ncs.gov.in',
      'mca.gov.in',
      'google.com',
      'infosys.com',
      'tcs.com',
      'wipro.com',
      'microsoft.com',
      'amazon.com',
    ];
    const isVerifiedOfficial = OFFICIAL_VERIFIED_ROOTS.some(
      (root) => hostname === root || hostname.endsWith('.' + root)
    );

    const mlSignal = !isUrlShortener(hostname) ? await this.fetchMLSignal(url) : null;
    let mlScore: number | undefined;
    let mlRiskLevel: 'safe' | 'suspicious' | 'danger' | undefined;
    let trigger_factors: string[] | undefined;

    if (mlSignal) {
      mlScore = mlSignal.risk_score;
      mlRiskLevel = mlSignal.risk_level;
      trigger_factors = mlSignal.trigger_factors;

      // Stage 1 Deterministic Rule Priority (R-03: Verified Employer / Government Domain)
      if (isVerifiedOfficial && !lookalike.isLookalike && !isPunycode(hostname) && !net.isIP(hostname)) {
        mlScore = 0.0;
        mlRiskLevel = 'safe';
        observed.push('Verified authentic enterprise/government domain (Rule R-03: Safe)');
      } else if (mlSignal.risk_level === 'danger' || mlSignal.is_phishing) {
        signals.push({
          id: 'LINK_ML_PHISHING_CONFIRMED',
          type: 'ml_phishing_signal',
          message: `Calibrated ML Phishing Detection Model identified high-confidence phishing indicators (${Math.round(mlSignal.risk_score * 100)}% risk score).`,
          severity: 'critical',
        });
        observed.push(`ML Phishing Model: High risk (${Math.round(mlSignal.risk_score * 100)}%)`);
      } else if (mlSignal.risk_level === 'suspicious') {
        signals.push({
          id: 'LINK_ML_PHISHING_SUSPICIOUS',
          type: 'ml_phishing_signal',
          message: `Calibrated ML Phishing Detection Model flagged suspicious URL characteristics (${Math.round(mlSignal.risk_score * 100)}% risk score).`,
          severity: 'warning',
        });
        observed.push(`ML Phishing Model: Suspicious (${Math.round(mlSignal.risk_score * 100)}%)`);
      } else {
        observed.push(`ML Phishing Model: Low risk (${Math.round(mlSignal.risk_score * 100)}%)`);
      }
    }

    // 8. Determine 3-level link risk enum
    let riskLevel: LinkRiskLevel = LINK_RISK_LEVELS.NO_MAJOR_WARNING_SIGNS;
    if (signals.some((s) => s.severity === 'critical')) {
      riskLevel = LINK_RISK_LEVELS.HIGH_RISK;
    } else if (signals.some((s) => s.severity === 'warning')) {
      riskLevel = LINK_RISK_LEVELS.NEEDS_VERIFICATION;
    }

    // 9. AI Explanation
    const explanation = await explainLinkObservations(
      {
        hostname,
        observations: observed,
        rdapAgeDays: rdap.ageDays ?? 'unknown',
        lookalikeTarget: lookalike.isLookalike ? lookalike.targetBrand : undefined,
      },
      Boolean(useAi)
    );

    return {
      url,
      hostname,
      protocol,
      pathname,
      riskLevel,
      observed,
      unverified,
      signals,
      explanation,
      mlScore,
      mlRiskLevel,
      trigger_factors,
    };
  }
}
