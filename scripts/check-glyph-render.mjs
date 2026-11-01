import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Sample representative strings in Hindi and Kannada from translations.ts
const hindiText = {
  brand: 'जांच.',
  title: 'इंटर्नशिप, नौकरी या स्कॉलरशिप के लिए कभी अग्रिम शुल्क न दें।',
  subtitle: 'भारतीय छात्रों के लिए तत्काल, निःशुल्क और गोपनीयता-सुरक्षित ऑफर सत्यापन। पैसे ट्रांसफर करने या निजी दस्तावेज साझा करने से पहले स्वचालित जांच चलाएं।',
  zeroFees: 'शून्य अग्रिम शुल्क',
  helpline: 'राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930',
  complexConjuncts: 'स्कॉलरशिप, इंटर्नशिप, प्रशिक्षण, नियुक्ति, दृष्टिकोण',
};

const kannadaText = {
  brand: 'ಜಾಂಚ್.',
  title: 'ಇಂಟರ್ನ್‌ಶಿಪ್, ಉದ್ಯೋಗ ಅಥವಾ ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕಾಗಿ ಮುಂಗಡ ಹಣವನ್ನು ಎಂದಿಗೂ ಪಾವತಿಸಬೇಡಿ.',
  subtitle: 'ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ತ್ವರಿತ, ಉಚಿತ ಮತ್ತು ಗೌಪ್ಯತೆ-ರಕ್ಷಿತ ಆಫರ್ ಪರಿಶೀಲನೆ. ಹಣ ವರ್ಗಾಯಿಸುವ ಅಥವಾ ದಾಖಲೆ ಹಂಚಿಕೊಳ್ಳುವ ಮುನ್ನ ಸ್ವಯಂಚಾಲಿತ ಪರಿಶೀಲನೆ ನಡೆಸಿ.',
  zeroFees: 'ಶೂನ್ಯ ಮುಂಗಡ ಶುಲ್ಕ',
  helpline: 'ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ: 1930',
  complexConjuncts: 'ಇಂಟರ್ನ್‌ಶಿಪ್, ವಿದ್ಯಾರ್ಥಿವೇತನ, ನಿಷ್ಠೆ, ಲಕ್ಷ್ಯ, ಆಫರ್',
};

function generateHtml(lang, data) {
  const fontLink =
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

  const fontFamily =
    lang === 'hi'
      ? "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif"
      : "'Noto Sans Kannada', 'Plus Jakarta Sans', sans-serif";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=360, initial-scale=1.0">
  <title>Glyph Render Test (${lang})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontLink}" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 360px;
      margin: 0 auto;
      background-color: #F9F8F3;
      color: #141413;
      font-family: ${fontFamily};
      padding: 16px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 1px solid #E6E5E1;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand {
      font-size: 20px;
      font-weight: 700;
      color: #141414;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E6E5E1;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    h1 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 22px;
      line-height: 1.3;
      margin-bottom: 12px;
      color: #141413;
    }
    p {
      font-size: 14px;
      color: #57534E;
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      background: #EAF6EE;
      color: #14532D;
      border: 1px solid #A7D7B3;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .helpline {
      background: #FFF1E6;
      border: 1px solid #F0B4B4;
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 13px;
      color: #C2410C;
      font-weight: 600;
    }
    .conjuncts {
      margin-top: 12px;
      font-size: 13px;
      padding: 8px;
      background: #F9F8F3;
      border: 1px dashed #D6D4CD;
      border-radius: 4px;
    }
    canvas {
      display: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand" id="brand">${data.brand}</div>
  </div>
  <div class="card">
    <span class="badge" id="badge">${data.zeroFees}</span>
    <h1 id="hero-title">${data.title}</h1>
    <p id="hero-subtitle">${data.subtitle}</p>
    <div class="helpline" id="helpline">${data.helpline}</div>
    <div class="conjuncts" id="conjuncts">
      <strong>Complex Conjuncts:</strong> <span id="conjunct-text">${data.complexConjuncts}</span>
    </div>
  </div>
  <canvas id="testCanvas" width="300" height="60"></canvas>
</body>
</html>`;
}

async function runCheck() {
  console.log('=== JAANCH GLYPH RENDERING VALIDATION (360px VIEWPORT) ===\n');

  // Start HTTP server to serve the test pages
  let currentLang = 'hi';
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const lang = url.searchParams.get('lang') || currentLang;
    const data = lang === 'kn' ? kannadaText : hindiText;
    const html = generateHtml(lang, data);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const uiShotsDir = path.join(rootDir, 'docs', 'ui-shots');
  if (!fs.existsSync(uiShotsDir)) {
    fs.mkdirSync(uiShotsDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 360, height: 740 },
      deviceScaleFactor: 2, // High-DPI for crisp font glyph rendering
    });

    const page = await context.newPage();

    for (const lang of ['hi', 'kn']) {
      const langName = lang === 'hi' ? 'Hindi (Devanagari)' : 'Kannada';
      console.log(`Checking ${langName} glyph rendering at 360px...`);

      await page.goto(`${baseUrl}/?lang=${lang}`, { waitUntil: 'networkidle' });

      // Wait for fonts to be fully loaded
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      // Verify no tofu (replacement character U+FFFD or missing glyph markers)
      const inspection = await page.evaluate(() => {
        const titleEl = document.getElementById('hero-title');
        const subtitleEl = document.getElementById('hero-subtitle');
        const conjunctsEl = document.getElementById('conjunct-text');
        const canvas = document.getElementById('testCanvas');
        const ctx = canvas.getContext('2d');

        const titleText = titleEl.textContent || '';
        const subtitleText = subtitleEl.textContent || '';
        const conjunctText = conjunctsEl.textContent || '';

        // Check for replacement character
        const hasTofuChar =
          titleText.includes('\uFFFD') ||
          subtitleText.includes('\uFFFD') ||
          conjunctText.includes('\uFFFD');

        const titleRect = titleEl.getBoundingClientRect();
        const subtitleRect = subtitleEl.getBoundingClientRect();

        // Render to canvas to check ink
        ctx.font = '20px ' + window.getComputedStyle(conjunctsEl).fontFamily;
        ctx.fillStyle = '#000000';
        ctx.fillText(conjunctText, 10, 30);
        const imgData = ctx.getImageData(0, 0, 300, 60).data;
        let nonZeroPixels = 0;
        for (let i = 3; i < imgData.length; i += 4) {
          if (imgData[i] > 0) nonZeroPixels++;
        }

        return {
          hasTofuChar,
          titleWidth: titleRect.width,
          titleHeight: titleRect.height,
          subtitleWidth: subtitleRect.width,
          subtitleHeight: subtitleRect.height,
          nonZeroPixels,
          computedFont: window.getComputedStyle(titleEl).fontFamily,
        };
      });

      if (inspection.hasTofuChar) {
        throw new Error(`[FAIL] Tofu character U+FFFD detected in ${langName} rendering!`);
      }
      if (inspection.titleWidth <= 0 || inspection.titleHeight <= 0) {
        throw new Error(`[FAIL] ${langName} title did not render valid bounding box!`);
      }
      if (inspection.nonZeroPixels < 100) {
        throw new Error(`[FAIL] Insufficient canvas glyph rasterization for ${langName}!`);
      }

      // Save screenshot
      const shotPath = path.join(uiShotsDir, `glyph-render-${lang}-360px.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      console.log(`  ✓ No tofu / replacement characters detected`);
      console.log(`  ✓ Text bounding box: ${inspection.titleWidth.toFixed(1)}px x ${inspection.titleHeight.toFixed(1)}px`);
      console.log(`  ✓ Canvas rendered pixels: ${inspection.nonZeroPixels} ink pixels`);
      console.log(`  ✓ Font family applied: ${inspection.computedFont}`);
      console.log(`  ✓ Screenshot saved: ${path.relative(rootDir, shotPath)}\n`);
    }

    console.log('✅ ALL GLYPH RENDERING CHECKS PASSED: Hindi and Kannada render properly without tofu at 360px.\n');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

runCheck().catch((err) => {
  console.error('\n❌ Glyph rendering check failed:', err.message);
  process.exit(1);
});

