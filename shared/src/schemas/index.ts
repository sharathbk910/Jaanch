import { z } from 'zod';

export const OpportunityDomainSchema = z.enum([
  'job',
  'internship',
  'scholarship',
  'freelance',
  'competition',
  'other',
  'general_message',
]);
export type OpportunityDomain = z.infer<typeof OpportunityDomainSchema>;

export const ConsentFlagsSchema = z.object({
  aiAnalysis: z.boolean().default(false),
  shareIndicators: z.boolean().default(false),
});
export type ConsentFlags = z.infer<typeof ConsentFlagsSchema>;

export const VerificationStatusSchema = z.enum([
  'LIKELY_GENUINE',
  'NEEDS_REVIEW',
  'HIGH_CONCERN',
  'CONFIRMED_SCAM',
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const SignalSeveritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);
export type SignalSeverity = z.infer<typeof SignalSeveritySchema>;

export const SignalSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  title: z.string(),
  whyItMatters: z.string(),
  evidence: z.string(),
  severity: SignalSeveritySchema,
});
export type Signal = z.infer<typeof SignalSchema>;

export const ExtractedEntitiesSchema = z.object({
  urls: z.array(z.string()),
  domains: z.array(z.string()),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  upiHandles: z.array(z.string()),
  amounts: z.array(z.string()),
  organization: z.string().nullable(),
});
export type ExtractedEntities = z.infer<typeof ExtractedEntitiesSchema>;

export const IntelMatchSchema = z.object({
  id: z.string(),
  entityType: z.enum(['email', 'domain', 'phone', 'upi', 'bank_account']),
  valueHash: z.string(),
  status: z.enum(['reported', 'unverified', 'ai_flagged', 'suspicious', 'confirmed', 'dismissed', 'disputed']),
  notes: z.string().optional(),
  confirmedAt: z.string().optional(),
});
export type IntelMatch = z.infer<typeof IntelMatchSchema>;

export const SenderDetailsSchema = z.object({
  email: z.string().optional(),
  domain: z.string().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  isOfficialCorporateDomain: z.boolean().optional(),
});
export type SenderDetails = z.infer<typeof SenderDetailsSchema>;

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1, 'Input text cannot be empty'),
  domain: OpportunityDomainSchema.default('other'),
  sender: SenderDetailsSchema.optional(),
  consentFlags: ConsentFlagsSchema.default({ aiAnalysis: false, shareIndicators: false }),
  runOfflineOnly: z.boolean().default(true),
});
export type AnalyzeRequestInput = z.input<typeof AnalyzeRequestSchema>;
export type AnalyzeRequest = z.output<typeof AnalyzeRequestSchema>;

export const AnalyzeResultSchema = z.object({
  status: VerificationStatusSchema,
  signals: z.array(SignalSchema),
  unverified: z.array(z.string()),
  extractedEntities: ExtractedEntitiesSchema,
  confidenceScore: z.number().min(0).max(100),
  recommendedActions: z.array(z.string()),
  auditId: z.string(),
  intelMatch: IntelMatchSchema.optional(),
});
export type AnalyzeResult = z.infer<typeof AnalyzeResultSchema>;
