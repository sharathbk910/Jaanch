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

    // If file doesn't exist, SPA fallback to index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(dist, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

const SAMPLE_CONCERN_DATA = {
  inputText: 'Deposit Rs 3500 refundable laptop deposit',
  domain: 'job',
  channel: 'web_form',
  timestamp: new Date().toISOString(),
  result: {
    status: 'HIGH_CONCERN',
    confidenceScore: 96,
    signals: [
      {
        id: 'sig_fee',
        ruleId: 'RULE_UPFRONT_FEE',
        title: 'Upfront Security Deposit Demanded',
        whyItMatters: 'Legitimate employers never demand payment for laptops, training, or job offers.',
        evidence: 'Deposit ₹3,500 refundable laptop security deposit within 2 hours via UPI to tcs.hr@okaxis',
        severity: 'critical',
      },
      {
        id: 'sig_urgency',
        ruleId: 'RULE_COERCIVE_DEADLINE',
        title: 'Coercive Time Pressure Tactics',
        whyItMatters: 'Fraudsters create artificial 2-hour urgency to prevent candidates from verifying with real employers.',
        evidence: 'within 2 hours via UPI or your job offer stands cancelled',
        severity: 'high',
      },
    ],
    unverified: [
      'Email address is not an official @tcs.com corporate email.',
      'Appointment letter is not corroborated in TCS Careers portal.',
    ],
    extractedEntities: {
      urls: ['http://tcs-careers.net/appointment'],
      domains: ['tcs-careers.net'],
      emails: ['careers@tcs-careers.net'],
      phones: ['+91 98765 43210'],
      upiHandles: ['tcs.hr@okaxis'],
      amounts: ['₹3,500'],
      organization: 'TCS',
    },
    recommendedActions: [
      'Do not transfer any money or pay via UPI. This pattern matches known job recruitment scams.',
      'Block the recruiter on WhatsApp, Telegram, and email immediately.',
      'If you have already paid, dial 1930 immediately or file a report at cybercrime.gov.in.',
    ],
    auditId: 'audit_sample_concern',
  },
};

async function generateScreenshots() {
  console.log('=== JAANCH RESULTS SCREENSHOT GENERATOR (360px, 768px, 1280px in Light/Dark & EN/HI/KN) ===\n');

  if (!fs.existsSync(distDir)) {
    throw new Error(`client/dist does not exist at ${distDir}. Please run "npm run build -w client" first.`);
  }

  const outDir = path.resolve(rootDir, 'docs', 'ui-shots', 'results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const server = createStaticServer(distDir);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const viewports = [
    { name: '360', width: 360, height: 800 },
    { name: '768', width: 768, height: 1024 },
    { name: '1280', width: 1280, height: 900 },
  ];

  const themes = ['light', 'dark'];
  const languages = ['en', 'hi', 'kn'];

  let browser;
  let count = 0;

  try {
    browser = await chromium.launch({ headless: true });

    for (const vp of viewports) {
      for (const theme of themes) {
        for (const lang of languages) {
          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            deviceScaleFactor: 1.5,
          });

          const page = await context.newPage();

          // Pre-seed localStorage and sessionStorage before navigation
          await page.addInitScript(({ t, l, sampleData }) => {
            window.localStorage.setItem('jaanch_theme', t);
            window.localStorage.setItem('jaanch_language', l);
            window.sessionStorage.setItem('jaanch_guest_analysis', JSON.stringify(sampleData));
          }, { t: theme, l: lang, sampleData: SAMPLE_CONCERN_DATA });

          await page.goto(`${baseUrl}/results/local`, { waitUntil: 'networkidle' });

          // Ensure theme and lang are accurately applied to DOM
          await page.evaluate(({ t, l }) => {
            document.documentElement.lang = l;
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
              document.documentElement.setAttribute('data-theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', 'light');
            }
          }, { t: theme, l: lang });

          // Wait for fonts to be ready
          await page.evaluate(async () => {
            await document.fonts.ready;
          });

          // Small settling delay for layout stability
          await page.waitForTimeout(250);

          const fileName = `results-${lang}-${theme}-${vp.name}px.png`;
          const filePath = path.join(outDir, fileName);

          await page.screenshot({ path: filePath, fullPage: true });
          count++;
          console.log(`[${count}/18] Saved: docs/ui-shots/results/${fileName} (${vp.name}px, ${theme}, ${lang})`);

          await context.close();
        }
      }
    }

    console.log(`\n✅ Generated all 18 visual proof screenshots successfully in docs/ui-shots/results/`);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

generateScreenshots().catch((err) => {
  console.error('\n❌ Screenshot generation failed:', err.message);
  process.exit(1);
});

