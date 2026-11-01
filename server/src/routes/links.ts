import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  detectLookalikeDomain,
  isPunycode,
  isUrlShortener,
  hasExcessiveSubdomains,
  LINK_RISK_LEVELS,
  type LinkRiskLevel,
} from '@jaanch/shared';
import { validateBody } from '../middleware/validate.js';
import { linkCheckRateLimiter } from '../middleware/rateLimiter.js';
import { safeFetch, SafeFetchError } from '../lib/safeFetch.js';
import { loadEnv } from '../config/env.js';
import { logger } from '../lib/logger.js';
import net from 'node:net';
import { explainLinkObservations } from '../lib/gemini.js';

const router = Router();

const LinkCheckSchema = z.object({
  url: z.string().refine(
    (val) => {
      try {
        const u = new URL(val);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(val);
      }
    },
    'Please provide a valid HTTP or HTTPS URL (e.g., https://example.com)'
  ),
  useAi: z.boolean().optional().default(false),
});

interface LinkSignal {
  id: string;
  type: 'lookalike' | 'punycode' | 'shortener' | 'ip_address' | 'insecure_scheme' | 'new_domain' | 'excessive_subdomains';
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

interface RdapResult {
  ageDays: number | null;
  status: 'verified' | 'unknown';
  errorReason?: string;
}

/**
 * Fetches domain registration age via RDAP using safeFetch.
 * Failure always yields status: 'unknown', NEVER 'pass'.
 */
export async function queryRdapDomainAge(domain: string): Promise<RdapResult> {
  const env = loadEnv();

  // Third-party network lookups stay disabled unless ENABLE_THIRD_PARTY_CHECKS=true (Decision D10)
  if (!env.ENABLE_THIRD_PARTY_CHECKS) {
    return { ageDays: null, status: 'unknown', errorReason: 'Third party RDAP check is disabled' };
  }

  // Raw IPs cannot be checked via domain RDAP
  if (net.isIP(domain) || isPunycode(domain)) {
    return { ageDays: null, status: 'unknown', errorReason: 'Non-standard domain format' };
  }

  // Extract base domain (e.g., sub.example.com -> example.com)
  const parts = domain.split('.');
  const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : domain;

  const rdapUrl = `${env.RDAP_BASE_URL.replace(/\/$/, '')}/domain/${encodeURIComponent(baseDomain)}`;

  try {
    const res = await safeFetch(rdapUrl, {
      timeoutMs: env.RDAP_TIMEOUT_MS,
      maxBytes: 256 * 1024,
    });

    if (res.status === 200) {
      const data = await res.json<{ events?: Array<{ eventAction: string; eventDate: string }> }>();
      const regEvent = data.events?.find(
        (e) => e.eventAction === 'registration' || e.eventAction === 'transfer'
      );

      if (regEvent?.eventDate) {
        const regDate = new Date(regEvent.eventDate);
        if (!isNaN(regDate.getTime())) {
          const diffMs = Date.now() - regDate.getTime();
          const ageDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          return { ageDays, status: 'verified' };
        }
      }
    }

    return { ageDays: null, status: 'unknown', errorReason: `RDAP server returned status ${res.status}` };
  } catch (err) {
    logger.debug(
      {
        domain: baseDomain,
        err: err instanceof SafeFetchError ? err.code : 'FETCH_ERROR',
      },
      'RDAP domain age lookup failed soft'
    );
    // Critical Spec Rule: Failure must be "unknown", never "pass"
    return { ageDays: null, status: 'unknown', errorReason: 'RDAP query timed out or unavailable' };
  }
}

router.post(
  '/link-check',
  linkCheckRateLimiter(),
  validateBody(LinkCheckSchema),
  async (req: Request, res: Response) => {
    const { url } = req.body as { url: string };

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
        res.status(400).json({
          error: {
            code: 'INVALID_URL',
            message: 'Unable to parse provided URL',
            requestId: req.id,
          },
        });
        return;
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
        message: 'Link uses a URL shortener service that obscures the real destination address (flagged: cannot inspect without external fetch).',
        severity: 'warning',
      });
      observed.push('URL shortener obscures destination (cannot inspect)');
    }

    // 4b. Structural check: Excessive subdomains
    if (hasExcessiveSubdomains(hostname)) {
      signals.push({
        id: 'LINK_EXCESSIVE_SUBDOMAINS',
        type: 'excessive_subdomains',
        message: 'Link uses excessive subdomain nesting (>= 4 levels), often used to disguise deceptive landing pages.',
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

    // 6. RDAP Domain Age Check (via safeFetch)
    const rdap = await queryRdapDomainAge(hostname);
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
      // Failure -> "unknown", never "pass"
      unverified.push('Domain registration age could not be verified via RDAP');
    }

    // Determine 3-level link risk enum (SPEC_ADDENDUM Section 2)
    let riskLevel: LinkRiskLevel = LINK_RISK_LEVELS.NO_MAJOR_WARNING_SIGNS;
    if (signals.some((s) => s.severity === 'critical')) {
      riskLevel = LINK_RISK_LEVELS.HIGH_RISK;
    } else if (signals.some((s) => s.severity === 'warning')) {
      riskLevel = LINK_RISK_LEVELS.NEEDS_VERIFICATION;
    }

    const explanation = await explainLinkObservations(
      {
        hostname,
        observations: observed,
        rdapAgeDays: rdap.ageDays ?? 'unknown',
        lookalikeTarget: lookalike.isLookalike ? lookalike.targetBrand : undefined,
      },
      Boolean(req.body.useAi)
    );

    res.status(200).json({
      data: {
        url,
        hostname,
        protocol,
        pathname,
        riskLevel,
        observed,
        unverified,
        signals,
        explanation,
      },
    });
  }
);

export const linksRouter = router;
