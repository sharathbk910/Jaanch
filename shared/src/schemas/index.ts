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

export const SignalCategorySchema = z.enum([
  'financial_demand',
  'credential_theft',
  'urgency_pressure',
  'unverified_contact',
  'brand_impersonation',
  'gov_scheme_abuse',
  'unverified_listing',
  'official_disclaimer',
  'phishing_lure',
  'task_fraud',
  'remote_access',
  'suspicious_link',
  'other',
]);
export type SignalCategory = z.infer<typeof SignalCategorySchema>;

export const SignalSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  category: SignalCategorySchema.optional(),
  title: z.string(),
  whyItMatters: z.string(),
  evidence: z.string(),
  severity: SignalSeveritySchema,
  source: z.string().optional(),
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
  tier: z.enum(['exact_text', 'indicator_match', 'similarity', 'semantic']).default('indicator_match'),
  status: z.enum(['reported', 'unverified', 'ai_flagged', 'suspicious', 'confirmed', 'dismissed', 'disputed']),
  confidenceBand: z.enum(['very_high', 'high', 'medium', 'low']).default('medium'),
  explanation: z.string(),
  publicId: z.string(),
  matchedIndicators: z.array(z.string()).default([]),
  matchedTokens: z.array(z.string()).optional(),
  similarityScore: z.number().optional(),
  id: z.string().optional(),
  entityType: z.enum(['email', 'domain', 'phone', 'upi', 'bank_account', 'text']).optional(),
  valueHash: z.string().optional(),
  notes: z.string().optional(),
  confirmedAt: z.string().optional(),
});
export type IntelMatch = z.infer<typeof IntelMatchSchema>;

export const SubmitReportRequestSchema = z.object({
  text: z.string().min(25, 'Text must be at least 25 characters for reporting').max(50000),
  category: z.string().default('other'),
  indicators: z
    .array(
      z.object({
        type: z.enum(['url', 'domain', 'phone', 'upi']),
        value: z.string().min(2).max(255),
        maskedDisplay: z.string().optional(),
      })
    )
    .optional(),
  shareIndicators: z.boolean(),
});
export type SubmitReportRequest = z.infer<typeof SubmitReportRequestSchema>;

export const DisputeRecordRequestSchema = z.object({
  publicId: z.string().min(4).max(64),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(2000),
  contactEmail: z.string().email().optional(),
});
export type DisputeRecordRequest = z.infer<typeof DisputeRecordRequestSchema>;

export const ModerationActionRequestSchema = z.object({
  action: z.enum(['confirm', 'dismiss', 'dispute', 'retract', 'edit_scrubbing']),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000),
  newScrubbedText: z.string().max(50000).optional(),
});
export type ModerationActionRequest = z.infer<typeof ModerationActionRequestSchema>;

export const SenderDetailsSchema = z.object({
  email: z.string().optional(),
  domain: z.string().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  isOfficialCorporateDomain: z.boolean().optional(),
  headers: z.string().optional(),
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

export const AiStatusSchema = z.enum([
  'success',
  'disabled',
  'timeout',
  'api_error',
  'invalid_output',
  'not_requested',
]);
export type AiStatus = z.infer<typeof AiStatusSchema>;

export const AnalyzeResultSchema = z.object({
  status: VerificationStatusSchema,
  signals: z.array(SignalSchema),
  unverified: z.array(z.string()),
  extractedEntities: ExtractedEntitiesSchema,
  confidenceScore: z.number().min(0).max(100),
  recommendedActions: z.array(z.string()),
  auditId: z.string(),
  intelMatch: IntelMatchSchema.optional(),
  aiStatus: AiStatusSchema.optional(),
  aiOverview: z.string().optional(),
});
export type AnalyzeResult = z.infer<typeof AnalyzeResultSchema>;
