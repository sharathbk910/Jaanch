import type { Signal, ExtractedEntities, SenderDetails } from '../schemas/index.js';
import { isNegatedInClause } from './negation.js';
import { findSpan } from '../normalize/index.js';
import { detectLookalikeDomain } from '../links/index.js';

export interface RuleDefinition {
  id: string;
  title: string;
  whyItMatters: string;
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

export const RULE_OFFICIAL_GOV_FEES: RuleDefinition = {
  id: 'RULE_OFFICIAL_GOV_FEES',
  title: 'Government Scheme Demanding Upfront Fee or Using Non-Gov Domain',
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
  whyItMatters:
    'The opportunity lacks an independently matched listing on the company careers page or verified portal.',
  isHardDisqualifier: false,
  evaluate: (_normalizedText, _rawText, entities, sender) => {
    // Fires when an offer mentions an organization but has no official domain verification
    if (entities.organization && !sender?.isOfficialCorporateDomain) {
      return {
        id: 'SIG-UNVERIFIED-LISTING',
        ruleId: 'RULE_UNVERIFIED_LISTING',
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

export const RULE_GENUINE_DISCLAIMER: RuleDefinition = {
  id: 'RULE_GENUINE_DISCLAIMER',
  title: 'Official Non-Fee Recruitment Policy Disclaimer Present',
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

export const RULE_CATALOG: RuleDefinition[] = [
  RULE_UPFRONT_FEE,
  RULE_BANK_OTP_DEBIT,
  RULE_COERCIVE_DEADLINE,
  RULE_FREE_EMAIL_CLAIMING_ORG,
  RULE_LOOKALIKE_DOMAIN,
  RULE_OFFICIAL_GOV_FEES,
  RULE_UNVERIFIED_LISTING,
  RULE_GENUINE_DISCLAIMER,
];
