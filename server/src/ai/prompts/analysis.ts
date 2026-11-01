import { z } from 'zod';

export const AdditionalSignalSchema = z.object({
  title: z.string().max(100),
  category: z.enum([
    'payment',
    'urgency',
    'data_request',
    'missing_details',
    'channel',
    'too_good_to_be_true',
  ]),
  severity: z.enum(['high', 'medium', 'low']),
  whyItMatters: z.string().max(300),
  evidenceQuote: z.string().min(3).max(300),
});

export const UnverifiedItemSchema = z.object({
  item: z.string().max(120),
  howToVerify: z.string().max(300),
});

export const AnalysisOutputSchema = z.object({
  additionalSignals: z.array(AdditionalSignalSchema).max(5),
  unverified: z.array(UnverifiedItemSchema).max(6),
  extraVerificationSteps: z.array(z.string().max(200)).max(4),
  overview: z.string().max(400),
  textOnlyConfidence: z.enum(['low', 'medium', 'high']),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

export const ANALYSIS_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'additionalSignals',
    'unverified',
    'extraVerificationSteps',
    'overview',
    'textOnlyConfidence',
  ],
  properties: {
    additionalSignals: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'category', 'severity', 'whyItMatters', 'evidenceQuote'],
        properties: {
          title: { type: 'string', maxLength: 100 },
          category: {
            type: 'string',
            enum: [
              'payment',
              'urgency',
              'data_request',
              'missing_details',
              'channel',
              'too_good_to_be_true',
            ],
          },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          whyItMatters: { type: 'string', maxLength: 300 },
          evidenceQuote: { type: 'string', minLength: 3, maxLength: 300 },
        },
      },
    },
    unverified: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['item', 'howToVerify'],
        properties: {
          item: { type: 'string', maxLength: 120 },
          howToVerify: { type: 'string', maxLength: 300 },
        },
      },
    },
    extraVerificationSteps: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string', maxLength: 200 },
    },
    overview: { type: 'string', maxLength: 400 },
    textOnlyConfidence: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
};

export function buildAnalysisPrompt(params: {
  domain?: string;
  channel?: string;
  claimedOrg?: string;
  ruleHits?: Array<{ ruleId: string; title: string }>;
  redactedText: string;
}): string {
  const domain = params.domain || 'other';
  const channel = params.channel || 'other';
  const claimedOrg = params.claimedOrg || 'Not specified';
  const ruleHitsLines =
    params.ruleHits && params.ruleHits.length > 0
      ? params.ruleHits.map((h) => `- [${h.ruleId}] ${h.title}`).join('\n')
      : 'None (no hard disqualifiers detected by deterministic rule pass)';

  // Security: neutralise closing tag in untrusted user text
  const safeRedacted = params.redactedText.replace(/<\/untrusted_message>/gi, '');

  return `Opportunity domain: ${domain}
How it reached the user: ${channel}
Organization claimed by user (may be empty): ${claimedOrg}

Rule-engine findings already detected (for context; do not repeat them unless you add new insight):
${ruleHitsLines}

Task:
1. Identify ADDITIONAL warning signs not already covered by the rule findings, each with an exact evidenceQuote from the message.
2. List what remains UNVERIFIED and how the user can verify each item independently.
3. Suggest up to 4 extra verification steps specific to this message and domain.
4. Write a 2-sentence plain-language overview for a student. Do not give a verdict.
5. Give your confidence (low|medium|high) in how much the text alone can tell us.

<untrusted_message>
${safeRedacted}
</untrusted_message>`;
}
