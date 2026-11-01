import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'client', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function createStaticServer(dist) {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(dist, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(dist, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

async function generateScreenshots() {
  console.log('=== JAANCH SHARE ALERT SCREENSHOT GENERATOR (360px & 1280px in EN/HI/KN) ===\n');

  if (!fs.existsSync(distDir)) {
    throw new Error(`client/dist does not exist at ${distDir}. Run "npm run build -w client" first.`);
  }

  const outDir = path.resolve(rootDir, 'docs', 'ui-shots', 'share-alert');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const server = createStaticServer(distDir);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const viewports = [
    { name: '360', width: 360, height: 800 },
    { name: '1280', width: 1280, height: 900 },
  ];

  const languages = ['en', 'hi', 'kn'];

  let browser;
  let count = 0;

  try {
    browser = await chromium.launch({ headless: true });

    for (const vp of viewports) {
      for (const lang of languages) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1.5,
        });

        const page = await context.newPage();

        // Pre-seed localStorage and sessionStorage with a confirmed scam audit result
        await page.addInitScript(({ l }) => {
          window.localStorage.setItem('jaanch_language', l);
          window.sessionStorage.setItem(
            'jaanch_guest_analysis',
            JSON.stringify({
              inputText:
                'URGENT: Selected as Software Trainee. Deposit ₹4,500 caution fee via UPI to fakehr@okaxis or job offer stands cancelled.',
              domain: 'job',
              channel: 'whatsapp',
              timestamp: new Date().toISOString(),
              result: {
                auditId: 'guest-audit-confirmed',
                status: 'CONFIRMED_SCAM',
                confidenceScore: 98,
                summary: 'Matched a moderator-confirmed fraud syndicate record.',
                whyBullets: ['Matched verified scam record JNC-INTEL-8842ABCD in the Jaanch Intelligence Network.'],
                signals: [
                  {
                    id: 'SIG_UPFRONT_FEE',
                    ruleId: 'RULE_UPFRONT_FEE',
                    title: 'Upfront Payment Demanded',
                    whyItMatters: 'Legitimate employers never demand laptop caution fees or deposits.',
                    evidence: 'Deposit ₹4,500 caution fee',
                    severity: 'critical',
                    category: 'financial_demand',
                  },
                ],
                extractedEntities: {
                  organization: 'TechCorp Fraud',
                  amounts: ['₹4,500'],
                  upiHandles: ['fakehr@okaxis'],
                },
                intelMatch: {
                  tier: 'exact_text',
                  status: 'confirmed',
                  confidenceBand: 'very_high',
                  explanation: 'Matches a confirmed scam record in the Jaanch Scam Intelligence Network.',
                  publicId: 'JNC-INTEL-8842ABCD',
                  confirmedAt: '2026-11-01T10:00:00.000Z',
                  matchedIndicators: ['fakehr@okaxis'],
                },
              },
            })
          );
        }, { l: lang });

        await page.goto(`${baseUrl}/results/local`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        // 1. Screenshot of the results page with the ShareAlert trigger card
        const cardShot = path.join(outDir, `share-alert-card-${lang}-${vp.name}px.png`);
        await page.screenshot({ path: cardShot, fullPage: false });
        console.log(`[PASS] Captured: ${path.basename(cardShot)}`);
        count++;

        // 2. Open the ShareAlert Modal
        const shareBtn = page.locator('button:has-text("Share on WhatsApp"), button:has-text("व्हाट्सएप पर साझा करें"), button:has-text("ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ")').first();
        if (await shareBtn.isVisible()) {
          await shareBtn.click();
          await page.waitForTimeout(300);

          const modalShot = path.join(outDir, `share-alert-modal-${lang}-${vp.name}px.png`);
          await page.screenshot({ path: modalShot, fullPage: false });
          console.log(`[PASS] Captured: ${path.basename(modalShot)}`);
          count++;
        }

        await context.close();
      }
    }

    console.log(`\n✅ Generated ${count} manual proof screenshots in docs/ui-shots/share-alert/\n`);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

generateScreenshots().catch((err) => {
  console.error('Screenshot generation failed:', err);
  process.exit(1);
});

