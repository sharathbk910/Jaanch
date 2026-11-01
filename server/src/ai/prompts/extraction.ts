import { z } from 'zod';

export const ExtractedFieldItemSchema = z
  .object({
    value: z.string().max(200),
    evidenceQuote: z.string().min(3).max(300),
  })
  .nullable();

export const ExtractionOutputSchema = z.object({
  fields: z.object({
    organization: ExtractedFieldItemSchema.optional(),
    roleOrProgram: ExtractedFieldItemSchema.optional(),
    eligibility: ExtractedFieldItemSchema.optional(),
    locationOrMode: ExtractedFieldItemSchema.optional(),
    duration: ExtractedFieldItemSchema.optional(),
    compensation: ExtractedFieldItemSchema.optional(),
    selectionProcess: ExtractedFieldItemSchema.optional(),
    deadline: ExtractedFieldItemSchema.optional(),
    contactChannel: ExtractedFieldItemSchema.optional(),
    officialLink: ExtractedFieldItemSchema.optional(),
  }),
});

export type ExtractionOutput = z.infer<typeof ExtractionOutputSchema>;

export const EXTRACTION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['fields'],
  properties: {
    fields: {
      type: 'object',
      additionalProperties: false,
      properties: {
        organization: { $ref: '#/$defs/f' },
        roleOrProgram: { $ref: '#/$defs/f' },
        eligibility: { $ref: '#/$defs/f' },
        locationOrMode: { $ref: '#/$defs/f' },
        duration: { $ref: '#/$defs/f' },
        compensation: { $ref: '#/$defs/f' },
        selectionProcess: { $ref: '#/$defs/f' },
        deadline: { $ref: '#/$defs/f' },
        contactChannel: { $ref: '#/$defs/f' },
        officialLink: { $ref: '#/$defs/f' },
      },
    },
  },
  $defs: {
    f: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          additionalProperties: false,
          required: ['value', 'evidenceQuote'],
          properties: {
            value: { type: 'string', maxLength: 200 },
            evidenceQuote: { type: 'string', minLength: 3, maxLength: 300 },
          },
        },
      ],
    },
  },
};

export function buildExtractionPrompt(redactedText: string, missedFields: string[]): string {
  const safeRedacted = redactedText.replace(/<\/untrusted_message>/gi, '');
  const fieldsList = missedFields.length > 0 ? missedFields.join(', ') : 'all offer details';

  return `The following student opportunity message was processed by a deterministic extractor.
Please examine the message text to fill in ONLY the following missing fields:
${fieldsList}

Task:
- For each field, extract the factual value and the exact evidenceQuote from the message.
- If a detail is missing, vague, or not mentioned, return null for that field. Never guess or invent details.
- evidenceQuote MUST be an exact contiguous quote from the text.

<untrusted_message>
${safeRedacted}
</untrusted_message>`;
}

