import {
  AnalyzeRequestSchema,
  AnalyzeResultSchema,
  type AnalyzeRequestInput,
  type AnalyzeResult,
  type Signal,
} from './schemas/index.js';
import { normalizeForMatching } from './normalize/index.js';
import { extractEntities } from './entities/index.js';
import { RULE_CATALOG } from './rules/catalog.js';
import { computeStatus } from './status/computeStatus.js';

export * from './schemas/index.js';
export * from './normalize/index.js';
export * from './privacy/redact.js';
export * from './entities/index.js';
export * from './links/index.js';
export * from './rules/catalog.js';
export * from './rules/negation.js';
export * from './status/computeStatus.js';

export const JAANCH_VERSION = '1.0.0';
export const JAANCH_SHARED_VERSION = '1.0.0';

const MAX_INPUT_LENGTH = 50000;

/**
 * Main deterministic offer analysis entrypoint
 */
export function analyzeOffer(rawRequest: AnalyzeRequestInput): AnalyzeResult {
  const request = AnalyzeRequestSchema.parse(rawRequest);

  // Input length protection
  const text = request.text.slice(0, MAX_INPUT_LENGTH);
  const normalizedForMatching = normalizeForMatching(text);

  // 1. Extract raw entities
  const rawEntities = extractEntities(text);

  // 2. Evaluate all 8 deterministic rules
  const signals: Signal[] = [];
  for (const rule of RULE_CATALOG) {
    const signal = rule.evaluate(normalizedForMatching, text, rawEntities, request.sender);
    if (signal) {
      signals.push(signal);
    }
  }

  // 3. Compute 4-verdict status & recommendations
  const statusResult = computeStatus(signals, rawEntities, request.sender);

  // 4. Consent-gated indicator sharing (Extraction runs on raw text before redaction; indicators are only returned if shareIndicators is set)
  const shouldShareIndicators = request.consentFlags?.shareIndicators === true;
  const returnedEntities = shouldShareIndicators
    ? rawEntities
    : {
        urls: [],
        domains: [],
        emails: [],
        phones: [],
        upiHandles: [],
        amounts: rawEntities.amounts,
        organization: rawEntities.organization,
      };

  // 5. Generate deterministic audit ID
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const result: AnalyzeResult = {
    status: statusResult.status,
    signals,
    unverified: statusResult.unverified,
    extractedEntities: returnedEntities,
    confidenceScore: statusResult.confidenceScore,
    recommendedActions: statusResult.recommendedActions,
    auditId,
  };

  return AnalyzeResultSchema.parse(result);
}
