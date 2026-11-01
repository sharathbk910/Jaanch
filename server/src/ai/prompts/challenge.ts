import { z } from 'zod';

export const ChallengeOutputSchema = z.object({
  subject: z.string().min(5).max(120),
  body: z.string().min(80).max(1200),
});

export type ChallengeOutput = z.infer<typeof ChallengeOutputSchema>;

export const CHALLENGE_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['subject', 'body'],
  properties: {
    subject: { type: 'string', minLength: 5, maxLength: 120 },
    body: { type: 'string', minLength: 80, maxLength: 1200 },
  },
};

export function buildChallengePrompt(params: {
  domain?: string;
  claimedOrg?: string;
  tone?: 'polite' | 'firm';
  senderName?: string;
}): string {
  const domain = params.domain || 'internship';
  const claimedOrg = params.claimedOrg || '';
  const tone = params.tone || 'polite';
  const senderName = params.senderName || '';

  return `Write a short, polite, professional email from a student to a recruiter/organizer whose message is under review.
Domain: ${domain}
Organization (may be empty): ${claimedOrg}
Tone: ${tone}
Student's first name (may be empty): ${senderName}

The email MUST ask for ALL of:
- the official company/organization domain and an official email address on it,
- company registration details (CIN / LLPIN or equivalent registration),
- a formal offer/selection letter on official letterhead with role, duration, and terms,
- confirmation that no fee or deposit is required at any stage (when applicable to the domain),
- the official channel through which the student can verify the opportunity.

Constraints: 90–150 words in the body. No threats, no accusations, no legal claims. Do not state that the sender is fraudulent. Do not include any information the student did not provide. End with a courteous sign-off using the student's first name if provided, otherwise "[Your Name]".`;
}

/**
 * Deterministic template fallback per SPEC_ORIGINAL Part A §15.2.
 * Satisfies all five requirements in 90–150 words, non-accusatory.
 */
export function buildChallengeTemplate(params: {
  domain?: string;
  claimedOrg?: string;
  tone?: 'polite' | 'firm';
  senderName?: string;
}): ChallengeOutput {
  const org = params.claimedOrg ? params.claimedOrg.trim() : 'your organization';
  const name = params.senderName ? params.senderName.trim() : '[Your Name]';
  const tone = params.tone || 'polite';

  const subject = `Verification Inquiry: Opportunity Details & Credentials – ${org}`;

  const body =
    tone === 'firm'
      ? `Dear Human Resources Team at ${org},

I am writing regarding the opportunity communicated to me. In accordance with my institution's placement cell verification protocol, I require official confirmation before proceeding.

Please provide the following credentials:
1. Your official corporate email address operating on ${org}'s primary domain.
2. The company registration details, including your Corporate Identification Number (CIN) or LLPIN.
3. A formal offer letter issued on official letterhead detailing the role scope, duration, and terms.
4. Written confirmation that no training fees, laptop security deposits, or advance charges apply at any stage.
5. The official portal or contact channel where this opportunity can be independently corroborated.

Thank you for your cooperation in maintaining safe recruitment standards.

Sincerely,
${name}`
      : `Dear Hiring Team at ${org},

Thank you for reaching out regarding this opportunity. As advised by my college academic guidelines, I need to corroborate the official details before taking any further steps.

Could you kindly share:
1. Confirmation from an official corporate email address on ${org}'s domain.
2. Your organization's official registration details, such as Corporate Identification Number (CIN) or LLPIN.
3. A formal offer or selection letter on official company letterhead specifying role and terms.
4. Clarification confirming that no upfront fees or security deposits are required at any point.
5. The public directory or portal where this placement can be independently verified.

I appreciate your time and assistance, and look forward to your response.

Warm regards,
${name}`;

  return { subject, body };
}
