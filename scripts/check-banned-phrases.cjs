const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const bannedPhrasesPath = path.join(__dirname, 'banned-phrases.json');
const allowlistPath = path.join(__dirname, 'banned-phrases-allowlist.json');

const bannedPhrases = JSON.parse(fs.readFileSync(bannedPhrasesPath, 'utf8'));
const allowlist = fs.existsSync(allowlistPath)
  ? JSON.parse(fs.readFileSync(allowlistPath, 'utf8'))
  : [];

function isAllowed(filePath, phrase) {
  const normalizedFile = filePath.replace(/\\/g, '/');
  return allowlist.some((item) => {
    const itemPath = (item.file || '').replace(/\\/g, '/');
    return normalizedFile.includes(itemPath) && item.phrase.toLowerCase() === phrase.toLowerCase();
  });
}

function scanFile(filePath, violations) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lowerContent = content.toLowerCase();

  for (const phrase of bannedPhrases) {
    const lowerPhrase = phrase.toLowerCase();
    let index = lowerContent.indexOf(lowerPhrase);

    while (index !== -1) {
      if (!isAllowed(filePath, phrase)) {
        // Find line number
        const linesUpToMatch = content.slice(0, index).split('\n');
        const lineNumber = linesUpToMatch.length;
        violations.push({
          file: filePath,
          line: lineNumber,
          phrase,
        });
      }
      index = lowerContent.indexOf(lowerPhrase, index + lowerPhrase.length);
    }
  }
}

function scanDirectory(dirPath, violations) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDirectory(fullPath, violations);
      }
    } else if (entry.isFile()) {
      if (/\.(tsx?|jsx?|mjs|cjs|json)$/.test(entry.name)) {
        // Skip banned phrases definition files themselves
        if (fullPath.includes('banned-phrases.json') || fullPath.includes('banned-phrases-allowlist.json')) {
          continue;
        }
        scanFile(fullPath, violations);
      }
    }
  }
}

function run() {
  const violations = [];
  const customTarget = process.argv[2];
  const targets = customTarget
    ? [path.resolve(customTarget)]
    : [
        path.join(rootDir, 'shared', 'src'),
        path.join(rootDir, 'server', 'src'),
        path.join(rootDir, 'client', 'src'),
      ];

  for (const target of targets) {
    if (fs.existsSync(target)) {
      if (fs.statSync(target).isFile()) {
        scanFile(target, violations);
      } else {
        scanDirectory(target, violations);
      }
    }
  }

  if (violations.length > 0) {
    console.error(`[check-banned-phrases] FAILED: Found ${violations.length} banned phrase violation(s):`);
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line} -> "${v.phrase}"`);
    }
    process.exit(1);
  } else {
    console.log('[check-banned-phrases] PASSED: No certainty claim banned phrases found.');
    process.exit(0);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, scanFile, scanDirectory, bannedPhrases, allowlist };
