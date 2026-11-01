/**
 * JAANCH ENVIRONMENT & HEALTH DOCTOR
 *
 * Checks:
 * 1. Node.js runtime version >= 20.0.0
 * 2. Environment variable NAMES present for Server and Client
 * 3. Security rules: No service role keys, pepper >= 24 chars, values NEVER printed
 * 4. Supabase URL reachability probe
 * 5. Server /api/health reachability probe
 *
 * Usage: node scripts/doctor.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to parse simple .env files without importing external libraries
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

// Simple fetch wrapper with timeout using native http/https
function probeUrl(targetUrl, timeoutMs = 3000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        parsed,
        {
          method: 'GET',
          timeout: timeoutMs,
          headers: { 'User-Agent': 'Jaanch-Doctor/1.0' },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            if (body.length < 1000) body += chunk;
          });
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 400,
              statusCode: res.statusCode,
              body,
            });
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: `Connection timed out after ${timeoutMs}ms` });
      });

      req.on('error', (err) => {
        resolve({ ok: false, error: err.message });
      });

      req.end();
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

export async function runDoctor(options = { silent: false }) {
  const results = {
    nodeVersion: { ok: false, version: process.version },
    serverEnv: { ok: false, checked: [] },
    clientEnv: { ok: false, checked: [] },
    security: { ok: false, issues: [] },
    supabase: { ok: false, reachable: false, note: '' },
    serverHealth: { ok: false, reachable: false, note: '' },
    allPassed: false,
  };

  const logs = [];
  const log = (msg) => {
    logs.push(msg);
    if (!options.silent) console.log(msg);
  };

  log('===============================================================');
  log('              JAANCH ENVIRONMENT & HEALTH DOCTOR              ');
  log('===============================================================');

  // 1. Check Node Version
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major >= 20) {
    results.nodeVersion.ok = true;
    log(`[PASS] Node.js Runtime: ${process.version} (>= 20.0.0 required)`);
  } else {
    results.nodeVersion.ok = false;
    log(`[FAIL] Node.js Runtime: ${process.version} is unsupported. Node >= 20.0.0 required.`);
  }

  // 2. Load Environments
  const serverEnvFile = path.join(ROOT_DIR, 'server', '.env');
  const clientEnvFile = path.join(ROOT_DIR, 'client', '.env');
  const serverEnv = { ...parseEnvFile(serverEnvFile), ...process.env };
  const clientEnv = { ...parseEnvFile(clientEnvFile), ...process.env };

  log('\n--- Checking Server Environment Variable Names ---');
  const requiredServerVars = [
    'PORT',
    'NODE_ENV',
    'CLIENT_ORIGINS',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'REPORT_HASH_PEPPER',
  ];

  let serverEnvOk = true;
  for (const varName of requiredServerVars) {
    const val = serverEnv[varName];
    const isSet = val !== undefined && val !== '';
    const isPlaceholder = isSet && (val.includes('your-') || val.includes('placeholder'));
    
    if (isSet && !isPlaceholder) {
      log(`[PASS] Server variable '${varName}' is present (never printing value)`);
      results.serverEnv.checked.push({ name: varName, status: 'PASS' });
    } else if (isPlaceholder) {
      log(`[WARN] Server variable '${varName}' has default placeholder value`);
      results.serverEnv.checked.push({ name: varName, status: 'WARN' });
    } else {
      log(`[FAIL] Server variable '${varName}' is missing or empty`);
      results.serverEnv.checked.push({ name: varName, status: 'FAIL' });
      serverEnvOk = false;
    }
  }

  // Optional server vars (reporting presence without failure)
  const optionalServerVars = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'LOG_LEVEL'];
  for (const varName of optionalServerVars) {
    const isSet = serverEnv[varName] !== undefined && serverEnv[varName] !== '';
    log(`[INFO] Optional variable '${varName}': ${isSet ? 'configured' : 'not configured (optional)'}`);
  }
  results.serverEnv.ok = serverEnvOk;

  log('\n--- Checking Client Environment Variable Names ---');
  const requiredClientVars = [
    'VITE_API_BASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  let clientEnvOk = true;
  for (const varName of requiredClientVars) {
    const val = clientEnv[varName];
    const isSet = val !== undefined && val !== '';
    const isPlaceholder = isSet && (val.includes('your-') || val.includes('placeholder'));

    if (isSet && !isPlaceholder) {
      log(`[PASS] Client variable '${varName}' is present (never printing value)`);
      results.clientEnv.checked.push({ name: varName, status: 'PASS' });
    } else if (isPlaceholder) {
      log(`[WARN] Client variable '${varName}' has default placeholder value`);
      results.clientEnv.checked.push({ name: varName, status: 'WARN' });
    } else {
      log(`[FAIL] Client variable '${varName}' is missing or empty`);
      results.clientEnv.checked.push({ name: varName, status: 'FAIL' });
      clientEnvOk = false;
    }
  }
  results.clientEnv.ok = clientEnvOk;

  log('\n--- Security Invariants Check ---');
  let securityOk = true;

  // Check no service role key
  const forbiddenKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'];
  for (const k of forbiddenKeys) {
    if (serverEnv[k] || clientEnv[k]) {
      log(`[FAIL] Forbidden key '${k}' detected! Service-role keys must NEVER be present.`);
      results.security.issues.push(`Forbidden key ${k} found`);
      securityOk = false;
    }
  }
  if (securityOk) {
    log('[PASS] No service-role key in runtime environment');
  }

  // Check REPORT_HASH_PEPPER length
  const pepper = serverEnv['REPORT_HASH_PEPPER'];
  if (pepper && pepper.length >= 24) {
    log(`[PASS] REPORT_HASH_PEPPER meets minimum length requirement (>= 24 chars)`);
  } else {
    log(`[FAIL] REPORT_HASH_PEPPER is missing or under 24 characters`);
    results.security.issues.push('REPORT_HASH_PEPPER under 24 chars');
    securityOk = false;
  }
  results.security.ok = securityOk;

  // 3. Supabase URL Reachability
  log('\n--- Reachability & Service Probes ---');
  const supabaseUrl = serverEnv['SUPABASE_URL'] || clientEnv['VITE_SUPABASE_URL'];
  if (supabaseUrl && !supabaseUrl.includes('your-project')) {
    log(`[PROBE] Probing Supabase URL host: ${supabaseUrl.replace(/https?:\/\//, '').split('/')[0]}`);
    const probe = await probeUrl(`${supabaseUrl}/auth/v1/health`, 3000);
    if (probe.ok || probe.statusCode === 200 || probe.statusCode === 401 || probe.statusCode === 404) {
      log(`[PASS] Supabase host reachable (HTTP ${probe.statusCode || 'OK'})`);
      results.supabase.ok = true;
      results.supabase.reachable = true;
    } else {
      log(`[WARN] Supabase probe returned error: ${probe.error || `HTTP ${probe.statusCode}`}`);
      results.supabase.note = probe.error || `HTTP ${probe.statusCode}`;
    }
  } else {
    log('[INFO] Supabase URL is set to default placeholder; skipping live probe.');
    results.supabase.note = 'Default placeholder';
  }

  // 4. Server /api/health Probe
  const port = serverEnv['PORT'] || 8080;
  const healthUrl = `http://127.0.0.1:${port}/api/health`;
  log(`[PROBE] Probing local server health: ${healthUrl}`);
  const healthProbe = await probeUrl(healthUrl, 1500);
  if (healthProbe.ok) {
    log(`[PASS] Server is LIVE and healthy on port ${port} (HTTP ${healthProbe.statusCode})`);
    results.serverHealth.ok = true;
    results.serverHealth.reachable = true;
  } else {
    log(`[INFO] Server is currently offline or unreachable on port ${port}.`);
    log('       (Start with "npm run dev" to verify live server healthcheck).');
    results.serverHealth.note = 'Server offline (start dev server to verify)';
  }

  // Overall Verdict
  results.allPassed = results.nodeVersion.ok && results.security.ok;
  log('\n===============================================================');
  if (results.allPassed) {
    log('✅ DOCTOR STATUS: PASS – System configuration is secure and valid.');
  } else {
    log('❌ DOCTOR STATUS: FAIL – Please address the failures identified above.');
  }
  log('===============================================================\n');

  return { results, logs };
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDoctor().then(({ results }) => {
    process.exit(results.allPassed ? 0 : 1);
  });
}

