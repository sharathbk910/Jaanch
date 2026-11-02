import type {
  Signal,
  VerificationStatus,
  ExtractedEntities,
  SenderDetails,
} from '../schemas/index.js';

export interface ComputeStatusResult {
  status: VerificationStatus;
  confidenceScore: number;
  unverified: string[];
  recommendedActions: string[];
}

const HARD_DISQUALIFIER_RULES = new Set([
  'RULE_UPFRONT_FEE',
  'RULE_BANK_OTP_DEBIT',
  'RULE_OFFICIAL_GOV_FEES',
  'RULE_LOOKALIKE_DOMAIN',
  'RULE_PHISHING_LINK_STRUCTURAL',
  'RULE_OTP_SHARING',
  'RULE_PHISHING_URGENT_ACTION',
  'RULE_IMPERSONATION_AUTHORITY',
  'RULE_TASK_SCAM',
  'RULE_INVESTMENT_GUARANTEED_RETURNS',
  'RULE_REMOTE_ACCESS_APP',
  'RULE_UPI_COLLECT_REQUEST',
  'RULE_EMAIL_DMARC_FAILED',
  'RULE_EMAIL_SPF_FAILED',
]);

const COERCIVE_OR_FREE_MAIL_RULES = new Set([
  'RULE_COERCIVE_DEADLINE',
  'RULE_FREE_EMAIL_CLAIMING_ORG',
]);

/**
 * Computes deterministic offer verification status based on evaluated signals.
 * Invariant: CONFIRMED_SCAM can never be produced by this library (requires Phase 7 moderator intelligence).
 */
export function computeStatus(
  signals: Signal[],
  entities: ExtractedEntities,
  sender?: SenderDetails
): ComputeStatusResult {
  const signalRuleIds = new Set(signals.map((s) => s.ruleId));

  // Determine negative signals vs positive evidence
  const hasHardDisqualifier = signals.some((s) => HARD_DISQUALIFIER_RULES.has(s.ruleId));
  const coerciveOrFreeMailHits = signals.filter((s) =>
    COERCIVE_OR_FREE_MAIL_RULES.has(s.ruleId)
  );
  const hasPositiveEvidence =
    signalRuleIds.has('RULE_GENUINE_DISCLAIMER') ||
    signalRuleIds.has('RULE_OFFICIAL_VERIFIED_DOMAIN') ||
    sender?.isOfficialCorporateDomain === true;

  const negativeSignals = signals.filter(
    (s) => s.ruleId !== 'RULE_GENUINE_DISCLAIMER' && s.severity !== 'info'
  );

  let status: VerificationStatus = 'NEEDS_REVIEW';
  let confidenceScore = 50;

  // 1. Hard disqualifiers -> HIGH_CONCERN
  if (hasHardDisqualifier) {
    status = 'HIGH_CONCERN';
    confidenceScore = 92;
  }
  // 2. Coercive deadline or free email claiming org:
  //    - Two or more combined -> HIGH_CONCERN
  //    - Single -> NEEDS_REVIEW
  else if (coerciveOrFreeMailHits.length >= 2) {
    status = 'HIGH_CONCERN';
    confidenceScore = 80;
  } else if (coerciveOrFreeMailHits.length === 1) {
    status = 'NEEDS_REVIEW';
    confidenceScore = 65;
  }
  // 3. Positive evidence check:
  //    LIKELY_GENUINE only with NO negative signals AND positive evidence; otherwise NEEDS_REVIEW
  else if (negativeSignals.length === 0 && hasPositiveEvidence) {
    status = 'LIKELY_GENUINE';
    confidenceScore = 85;
  } else {
    status = 'NEEDS_REVIEW';
    confidenceScore = negativeSignals.length > 0 ? 60 : 45;
  }

  // Populate unverified items
  const unverified: string[] = [];

  if (!sender?.isOfficialCorporateDomain) {
    unverified.push('Sender email domain has not been verified against an official enterprise registry.');
  }
  if (!entities.organization) {
    unverified.push('Organization identity could not be deterministically resolved from the message.');
  } else {
    unverified.push(`Official careers page listing for "${entities.organization}" has not been matched.`);
  }
  if (entities.phones.length > 0) {
    unverified.push('Contact phone numbers have not been verified against published corporate directories.');
  }
  unverified.push('Independent Certificate Transparency logs and domain age records have not been queried.');

  // Populate recommended actions
  const recommendedActions: string[] = [];

  if (status === 'HIGH_CONCERN') {
    recommendedActions.push('Do not transfer any money, registration fees, or security deposits.');
    recommendedActions.push('Do not share OTPs, card credentials, Aadhaar details, or passwords.');
    recommendedActions.push('Report fraudulent communication to the National Cybercrime Portal (cybercrime.gov.in or dial 1930).');
  } else if (status === 'NEEDS_REVIEW') {
    recommendedActions.push("Independently locate the company's official careers portal using a direct search engine query.");
    recommendedActions.push('Contact the organization directly via official verified telephone numbers or support emails.');
    recommendedActions.push('Consult your college placement officer or university department before committing.');
  } else {
    recommendedActions.push('Verify the formal offer letter on the organization official internal portal.');
    recommendedActions.push('Ensure all further communications remain strictly on the verified corporate domain.');
  }

  return {
    status,
    confidenceScore,
    unverified,
    recommendedActions,
  };
}
