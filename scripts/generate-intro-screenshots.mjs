import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'docs', 'ui-shots', 'intro');

const PHASES = [
  { phase: 'walking', filename: 'intro-frame-1-walking.png', label: 'Walking & Mid-Drag Pose' },
  { phase: 'exhausted', filename: 'intro-frame-2-exhausted.png', label: 'Exhaustion & Sweat Droplet Pose' },
  { phase: 'resting', filename: 'intro-frame-3-resting.png', label: 'Resting & Crossed-Legs Pose' },
];

async function captureIntroScreenshots() {
  console.log('=== JAANCH PHASE 14: ROBOT INTRO KEYFRAME SCREENSHOTS ===\n');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  for (const item of PHASES) {
    const url = `http://localhost:5173/?introPhase=${item.phase}`;
    console.log(`Navigating to ${url} (${item.label})...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the robot intro SVG scene to be mounted
    await page.waitForSelector('[data-testid="robot-intro"]', { state: 'visible', timeout: 5000 });
    // Small pause to allow spring animation to settle
    await page.waitForTimeout(300);

    const destPath = path.join(outDir, item.filename);
    await page.screenshot({ path: destPath, fullPage: false });
    console.log(` Saved: ${destPath}`);
  }

  await browser.close();
  console.log('\n All 3 keyframe screenshots generated successfully in docs/ui-shots/intro/\n');
}

captureIntroScreenshots().catch((err) => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
