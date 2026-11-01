import { type AnalyzeResult } from '@jaanch/shared';

const GUEST_RESULTS_KEY = 'jaanch_guest_analysis';

export interface GuestAnalysisSession {
  inputText: string;
  domain?: string;
  channel?: string;
  result: AnalyzeResult;
  timestamp: string;
}

export function saveGuestAnalysis(session: GuestAnalysisSession): void {
  try {
    sessionStorage.setItem(GUEST_RESULTS_KEY, JSON.stringify(session));
  } catch {
    // SessionStorage may fail in private mode or quota exceeded
  }
}

export function getGuestAnalysis(): GuestAnalysisSession | null {
  try {
    const data = sessionStorage.getItem(GUEST_RESULTS_KEY);
    if (!data) return null;
    return JSON.parse(data) as GuestAnalysisSession;
  } catch {
    return null;
  }
}

export function clearGuestAnalysis(): void {
  try {
    sessionStorage.removeItem(GUEST_RESULTS_KEY);
  } catch {
    // Ignore
  }
}
