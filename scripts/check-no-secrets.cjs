const fs = require('fs');
const path = require('path');

const FORBIDDEN_LITERALS = [
  'GEMINI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REPORT_HASH_PEPPER',
  'SAFE_BROWSING_API_KEY',
  '@google/genai',
];

const JWT_REGEX = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/;

function scanDirectory(dirPath, violations) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scanDirectory(fullPath, violations);
      }
    } else if (entry.isFile()) {
      // Check file extension
      if (/\.(tsx?|jsx?|html|json|css|mjs|cjs)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');

        for (const token of FORBIDDEN_LITERALS) {
          if (content.includes(token)) {
            violations.push({
              file: fullPath,
              reason: `Forbidden token detected: "${token}"`,
            });
          }
        }

        const jwtMatch = content.match(JWT_REGEX);
        if (jwtMatch) {
          violations.push({
            file: fullPath,
            reason: `Potential JWT secret pattern detected: "${jwtMatch[0].slice(0, 16)}..."`,
          });
        }
      }
    }
  }
}

function run() {
  const violations = [];
  const rootDir = path.resolve(__dirname, '..');
  
  // Custom directory support via CLI argument or env for testing
  const customTarget = process.argv[2];
  const targets = customTarget
    ? [path.resolve(customTarget)]
    : [
        path.join(rootDir, 'client', 'src'),
        path.join(rootDir, 'client', 'dist'),
      ];

  for (const target of targets) {
    scanDirectory(target, violations);
  }

  if (violations.length > 0) {
    console.error(`[check-no-secrets] FAILED: Found ${violations.length} secret violation(s):`);
    for (const v of violations) {
      console.error(`  - ${v.file}: ${v.reason}`);
    }
    process.exit(1);
  } else {
    console.log('[check-no-secrets] PASSED: No secrets found in client source or distribution.');
    process.exit(0);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, FORBIDDEN_LITERALS, JWT_REGEX, scanDirectory };
