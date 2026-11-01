import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regex patterns to match hardcoded color definitions:
// 1. Tailwind arbitrary hex values: e.g., bg-[#ff0000], text-[#123]
const TAILWIND_HEX_REGEX = /\[#(?:[0-9a-fA-F]{3,8})\]/;

// 2. Functional color notations: rgb(...), rgba(...), hsl(...), hsla(...)
const COLOR_FUNC_REGEX = /\b(?:rgb|rgba|hsl|hsla)\s*\([^)]*\)/i;

// 3. Hex color literals: #fff, #ffffff, #12345678 (exclude markdown headings or anchors)
// Matches #hex preceded by quote, backtick, colon, or whitespace
const HEX_COLOR_REGEX = /(?:["'`:=,\s(])(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8}))\b/;

export function scanFileForColors(filePath, content, violations) {
  // tokens.css and react-pdf document stylesheets (which do not run in DOM and cannot consume CSS variables) are exempt
  const lowerBase = path.basename(filePath).toLowerCase();
  if (lowerBase === 'tokens.css' || lowerBase.includes('pdfreport') || lowerBase.includes('pdftokens') || lowerBase.includes('reportdocument')) {
    return;
  }

  const lines = content.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    // Skip single-line comments in code
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    if (TAILWIND_HEX_REGEX.test(line)) {
      const match = line.match(TAILWIND_HEX_REGEX);
      violations.push({
        file: filePath,
        line: lineIndex + 1,
        match: match ? match[0] : '',
        type: 'Tailwind arbitrary hex color',
      });
      continue;
    }

    if (COLOR_FUNC_REGEX.test(line)) {
      const match = line.match(COLOR_FUNC_REGEX);
      violations.push({
        file: filePath,
        line: lineIndex + 1,
        match: match ? match[0] : '',
        type: 'Functional color definition (rgb/rgba/hsl/hsla)',
      });
      continue;
    }

    const hexMatch = line.match(HEX_COLOR_REGEX);
    if (hexMatch) {
      violations.push({
        file: filePath,
        line: lineIndex + 1,
        match: hexMatch[1],
        type: 'Hardcoded Hex color',
      });
    }
  }
}

export function scanDirectory(dirPath, violations) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDirectory(fullPath, violations);
      }
    } else if (entry.isFile()) {
      if (/\.(tsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        scanFileForColors(fullPath, content, violations);
      }
    }
  }
}

export function run() {
  const violations = [];
  const rootDir = path.resolve(__dirname, '..');
  const customTarget = process.argv[2];
  const targetDir = customTarget
    ? path.resolve(customTarget)
    : path.join(rootDir, 'client', 'src');

  if (fs.existsSync(targetDir)) {
    if (fs.statSync(targetDir).isFile()) {
      const content = fs.readFileSync(targetDir, 'utf8');
      scanFileForColors(targetDir, content, violations);
    } else {
      scanDirectory(targetDir, violations);
    }
  }

  if (violations.length > 0) {
    console.error(`[check-no-hardcoded-colors] FAILED: Found ${violations.length} hardcoded color violation(s):`);
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line} [${v.type}]: ${v.match}`);
    }
    process.exit(1);
  } else {
    console.log('[check-no-hardcoded-colors] PASSED: No hardcoded colors found in client/src (.ts/.tsx).');
    process.exit(0);
  }
}

// Run directly when invoked as script
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  run();
}
