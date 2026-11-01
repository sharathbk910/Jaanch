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
};
