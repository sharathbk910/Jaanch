import { type SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from '../config/env.js';
import { logger } from './logger.js';

export interface SubmissionRecord {
  id: string;
  user_id: string;
  input_type: string;
  domain: string | null;
  channel: string | null;
  text_hash: string;
  redacted_text: string | null;
  created_at: string;
}

export interface DetectionResultRecord {
  id: string;
  submission_id: string;
  status: string;
  confidence: number;
  signals: unknown[];
  schema_version: string;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  inputType: string;
  domain: string | null;
  channel: string | null;
  textHash: string;
  redactedText: string | null;
  createdAt: string;
  result?: {
    status: string;
    confidence: number;
    signals: unknown[];
    schemaVersion: string;
  };
}

// In-memory test store used in test environments without a live Supabase connection
const inMemorySubmissions: SubmissionRecord[] = [];
const inMemoryResults: DetectionResultRecord[] = [];

export function clearInMemoryHistory(): void {
  inMemorySubmissions.length = 0;
  inMemoryResults.length = 0;
}

export function getInMemorySubmissions(): SubmissionRecord[] {
  return [...inMemorySubmissions];
}

export function getInMemoryResults(): DetectionResultRecord[] {
  return [...inMemoryResults];
}

export class HistoryRepository {
  /**
   * Saves a submission and its detection result.
   */
  static async saveSubmission(
    client: SupabaseClient | null,
    params: {
      userId: string;
      inputType: string;
      domain?: string | null;
      channel?: string | null;
      textHash: string;
      redactedText?: string | null;
      status: string;
      confidence: number;
      signals: unknown[];
    }
  ): Promise<string> {
    const env = loadEnv();
    const submissionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const submission: SubmissionRecord = {
      id: submissionId,
      user_id: params.userId,
      input_type: params.inputType,
      domain: params.domain || null,
      channel: params.channel || null,
      text_hash: params.textHash,
      redacted_text: params.redactedText || null,
      created_at: now,
    };

    const detection: DetectionResultRecord = {
      id: crypto.randomUUID(),
      submission_id: submissionId,
      status: params.status,
      confidence: params.confidence,
      signals: params.signals,
      schema_version: '1.0.0',
      created_at: now,
    };

    inMemorySubmissions.push(submission);
    inMemoryResults.push(detection);

    const shouldCallRemote =
      client &&
      (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes('placeholder');

    if (shouldCallRemote) {
      try {
        const { error: subErr } = await client.from('submissions').insert({
          id: submission.id,
          user_id: submission.user_id,
          input_type: submission.input_type,
          domain: submission.domain,
          channel: submission.channel,
          text_hash: submission.text_hash,
          redacted_text: submission.redacted_text,
        });

        if (subErr) {
          logger.error({ subErr }, 'Error inserting submission into Supabase');
          throw subErr;
        }

        const { error: resErr } = await client.from('detection_results').insert({
          id: detection.id,
          submission_id: detection.submission_id,
          status: detection.status,
          confidence: detection.confidence,
          signals: detection.signals,
          schema_version: detection.schema_version,
        });

        if (resErr) {
          logger.error({ resErr }, 'Error inserting detection_result into Supabase');
          throw resErr;
        }
      } catch (err) {
        logger.warn({ err }, 'Supabase write failed, falling back to local storage');
      }
    }

    return submissionId;
  }

  /**
   * Retrieves paginated submissions owned strictly by userId.
   * Parameterized and sanitizes domain filter against SQL-injection.
   */
  static async getHistory(
    client: SupabaseClient | null,
    userId: string,
    options: { page: number; limit: number; domain?: string }
  ): Promise<{ items: HistoryItem[]; total: number }> {
    const env = loadEnv();
    const offset = (options.page - 1) * options.limit;

    const shouldCallRemote =
      client &&
      (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes('placeholder');

    if (shouldCallRemote) {
      try {
        let query = client
          .from('submissions')
          .select('*, detection_results(*)', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (options.domain) {
          query = query.eq('domain', options.domain);
        }

        query = query.range(offset, offset + options.limit - 1);

        const { data, count, error } = await query;
        if (!error && data) {
          const items: HistoryItem[] = data.map((row: any) => {
            const res = Array.isArray(row.detection_results)
              ? row.detection_results[0]
              : row.detection_results;
            return {
              id: row.id,
              inputType: row.input_type,
              domain: row.domain,
              channel: row.channel,
              textHash: row.text_hash,
              redactedText: row.redacted_text,
              createdAt: row.created_at,
              result: res
                ? {
                    status: res.status,
                    confidence: Number(res.confidence),
                    signals: res.signals || [],
                    schemaVersion: res.schema_version || '1.0.0',
                  }
                : undefined,
            };
          });

          return { items, total: count || items.length };
        }
      } catch (err) {
        logger.warn({ err }, 'Supabase read failed, querying local memory');
      }
    }

    // In-memory fallback
    let filtered = inMemorySubmissions.filter((s) => s.user_id === userId);
    if (options.domain) {
      filtered = filtered.filter((s) => s.domain === options.domain);
    }

    // Sort descending by created_at
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + options.limit);

    const items: HistoryItem[] = paginated.map((sub) => {
      const res = inMemoryResults.find((r) => r.submission_id === sub.id);
      return {
        id: sub.id,
        inputType: sub.input_type,
        domain: sub.domain,
        channel: sub.channel,
        textHash: sub.text_hash,
        redactedText: sub.redacted_text,
        createdAt: sub.created_at,
        result: res
          ? {
              status: res.status,
              confidence: res.confidence,
              signals: res.signals,
              schemaVersion: res.schema_version,
            }
          : undefined,
      };
    });

    return { items, total };
  }

  /**
   * Retrieves a single submission by ID owned strictly by userId.
   */
  static async getSubmissionById(
    client: SupabaseClient | null,
    userId: string,
    submissionId: string
  ): Promise<any | null> {
    const env = loadEnv();
    const shouldCallRemote =
      client &&
      (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes('placeholder');

    if (shouldCallRemote) {
      try {
        const { data: sub, error } = await client
          .from('submissions')
          .select(`
            id,
            input_type,
            domain,
            channel,
            text_hash,
            redacted_text,
            created_at,
            detection_results (
              id,
              status,
              confidence,
              signals,
              schema_version
            )
          `)
          .eq('id', submissionId)
          .eq('user_id', userId)
          .single();

        if (!error && sub) {
          const det = Array.isArray(sub.detection_results)
            ? sub.detection_results[0]
            : sub.detection_results;
          return {
            id: sub.id,
            inputType: sub.input_type,
            domain: sub.domain,
            channel: sub.channel,
            createdAt: sub.created_at,
            result: det
              ? {
                  status: det.status,
                  confidenceScore: det.confidence,
                  signals: det.signals,
                }
              : null,
          };
        }
      } catch (err) {
        logger.warn({ err }, 'Supabase getSubmissionById failed, trying in-memory');
      }
    }

    const sub = inMemorySubmissions.find((s) => s.id === submissionId && s.user_id === userId);
    if (!sub) return null;

    const det = inMemoryResults.find((r) => r.submission_id === submissionId);
    return {
      id: sub.id,
      inputType: sub.input_type,
      domain: sub.domain,
      channel: sub.channel,
      createdAt: sub.created_at,
      result: det
        ? {
            status: det.status,
            confidenceScore: det.confidence,
            signals: det.signals,
          }
        : null,
    };
  }

  /**
   * Deletes a specific submission owned by userId.
   * Returns true if deleted, false if not found or unowned.
   */
  static async deleteSubmission(
    client: SupabaseClient | null,
    userId: string,
    submissionId: string
  ): Promise<boolean> {
    const env = loadEnv();

    const shouldCallRemote =
      client &&
      (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes('placeholder');

    if (shouldCallRemote) {
      try {
        const { error, count } = await client
          .from('submissions')
          .delete({ count: 'exact' })
          .match({ id: submissionId, user_id: userId });

        if (!error && count && count > 0) {
          return true;
        }
      } catch (err) {
        logger.warn({ err }, 'Supabase delete failed, trying in-memory');
      }
    }

    const idx = inMemorySubmissions.findIndex((s) => s.id === submissionId && s.user_id === userId);
    if (idx === -1) {
      return false;
    }

    inMemorySubmissions.splice(idx, 1);
    const resIdx = inMemoryResults.findIndex((r) => r.submission_id === submissionId);
    if (resIdx !== -1) {
      inMemoryResults.splice(resIdx, 1);
    }

    return true;
  }

  /**
   * Privacy erasure: deletes all user data, submissions, and detection results.
   */
  static async eraseAccountData(
    client: SupabaseClient | null,
    userId: string
  ): Promise<{ deletedCount: number }> {
    const env = loadEnv();
    let deletedCount = 0;

    const shouldCallRemote =
      client &&
      (env.NODE_ENV !== 'test' || process.env.TEST_LIVE_SUPABASE === 'true') &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes('placeholder');

    if (shouldCallRemote) {
      try {
        const { count } = await client
          .from('submissions')
          .delete({ count: 'exact' })
          .eq('user_id', userId);

        deletedCount = count || 0;

        await client.from('profiles').delete().eq('id', userId);
      } catch (err) {
        logger.warn({ err }, 'Supabase erasure failed');
      }
    }

    const userSubs = inMemorySubmissions.filter((s) => s.user_id === userId);
    deletedCount = Math.max(deletedCount, userSubs.length);

    for (const sub of userSubs) {
      const resIdx = inMemoryResults.findIndex((r) => r.submission_id === sub.id);
      if (resIdx !== -1) {
        inMemoryResults.splice(resIdx, 1);
      }
    }

    for (let i = inMemorySubmissions.length - 1; i >= 0; i--) {
      if (inMemorySubmissions[i].user_id === userId) {
        inMemorySubmissions.splice(i, 1);
      }
    }

    return { deletedCount };
  }
}
