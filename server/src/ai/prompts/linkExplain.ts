import { z } from 'zod';

export const LinkExplainOutputSchema = z.object({
  plainExplanation: z.string().max(400),
  whatToCheckNext: z.array(z.string().max(160)).max(4),
});

export type LinkExplainOutput = z.infer<typeof LinkExplainOutputSchema>;

export const LINK_EXPLAIN_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['plainExplanation', 'whatToCheckNext'],
  properties: {
    plainExplanation: { type: 'string', maxLength: 400 },
    whatToCheckNext: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string', maxLength: 160 },
    },
  },
};

export interface LinkObservationsData {
  hostname: string;
  registrableDomain?: string;
  observations: string[];
  rdapAgeDays?: number | 'unknown';
  lookalikeTarget?: string;
}

export function buildLinkExplainPrompt(data: LinkObservationsData): string {
  const ageStr =
    typeof data.rdapAgeDays === 'number'
      ? `${data.rdapAgeDays} days old`
      : 'Unknown domain age';

  return `Explain the following domain/URL observations clearly for a student.
Hostname: ${data.hostname}
Registrable domain: ${data.registrableDomain || data.hostname}
Domain registration age: ${ageStr}
Lookalike impersonation detected: ${data.lookalikeTarget || 'None'}

Observed technical signals:
${data.observations.map((o) => `- ${o}`).join('\n') || '- Standard domain format'}

Task:
1. Write a 2-sentence plain-language explanation of what these observations mean in terms of caution. Do not make claims beyond the supplied observations.
2. List up to 4 concrete things the student should check next before trusting or logging into this site.`;
}

/**
 * Deterministic template fallback per SPEC_ORIGINAL Part A §15.3.
 */
export function buildLinkExplainTemplate(data: LinkObservationsData): LinkExplainOutput {
  const host = data.hostname;
  const isLookalike = Boolean(data.lookalikeTarget);
  const isRecent = typeof data.rdapAgeDays === 'number' && data.rdapAgeDays < 90;

  let plainExplanation = `The domain ${host} was inspected using structured domain indicators. `;
  if (isLookalike) {
    plainExplanation += `It resembles legitimate organization "${data.lookalikeTarget}" using typosquatting patterns. Extreme caution is advised.`;
  } else if (isRecent) {
    plainExplanation += `This domain was registered very recently (${data.rdapAgeDays} days ago). Newly created domains require independent verification.`;
  } else if (data.observations.length > 0) {
    plainExplanation += `The domain exhibits patterns that warrant caution: ${data.observations.slice(0, 2).join('; ')}.`;
  } else {
    plainExplanation += `No obvious structural red flags were found in the domain name format, but always verify authenticity directly.`;
  }

  const whatToCheckNext: string[] = [
    `Search for "${data.lookalikeTarget || host}" directly on Google or official social channels instead of clicking links.`,
    'Check if this exact link is published on the official company careers portal.',
    'Never enter passwords, OTPs, or bank account numbers on unverified domains.',
  ];

  return {
    plainExplanation: plainExplanation.slice(0, 400),
    whatToCheckNext: whatToCheckNext.slice(0, 4),
  };
}
