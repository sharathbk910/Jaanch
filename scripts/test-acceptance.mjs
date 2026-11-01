import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CRITERIA = [
  { id: 'CRIT-01', name: 'Hero section with CTA and official portal notice' },
  { id: 'CRIT-02', name: 'Sticky nav with no content overlap' },
  { id: 'CRIT-03', name: 'Language switch (EN / HI / KN)' },
  { id: 'CRIT-04', name: '3 test scenarios / sample chips' },
  { id: 'CRIT-05', name: '25-character minimum input validation' },
  { id: 'CRIT-06', name: 'Results layout (Status, Why bullets, Next steps)' },
  { id: 'CRIT-07', name: 'PDF export <= 4 pages and >= 75% fill' },
  { id: 'CRIT-08', name: 'Design token compliance (no hardcoded colors)' },
  { id: 'CRIT-09', name: 'Responsive layout from 360px viewport' },
  { id: 'CRIT-10', name: 'No secrets in client bundle' },
];

async function checkUrlReachable(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 1500 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function runAcceptanceHarness() {
  console.log('=== JAANCH ACCEPTANCE CRITERIA HARNESS ===\n');

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const isClientRunning = await checkUrlReachable(clientUrl);

  const results = [];

  for (const crit of CRITERIA) {
    // In Phase 1, UI features are not yet implemented
    // The harness reports NOT_YET_IMPLEMENTED honestly unless the full verification is performed.
    if (!isClientRunning) {
      results.push({
        id: crit.id,
        name: crit.name,
        status: 'NOT_YET_IMPLEMENTED',
        details: 'Client UI server is not currently running or page components not yet deployed.',
      });
      continue;
    }

    // When client is running in later phases, CDP / DOM checks will verify live criteria here.
    results.push({
      id: crit.id,
      name: crit.name,
      status: 'NOT_YET_IMPLEMENTED',
      details: 'Live DOM check pending Phase implementation.',
    });
  }

  let passCount = 0;
  let failCount = 0;
  let notImplCount = 0;

  for (const r of results) {
    if (r.status === 'PASS') passCount++;
    else if (r.status === 'FAIL') failCount++;
    else notImplCount++;

    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏳';
    console.log(`${icon} [${r.id}] ${r.name.padEnd(52)} : ${r.status}`);
    if (r.status !== 'PASS') {
      console.log(`     Reason: ${r.details}`);
    }
  }

  console.log('\n--- Acceptance Test Summary ---');
  console.log(`Total: ${results.length} | PASS: ${passCount} | FAIL: ${failCount} | NOT_YET_IMPLEMENTED: ${notImplCount}\n`);

  return results;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  runAcceptanceHarness().then(() => {
    // Harness exits 0 when properly reporting status without crashes
    process.exit(0);
  });
}
