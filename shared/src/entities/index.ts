import type { ExtractedEntities } from '../schemas/index.js';

const URL_REGEX = /\bhttps?:\/\/[^\s<>"'{}|\\^`]+/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+91[\s-]?)?(?:\b[6-9]\d{4}[\s-]?\d{5}\b|\b0[6-9]\d{9}\b)/g;
const UPI_REGEX = /\b[a-zA-Z0-9._-]{2,}@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|apl|upi|axl|ibl|barodampay|federal|idfcbank|icici|kotak|postbank|sbi|hdfcbank|axisbank|pnb)\b/gi;
const AMOUNT_REGEX = /(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{1,2})?|\b[\d,]+(?:\.\d{1,2})?\s*(?:rupees|inr|\/-)\b/gi;

const KNOWN_ORGANIZATIONS = [
  'Tata Consultancy Services',
  'TCS',
  'Infosys',
  'Wipro',
  'HCL Technologies',
  'Cognizant',
  'Accenture',
  'Tech Mahindra',
  'Capgemini',
  'Microsoft',
  'Google',
  'Amazon',
  'IBM',
  'Oracle',
  'Deloitte',
  'Reliance Industries',
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'TechCorp',
];

const CORP_SUFFIXES = [
  'Pvt\\.?\\s*Ltd\\.?',
  'Private\\s+Limited',
  'Limited',
  'LLP',
  'Inc\\.?',
  'Technologies',
  'Solutions',
  'Enterprises',
  'Consultancy\\s+Services',
  'Infotech',
];

const STOP_ORGANIZATIONS = new Set([
  'dear',
  'candidate',
  'student',
  'intern',
  'team',
  'hr team',
  'hiring team',
  'congratulations',
  'offer letter',
  'whatsapp',
  'telegram',
  'government',
  'india',
  'recruitment',
]);

/**
 * Conservative scored organization extractor
 * Returns organization name if confidence is high; null if uncertain.
 */
export function extractOrganization(text: string): string | null {
  if (!text) return null;

  // 1. Check known organizations
  for (const org of KNOWN_ORGANIZATIONS) {
    const orgRegex = new RegExp(`\\b${org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (orgRegex.test(text)) {
      return org;
    }
  }

  // 2. Pattern: [Name] + Corporate suffix
  const suffixPattern = new RegExp(`\\b([A-Z][A-Za-z0-9&.' -]{2,35})\\s+(${CORP_SUFFIXES.join('|')})(?:\\b|\\.?)`, 'i');
  const suffixMatch = text.match(suffixPattern);
  if (suffixMatch) {
    let candidate = `${suffixMatch[1]} ${suffixMatch[2]}`.trim();
    candidate = candidate.replace(/^(?:welcome\s+to|selected\s+for|offer\s+from|joining)\s+/i, '').trim();
    if (!STOP_ORGANIZATIONS.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  // 3. Pattern: Prepositions ("at [Company]", "from [Company]", "with [Company]")
  const prepPattern = /\b(?:at|from|with|joining)\s+([A-Z][A-Za-z0-9&.]{2,30}(?:\s+[A-Z][A-Za-z0-9&.]{2,30}){0,3})\b/g;
  let match: RegExpExecArray | null;
  while ((match = prepPattern.exec(text)) !== null) {
    const candidate = match[1].trim();
    const lower = candidate.toLowerCase();
    if (!STOP_ORGANIZATIONS.has(lower) && candidate.length > 2) {
      // Must be capitalized words and not generic
      const words = candidate.split(/\s+/);
      if (words.every((w) => /^[A-Z]/.test(w))) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Deterministic extraction of entities and indicators
 */
export function extractEntities(text: string): ExtractedEntities {
  if (!text) {
    return {
      urls: [],
      domains: [],
      emails: [],
      phones: [],
      upiHandles: [],
      amounts: [],
      organization: null,
    };
  }

  // URLs
  const urls: string[] = [];
  const urlMatches = text.match(URL_REGEX) || [];
  for (const u of urlMatches) {
    const cleanUrl = u.replace(/[.,;:!?)]+$/, '');
    if (!urls.includes(cleanUrl)) urls.push(cleanUrl);
  }

  // Emails
  const emails: string[] = [];
  const emailMatches = text.match(EMAIL_REGEX) || [];
  for (const e of emailMatches) {
    const clean = e.toLowerCase();
    if (!emails.includes(clean)) emails.push(clean);
  }

  // Domains from URLs and Emails
  const domains: string[] = [];
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      const host = parsed.hostname.toLowerCase();
      if (!domains.includes(host)) domains.push(host);
    } catch {
      // ignore invalid URLs
    }
  }
  for (const e of emails) {
    const parts = e.split('@');
    if (parts.length === 2 && !domains.includes(parts[1])) {
      domains.push(parts[1]);
    }
  }

  // Phones
  const phones: string[] = [];
  const phoneMatches = text.match(PHONE_REGEX) || [];
  for (const p of phoneMatches) {
    const clean = p.replace(/[\s-]/g, '');
    if (!phones.includes(clean)) phones.push(clean);
  }

  // UPI Handles
  const upiHandles: string[] = [];
  const upiMatches = text.match(UPI_REGEX) || [];
  for (const upi of upiMatches) {
    const clean = upi.toLowerCase();
    if (!upiHandles.includes(clean)) upiHandles.push(clean);
  }

  // Amounts
  const amounts: string[] = [];
  const amountMatches = text.match(AMOUNT_REGEX) || [];
  for (const amt of amountMatches) {
    const clean = amt.trim();
    if (!amounts.includes(clean)) amounts.push(clean);
  }

  // Organization
  const organization = extractOrganization(text);

  return {
    urls,
    domains,
    emails,
    phones,
    upiHandles,
    amounts,
    organization,
  };
}
