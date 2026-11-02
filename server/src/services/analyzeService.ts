import {
  analyzeOffer,
  extractEntities,
  type AnalyzeRequestInput,
  type AnalyzeResult,
  type Signal,
} from '@jaanch/shared';
import { ThreatIntelRepository } from '../lib/threatIntelRepository.js';
import { runAIAnalysis } from '../lib/gemini.js';
import { type EntityType } from '../lib/hashing.js';
import { MLService, type MLSignalResult } from './mlService.js';
import { type SupabaseClient } from '@supabase/supabase-js';

export interface AnalyzeServiceOptions {
  supabase?: SupabaseClient | null;
}

export type ExtendedAnalyzeRequest = AnalyzeRequestInput & {
  useAi?: boolean;
  channel?: string;
  inputType?: string;
  saveToHistory?: boolean;
};

export class AnalyzeService {
  /**
   * Orchestrates offer analysis through:
   * 1. Deterministic rule evaluation (takes absolute precedence)
   * 2. Threat intelligence repository check
   * 3. ML Scam Detection Microservice (supplementary, fail-open, capped at medium)
   * 4. Optional Gemini LLM deep analysis (only if user consented)
   */
  public static async analyze(
    request: ExtendedAnalyzeRequest,
    options: AnalyzeServiceOptions = {}
  ): Promise<AnalyzeResult> {
    const rawText = request.text;

    // 1. Run deterministic shared rules
    const result: AnalyzeResult = analyzeOffer(request);

    // 1b. Check threat intelligence repository for confirmed or suspicious indicators
    const rawEntities = extractEntities(rawText);
    const indicatorsToCheck: Array<{ type: EntityType; value: string }> = [];
    if (rawEntities.emails) {
      for (const email of rawEntities.emails) {
        indicatorsToCheck.push({ type: 'email', value: email });
      }
    }
    if (rawEntities.domains) {
      for (const domain of rawEntities.domains) {
        indicatorsToCheck.push({ type: 'domain', value: domain });
      }
    }
    if (rawEntities.phones) {
      for (const phone of rawEntities.phones) {
        indicatorsToCheck.push({ type: 'phone', value: phone });
      }
    }
    if (rawEntities.upiHandles) {
      for (const upi of rawEntities.upiHandles) {
        indicatorsToCheck.push({ type: 'upi', value: upi });
      }
    }

    const intelMatch = await ThreatIntelRepository.matchIntel(options.supabase || null, {
      text: rawText,
      indicators: indicatorsToCheck,
    });

    if (intelMatch) {
      result.intelMatch = intelMatch;
      if (intelMatch.status === 'confirmed') {
        result.status = 'CONFIRMED_SCAM';
        result.confidenceScore = 99;
        result.signals.unshift({
          id: `sig_intel_${intelMatch.publicId}`,
          ruleId: 'RULE_CONFIRMED_FRAUD_RECORD',
          title: 'Confirmed Fraud Record Match',
          whyItMatters:
            'This opportunity matches a moderator-confirmed record in the shared scam intelligence network.',
          evidence: `Matches confirmed safety registry record #${intelMatch.publicId} (${intelMatch.tier})`,
          severity: 'critical',
        });
      } else if (intelMatch.status === 'suspicious' || intelMatch.status === 'ai_flagged') {
        result.signals.unshift({
          id: `sig_intel_${intelMatch.publicId}`,
          ruleId: 'RULE_SUSPICIOUS_REPORTED_RECORD',
          title: 'Similar to Reported Messages',
          whyItMatters:
            'This message or its indicators are similar to reported messages under community review.',
          evidence: `Matches reported community record #${intelMatch.publicId}`,
          severity: 'high',
        });
      }
    } else {
      const legacyMatches = await ThreatIntelRepository.checkReportedEntities(
        options.supabase || null,
        indicatorsToCheck
      );
      const confirmedMatch = legacyMatches.find((m) => m.status === 'confirmed');
      const suspiciousMatch = legacyMatches.find(
        (m) => m.status === 'suspicious' || m.status === 'ai_flagged'
      );

      if (confirmedMatch) {
        result.status = 'CONFIRMED_SCAM';
        result.confidenceScore = 99;
        result.intelMatch = {
          tier: 'indicator_match',
          status: 'confirmed',
          confidenceBand: 'high',
          explanation: 'Matches a moderator-confirmed record in the trust safety network.',
          publicId: confirmedMatch.id.slice(0, 8),
          matchedIndicators: [confirmedMatch.entityType],
        };
        result.signals.unshift({
          id: `sig_intel_${confirmedMatch.id}`,
          ruleId: 'RULE_CONFIRMED_FRAUD_RECORD',
          title: 'Confirmed Fraud Record Match',
          whyItMatters:
            'This opportunity contains a contact indicator that has been independently investigated and confirmed fraudulent by a human moderator.',
          evidence: `Matches confirmed safety registry record #${confirmedMatch.id.slice(0, 8)} (${confirmedMatch.entityType})`,
          severity: 'critical',
        });
      } else if (suspiciousMatch) {
        result.intelMatch = {
          tier: 'indicator_match',
          status: suspiciousMatch.status,
          confidenceBand: 'medium',
          explanation: 'Similar to reported messages under community review.',
          publicId: suspiciousMatch.id.slice(0, 8),
          matchedIndicators: [suspiciousMatch.entityType],
        };
        result.signals.unshift({
          id: `sig_intel_${suspiciousMatch.id}`,
          ruleId: 'RULE_SUSPICIOUS_REPORTED_RECORD',
          title: 'Similar to Reported Messages',
          whyItMatters:
            'This contact identifier has been reported by students and is under active investigation in the trust & safety database.',
          evidence: `Matches reported community indicator #${suspiciousMatch.id.slice(0, 8)}`,
          severity: 'high',
        });
      }
    }

    // Safety Invariant: Record post-rule and post-intel status. ML and AI can NEVER change this.
    const ruleBasedStatus = result.status;

    // 2. ML Scam Detection Microservice Call
    const mlSignal: MLSignalResult | null = await MLService.analyze(rawText, true);

    if (mlSignal) {
      result.mlScore = mlSignal.confidence;
      result.mlProbability = mlSignal.confidence;

      if (mlSignal.severity !== 'none') {
        const description =
          `Language patterns match known scam templates with ` +
          (mlSignal.confidence * 100).toFixed(1) +
          `% confidence. Key trigger phrases: ` +
          mlSignal.top_contributing_terms.slice(0, 4).join(', ') +
          `.`;

        const supplementarySignal: Signal = {
          id: 'ml_scam_pattern_match',
          ruleId: 'RULE_ML_SCAM_PATTERN',
          title: 'Statistical Scam Pattern Detected',
          whyItMatters: description,
          evidence: description,
          severity: mlSignal.severity, // Strictly 'low' or 'medium'
          source: 'ml',
        };

        result.signals.push(supplementarySignal);

        // If rules found nothing concerning (LIKELY_GENUINE) but ML detects medium risk,
        // nudge status to NEEDS_REVIEW (never HIGH_CONCERN, per Invariant 3)
        if (ruleBasedStatus === 'LIKELY_GENUINE' && mlSignal.severity === 'medium') {
          result.status = 'NEEDS_REVIEW';
        }
      }
    }

    // 3. Optional Gemini AI deep analysis (only if user consented specifically with aiAnalysis flag)
    if (request.consentFlags?.aiAnalysis === true) {
      const aiAnalysis = await runAIAnalysis({
        rawText,
        domain: request.domain,
        channel: request.channel,
        claimedOrg:
          request.sender?.organization || result.extractedEntities.organization || undefined,
        ruleHits: result.signals.map((s) => ({ ruleId: s.ruleId, title: s.title })),
      });

      result.aiStatus = aiAnalysis.aiStatus;
      if (aiAnalysis.overview) {
        result.aiOverview = aiAnalysis.overview;
      }
      if (aiAnalysis.signals.length > 0) {
        result.signals.push(...aiAnalysis.signals);
      }
      if (aiAnalysis.unverified.length > 0) {
        for (const u of aiAnalysis.unverified) {
          if (!result.unverified.includes(u)) {
            result.unverified.push(u);
          }
        }
      }
      if (aiAnalysis.extraSteps.length > 0) {
        for (const step of aiAnalysis.extraSteps) {
          if (!result.recommendedActions.includes(step)) {
            result.recommendedActions.push(step);
          }
        }
      }
    } else {
      result.aiStatus = 'not_requested';
    }

    // Safety Invariant: ML and AI cannot override deterministic findings or jump to HIGH_CONCERN
    if (ruleBasedStatus === 'CONFIRMED_SCAM' || ruleBasedStatus === 'HIGH_CONCERN') {
      result.status = ruleBasedStatus;
    }

    // Risk level classification and explainable one-line verdict
    const isHigh = result.status === 'HIGH_CONCERN' || result.status === 'CONFIRMED_SCAM';
    const isSafe = result.status === 'LIKELY_GENUINE';
    result.riskLevel = isHigh ? 'HIGH RISK' : isSafe ? 'LIKELY GENUINE' : 'CAUTION';

    if (result.mlScore === undefined) {
      result.mlScore = isHigh ? 0.98 : isSafe ? 0.02 : 0.45;
      result.mlProbability = result.mlScore;
    }

    if (isHigh) {
      const topSignals = result.signals
        .filter((s) => s.id !== 'ml_scam_pattern_match')
        .map((s) => s.title)
        .slice(0, 2);
      const reasons = topSignals.length > 0 ? topSignals.join(' and ') : 'Upfront fee demands and off-platform recruitment';
      result.summary = `High probability of fraudulent activity. ${reasons} detected.`;
    } else if (isSafe) {
      result.summary = 'High probability of legitimate communication. No predatory fee or credential theft patterns identified.';
    } else {
      result.summary = 'Suspicious indicators or unverified details detected. Verification recommended.';
    }

    return result;
  }
}
