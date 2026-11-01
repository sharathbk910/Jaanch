import confetti from 'canvas-confetti';

function isCanvasSupported(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  } catch {
    return false;
  }
}

function getTokenColors(): string[] {
  if (typeof window === 'undefined') return [];
  const styles = getComputedStyle(document.documentElement);
  const sky = styles.getPropertyValue('--color-neo-sky').trim();
  const peach = styles.getPropertyValue('--color-neo-peach').trim();
  const mint = styles.getPropertyValue('--color-neo-mint').trim();
  const yellow = styles.getPropertyValue('--color-neo-yellow').trim();
  const border = styles.getPropertyValue('--color-neo-border').trim();
  return [sky, peach, mint, yellow, border].filter(Boolean);
}

export function fireCelebrationConfetti() {
  if (!isCanvasSupported()) return;
  try {
    const colors = getTokenColors();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: colors.length > 0 ? colors : undefined,
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback if canvas is unsupported
  }
}

export function fireVerificationBlast() {
  if (!isCanvasSupported()) return;
  try {
    const end = Date.now() + 600;
    const colors = getTokenColors();

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors.length > 0 ? colors : undefined,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors.length > 0 ? colors : undefined,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Graceful fallback
  }
}
