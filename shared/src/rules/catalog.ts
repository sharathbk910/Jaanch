import type { Signal, ExtractedEntities, SenderDetails, SignalCategory } from '../schemas/index.js';
import { isNegatedInClause } from './negation.js';
import { findSpan } from '../normalize/index.js';
import { detectLookalikeDomain, isIpAddressHost, isPunycode } from '../links/index.js';

export interface RuleDefinition {
  id: string;
  title: string;
  whyItMatters: string;
  category?: SignalCategory;
  isHardDisqualifier: boolean;
  evaluate: (
    normalizedText: string,
    rawText: string,
    entities: ExtractedEntities,
    sender?: SenderDetails
  ) => Signal | null;
}

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'outlook.com',
  'hotmail.com',
  'protonmail.com',
  'proton.me',
  'rediffmail.com',
  'aol.com',
  'zoho.com',
]);

export const RULE_UPFRONT_FEE: RuleDefinition = {
  id: 'RULE_UPFRONT_FEE',
  title: 'Upfront Payment or Deposit Demanded',
  category: 'financial_demand',
  whyItMatters:
    'Legitimate companies and employers never ask candidates to pay registration fees, training charges, or security deposits for jobs or internships.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    // English, Hindi, Hinglish, Kannada upfront fee terms
    const feeRegex =
      /\b(?:registration\s+(?:fees?|charges?|deposits?)|training\s+(?:fees?|charges?|costs?)|processing\s+(?:fees?|charges?)|security\s+deposits?|kit\s+(?:fees?|charges?|costs?)|laptop\s+(?:fees?|charges?|courier)|refundable\s+deposits?|pay\s+(?:upfront|first|amount|fees?)|deposit\s+₹|deposit\s+rs|pay\s+₹|pay\s+rs|panjikaran\s+shulk|training\s+shulk|deposit\s+bhare|paise\s+bhejo|fees?\s+jama|shulk\s+jama|no[n]?dani\s+shulka|shulka\s+pavathisi|taraketi\s+shulka|deposit\s+kodi|ana\s+kodabeku)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = feeRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-UPFRONT-FEE',
          ruleId: 'RULE_UPFRONT_FEE',
          category: 'financial_demand',
          title: 'Upfront Payment or Deposit Demanded',
          whyItMatters:
            'Legitimate companies never demand registration fees, training deposits, or hardware courier charges before or during selection.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_BANK_OTP_DEBIT: RuleDefinition = {
  id: 'RULE_BANK_OTP_DEBIT',
  title: 'Sensitive Financial Credentials / OTP Requested',
  category: 'credential_theft',
  whyItMatters:
    'Asking for OTP, PIN, debit/credit card numbers, or passwords is an immediate indicator of financial credential theft.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const credRegex =
      /\b(?:one[\s-]?time\s+password|share\s+otp|enter\s+otp|send\s+otp|otp\s+required|debit\s+card\s+(?:number|details|pin)|credit\s+card\s+(?:number|cvv)|bank\s+password|netbanking\s+password|cheque\s+overpayment|deposit\s+cheque\s+and\s+return|send\s+(?:part\s+of\s+)?money\s+back|otp\s+bheje|bank\s+password\s+de|otp\s+kodi|pin\s+tilisi)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = credRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-BANK-OTP',
          ruleId: 'RULE_BANK_OTP_DEBIT',
          category: 'credential_theft',
          title: 'Sensitive Financial Credentials / OTP Requested',
          whyItMatters:
            'Employers and scholarship sponsors never request banking passwords, card PINs, or verification OTPs.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_COERCIVE_DEADLINE: RuleDefinition = {
  id: 'RULE_COERCIVE_DEADLINE',
  title: 'Artificial Urgency & Coercive Deadline',
  category: 'urgency_pressure',
  whyItMatters:
    'Scammers create extreme pressure (e.g., pay within 2 hours) to prevent candidates from verifying details or seeking second opinions.',
  isHardDisqualifier: false,
  evaluate: (normalizedText, rawText) => {
    const urgencyRegex =
      /\b(?:within\s+[1-4]\s+hours?|offer\s+expires\s+in\s+[1-4]\s+hours?|immediate\s+response\s+required|limited\s+slots?\s+remaining|slots?\s+filling\s+fast|urgent\s+(?:pay|confirm)|turant\s+(?:paise|sampark)|kewal\s+[1-4]\s+ghante|offer\s+samapt\s+ho\s+jayega|tavartavagi|begane\s+samparkisi)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = urgencyRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-COERCIVE-DEADLINE',
          ruleId: 'RULE_COERCIVE_DEADLINE',
          category: 'urgency_pressure',
          title: 'Artificial Urgency & Coercive Deadline',
          whyItMatters:
            'Short artificial deadlines are designed to force rushed payments before the opportunity can be independently confirmed.',
          evidence: evidence || match[0],
          severity: 'medium',
        };
      }
    }
    return null;
  },
};

export const RULE_FREE_EMAIL_CLAIMING_ORG: RuleDefinition = {
  id: 'RULE_FREE_EMAIL_CLAIMING_ORG',
  title: 'Free Personal Email Used for Corporate Communication',
  category: 'unverified_contact',
  whyItMatters:
    'Reputable organizations send official offers and selection notices from verified enterprise domains, not free personal email services.',
  isHardDisqualifier: false,
  evaluate: (normalizedText, rawText, entities, sender) => {
    // Check if organization is present (either sender or extracted)
    const org = sender?.organization || entities.organization;
    if (!org) return null;

    // Check emails from entities or sender
    const emailsToCheck = [...entities.emails];
    if (sender?.email && !emailsToCheck.includes(sender.email.toLowerCase())) {
      emailsToCheck.push(sender.email.toLowerCase());
    }

    for (const email of emailsToCheck) {
      const parts = email.split('@');
      if (parts.length === 2) {
        const domain = parts[1].toLowerCase();
        if (FREE_EMAIL_PROVIDERS.has(domain)) {
          const matchIdx = normalizedText.indexOf(email);
          const evidence =
            matchIdx >= 0 ? findSpan(rawText, matchIdx, email.length) : `${org} contacted from ${email}`;
          return {
            id: 'SIG-FREE-EMAIL-ORG',
            ruleId: 'RULE_FREE_EMAIL_CLAIMING_ORG',
            category: 'unverified_contact',
            title: 'Free Personal Email Used for Corporate Communication',
            whyItMatters:
              `The offer claims representation of "${org}" but provides a free public email address (${domain}).`,
            evidence,
            severity: 'medium',
          };
        }
      }
    }

    return null;
  },
};

export const RULE_LOOKALIKE_DOMAIN: RuleDefinition = {
  id: 'RULE_LOOKALIKE_DOMAIN',
  title: 'Lookalike or Typosquatting Brand Domain Detected',
  category: 'brand_impersonation',
  whyItMatters:
    'Fraudulent websites mimic well-known company domains using hyphens, extra keywords, or misspelled letters to deceive applicants.',
  isHardDisqualifier: true,
  evaluate: (_normalizedText, _rawText, entities, sender) => {
    const domainsToCheck = [...entities.domains];
    if (sender?.domain && !domainsToCheck.includes(sender.domain.toLowerCase())) {
      domainsToCheck.push(sender.domain.toLowerCase());
    }

    for (const domain of domainsToCheck) {
      const check = detectLookalikeDomain(domain);
      if (check.isLookalike) {
        return {
          id: 'SIG-LOOKALIKE-DOMAIN',
          ruleId: 'RULE_LOOKALIKE_DOMAIN',
          category: 'brand_impersonation',
          title: 'Lookalike or Typosquatting Brand Domain Detected',
          whyItMatters:
            check.reason || `Domain "${domain}" imitates recognized brand "${check.targetBrand}".`,
          evidence: `Suspect domain: ${domain}`,
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_PHISHING_LINK_STRUCTURAL: RuleDefinition = {
  id: 'RULE_PHISHING_LINK_STRUCTURAL',
  title: 'Deceptive Phishing Link, Raw Numeric IP, or Subdomain Spoofing Detected',
  category: 'brand_impersonation',
  whyItMatters:
    'Legitimate recruitment communications never use raw IP hosts, deceptive subdomains mimicking government or brand portals, or punycode characters.',
  isHardDisqualifier: true,
  evaluate: (_normalizedText, _rawText, entities) => {
    for (const domain of entities.domains) {
      const lower = domain.toLowerCase();

      // 1. Raw numeric IP address host (e.g. 192.168.1.100)
      if (isIpAddressHost(lower)) {
        return {
          id: 'SIG-IP-HOSTNAME-PHISHING',
          ruleId: 'RULE_PHISHING_LINK_STRUCTURAL',
          category: 'brand_impersonation',
          title: 'Direct Numeric IP Address Phishing Link Detected',
          whyItMatters:
            'Links using raw numeric IP addresses instead of authenticated domain names are a hallmark of phishing and credential harvesting attacks.',
          evidence: `Suspect host: ${domain}`,
          severity: 'critical',
        };
      }

      // 2. Punycode / IDN encoding
      if (isPunycode(lower)) {
        return {
          id: 'SIG-PUNYCODE-PHISHING',
          ruleId: 'RULE_PHISHING_LINK_STRUCTURAL',
          category: 'brand_impersonation',
          title: 'Punycode / IDN Homograph Phishing Link Detected',
          whyItMatters:
            'Punycode character encoding is frequently used to disguise deceptive homoglyph characters mimicking legitimate enterprise brands.',
          evidence: `Suspect domain: ${domain}`,
          severity: 'critical',
        };
      }

      // 3. Subdomain brand spoofing
      // e.g. secure-login-scholarships-gov.in.account-verification-update.com
      // Official government domains (.gov.in / .nic.in) are authentic and must never trigger spoofing
      if (lower.endsWith('.gov.in') || lower.endsWith('.nic.in')) {
        continue;
      }

      const parts = lower.split('.');
      if (parts.length >= 3) {
        const rootDomain = parts.slice(-2).join('.');
        const subdomain = parts.slice(0, -2).join('.');
        const brandSpoof =
          /\b(?:gov|nic|scholarships?|aicte|tcs|infosys|wipro|google|microsoft|amazon|sbi|hdfc|icici|paypal|login|verify|security)\b/i;
        if (
          brandSpoof.test(subdomain) &&
          rootDomain !== 'gov.in' &&
          rootDomain !== 'nic.in' &&
          !rootDomain.endsWith('.gov.in') &&
          !rootDomain.endsWith('.nic.in') &&
          !['google.com', 'microsoft.com', 'tcs.com', 'infosys.com', 'wipro.com'].includes(rootDomain)
        ) {
          return {
            id: 'SIG-SUBDOMAIN-BRAND-SPOOF',
            ruleId: 'RULE_PHISHING_LINK_STRUCTURAL',
            category: 'brand_impersonation',
            title: 'Subdomain Brand Spoofing Phishing Link Detected',
            whyItMatters:
              'The link embeds authentic organization or government keywords inside a subdomain on an unrelated root domain to trick users into trusting a fraudulent page.',
            evidence: `Deceptive domain: ${domain} (root: ${rootDomain})`,
            severity: 'critical',
          };
        }
      }
    }
    return null;
  },
};

export const RULE_OFFICIAL_GOV_FEES: RuleDefinition = {
  id: 'RULE_OFFICIAL_GOV_FEES',
  title: 'Government Scheme Demanding Upfront Fee or Using Non-Gov Domain',
  category: 'gov_scheme_abuse',
  whyItMatters:
    'Indian government schemes (e.g. AICTE, PMKVY, NATS) do not charge application/selection fees and always operate on .gov.in or .nic.in domains.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText, entities) => {
    const govSchemeRegex =
      /\b(?:pmkvy|nats|aicte|pradhan\s+mantri|ministry\s+of|sarkari\s+yojana|sarkara\s+yojane|national\s+scholarship\s+portal)\b/gi;

    if (!govSchemeRegex.test(normalizedText)) {
      return null;
    }

    // Check if upfront payment or fee is mentioned
    const feeRegex = /\b(?:fee|charge|deposit|shulk|ana|pavatis|pay\s+₹|pay\s+rs)\b/i;
    if (feeRegex.test(normalizedText)) {
      const match = normalizedText.match(govSchemeRegex);
      const idx = match ? normalizedText.indexOf(match[0]) : 0;
      if (!isNegatedInClause(normalizedText, idx)) {
        const evidence = findSpan(rawText, idx, 30);
        return {
          id: 'SIG-GOV-FEE',
          ruleId: 'RULE_OFFICIAL_GOV_FEES',
          category: 'gov_scheme_abuse',
          title: 'Government Scheme Demanding Upfront Fee',
          whyItMatters:
            'Official government skilling and scholarship schemes are free and never require upfront processing fees.',
          evidence: evidence || 'Fee demanded under government scheme name',
          severity: 'critical',
        };
      }
    }

    // Check if non-gov domain is linked
    const OFFICIAL_GOV_DOMAINS = ['.gov.in', '.nic.in', 'aicte-india.org'];
    for (const dom of entities.domains) {
      const isOfficial = OFFICIAL_GOV_DOMAINS.some((d) => dom === d || dom.endsWith(d));
      if (!isOfficial) {
        return {
          id: 'SIG-GOV-NON-GOV-DOMAIN',
          ruleId: 'RULE_OFFICIAL_GOV_FEES',
          category: 'gov_scheme_abuse',
          title: 'Government Scheme Directing to Non-Government Domain',
          whyItMatters:
            'Claims government representation but directs users to an unofficial commercial website domain.',
          evidence: `Unofficial domain linked: ${dom}`,
          severity: 'critical',
        };
      }
    }

    return null;
  },
};

export const RULE_UNVERIFIED_LISTING: RuleDefinition = {
  id: 'RULE_UNVERIFIED_LISTING',
  title: 'Opportunity Not Corroborated by Official Listing',
  category: 'unverified_listing',
  whyItMatters:
    'The opportunity lacks an independently matched listing on the company careers page or verified portal.',
  isHardDisqualifier: false,
  evaluate: (_normalizedText, _rawText, entities, sender) => {
    // Check if any extracted domain already matches an authentic corporate or government domain
    const hasMatchingOfficialDomain = entities.domains.some((d) => {
      const lower = d.toLowerCase();
      if (lower.endsWith('.gov.in') || lower.endsWith('.nic.in')) return true;
      if (entities.organization) {
        const orgLower = entities.organization.toLowerCase();
        if (orgLower === 'google' && (lower === 'google.com' || lower.endsWith('.google.com'))) return true;
        if (orgLower === 'tcs' && (lower === 'tcs.com' || lower.endsWith('.tcs.com'))) return true;
        if (orgLower === 'infosys' && (lower === 'infosys.com' || lower.endsWith('.infosys.com'))) return true;
        if (orgLower === 'wipro' && (lower === 'wipro.com' || lower.endsWith('.wipro.com'))) return true;
      }
      return false;
    });

    // Fires when an offer mentions an organization but has no official domain verification
    if (entities.organization && !sender?.isOfficialCorporateDomain && !hasMatchingOfficialDomain) {
      return {
        id: 'SIG-UNVERIFIED-LISTING',
        ruleId: 'RULE_UNVERIFIED_LISTING',
        category: 'unverified_listing',
        title: 'Opportunity Not Corroborated by Official Listing',
        whyItMatters:
          'While no direct fraudulent indicators were found, this offer has not been verified against an official careers database.',
        evidence: `Unverified claim: ${entities.organization}`,
        severity: 'low',
      };
    }
    return null;
  },
};

export const RULE_OFFICIAL_VERIFIED_DOMAIN: RuleDefinition = {
  id: 'RULE_OFFICIAL_VERIFIED_DOMAIN',
  title: 'Verified Official Organization or Government Portal Link Present',
  category: 'official_disclaimer',
  whyItMatters:
    'The communication links directly to an authentic official government or enterprise domain.',
  isHardDisqualifier: false,
  evaluate: (_normalizedText, _rawText, entities) => {
    const OFFICIAL_HOST_SUFFIXES = [
      '.gov.in',
      '.nic.in',
      'gov.in',
      'nic.in',
      'aicte-india.org',
      'ncs.gov.in',
      'scholarships.gov.in',
      'mca.gov.in',
      'google.com',
      'tcs.com',
      'infosys.com',
      'wipro.com',
      'microsoft.com',
      'amazon.com',
    ];

    for (const domain of entities.domains) {
      const lower = domain.toLowerCase();
      const isOfficial = OFFICIAL_HOST_SUFFIXES.some(
        (suffix) => lower === suffix || lower.endsWith('.' + suffix) || lower.endsWith(suffix)
      );
      if (isOfficial) {
        return {
          id: 'SIG-OFFICIAL-VERIFIED-DOMAIN',
          ruleId: 'RULE_OFFICIAL_VERIFIED_DOMAIN',
          category: 'official_disclaimer',
          title: 'Verified Official Domain Link Corroborated',
          whyItMatters:
            'Direct link to recognized official government or enterprise portal verified.',
          evidence: `Official domain: ${domain}`,
          severity: 'info',
        };
      }
    }
    return null;
  },
};

export const RULE_GENUINE_DISCLAIMER: RuleDefinition = {
  id: 'RULE_GENUINE_DISCLAIMER',
  title: 'Official Non-Fee Recruitment Policy Disclaimer Present',
  category: 'official_disclaimer',
  whyItMatters:
    'Legitimate companies frequently include explicit notices confirming that they do not solicit money at any stage of hiring.',
  isHardDisqualifier: false,
  evaluate: (normalizedText, rawText) => {
    const disclaimerRegex =
      /\b(?:(?:we\s+(?:do\s+not|never)|does\s+not|never)\s+(?:charge|ask\s+for|solicit)\s+(?:any\s+)?(?:fees?|money|deposits?|payments?)|recruitment\s+is\s+free\s+of\s+charge|kisi\s+bhi\s+shulk\s+ki\s+mang\s+nahi|shulk\s+nahi\s+liya\s+jata|yavude\s+shulkavilla)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = disclaimerRegex.exec(normalizedText)) !== null) {
      const evidence = findSpan(rawText, match.index, match[0].length);
      return {
        id: 'SIG-GENUINE-DISCLAIMER',
        ruleId: 'RULE_GENUINE_DISCLAIMER',
        category: 'official_disclaimer',
        title: 'Official Non-Fee Recruitment Policy Disclaimer Present',
        whyItMatters:
          'Includes clear compliance policy stating that the organization never charges recruitment fees.',
        evidence: evidence || match[0],
        severity: 'info',
      };
    }
    return null;
  },
};

export const RULE_OTP_SHARING: RuleDefinition = {
  id: 'RULE_OTP_SHARING',
  title: 'OTP or Verification Code Sharing Demanded',
  category: 'credential_theft',
  whyItMatters:
    'Legitimate recruiters, interviewers, and scholarship authorities never ask candidates to share one-time passwords (OTPs).',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const otpRegex =
      /\b(?:share\s+(?:your\s+)?otp|enter\s+(?:the\s+)?otp\s+to\s+confirm|forward\s+(?:the\s+)?otp|send\s+(?:the\s+)?otp\s+received|tell\s+(?:me\s+)?(?:the\s+)?otp|otp\s+(?:bhejo|batao|bhejiye|bataye|kodi|tilisi|share\s+kare))\b/gi;

    let match: RegExpExecArray | null;
    while ((match = otpRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-OTP-SHARING',
          ruleId: 'RULE_OTP_SHARING',
          category: 'credential_theft',
          title: 'OTP or Verification Code Sharing Demanded',
          whyItMatters:
            'Sharing an OTP grants immediate unauthorized access to your banking, UPI, or portal account.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_PHISHING_URGENT_ACTION: RuleDefinition = {
  id: 'RULE_PHISHING_URGENT_ACTION',
  title: 'Urgent Account Suspension or KYC Expiry Threat',
  category: 'phishing_lure',
  whyItMatters:
    'Phishing lures intimidate students with threats of blocked accounts, expired KYC, or deactivated services to force immediate interaction with unverified links or phone numbers.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const phishingRegex =
      /\b(?:(?:bank\s+)?account\s+(?:has\s+been\s+|is\s+|will\s+be\s+)?blocked|kyc\s+(?:is\s+)?(?:expired|suspended|pending|incomplete)|sim\s+(?:card\s+)?(?:will\s+be\s+)?deactivated|electricity\s+(?:power\s+)?(?:will\s+be\s+)?disconnected|pan\s+(?:card\s+)?(?:is\s+)?(?:inactive|blocked)|khata\s+band\s+ho\s+gaya|kyc\s+update\s+kare|bijli\s+cut\s+hogi|khate\s+raddagide|kyc\s+avadi\s+mugidide)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = phishingRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-PHISHING-URGENT',
          ruleId: 'RULE_PHISHING_URGENT_ACTION',
          category: 'phishing_lure',
          title: 'Urgent Account Suspension or KYC Expiry Threat',
          whyItMatters:
            'Coercive account cutoff threats are classic phishing tactics designed to induce panic and credential disclosure.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_IMPERSONATION_AUTHORITY: RuleDefinition = {
  id: 'RULE_IMPERSONATION_AUTHORITY',
  title: 'Law Enforcement, Government, or Executive Impersonation Lure',
  category: 'brand_impersonation',
  whyItMatters:
    'Scammers impersonate police, CBI, customs officials, or corporate executives (digital arrest, customs parcel seized, CEO gift card demand).',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const impersonateRegex =
      /\b(?:digital\s+arrest|calling\s+from\s+(?:cbi|crime\s+branch|police|customs|narcotics)|parcel\s+(?:seized|detained|held\s+at\s+customs)|fedex\s+parcel\s+(?:contains\s+illegal|customs\s+issue)|cbi\s+officer|customs\s+officer|police\s+officer\s+speaking|ceo\s+(?:needs|requesting)\s+(?:urgent\s+)?gift\s+cards?|police\s+digital\s+arrest|customs\s+me\s+parcel\s+ruka|parcel\s+thadeyalaagide)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = impersonateRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-IMPERSONATION-AUTHORITY',
          ruleId: 'RULE_IMPERSONATION_AUTHORITY',
          category: 'brand_impersonation',
          title: 'Law Enforcement or Executive Impersonation Lure',
          whyItMatters:
            'Indian law enforcement and legitimate companies never conduct "digital arrests" or demand money/gift cards over chat.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_TASK_SCAM: RuleDefinition = {
  id: 'RULE_TASK_SCAM',
  title: 'Pay-Per-Task, Data Entry, or Social Media Review Fraud',
  category: 'task_fraud',
  whyItMatters:
    'Offers paying ₹50-₹500 per task, or daily sums for simple data entry typing tasks, are predatory scams designed to bait students into upfront fee or crypto investment traps.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const taskRegex =
      /\b(?:pay-per-task|like\s+(?:and\s+subscribe\s+)?youtube\s+videos?\s+(?:to\s+earn|for\s+money)|earn\s+₹?[0-9,]+(?:\s+to\s+₹?[0-9,]+)?\s*(?:inr|rs\.?)?\s*daily(?:\s+by\s+completing|\s+for|\s+doing)?|(?:simple\s+)?data\s+entry\s+typing\s+tasks?|telegram\s+(?:task|rating|review\s+job)|complete\s+(?:simple\s+)?(?:data\s+entry\s+)?tasks?\s+to\s+earn|crypto\s+(?:trading\s+)?task\s+daily|review\s+hotels?\s+and\s+earn|video\s+like\s+karke\s+paise|telegram\s+task\s+karke|video\s+like\s+madi\s+hana)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = taskRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-TASK-SCAM',
          ruleId: 'RULE_TASK_SCAM',
          category: 'task_fraud',
          title: 'Pay-Per-Task or Data Entry Review Fraud',
          whyItMatters:
            'Legitimate corporate employers do not hire students for daily typing batches or unvetted Telegram review tasks.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_INVESTMENT_GUARANTEED_RETURNS: RuleDefinition = {
  id: 'RULE_INVESTMENT_GUARANTEED_RETURNS',
  title: 'Guaranteed High-Yield Investment or Doubling Scheme',
  category: 'financial_demand',
  whyItMatters:
    'Guaranteed returns, daily ROI, and claims to double money are illegal financial fraud under SEBI regulations.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const investRegex =
      /\b(?:guaranteed\s+(?:returns?|profit|daily\s+profit)|double\s+(?:your\s+)?money\s+in\s+[0-9]+\s+(?:days?|hours?)|100%\s+guaranteed\s+profit|zero\s+risk\s+investment|daily\s+roi\s+guaranteed|paisa\s+double\s+hoga|hana\s+eradaneyagi|khachita\s+labha)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = investRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-INVESTMENT-RETURNS',
          ruleId: 'RULE_INVESTMENT_GUARANTEED_RETURNS',
          category: 'financial_demand',
          title: 'Guaranteed Investment or Doubling Scheme',
          whyItMatters:
            'Guaranteed return promises are Ponzi indicators and violate statutory investment protections.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_REMOTE_ACCESS_APP: RuleDefinition = {
  id: 'RULE_REMOTE_ACCESS_APP',
  title: 'Remote Device Access Application Demanded',
  category: 'remote_access',
  whyItMatters:
    'Demanding the installation of AnyDesk, TeamViewer, RustDesk, or QuickSupport allows fraudsters to control your screen and siphon funds.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const remoteRegex =
      /\b(?:install\s+(?:anydesk|teamviewer|rustdesk|quicksupport|airdroid)|download\s+(?:anydesk|teamviewer|rustdesk|quicksupport|airdroid)|anydesk\s+(?:app|kare|download)|teamviewer\s+download|anydesk\s+install\s+madi)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = remoteRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-REMOTE-ACCESS',
          ruleId: 'RULE_REMOTE_ACCESS_APP',
          category: 'remote_access',
          title: 'Remote Screen-Sharing / Device Control App Demanded',
          whyItMatters:
            'Installing remote desktop tools during job recruitment enables unauthorized device takeover and credential theft.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_UPI_COLLECT_REQUEST: RuleDefinition = {
  id: 'RULE_UPI_COLLECT_REQUEST',
  title: 'UPI Collect Request or PIN to Receive Money Lure',
  category: 'financial_demand',
  whyItMatters:
    'In UPI, you never need to enter your MPIN or approve a collect request to receive funds. Doing so debits money from your account.',
  isHardDisqualifier: true,
  evaluate: (normalizedText, rawText) => {
    const upiCollectRegex =
      /\b(?:enter\s+(?:your\s+)?(?:upi\s+)?pin\s+to\s+receive|enter\s+pin\s+for\s+refund|approve\s+(?:upi\s+)?collect\s+request\s+to\s+receive|pin\s+dale\s+paise\s+prapt\s+karne|paise\s+lene\s+ke\s+liye\s+pin|hana\s+padedu\s+upi\s+pin)\b/gi;

    let match: RegExpExecArray | null;
    while ((match = upiCollectRegex.exec(normalizedText)) !== null) {
      if (!isNegatedInClause(normalizedText, match.index)) {
        const evidence = findSpan(rawText, match.index, match[0].length);
        return {
          id: 'SIG-UPI-COLLECT',
          ruleId: 'RULE_UPI_COLLECT_REQUEST',
          category: 'financial_demand',
          title: 'UPI Collect Request or PIN to Receive Money Lure',
          whyItMatters:
            'Entering a UPI PIN authorizes outgoing payment; you never need to enter a PIN to receive a stipend or refund.',
          evidence: evidence || match[0],
          severity: 'critical',
        };
      }
    }
    return null;
  },
};

export const RULE_CATALOG: RuleDefinition[] = [
  RULE_UPFRONT_FEE,
  RULE_BANK_OTP_DEBIT,
  RULE_COERCIVE_DEADLINE,
  RULE_FREE_EMAIL_CLAIMING_ORG,
  RULE_LOOKALIKE_DOMAIN,
  RULE_PHISHING_LINK_STRUCTURAL,
  RULE_OFFICIAL_GOV_FEES,
  RULE_UNVERIFIED_LISTING,
  RULE_OFFICIAL_VERIFIED_DOMAIN,
  RULE_GENUINE_DISCLAIMER,
  RULE_OTP_SHARING,
  RULE_PHISHING_URGENT_ACTION,
  RULE_IMPERSONATION_AUTHORITY,
  RULE_TASK_SCAM,
  RULE_INVESTMENT_GUARANTEED_RETURNS,
  RULE_REMOTE_ACCESS_APP,
  RULE_UPI_COLLECT_REQUEST,
];
