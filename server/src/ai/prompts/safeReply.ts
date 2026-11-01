import { z } from 'zod';

export const SafeReplyOutputSchema = z.object({
  subject: z.string().min(5).max(120),
  body: z.string().min(80).max(1200),
});

export type SafeReplyOutput = z.infer<typeof SafeReplyOutputSchema>;

export const SAFE_REPLY_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['subject', 'body'],
  properties: {
    subject: { type: 'string', minLength: 5, maxLength: 120 },
    body: { type: 'string', minLength: 80, maxLength: 1200 },
  },
};

export function buildSafeReplyPrompt(params: {
  domain?: string;
  claimedOrg?: string;
  tone?: 'polite' | 'firm';
  senderName?: string;
}): string {
  const domain = params.domain || 'internship';
  const claimedOrg = params.claimedOrg || '';
  const tone = params.tone || 'polite';
  const senderName = params.senderName || '';

  return `Write a short, polite, professional safe reply email from a student to a recruiter/organizer.
Domain: ${domain}
Organization (may be empty): ${claimedOrg}
Tone: ${tone}
Student's first name (may be empty): ${senderName}

The email MUST:
- thank the sender for reaching out,
- share NO personal data, bank details, or identity documents,
- confirm student interest conditionally subject to verification,
- request the official email domain and corporate contact,
- request a written description of the selection and interview process,
- request clarification on the exact meaning of "registration" with confirmation that no fee applies,
- request a formal offer or selection letter on official company letterhead.

Constraints: 90–150 words in the body. No threats, no accusations, no legal claims. Do not state that the sender is fraudulent. End with a courteous sign-off using the student's first name if provided, otherwise "[Your Name]".`;
}

/**
 * Deterministic template fallback per SPEC_ORIGINAL Part C §9.
 */
export function buildSafeReplyTemplate(params: {
  domain?: string;
  claimedOrg?: string;
  tone?: 'polite' | 'firm';
  senderName?: string;
}): SafeReplyOutput {
  const org = params.claimedOrg ? params.claimedOrg.trim() : 'your organization';
  const name = params.senderName ? params.senderName.trim() : '[Your Name]';

  const subject = `Re: Application & Verification Inquiry – ${org}`;

  const body = `Dear Hiring Team at ${org},

Thank you for reaching out regarding this opportunity. I am interested in the role subject to my academic institution's placement verification requirements.

Before submitting any documentation or completing onboarding steps, could you please provide:
1. Communication from your official corporate email domain representing ${org}.
2. A written outline of the evaluation, selection, and interview process.
3. Clarification on what "registration" entails, confirming that no registration fee or security deposit applies at any stage.
4. A formal offer letter issued on official company letterhead detailing scope, duration, and terms.

In line with campus safety guidelines, I do not transfer advance deposits or submit unredacted personal ID documents prior to formal verification.

Thank you for your time, and I look forward to hearing from you.

Best regards,
${name}`;

  return { subject, body };
}
