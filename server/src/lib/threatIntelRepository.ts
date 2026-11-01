import { type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { loadEnv } from '../config/env.js';
import { logger } from './logger.js';
import {
  hashEntity,
  normalizeEntityValue,
  hashNormalizedText,
  hashIndicatorPeppered,
  maskIndicator,
  generateIntelPublicId,
  type EntityType,
  type IndicatorType,
} from './hashing.js';
import { writeAuditLog } from './auditLog.js';
import { type IntelMatch, computeShingleJaccard } from '@jaanch/shared';
import { getEmbeddingProvider, cosineSimilarity } from './embeddings.js';

export const INTEL_THRESHOLDS = {
  SIMILARITY_JACCARD_MIN: 0.45,
  SIMILARITY_HIGH_CONFIDENCE: 0.65,
  SEMANTIC_COSINE_MIN: 0.75,
  SEMANTIC_HIGH_CONFIDENCE: 0.85,
};

export type ThreatEntityStatus =
  | 'reported'
  | 'unverified'
  | 'ai_flagged'
  | 'suspicious'
  | 'confirmed'
  | 'dismissed'
  | 'disputed';

export const MIN_REPORTERS_FOR_SUSPICIOUS = 3;
export const NEW_ACCOUNT_COOLOFF_HOURS = 24;

export const DEFAULT_ALLOWLISTED_DOMAINS = [
  'tcs.com',
  'infosys.com',
  'wipro.com',
  'hcltech.com',
  'accenture.com',
  'cognizant.com',
  'ibm.com',
  'microsoft.com',
  'google.com',
  'amazon.com',
  'amazon.in',
  'sbi.co.in',
  'aicte-india.org',
  'scholarships.gov.in',
  'mca.gov.in',
  'ncs.gov.in',
  'gov.in',
  'nic.in',
  'ac.in',
  'edu.in',
];

export function isDomainAllowlisted(domainOrUrl: string, allowlist: string[] = DEFAULT_ALLOWLISTED_DOMAINS): boolean {
  if (!domainOrUrl) return false;
  let hostname = domainOrUrl.toLowerCase().trim();
  hostname = hostname.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/:\d+$/, '');

  for (const allowed of allowlist) {
    const cleanAllowed = allowed.toLowerCase().trim();
    if (hostname === cleanAllowed || hostname.endsWith(`.${cleanAllowed}`)) {
      return true;
    }
  }
  return false;
}

export interface ReportedEntityRecord {
  id: string;
  entity_type: EntityType;
  value_hash: string;
  status: ThreatEntityStatus;
  report_count: number;
  notes: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScamReportRecord {
  id: string;
  user_id: string;
  entity_type: EntityType;
  value_hash: string;
  channel: string;
  description: string | null;
  created_at: string;
}

export interface ReportedEntityMatch {
  id: string;
  entityType: EntityType;
  valueHash: string;
  status: ThreatEntityStatus;
  reportCount: number;
  notes: string | null;
  confirmedAt: string | null;
}

// -----------------------------------------------------------------------------
// Phase 7 Shared Intelligence Models
// -----------------------------------------------------------------------------

export interface IntelRecord {
  id: string;
  public_id: string;
  status: ThreatEntityStatus;
  category: string;
  scrubbed_text: string;
  normalized_hash: string;
  first_reported_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  embedding?: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface IntelIndicator {
  id: string;
  record_id: string;
  type: IndicatorType;
  value_hash: string;
  masked_display: string;
  domain?: string;
  created_at: string;
}

export interface IntelReport {
  id: string;
  record_id: string;
  reporter_id: string;
  created_at: string;
}

export interface ModerationAction {
  id: string;
  record_id: string;
  moderator_id: string;
  action: 'confirm' | 'dismiss' | 'dispute' | 'retract' | 'edit_scrubbing';
  reason: string;
  previous_status: string | null;
  new_status: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// In-memory threat database for test environments and non-Supabase local test runs
const inMemoryEntities = new Map<string, ReportedEntityRecord>();
const inMemoryReports: ScamReportRecord[] = [];

const inMemoryIntelRecords = new Map<string, IntelRecord>();
const inMemoryIntelIndicators: IntelIndicator[] = [];
const inMemoryIntelReports: IntelReport[] = [];
const inMemoryModerationActions: ModerationAction[] = [];
const inMemoryAllowlist = new Set<string>(DEFAULT_ALLOWLISTED_DOMAINS);
const inMemoryUserCreatedAts = new Map<string, string>();

export function clearInMemoryThreatIntel(): void {
  inMemoryEntities.clear();
  inMemoryReports.length = 0;
  inMemoryIntelRecords.clear();
  inMemoryIntelIndicators.length = 0;
  inMemoryIntelReports.length = 0;
  inMemoryModerationActions.length = 0;
  inMemoryUserCreatedAts.clear();
  inMemoryAllowlist.clear();
  for (const d of DEFAULT_ALLOWLISTED_DOMAINS) inMemoryAllowlist.add(d);
}

export function registerUserCreatedAtForTest(userId: string, createdAt: string): void {
  inMemoryUserCreatedAts.set(userId, createdAt);
}

export function getInMemoryThreatIntel(): {
  entities: ReportedEntityRecord[];
  reports: ScamReportRecord[];
  intelRecords: IntelRecord[];
  intelIndicators: IntelIndicator[];
  intelReports: IntelReport[];
  moderationActions: ModerationAction[];
} {
  return {
    entities: Array.from(inMemoryEntities.values()),
    reports: [...inMemoryReports],
    intelRecords: Array.from(inMemoryIntelRecords.values()),
    intelIndicators: [...inMemoryIntelIndicators],
    intelReports: [...inMemoryIntelReports],
    moderationActions: [...inMemoryModerationActions],
  };
}

export function seedReportedEntity(
  record:
    | (Partial<ReportedEntityRecord> & { entity_type: EntityType; value_hash: string; status: ThreatEntityStatus })
    | {
        id?: string;
        entityType: EntityType;
        value: string;
        status: ThreatEntityStatus;
        confidence?: number;
        reportCount?: number;
        notes?: string | null;
        confirmedAt?: string | null;
      }
): ReportedEntityRecord {
  const entityType = 'entity_type' in record ? record.entity_type : record.entityType;
  const valueHash = 'value_hash' in record ? record.value_hash : hashEntity(entityType, record.value);
  const status = record.status;
  const reportCount =
    'report_count' in record && record.report_count !== undefined
      ? record.report_count
      : 'reportCount' in record && record.reportCount !== undefined
        ? record.reportCount
        : 1;
  const notes = record.notes || null;
  const confirmedAt =
    'confirmed_at' in record
      ? record.confirmed_at
      : 'confirmedAt' in record
        ? record.confirmedAt
        : status === 'confirmed'
          ? new Date().toISOString()
          : null;

  const fullRecord: ReportedEntityRecord = {
    id: record.id || crypto.randomUUID(),
    entity_type: entityType,
    value_hash: valueHash,
    status,
    report_count: reportCount,
    notes,
    confirmed_at: confirmedAt || null,
    created_at: ('created_at' in record && record.created_at) || new Date().toISOString(),
    updated_at: ('updated_at' in record && record.updated_at) || new Date().toISOString(),
  };

  inMemoryEntities.set(valueHash, fullRecord);
  return fullRecord;
}

function shouldCallRemote(supabase: SupabaseClient | null): supabase is SupabaseClient {
  if (!supabase) return false;
  const env = loadEnv();
  return (
    (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
    Boolean(env.SUPABASE_URL) &&
    !env.SUPABASE_URL.includes('placeholder')
  );
}

export class ThreatIntelRepository {
  /**
   * Hashes a raw entity value using the configured pepper
   */
  static hashIndicator(type: EntityType, value: string): string {
    return hashEntity(type, value);
  }

  // ---------------------------------------------------------------------------
  // Phase 7: Shared Intelligence Message Reporting & Deduplication
  // ---------------------------------------------------------------------------

  /**
   * Submits a scrubbed text scam report with deduplication and promotion logic
   */
  static async submitIntelReport(
    supabase: SupabaseClient | null,
    data: {
      userId: string;
      userCreatedAt?: string;
      scrubbedText: string;
      category?: string;
      indicators?: Array<{ type: IndicatorType; value: string; maskedDisplay?: string }>;
      isHighConcern?: boolean;
    }
  ): Promise<{
    recordId: string;
    publicId: string;
    status: ThreatEntityStatus;
    deduplicated: boolean;
    isNewRecord: boolean;
  }> {
    const { userId, scrubbedText, category = 'other', indicators = [], isHighConcern = false } = data;
    const normalizedHash = hashNormalizedText(scrubbedText);
    const now = new Date().toISOString();

    if (data.userCreatedAt) {
      inMemoryUserCreatedAts.set(userId, data.userCreatedAt);
    }

    if (shouldCallRemote(supabase)) {
      try {
        // Query if exact normalized hash already exists
        const { data: existingRecord } = await supabase
          .from('intel_records')
          .select('id, public_id, status, created_at')
          .eq('normalized_hash', normalizedHash)
          .maybeSingle();

        if (existingRecord) {
          const recordId = existingRecord.id;
          // Deduplicate report for this user
          const { error: insertReportError } = await supabase
            .from('intel_reports')
            .insert({ record_id: recordId, reporter_id: userId });

          const wasDuplicateUser = Boolean(insertReportError && insertReportError.code === '23505');

          // Check promotion criteria
          let updatedStatus = existingRecord.status as ThreatEntityStatus;
          if (!wasDuplicateUser) {
            const { data: reports } = await supabase
              .from('intel_reports')
              .select('reporter_id, created_at, profiles!inner(created_at)')
              .eq('record_id', recordId);

            const cooloffMs = NEW_ACCOUNT_COOLOFF_HOURS * 60 * 60 * 1000;
            const nowMs = Date.now();
            const qualifiedReporters = (reports || []).filter((r: any) => {
              const userCreated = new Date(r.profiles?.created_at || r.created_at).getTime();
              return nowMs - userCreated >= cooloffMs;
            });

            if (
              qualifiedReporters.length >= MIN_REPORTERS_FOR_SUSPICIOUS &&
              (updatedStatus === 'reported' || updatedStatus === 'unverified')
            ) {
              updatedStatus = 'suspicious';
              await supabase
                .from('intel_records')
                .update({ status: 'suspicious', updated_at: now })
                .eq('id', recordId);
            }
          }

          if (isHighConcern && updatedStatus === 'reported') {
            updatedStatus = 'ai_flagged';
            await supabase
              .from('intel_records')
              .update({ status: 'ai_flagged', updated_at: now })
              .eq('id', recordId);
          }

          return {
            recordId,
            publicId: existingRecord.public_id,
            status: updatedStatus,
            deduplicated: wasDuplicateUser,
            isNewRecord: false,
          };
        }

        // New record creation
        const publicId = generateIntelPublicId();
        const initialStatus: ThreatEntityStatus = isHighConcern ? 'ai_flagged' : 'reported';
        const embedding = await getEmbeddingProvider().generateEmbedding(scrubbedText);

        const { data: createdRecord, error: createError } = await supabase
          .from('intel_records')
          .insert({
            public_id: publicId,
            status: initialStatus,
            category,
            scrubbed_text: scrubbedText,
            normalized_hash: normalizedHash,
            ...(embedding ? { embedding } : {}),
          })
          .select('id, public_id, status')
          .single();

        if (createError) throw createError;

        const recordId = createdRecord.id;

        // Insert indicators
        if (indicators.length > 0) {
          const indicatorRows = indicators.map((ind) => ({
            record_id: recordId,
            type: ind.type,
            value_hash: hashIndicatorPeppered(ind.type, ind.value),
            masked_display: ind.maskedDisplay || maskIndicator(ind.type, ind.value),
          }));
          await supabase.from('intel_indicators').insert(indicatorRows);
        }

        // Insert first report
        await supabase.from('intel_reports').insert({
          record_id: recordId,
          reporter_id: userId,
        });

        return {
          recordId,
          publicId,
          status: initialStatus,
          deduplicated: false,
          isNewRecord: true,
        };
      } catch (err) {
        logger.error({ err }, 'Failed to submit intel report to Supabase, falling back to memory store');
      }
    }

    // In-memory fallback
    const existingRecord = inMemoryIntelRecords.get(normalizedHash);
    if (existingRecord) {
      const recordId = existingRecord.id;
      const alreadyReported = inMemoryIntelReports.some(
        (r) => r.record_id === recordId && r.reporter_id === userId
      );

      if (!alreadyReported) {
        inMemoryIntelReports.push({
          id: crypto.randomUUID(),
          record_id: recordId,
          reporter_id: userId,
          created_at: now,
        });

        // Check promotion rule: >= MIN_REPORTERS_FOR_SUSPICIOUS (3) from accounts older than 24h
        const reportsForRecord = inMemoryIntelReports.filter((r) => r.record_id === recordId);
        const cooloffMs = NEW_ACCOUNT_COOLOFF_HOURS * 60 * 60 * 1000;
        const nowMs = Date.now();

        const qualifiedReporters = reportsForRecord.filter((r) => {
          const userCreatedStr = inMemoryUserCreatedAts.get(r.reporter_id);
          if (!userCreatedStr) return false;
          return nowMs - new Date(userCreatedStr).getTime() >= cooloffMs;
        });

        if (
          qualifiedReporters.length >= MIN_REPORTERS_FOR_SUSPICIOUS &&
          (existingRecord.status === 'reported' || existingRecord.status === 'unverified')
        ) {
          existingRecord.status = 'suspicious';
          existingRecord.updated_at = now;
        }
      }

      if (isHighConcern && existingRecord.status === 'reported') {
        existingRecord.status = 'ai_flagged';
        existingRecord.updated_at = now;
      }

      return {
        recordId: existingRecord.id,
        publicId: existingRecord.public_id,
        status: existingRecord.status,
        deduplicated: alreadyReported,
        isNewRecord: false,
      };
    }

    // Create new in-memory intel record
    const recordId = crypto.randomUUID();
    const publicId = generateIntelPublicId();
    const initialStatus: ThreatEntityStatus = isHighConcern ? 'ai_flagged' : 'reported';
    const embedding = await getEmbeddingProvider().generateEmbedding(scrubbedText);

    const newRecord: IntelRecord = {
      id: recordId,
      public_id: publicId,
      status: initialStatus,
      category,
      scrubbed_text: scrubbedText,
      normalized_hash: normalizedHash,
      embedding: embedding || null,
      first_reported_at: now,
      confirmed_at: null,
      confirmed_by: null,
      created_at: now,
      updated_at: now,
    };

    inMemoryIntelRecords.set(normalizedHash, newRecord);

    // Save indicators
    for (const ind of indicators) {
      const extractedDomain =
        ind.type === 'domain' || ind.type === 'url' ? normalizeEntityValue('domain', ind.value) : undefined;

      inMemoryIntelIndicators.push({
        id: crypto.randomUUID(),
        record_id: recordId,
        type: ind.type,
        value_hash: hashIndicatorPeppered(ind.type, ind.value),
        masked_display: ind.maskedDisplay || maskIndicator(ind.type, ind.value),
        domain: extractedDomain,
        created_at: now,
      });
    }

    // Save initial report
    inMemoryIntelReports.push({
      id: crypto.randomUUID(),
      record_id: recordId,
      reporter_id: userId,
      created_at: now,
    });

    return {
      recordId,
      publicId,
      status: initialStatus,
      deduplicated: false,
      isNewRecord: true,
    };
  }

  /**
   * Dual-tier Threat Intelligence Matching for /api/analyze
   * 1. Exact normalized-hash match
   * 2. Indicator peppered-hash match
   */
  static async matchIntel(
    supabase: SupabaseClient | null,
    options: {
      text: string;
      indicators: Array<{ type: string; value: string }>;
    }
  ): Promise<IntelMatch | null> {
    const { text, indicators } = options;
    const normalizedHash = hashNormalizedText(text);

    // 1. Exact normalized text match
    if (shouldCallRemote(supabase)) {
      try {
        const { data: exactRow } = await supabase
          .from('intel_records')
          .select('id, public_id, status')
          .eq('normalized_hash', normalizedHash)
          .maybeSingle();

        if (exactRow) {
          const status = exactRow.status as ThreatEntityStatus;
          if (status === 'confirmed') {
            return {
              tier: 'exact_text',
              status: 'confirmed',
              confidenceBand: 'very_high',
              explanation: 'Matches a moderator-confirmed record in the Jaanch Scam Intelligence Network.',
              publicId: exactRow.public_id,
              matchedIndicators: [],
            };
          }
          if (status === 'suspicious' || status === 'ai_flagged') {
            return {
              tier: 'exact_text',
              status,
              confidenceBand: 'high',
              explanation: 'Similar to reported messages under active community review.',
              publicId: exactRow.public_id,
              matchedIndicators: [],
            };
          }
        }
      } catch (err) {
        logger.error({ err }, 'Exact text intel match query failed in Supabase');
      }
    } else {
      const exactRecord = inMemoryIntelRecords.get(normalizedHash);
      if (exactRecord) {
        const status = exactRecord.status;
        const indicatorsForRecord = inMemoryIntelIndicators
          .filter((i) => i.record_id === exactRecord.id)
          .map((i) => i.masked_display);

        if (status === 'confirmed') {
          return {
            tier: 'exact_text',
            status: 'confirmed',
            confidenceBand: 'very_high',
            explanation: 'Matches a moderator-confirmed record in the Jaanch Scam Intelligence Network.',
            publicId: exactRecord.public_id,
            matchedIndicators: indicatorsForRecord,
          };
        }
        if (status === 'suspicious' || status === 'ai_flagged') {
          return {
            tier: 'exact_text',
            status,
            confidenceBand: 'high',
            explanation: 'Similar to reported messages under active community review.',
            publicId: exactRecord.public_id,
            matchedIndicators: indicatorsForRecord,
          };
        }
      }
    }

    // 2. Indicator hash match
    const validIndicators = indicators.filter((ind) =>
      ['url', 'domain', 'phone', 'upi'].includes(ind.type)
    ) as Array<{ type: IndicatorType; value: string }>;

    if (validIndicators.length > 0) {
      const indicatorHashes = validIndicators.map((ind) => ({
        type: ind.type,
        hash: hashIndicatorPeppered(ind.type, ind.value),
        value: ind.value,
      }));

      if (shouldCallRemote(supabase)) {
        try {
          const hashesOnly = indicatorHashes.map((i) => i.hash);
          const { data: matchedInds } = await supabase
            .from('intel_indicators')
            .select('record_id, masked_display, intel_records!inner(id, public_id, status)')
            .in('value_hash', hashesOnly);

          if (matchedInds && matchedInds.length > 0) {
            const confirmed = matchedInds.find((m: any) => m.intel_records?.status === 'confirmed');
            if (confirmed) {
              return {
                tier: 'indicator_match',
                status: 'confirmed',
                confidenceBand: 'high',
                explanation: 'One or more contact/payment indicators match a moderator-confirmed record.',
                publicId: (confirmed as any).intel_records.public_id,
                matchedIndicators: matchedInds.map((m: any) => m.masked_display),
              };
            }

            const suspicious = matchedInds.find(
              (m: any) => m.intel_records?.status === 'suspicious' || m.intel_records?.status === 'ai_flagged'
            );
            if (suspicious) {
              return {
                tier: 'indicator_match',
                status: (suspicious as any).intel_records.status,
                confidenceBand: 'medium',
                explanation: 'Similar to reported messages under community review.',
                publicId: (suspicious as any).intel_records.public_id,
                matchedIndicators: matchedInds.map((m: any) => m.masked_display),
              };
            }
          }
        } catch (err) {
          logger.error({ err }, 'Indicator intel match query failed in Supabase');
        }
      } else {
        // In-memory indicator search
        const matched = inMemoryIntelIndicators.filter((ind) =>
          indicatorHashes.some((h) => h.hash === ind.value_hash)
        );

        if (matched.length > 0) {
          // Collect parent records
          const parentRecords = Array.from(inMemoryIntelRecords.values()).filter((r) =>
            matched.some((m) => m.record_id === r.id)
          );

          const confirmedRecord = parentRecords.find((r) => r.status === 'confirmed');
          if (confirmedRecord) {
            return {
              tier: 'indicator_match',
              status: 'confirmed',
              confidenceBand: 'high',
              explanation: 'One or more contact/payment indicators match a moderator-confirmed record.',
              publicId: confirmedRecord.public_id,
              matchedIndicators: matched.map((m) => m.masked_display),
            };
          }

          const suspiciousRecord = parentRecords.find(
            (r) => r.status === 'suspicious' || r.status === 'ai_flagged'
          );
          if (suspiciousRecord) {
            return {
              tier: 'indicator_match',
              status: suspiciousRecord.status,
              confidenceBand: 'medium',
              explanation: 'Similar to reported messages under community review.',
              publicId: suspiciousRecord.public_id,
              matchedIndicators: matched.map((m) => m.masked_display),
            };
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. Similarity Tier: Trigram & Shingle-Jaccard matching
    // INVARIANT: Matches ONLY against confirmed or suspicious records
    // -------------------------------------------------------------------------
    if (shouldCallRemote(supabase)) {
      try {
        const { data: simRows, error: simError } = await supabase.rpc('match_intel_similarity', {
          query_text: text,
          similarity_threshold: INTEL_THRESHOLDS.SIMILARITY_JACCARD_MIN,
          match_limit: 1,
        });

        if (!simError && simRows && simRows.length > 0) {
          const top = simRows[0];
          const shingleExp = computeShingleJaccard(text, top.scrubbed_text);
          const score = typeof top.similarity_score === 'number' ? top.similarity_score : shingleExp.similarity;
          return {
            tier: 'similarity',
            status: top.status as ThreatEntityStatus,
            confidenceBand: score >= INTEL_THRESHOLDS.SIMILARITY_HIGH_CONFIDENCE ? 'high' : 'medium',
            explanation: top.status === 'confirmed'
              ? 'High textual similarity to a confirmed scam report in the Jaanch Intelligence Network.'
              : 'Textually similar to reported messages under active community review.',
            publicId: top.public_id,
            matchedIndicators: [],
            matchedTokens: shingleExp.matchedTokens,
            similarityScore: Math.round(score * 1000) / 1000,
          };
        }
      } catch (err) {
        logger.error({ err }, 'Similarity RPC query failed in Supabase');
      }
    } else {
      // In-memory similarity matching against eligible records
      const eligibleRecords = Array.from(inMemoryIntelRecords.values()).filter(
        (r) => r.status === 'confirmed' || r.status === 'suspicious'
      );

      let bestMatch: { record: IntelRecord; shingleRes: ReturnType<typeof computeShingleJaccard> } | null = null;
      for (const rec of eligibleRecords) {
        const shingleRes = computeShingleJaccard(text, rec.scrubbed_text);
        if (shingleRes.similarity >= INTEL_THRESHOLDS.SIMILARITY_JACCARD_MIN) {
          if (!bestMatch || shingleRes.similarity > bestMatch.shingleRes.similarity) {
            bestMatch = { record: rec, shingleRes };
          }
        }
      }

      if (bestMatch) {
        const score = bestMatch.shingleRes.similarity;
        return {
          tier: 'similarity',
          status: bestMatch.record.status,
          confidenceBand: score >= INTEL_THRESHOLDS.SIMILARITY_HIGH_CONFIDENCE ? 'high' : 'medium',
          explanation: bestMatch.record.status === 'confirmed'
            ? 'High textual similarity to a confirmed scam report in the Jaanch Intelligence Network.'
            : 'Textually similar to reported messages under active community review.',
          publicId: bestMatch.record.public_id,
          matchedIndicators: [],
          matchedTokens: bestMatch.shingleRes.matchedTokens,
          similarityScore: score,
        };
      }
    }

    // -------------------------------------------------------------------------
    // 4. Semantic Tier: Vector embedding matching (Optional, off without a key)
    // INVARIANT: Matches ONLY against confirmed or suspicious records
    // -------------------------------------------------------------------------
    const embeddingProvider = getEmbeddingProvider();
    if (embeddingProvider.modelId !== 'none') {
      try {
        const queryEmbedding = await embeddingProvider.generateEmbedding(text);
        if (queryEmbedding) {
          if (shouldCallRemote(supabase)) {
            const { data: semRows, error: semError } = await supabase.rpc('match_intel_semantic', {
              query_embedding: queryEmbedding,
              similarity_threshold: INTEL_THRESHOLDS.SEMANTIC_COSINE_MIN,
              match_limit: 1,
            });

            if (!semError && semRows && semRows.length > 0) {
              const top = semRows[0];
              const score = typeof top.similarity_score === 'number' ? top.similarity_score : INTEL_THRESHOLDS.SEMANTIC_COSINE_MIN;
              return {
                tier: 'semantic',
                status: top.status as ThreatEntityStatus,
                confidenceBand: score >= INTEL_THRESHOLDS.SEMANTIC_HIGH_CONFIDENCE ? 'high' : 'medium',
                explanation: top.status === 'confirmed'
                  ? 'Semantically matches confirmed fraud patterns in the Jaanch Scam Intelligence Network.'
                  : 'Semantically similar to reported patterns under review.',
                publicId: top.public_id,
                matchedIndicators: [],
                similarityScore: Math.round(score * 1000) / 1000,
              };
            }
          } else {
            // In-memory semantic evaluation
            const eligibleSemantic = Array.from(inMemoryIntelRecords.values()).filter(
              (r) => (r.status === 'confirmed' || r.status === 'suspicious') && r.embedding
            );

            let bestSemantic: { record: IntelRecord; score: number } | null = null;
            for (const rec of eligibleSemantic) {
              const score = cosineSimilarity(queryEmbedding, rec.embedding!);
              if (score >= INTEL_THRESHOLDS.SEMANTIC_COSINE_MIN) {
                if (!bestSemantic || score > bestSemantic.score) {
                  bestSemantic = { record: rec, score };
                }
              }
            }

            if (bestSemantic) {
              return {
                tier: 'semantic',
                status: bestSemantic.record.status,
                confidenceBand: bestSemantic.score >= INTEL_THRESHOLDS.SEMANTIC_HIGH_CONFIDENCE ? 'high' : 'medium',
                explanation: bestSemantic.record.status === 'confirmed'
                  ? 'Semantically matches confirmed fraud patterns in the Jaanch Scam Intelligence Network.'
                  : 'Semantically similar to reported patterns under review.',
                publicId: bestSemantic.record.public_id,
                matchedIndicators: [],
                similarityScore: Math.round(bestSemantic.score * 1000) / 1000,
              };
            }
          }
        }
      } catch (err) {
        logger.warn({ err }, 'Semantic tier matching failed soft');
      }
    }

    return null;
  }

  /**
   * Anyone can contest a record (POST /api/disputes)
   */
  static async disputeIntelRecord(
    supabase: SupabaseClient | null,
    options: {
      publicId: string;
      reason: string;
      contactEmail?: string;
    }
  ): Promise<{ publicId: string; status: ThreatEntityStatus }> {
    const { publicId, reason, contactEmail } = options;
    const now = new Date().toISOString();

    if (shouldCallRemote(supabase)) {
      const { data: record, error } = await supabase
        .from('intel_records')
        .select('id, status')
        .eq('public_id', publicId)
        .single();

      if (error || !record) {
        throw new Error(`Record with public ID ${publicId} not found.`);
      }

      await supabase
        .from('intel_records')
        .update({ status: 'disputed', updated_at: now })
        .eq('id', record.id);

      await supabase.from('moderation_actions').insert({
        record_id: record.id,
        moderator_id: '00000000-0000-0000-0000-000000000000', // public dispute placeholder or system
        action: 'dispute',
        reason,
        previous_status: record.status,
        new_status: 'disputed',
        metadata: { contactEmail },
      });

      return { publicId, status: 'disputed' };
    }

    // In-memory fallback
    const record = Array.from(inMemoryIntelRecords.values()).find((r) => r.public_id === publicId);
    if (!record) {
      throw new Error(`Record with public ID ${publicId} not found.`);
    }

    const previousStatus = record.status;
    record.status = 'disputed';
    record.updated_at = now;

    inMemoryModerationActions.push({
      id: crypto.randomUUID(),
      record_id: record.id,
      moderator_id: '00000000-0000-0000-0000-000000000000',
      action: 'dispute',
      reason,
      previous_status: previousStatus,
      new_status: 'disputed',
      metadata: { contactEmail },
      created_at: now,
    });

    return { publicId, status: 'disputed' };
  }

  /**
   * Lists intel records for moderator queue
   */
  static async listModerationQueue(
    supabase: SupabaseClient | null,
    options: { status?: ThreatEntityStatus; page?: number; limit?: number } = {}
  ): Promise<{
    items: Array<{
      id: string;
      publicId: string;
      status: ThreatEntityStatus;
      category: string;
      scrubbedText: string;
      firstReportedAt: string;
      reportCount: number;
      indicators: string[];
    }>;
    total: number;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    if (shouldCallRemote(supabase)) {
      let query = supabase
        .from('intel_records')
        .select('id, public_id, status, category, scrubbed_text, first_reported_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      const items = (data || []).map((row: any) => ({
        id: row.id,
        publicId: row.public_id,
        status: row.status as ThreatEntityStatus,
        category: row.category,
        scrubbedText: row.scrubbed_text,
        firstReportedAt: row.first_reported_at,
        reportCount: 1, // aggregate count
        indicators: [],
      }));

      return { items, total: count || items.length };
    }

    // In-memory fallback
    let list = Array.from(inMemoryIntelRecords.values());
    if (options.status) {
      list = list.filter((r) => r.status === options.status);
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = list.length;
    const paged = list.slice(offset, offset + limit);

    const items = paged.map((r) => {
      const reportCount = inMemoryIntelReports.filter((rep) => rep.record_id === r.id).length;
      const indicators = inMemoryIntelIndicators
        .filter((i) => i.record_id === r.id)
        .map((i) => `${i.type}: ${i.masked_display}`);

      return {
        id: r.id,
        publicId: r.public_id,
        status: r.status,
        category: r.category,
        scrubbedText: r.scrubbed_text,
        firstReportedAt: r.first_reported_at,
        reportCount,
        indicators,
      };
    });

    return { items, total };
  }

  /**
   * Detail view for moderator: returns scrubbed text only, zero raw submissions
   */
  static async getModerationRecordDetail(
    supabase: SupabaseClient | null,
    recordIdOrPublicId: string
  ): Promise<{
    id: string;
    publicId: string;
    status: ThreatEntityStatus;
    category: string;
    scrubbedText: string;
    firstReportedAt: string;
    confirmedAt: string | null;
    reportCount: number;
    indicators: Array<{ type: string; maskedDisplay: string }>;
    history: Array<{ action: string; reason: string; createdAt: string; newStatus: string | null }>;
  }> {
    if (shouldCallRemote(supabase)) {
      const { data: record, error } = await supabase
        .from('intel_records')
        .select('*')
        .or(`id.eq.${recordIdOrPublicId},public_id.eq.${recordIdOrPublicId}`)
        .single();

      if (error || !record) {
        throw new Error(`Record ${recordIdOrPublicId} not found.`);
      }

      const { data: indicators } = await supabase
        .from('intel_indicators')
        .select('type, masked_display')
        .eq('record_id', record.id);

      const { data: history } = await supabase
        .from('moderation_actions')
        .select('action, reason, created_at, new_status')
        .eq('record_id', record.id)
        .order('created_at', { ascending: false });

      const { count } = await supabase
        .from('intel_reports')
        .select('*', { count: 'exact', head: true })
        .eq('record_id', record.id);

      return {
        id: record.id,
        publicId: record.public_id,
        status: record.status as ThreatEntityStatus,
        category: record.category,
        scrubbedText: record.scrubbed_text,
        firstReportedAt: record.first_reported_at,
        confirmedAt: record.confirmed_at,
        reportCount: count || 1,
        indicators: (indicators || []).map((i: any) => ({
          type: i.type,
          maskedDisplay: i.masked_display,
        })),
        history: (history || []).map((h: any) => ({
          action: h.action,
          reason: h.reason,
          createdAt: h.created_at,
          newStatus: h.new_status,
        })),
      };
    }

    // In-memory fallback
    const record = Array.from(inMemoryIntelRecords.values()).find(
      (r) => r.id === recordIdOrPublicId || r.public_id === recordIdOrPublicId
    );

    if (!record) {
      throw new Error(`Record ${recordIdOrPublicId} not found.`);
    }

    const reportCount = inMemoryIntelReports.filter((rep) => rep.record_id === record.id).length;
    const indicators = inMemoryIntelIndicators
      .filter((i) => i.record_id === record.id)
      .map((i) => ({ type: i.type, maskedDisplay: i.masked_display }));
    const history = inMemoryModerationActions
      .filter((m) => m.record_id === record.id)
      .map((m) => ({
        action: m.action,
        reason: m.reason,
        createdAt: m.created_at,
        newStatus: m.new_status,
      }));

    return {
      id: record.id,
      publicId: record.public_id,
      status: record.status,
      category: record.category,
      scrubbedText: record.scrubbed_text,
      firstReportedAt: record.first_reported_at,
      confirmedAt: record.confirmed_at,
      reportCount,
      indicators,
      history,
    };
  }

  /**
   * Edit scrubbing: moderator sanitizes or refines scrubbed text
   */
  static async editScrubbing(
    supabase: SupabaseClient | null,
    options: {
      recordId: string;
      newScrubbedText: string;
      moderatorId: string;
      reason: string;
    }
  ): Promise<{ id: string; scrubbedText: string }> {
    const { recordId, newScrubbedText, moderatorId, reason } = options;
    const now = new Date().toISOString();

    if (shouldCallRemote(supabase)) {
      const { data, error } = await supabase
        .from('intel_records')
        .update({ scrubbed_text: newScrubbedText, updated_at: now })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('moderation_actions').insert({
        record_id: recordId,
        moderator_id: moderatorId,
        action: 'edit_scrubbing',
        reason,
        new_status: data.status,
      });

      return { id: recordId, scrubbedText: newScrubbedText };
    }

    // In-memory fallback
    const record = Array.from(inMemoryIntelRecords.values()).find(
      (r) => r.id === recordId || r.public_id === recordId
    );
    if (!record) {
      throw new Error(`Record with ID ${recordId} not found.`);
    }

    record.scrubbed_text = newScrubbedText;
    record.updated_at = now;

    inMemoryModerationActions.push({
      id: crypto.randomUUID(),
      record_id: record.id,
      moderator_id: moderatorId,
      action: 'edit_scrubbing',
      reason,
      previous_status: record.status,
      new_status: record.status,
      created_at: now,
    });

    return { id: record.id, scrubbedText: newScrubbedText };
  }

  /**
   * Moderator Action: Confirm, Dismiss, Dispute, or Retract with mandatory reason
   * BLOCKS confirmation if any indicator domain is on domain_allowlist!
   */
  static async transitionModerationRecord(
    supabase: SupabaseClient | null,
    options: {
      recordId: string;
      action: 'confirm' | 'dismiss' | 'dispute' | 'retract';
      reason: string;
      moderatorId: string;
    }
  ): Promise<{ id: string; status: ThreatEntityStatus }> {
    const { recordId, action, reason, moderatorId } = options;
    const now = new Date().toISOString();

    // Map action to resulting status
    let nextStatus: ThreatEntityStatus;
    switch (action) {
      case 'confirm':
        nextStatus = 'confirmed';
        break;
      case 'dismiss':
        nextStatus = 'dismissed';
        break;
      case 'dispute':
        nextStatus = 'disputed';
        break;
      case 'retract':
        nextStatus = 'reported';
        break;
    }

    // DOMAIN ALLOWLIST CHECK ON CONFIRM
    if (action === 'confirm') {
      const indicators = inMemoryIntelIndicators.filter((i) => i.record_id === recordId);
      for (const ind of indicators) {
        if (ind.type === 'domain' || ind.type === 'url') {
          const dom = ind.domain || ind.masked_display;
          if (dom && isDomainAllowlisted(dom)) {
            const err = new Error(
              `Domain "${dom}" is on the official domain allowlist and cannot be confirmed as a scam.`
            );
            (err as any).code = 'ALLOWLISTED_DOMAIN_BLOCKED';
            throw err;
          }
        }
      }
    }

    if (shouldCallRemote(supabase)) {
      const { data: record, error: fetchErr } = await supabase
        .from('intel_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchErr || !record) {
        throw new Error(`Record ${recordId} not found.`);
      }

      // Check allowlist in Supabase
      if (action === 'confirm') {
        const { data: remoteIndicators } = await supabase
          .from('intel_indicators')
          .select('type, masked_display')
          .eq('record_id', recordId);

        const { data: allowlistRows } = await supabase
          .from('domain_allowlist')
          .select('domain');

        const activeAllowlist = (allowlistRows || []).map((r: any) => r.domain);

        for (const ind of remoteIndicators || []) {
          if (ind.type === 'domain' || ind.type === 'url') {
            if (isDomainAllowlisted(ind.masked_display, activeAllowlist)) {
              const err = new Error(
                `Domain "${ind.masked_display}" is on the official domain allowlist and cannot be confirmed as a scam.`
              );
              (err as any).code = 'ALLOWLISTED_DOMAIN_BLOCKED';
              throw err;
            }
          }
        }
      }

      const updatePayload: Record<string, unknown> = {
        status: nextStatus,
        updated_at: now,
      };
      if (action === 'confirm') {
        updatePayload.confirmed_at = now;
        updatePayload.confirmed_by = moderatorId;
      } else if (action === 'retract') {
        updatePayload.confirmed_at = null;
        updatePayload.confirmed_by = null;
      }

      const { data: updated, error: updateErr } = await supabase
        .from('intel_records')
        .update(updatePayload)
        .eq('id', recordId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      await supabase.from('moderation_actions').insert({
        record_id: recordId,
        moderator_id: moderatorId,
        action,
        reason,
        previous_status: record.status,
        new_status: nextStatus,
      });

      await writeAuditLog({
        actor_id: moderatorId,
        action: 'TRANSITION_INTEL_RECORD',
        entity: 'intel_records',
        entity_id: recordId,
        meta: {
          action,
          reason,
          fromStatus: record.status,
          toStatus: nextStatus,
        },
      });

      return { id: recordId, status: nextStatus };
    }

    // In-memory fallback
    const record = Array.from(inMemoryIntelRecords.values()).find(
      (r) => r.id === recordId || r.public_id === recordId
    );
    if (!record) {
      throw new Error(`Record with ID ${recordId} not found.`);
    }

    const previousStatus = record.status;
    record.status = nextStatus;
    record.updated_at = now;
    if (action === 'confirm') {
      record.confirmed_at = now;
      record.confirmed_by = moderatorId;
    } else if (action === 'retract') {
      record.confirmed_at = null;
      record.confirmed_by = null;
    }

    inMemoryModerationActions.push({
      id: crypto.randomUUID(),
      record_id: record.id,
      moderator_id: moderatorId,
      action,
      reason,
      previous_status: previousStatus,
      new_status: nextStatus,
      created_at: now,
    });

    await writeAuditLog({
      actor_id: moderatorId,
      action: 'TRANSITION_INTEL_RECORD',
      entity: 'intel_records',
      entity_id: record.id,
      meta: {
        action,
        reason,
        fromStatus: previousStatus,
        toStatus: nextStatus,
      },
    });

    return { id: record.id, status: nextStatus };
  }

  /**
   * Helper to seed intel record in tests
   */
  static seedIntelRecord(options: {
    publicId?: string;
    status: ThreatEntityStatus;
    scrubbedText: string;
    category?: string;
    indicators?: Array<{ type: IndicatorType; value: string }>;
  }): IntelRecord {
    const publicId = options.publicId || generateIntelPublicId();
    const normalizedHash = hashNormalizedText(options.scrubbedText);
    const now = new Date().toISOString();
    const recordId = crypto.randomUUID();

    const record: IntelRecord = {
      id: recordId,
      public_id: publicId,
      status: options.status,
      category: options.category || 'other',
      scrubbed_text: options.scrubbedText,
      normalized_hash: normalizedHash,
      first_reported_at: now,
      confirmed_at: options.status === 'confirmed' ? now : null,
      confirmed_by: options.status === 'confirmed' ? '00000000-0000-0000-0000-000000000000' : null,
      created_at: now,
      updated_at: now,
    };

    inMemoryIntelRecords.set(normalizedHash, record);

    if (options.indicators) {
      for (const ind of options.indicators) {
        const extractedDomain =
          ind.type === 'domain' || ind.type === 'url' ? normalizeEntityValue('domain', ind.value) : undefined;
        inMemoryIntelIndicators.push({
          id: crypto.randomUUID(),
          record_id: recordId,
          type: ind.type,
          value_hash: hashIndicatorPeppered(ind.type, ind.value),
          masked_display: maskIndicator(ind.type, ind.value),
          domain: extractedDomain,
          created_at: now,
        });
      }
    }

    return record;
  }

  // ---------------------------------------------------------------------------
  // Backwards Compatibility Methods for Existing Tests
  // ---------------------------------------------------------------------------

  static async submitScamReport(
    supabase: SupabaseClient | null,
    data: {
      userId: string;
      entityType: EntityType;
      rawValue: string;
      channel?: string;
      description?: string;
    }
  ): Promise<{ reportId: string; entityHash: string; status: ThreatEntityStatus; reportCount: number }> {
    const entityHash = this.hashIndicator(data.entityType, data.rawValue);
    const channel = data.channel || 'other';
    const description = data.description || '';

    if (shouldCallRemote(supabase)) {
      try {
        const { data: rpcReportId, error } = await supabase.rpc('submit_scam_report', {
          p_entity_type: data.entityType,
          p_value_hash: entityHash,
          p_channel: channel,
          p_description: description,
        });

        if (error) throw error;

        const { data: entityRow } = await supabase
          .from('reported_entities')
          .select('status, report_count')
          .eq('value_hash', entityHash)
          .single();

        return {
          reportId: rpcReportId as string,
          entityHash,
          status: (entityRow?.status as ThreatEntityStatus) || 'unverified',
          reportCount: entityRow?.report_count || 1,
        };
      } catch (err) {
        logger.error({ err }, 'Failed to submit scam report to Supabase, falling back to memory store');
      }
    }

    const reportId = crypto.randomUUID();
    const reportRecord: ScamReportRecord = {
      id: reportId,
      user_id: data.userId,
      entity_type: data.entityType,
      value_hash: entityHash,
      channel,
      description,
      created_at: new Date().toISOString(),
    };
    inMemoryReports.push(reportRecord);

    let entityRecord = inMemoryEntities.get(entityHash);
    if (entityRecord) {
      entityRecord.report_count += 1;
      entityRecord.updated_at = new Date().toISOString();
    } else {
      entityRecord = {
        id: crypto.randomUUID(),
        entity_type: data.entityType,
        value_hash: entityHash,
        status: 'unverified',
        report_count: 1,
        notes: null,
        confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryEntities.set(entityHash, entityRecord);
    }

    return {
      reportId,
      entityHash,
      status: entityRecord.status,
      reportCount: entityRecord.report_count,
    };
  }

  static async checkReportedEntities(
    supabase: SupabaseClient | null,
    indicators: Array<{ type: EntityType; value: string }> | string[]
  ): Promise<ReportedEntityMatch[]> {
    if (!indicators || indicators.length === 0) return [];

    const hashes: string[] = indicators.map((ind) => {
      if (typeof ind === 'string') return ind;
      return this.hashIndicator(ind.type, ind.value);
    });

    if (hashes.length === 0) return [];

    if (shouldCallRemote(supabase)) {
      try {
        const { data: rows, error } = await supabase.rpc('check_reported_entities', {
          p_hashes: hashes,
        });

        if (!error && rows) {
          return rows.map((r: any) => ({
            id: r.id,
            entityType: r.entity_type,
            valueHash: r.value_hash,
            status: r.status,
            reportCount: r.report_count,
            notes: r.notes,
            confirmedAt: r.confirmed_at,
          }));
        }
      } catch (err) {
        logger.error({ err }, 'check_reported_entities RPC call error');
      }
    }

    const matches: ReportedEntityMatch[] = [];
    for (const h of hashes) {
      const record = inMemoryEntities.get(h);
      if (record && ['confirmed', 'suspicious', 'ai_flagged'].includes(record.status)) {
        matches.push({
          id: record.id,
          entityType: record.entity_type,
          valueHash: record.value_hash,
          status: record.status,
          reportCount: record.report_count,
          notes: record.notes,
          confirmedAt: record.confirmed_at,
        });
      }
    }

    return matches;
  }

  static async listReportedEntities(
    supabase: SupabaseClient | null,
    options: { status?: ThreatEntityStatus; page?: number; limit?: number } = {}
  ): Promise<{ items: ReportedEntityRecord[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    if (shouldCallRemote(supabase)) {
      try {
        let query = supabase
          .from('reported_entities')
          .select('*', { count: 'exact' })
          .order('report_count', { ascending: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (options.status) query = query.eq('status', options.status);

        const { data, count, error } = await query;
        if (!error && data) {
          return { items: data as ReportedEntityRecord[], total: count || data.length };
        }
      } catch (err) {
        logger.error({ err }, 'Failed to list reported entities from Supabase');
      }
    }

    let list = Array.from(inMemoryEntities.values());
    if (options.status) list = list.filter((e) => e.status === options.status);
    list.sort((a, b) => b.report_count - a.report_count);

    const total = list.length;
    const items = list.slice(offset, offset + limit);
    return { items, total };
  }

  static async transitionEntityStatus(
    supabase: SupabaseClient | null,
    options: {
      entityId: string;
      toStatus: ThreatEntityStatus;
      notes?: string;
      moderatorId: string;
    }
  ): Promise<ReportedEntityRecord> {
    const { entityId, toStatus, notes, moderatorId } = options;
    const now = new Date().toISOString();
    const confirmedAt = toStatus === 'confirmed' ? now : null;

    if (shouldCallRemote(supabase)) {
      try {
        const updatePayload: Record<string, unknown> = {
          status: toStatus,
          updated_at: now,
        };
        if (notes !== undefined) updatePayload.notes = notes;
        if (toStatus === 'confirmed') updatePayload.confirmed_at = confirmedAt;

        const { data, error } = await supabase
          .from('reported_entities')
          .update(updatePayload)
          .eq('id', entityId)
          .select()
          .single();

        if (error) throw error;

        await writeAuditLog({
          actor_id: moderatorId,
          action: 'TRANSITION_ENTITY_STATUS',
          entity: 'reported_entities',
          entity_id: entityId,
          meta: { toStatus, notes, confirmedAt },
        });

        return data as ReportedEntityRecord;
      } catch (err) {
        logger.error({ err }, 'Failed to update reported entity status in Supabase');
      }
    }

    const record = Array.from(inMemoryEntities.values()).find((e) => e.id === entityId);
    if (!record) {
      throw new Error(`Reported entity with ID ${entityId} not found.`);
    }

    record.status = toStatus;
    record.updated_at = now;
    if (notes !== undefined) record.notes = notes;
    if (toStatus === 'confirmed') record.confirmed_at = confirmedAt;

    await writeAuditLog({
      actor_id: moderatorId,
      action: 'TRANSITION_ENTITY_STATUS',
      entity: 'reported_entities',
      entity_id: entityId,
      meta: { toStatus, notes, confirmedAt },
    });

    return record;
  }
}
