import {
  AnalyzeResultSchema,
  type AnalyzeRequestInput,
  type AnalyzeResult,
} from '@jaanch/shared';
import { supabase } from './supabase.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = (await supabase.auth.getSession()).data.session;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      body?.error?.message || `Request failed with status ${res.status}`,
      res.status,
      body?.error?.code || 'UNKNOWN_ERROR',
      body?.error?.details
    );
  }

  return body.data;
}

export const apiClient = {
  /**
   * Submits page feedback via FeedbackPill component
   */
  async submitPageFeedback(data: {
    page: string;
    rating: number;
    message?: string;
  }): Promise<{ id: string }> {
    return request<{ id: string }>('/api/feedback/page', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Submits offer text for analysis
   */
  async analyzeOffer(input: AnalyzeRequestInput & { saveToHistory?: boolean }): Promise<AnalyzeResult> {
    const rawData = await request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return AnalyzeResultSchema.parse(rawData);
  },

  /**
   * Checks a hyperlink for lookalike typosquatting and RDAP age
   */
  async checkLink(url: string): Promise<any> {
    return request<any>('/api/link-check', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  /**
   * Retrieves paginated user submission history
   */
  async getHistory(params: { page?: number; limit?: number; domain?: string } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.domain) query.set('domain', params.domain);

    const qs = query.toString();
    return request<any>(`/api/history${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieves a specific submission details owned by the authenticated user
   */
  async getHistoryItem(id: string): Promise<any> {
    return request<any>(`/api/history/${id}`);
  },

  /**
   * Deletes a specific submission owned by the authenticated user
   */
  async deleteHistory(id: string): Promise<{ success: boolean; deletedId: string }> {
    return request<{ success: boolean; deletedId: string }>(`/api/history/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Privacy erasure: deletes all user account data
   */
  async eraseAccountData(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/account/data', {
      method: 'DELETE',
    });
  },

  /**
   * Community threat reporting: reports a fraudulent entity (email, domain, phone, upi)
   */
  async reportEntity(data: {
    entityType: 'email' | 'domain' | 'phone' | 'upi' | 'bank_account';
    value: string;
    channel?: string;
    description?: string;
  }): Promise<{ reportId: string; status: string; reportCount: number; message: string }> {
    return request<{ reportId: string; status: string; reportCount: number; message: string }>(
      '/api/reports/entity',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Threat intelligence lookup
   */
  async lookupThreatIntel(
    entities: Array<{ entityType: 'email' | 'domain' | 'phone' | 'upi' | 'bank_account'; value: string }>
  ): Promise<{ matches: any[] }> {
    return request<{ matches: any[] }>('/api/threat-intel/lookup', {
      method: 'POST',
      body: JSON.stringify({ entities }),
    });
  },

  /**
   * Moderator: retrieves reported entities queue
   */
  async getModerationEntities(params: { status?: string; page?: number; limit?: number } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return request<any>(`/api/moderation/entities${qs ? `?${qs}` : ''}`);
  },

  /**
   * Moderator: transitions threat indicator lifecycle state
   */
  async transitionEntityStatus(id: string, data: { toStatus: string; notes?: string }): Promise<any> {
    return request<any>(`/api/moderation/entities/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Submits a scam intelligence report for deduplication and community protection
   */
  async submitIntelReport(data: {
    text: string;
    category?: string;
    indicators?: Array<{ type: 'url' | 'domain' | 'phone' | 'upi'; value: string; maskedDisplay?: string }>;
    shareIndicators: boolean;
  }): Promise<{ recordId: string; publicId: string; status: string; deduplicated: boolean; isNewRecord: boolean; message: string }> {
    return request<{ recordId: string; publicId: string; status: string; deduplicated: boolean; isNewRecord: boolean; message: string }>(
      '/api/reports',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Contests a threat intelligence record
   */
  async disputeIntelRecord(data: {
    publicId: string;
    reason: string;
    contactEmail?: string;
  }): Promise<{ publicId: string; status: string; message: string }> {
    return request<{ publicId: string; status: string; message: string }>('/api/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Moderator: fetches moderation queue of shared threat records
   */
  async getModerationQueue(params: { status?: string; page?: number; limit?: number } = {}): Promise<{
    items: Array<{
      id: string;
      publicId: string;
      status: string;
      category: string;
      scrubbedText: string;
      firstReportedAt: string;
      reportCount: number;
      indicators: string[];
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return request<any>(`/api/moderation/queue${qs ? `?${qs}` : ''}`);
  },

  /**
   * Moderator: fetches full detail of an intel record (scrubbed text only)
   */
  async getModerationRecordDetail(id: string): Promise<{
    id: string;
    publicId: string;
    status: string;
    category: string;
    scrubbedText: string;
    firstReportedAt: string;
    confirmedAt: string | null;
    reportCount: number;
    indicators: Array<{ type: string; maskedDisplay: string }>;
    history: Array<{ action: string; reason: string; createdAt: string; newStatus: string | null }>;
  }> {
    return request<any>(`/api/moderation/records/${id}`);
  },

  /**
   * Moderator: edits scrubbed text to sanitize sensitive information
   */
  async editModerationScrubbing(id: string, data: { newScrubbedText: string; reason: string }): Promise<{ id: string; scrubbedText: string }> {
    return request<{ id: string; scrubbedText: string }>(`/api/moderation/records/${id}/scrubbing`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Moderator: executes confirm, dismiss, dispute, or retract with mandatory reason
   */
  async executeModerationAction(
    id: string,
    data: { action: 'confirm' | 'dismiss' | 'dispute' | 'retract'; reason: string }
  ): Promise<{ id: string; status: string; message: string }> {
    return request<{ id: string; status: string; message: string }>(`/api/moderation/records/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Generates recruiter challenge email or safe reply draft
   */
  async generateChallengeEmail(data: {
    kind?: 'challenge' | 'safe_reply';
    domain?: string;
    claimedOrg?: string;
    tone?: 'polite' | 'firm';
    senderName?: string;
    useAi?: boolean;
  }): Promise<{ subject: string; body: string; source: 'ai' | 'template'; kind: 'challenge' | 'safe_reply' }> {
    return request<{ subject: string; body: string; source: 'ai' | 'template'; kind: 'challenge' | 'safe_reply' }>(
      '/api/challenge-email',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

