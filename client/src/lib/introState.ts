export const INTRO_SEEN_KEY = 'jaanch_brand_intro_seen';

export function hasSeenBrandIntro(): boolean {
  try {
    return typeof window !== 'undefined' && window.sessionStorage?.getItem(INTRO_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markBrandIntroSeen(): boolean {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
      return true;
    }
  } catch {}
  return false;
}

