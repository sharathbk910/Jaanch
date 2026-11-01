import { type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { loadEnv } from '../config/env.js';
import { logger } from './logger.js';
import { hashEntity, normalizeEntityValue, type EntityType } from './hashing.js';
import { writeAuditLog } from './auditLog.js';

export type ThreatEntityStatus =
  | 'reported'
  | 'unverified'
  | 'ai_flagged'
  | 'suspicious'
  | 'confirmed'
  | 'dismissed'
  | 'disputed';

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

// In-memory threat database for test environments and non-Supabase local test runs
const inMemoryEntities = new Map<string, ReportedEntityRecord>();
const inMemoryReports: ScamReportRecord[] = [];

export function clearInMemoryThreatIntel(): void {
  inMemoryEntities.clear();
  inMemoryReports.length = 0;
}

export function getInMemoryThreatIntel(): {
  entities: ReportedEntityRecord[];
  reports: ScamReportRecord[];
} {
  return {
    entities: Array.from(inMemoryEntities.values()),
    reports: [...inMemoryReports],
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

  /**
   * Submits a user scam report atomically and creates or increments the aggregated indicator record
   */
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
        // Execute atomic stored procedure submit_scam_report
        const { data: rpcReportId, error } = await supabase.rpc('submit_scam_report', {
          p_entity_type: data.entityType,
          p_value_hash: entityHash,
          p_channel: channel,
          p_description: description,
        });

        if (error) {
          logger.warn({ error: error.message }, 'Supabase submit_scam_report RPC failed, falling back');
          throw error;
        }

        // Query the updated entity count
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

    // In-memory fallback
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

  /**
   * Queries threat database by entity hashes to find confirmed, suspicious, or flagged indicators
   */
  static async checkReportedEntities(
    supabase: SupabaseClient | null,
    indicators: Array<{ type: EntityType; value: string }> | string[]
  ): Promise<ReportedEntityMatch[]> {
    if (!indicators || indicators.length === 0) {
      return [];
    }

    // Calculate peppered hashes if raw objects were supplied
    const hashes: string[] = indicators.map((ind) => {
      if (typeof ind === 'string') {
        return ind;
      }
      return this.hashIndicator(ind.type, ind.value);
    });

    if (hashes.length === 0) {
      return [];
    }

    if (shouldCallRemote(supabase)) {
      try {
        const { data: rows, error } = await supabase!.rpc('check_reported_entities', {
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

    // In-memory fallback
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

  /**
   * Lists reported entities for human moderator review
   */
  static async listReportedEntities(
    supabase: SupabaseClient | null,
    options: { status?: ThreatEntityStatus; page?: number; limit?: number } = {}
  ): Promise<{ items: ReportedEntityRecord[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    if (shouldCallRemote(supabase)) {
      try {
        let query = supabase!
          .from('reported_entities')
          .select('*', { count: 'exact' })
          .order('report_count', { ascending: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (options.status) {
          query = query.eq('status', options.status);
        }

        const { data, count, error } = await query;
        if (!error && data) {
          return {
            items: data as ReportedEntityRecord[],
            total: count || data.length,
          };
        }
      } catch (err) {
        logger.error({ err }, 'Failed to list reported entities from Supabase');
      }
    }

    // In-memory fallback
    let list = Array.from(inMemoryEntities.values());
    if (options.status) {
      list = list.filter((e) => e.status === options.status);
    }
    list.sort((a, b) => b.report_count - a.report_count);

    const total = list.length;
    const items = list.slice(offset, offset + limit);

    return { items, total };
  }

  /**
   * Moderator workflow: elevates or transitions entity lifecycle state
   * Only an authorized human moderator can elevate an entity to 'confirmed'.
   */
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

        if (error) {
          throw error;
        }

        await writeAuditLog({
          actor_id: moderatorId,
          action: 'TRANSITION_ENTITY_STATUS',
          entity: 'reported_entities',
          entity_id: entityId,
          meta: {
            toStatus,
            notes,
            confirmedAt,
          },
        });

        return data as ReportedEntityRecord;
      } catch (err) {
        logger.error({ err }, 'Failed to update reported entity status in Supabase');
      }
    }

    // In-memory fallback
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
      meta: {
        toStatus,
        notes,
        confirmedAt,
      },
    });

    return record;
  }
}

