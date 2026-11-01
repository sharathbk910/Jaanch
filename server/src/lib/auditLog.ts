import { loadEnv } from '../config/env.js';
import { getServiceRoleClient } from './supabase.js';
import { logger } from './logger.js';

export interface AuditLogEntry {
  id?: string;
  actor_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  meta?: Record<string, unknown>;
  created_at?: string;
}

// In-memory buffer for testing audit log writes and assertions
const testAuditLogs: AuditLogEntry[] = [];

export function getTestAuditLogs(): AuditLogEntry[] {
  return [...testAuditLogs];
}

export function clearTestAuditLogs(): void {
  testAuditLogs.length = 0;
}

/**
 * Strips any potential message text or user PII from metadata.
 * Invariant: Audit logs NEVER store message text, transcripts, or unredacted PII.
 */
function sanitizeAuditMeta(meta?: Record<string, unknown>): Record<string, unknown> {
  if (!meta) return {};
  const cleaned: Record<string, unknown> = {};

  const forbiddenKeys = new Set(['text', 'message', 'rawtext', 'raw_text', 'content', 'input', 'body']);

  for (const [key, value] of Object.entries(meta)) {
    if (forbiddenKeys.has(key.toLowerCase())) {
      continue;
    }
    // If value is a nested object, sanitize recursively
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeAuditMeta(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Writes an audit log entry using the service-role client.
 * Ordinary users have no SELECT or INSERT permissions on audit_logs.
 */
export async function writeAuditLog(entry: {
  actor_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const sanitizedMeta = sanitizeAuditMeta(entry.meta);

  const logRecord: AuditLogEntry = {
    id: crypto.randomUUID(),
    actor_id: entry.actor_id || null,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entity_id || null,
    meta: sanitizedMeta,
    created_at: new Date().toISOString(),
  };

  testAuditLogs.push(logRecord);

  try {
    const env = loadEnv();
    const shouldCallRemote =
      (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
      env.SUPABASE_SERVICE_ROLE_KEY &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes('placeholder');

    if (shouldCallRemote) {
      const adminClient = getServiceRoleClient();
      await adminClient.from('audit_logs').insert({
        actor_id: logRecord.actor_id,
        action: logRecord.action,
        entity: logRecord.entity,
        entity_id: logRecord.entity_id,
        meta: logRecord.meta,
      });
    }
  } catch (err: unknown) {
    logger.warn({ err }, 'Failed to persist audit log to Supabase; buffered in memory');
  }
}
