export const KNOWN_URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'ow.ly',
  'buff.ly',
  'rebrand.ly',
  'tiny.cc',
]);

export const KNOWN_FIRMS = [
  { brand: 'tcs', domain: 'tcs.com' },
  { brand: 'infosys', domain: 'infosys.com' },
  { brand: 'wipro', domain: 'wipro.com' },
  { brand: 'microsoft', domain: 'microsoft.com' },
  { brand: 'google', domain: 'google.com' },
  { brand: 'amazon', domain: 'amazon.com' },
  { brand: 'accenture', domain: 'accenture.com' },
  { brand: 'cognizant', domain: 'cognizant.com' },
  { brand: 'ibm', domain: 'ibm.com' },
  { brand: 'deloitte', domain: 'deloitte.com' },
  { brand: 'hcl', domain: 'hcltech.com' },
  { brand: 'techcorp', domain: 'techcorp.com' },
];

/**
 * Standard Levenshtein distance computation
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Detects whether a host is an IP-literal (IPv4 or IPv6)
 */
export function isIpAddressHost(host: string): boolean {
  if (!host) return false;
  const clean = host.replace(/^\[|\]$/g, '').trim();
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
  if (ipv4.test(clean)) {
    const parts = clean.split(':')[0].split('.').map(Number);
    return parts.every((p) => p >= 0 && p <= 255);
  }
  return clean.includes(':');
}

/**
 * Checks if a domain has excessive subdomain nesting (>= 4 dots / labels)
 * e.g. login.verify.update.bank.attacker.com
 */
export function hasExcessiveSubdomains(domain: string): boolean {
  if (!domain) return false;
  const clean = domain.toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./, '');
  const labels = clean.split('.').filter(Boolean);
  return labels.length >= 4;
}

/**
 * Checks if a domain uses Punycode / IDN encoding
 */
export function isPunycode(domain: string): boolean {
  if (!domain) return false;
  return domain.toLowerCase().includes('xn--');
}

/**
 * Checks if a domain is a known URL shortening service
 */
export function isUrlShortener(domain: string): boolean {
  if (!domain) return false;
  const clean = domain.toLowerCase().replace(/^www\./, '');
  return KNOWN_URL_SHORTENERS.has(clean);
}

export interface LookalikeResult {
  isLookalike: boolean;
  targetBrand?: string;
  officialDomain?: string;
  reason?: string;
}

/**
 * Detects lookalike domains targeting known brands:
 * - Common substitutions: 0 -> o, 1 -> l, vv -> w
 * - Hyphenated additions: e.g. tcs-careers.org, google-india-jobs.net
 * - Levenshtein typosquat distance <= 2
 */
export function detectLookalikeDomain(
  domain: string,
  knownFirms = KNOWN_FIRMS
): LookalikeResult {
  if (!domain) return { isLookalike: false };

  const clean = domain.toLowerCase().replace(/^www\./, '');

  // If it matches ANY known official firm domain, it is legitimate
  if (knownFirms.some((f) => clean === f.domain || clean.endsWith(`.${f.domain}`))) {
    return { isLookalike: false };
  }

  // Punycode is inherently suspicious for brand lookalikes
  if (isPunycode(clean)) {
    return {
      isLookalike: true,
      reason: 'Domain contains Punycode/IDN homograph prefix (xn--)',
    };
  }

  // Extract base label (e.g. micros0ft-careers from micros0ft-careers.com)
  const parts = clean.split('.');
  if (parts.length < 2) return { isLookalike: false };
  const baseLabel = parts[0];

  for (const firm of knownFirms) {
    const brand = firm.brand;

    // 1. Check exact brand embedded with hyphens/keywords (e.g. tcs-careers, google-jobs)
    if (
      baseLabel.startsWith(`${brand}-`) ||
      baseLabel.endsWith(`-${brand}`) ||
      baseLabel.includes(`${brand}careers`) ||
      baseLabel.includes(`${brand}jobs`) ||
      baseLabel.includes(`${brand}hiring`)
    ) {
      return {
        isLookalike: true,
        targetBrand: firm.brand,
        officialDomain: firm.domain,
        reason: `Impersonates brand "${firm.brand}" with recruitment suffixes on unverified domain`,
      };
    }

    // 2. Check character substitutions (0 -> o, 1 -> l/i, vv -> w)
    const normalizedSub = baseLabel
      .replace(/0/g, 'o')
      .replace(/1/g, 'l')
      .replace(/vv/g, 'w');

    if (normalizedSub === brand || normalizedSub.includes(brand)) {
      if (baseLabel !== brand) {
        return {
          isLookalike: true,
          targetBrand: firm.brand,
          officialDomain: firm.domain,
          reason: `Typosquatting/homoglyph swap targeting "${firm.brand}"`,
        };
      }
    }

    // 3. Levenshtein distance on base label if length is close
    if (Math.abs(baseLabel.length - brand.length) <= 2) {
      const dist = levenshteinDistance(baseLabel, brand);
      if (dist >= 1 && dist <= 2) {
        return {
          isLookalike: true,
          targetBrand: firm.brand,
          officialDomain: firm.domain,
          reason: `Typo domain at edit distance ${dist} from "${firm.brand}"`,
        };
      }
    }
  }

  return { isLookalike: false };
}
