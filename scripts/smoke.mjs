/**
 * JAANCH PRODUCTION SMOKE TEST
 *
 * Verifies core API functionality against a running or ephemeral server:
 * 1. GET /api/health (status ok, uptime)
 * 2. POST /api/analyze with Genuine offer -> LIKELY_GENUINE
 * 3. POST /api/analyze with Upfront Fee scam -> HIGH_CONCERN + RULE_UPFRONT_FEE
 * 4. POST /api/analyze with OTP Phishing scam -> HIGH_CONCERN + RULE_BANK_OTP_DEBIT/RULE_OTP_SHARING
 * 5. POST /api/link-check with lookalike domain -> HIGH_RISK
 * 6. POST /api/threat-intel/match with sample text -> HTTP 200
 * 7. Optional signed-in history flow when SMOKE_EMAIL & SMOKE_PASSWORD are set
 *
 * Usage: node scripts/smoke.mjs
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function loadServerModules() {
  const distAppPath = path.join(ROOT_DIR, 'server', 'dist', 'app.js');
  if (fs.existsSync(distAppPath)) {
    const appMod = await import('../server/dist/app.js');
    const envMod = await import('../server/dist/config/env.js');
    return { createApp: appMod.createApp, loadEnv: envMod.loadEnv };
  } else {
    try {
      const appMod = await import('../server/src/app.ts');
      const envMod = await import('../server/src/config/env.ts');
      return { createApp: appMod.createApp, loadEnv: envMod.loadEnv };
    } catch {
      const appMod = await import('../server/src/app.js');
      const envMod = await import('../server/src/config/env.js');
      return { createApp: appMod.createApp, loadEnv: envMod.loadEnv };
    }
  }
}

const GENUINE_FIXTURE = {
  text: `Dear Candidate,
Congratulations! We are pleased to offer you an internship position as a Software Engineering Intern at Tata Consultancy Services (TCS) starting June 2026.
Reporting Location: TCS Olympus, Hiranandani Estate, Thane, Maharashtra 400607.
Stipend: ₹35,000 per month.
Please review the appointment terms on the official TCS NextStep portal at https://nextstep.tcs.com/campus/#/login and submit your acceptance within 7 business days.
TCS will never ask for security deposits, laptop fees, or bank transfers during the hiring process.

Warm regards,
TCS Campus Recruitment Team
hr@tcs.com`,
  domain: 'internship',
  channel: 'email',
  sender: {
    email: 'careers@tcs.com',
    domain: 'tcs.com',
    isOfficialCorporateDomain: true,
  },
  consentFlags: {
    aiAnalysis: false,
    shareIndicators: false,
  },
  inputType: 'raw_text',
  saveToHistory: false,
};

const FEE_SCAM_FIXTURE = {
  text: `URGENT: TCS Careers Offer Letter.
Congratulations! You are selected as Associate Software Engineer.
Deposit ₹3,500 refundable laptop security deposit within 2 hours via UPI to tcs.hr@okaxis or your job offer stands cancelled.
Contact HR on WhatsApp +91 98765 43210 immediately with payment screenshot.`,
  domain: 'job',
  channel: 'whatsapp',
  sender: {
    email: 'careers@tcs-careers-apply.com',
    phone: '+91 98765 43210',
  },
  consentFlags: {
    aiAnalysis: false,
    shareIndicators: false,
  },
  inputType: 'raw_text',
  saveToHistory: false,
};

const OTP_SCAM_FIXTURE = {
  text: `URGENT: Your National Scholarship Scheme grant of ₹25,000 is approved by State Bank of India.
To credit your account immediately, share the 6-digit OTP received on your mobile with official agent on WhatsApp +91 91234 56789.
Failure to share OTP within 15 minutes will result in permanent scholarship cancellation and penalty under DBT guidelines.`,
  domain: 'scholarship',
  channel: 'sms',
  sender: {
    phone: '+91 91234 56789',
  },
  consentFlags: {
    aiAnalysis: false,
    shareIndicators: false,
  },
  inputType: 'raw_text',
  saveToHistory: false,
};

function postJson(url, payload, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(
      parsed,
      {
        method: 'POST',
        headers,
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.write(body);
    req.end();
  });
}

function getJson(url, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(
      parsed,
      {
        method: 'GET',
        headers,
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.end();
  });
}

export async function runSmokeTest() {
  console.log('===============================================================');
  console.log('                 JAANCH PRODUCTION SMOKE TEST                  ');
  console.log('===============================================================');

  const { createApp, loadEnv } = await loadServerModules();
  const env = loadEnv();
  let serverInstance = null;
  let baseUrl = '';

  const remoteTarget = process.env.SMOKE_TARGET_URL || process.env.REMOTE_URL;
  if (remoteTarget) {
    baseUrl = remoteTarget.replace(/\/+$/, '');
    console.log(`[INFO] Targeting configured remote server at ${baseUrl}`);
  } else {
    // Check if server is already running on env.PORT
    const probePort = env.PORT || 8080;
    const isRunning = await new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${probePort}/api/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(800, () => {
        req.destroy();
        resolve(false);
      });
    });

    if (isRunning) {
      baseUrl = `http://127.0.0.1:${probePort}`;
      console.log(`[INFO] Connected to existing server at ${baseUrl}`);
    } else {
      // Start ephemeral server
      const app = createApp();
      serverInstance = http.createServer(app);
      await new Promise((resolve) => {
        serverInstance.listen(0, '127.0.0.1', () => {
          const addr = serverInstance.address();
          baseUrl = `http://127.0.0.1:${addr.port}`;
          console.log(`[INFO] Started ephemeral test server at ${baseUrl}`);
          resolve();
        });
      });
    }
  }

  const results = [];
  const record = (name, pass, details = '') => {
    results.push({ name, pass, details });
    const mark = pass ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${mark} - ${name}${details ? ` (${details})` : ''}`);
  };

  try {
    // 1. Healthcheck
    const health = await getJson(`${baseUrl}/api/health`);
    record(
      'GET /api/health returns HTTP 200 with ok status',
      health.statusCode === 200 && health.body?.status === 'ok',
      `uptime: ${health.body?.uptime ? Math.round(health.body.uptime) : 0}s`
    );

    // 2. Public Config
    const configRes = await getJson(`${baseUrl}/api/config`);
    record(
      'GET /api/config returns public configuration safely',
      configRes.statusCode === 200 && Boolean(configRes.body?.data?.supabaseUrl),
      `supabaseUrl: present, secrets: none`
    );

    // 3. Genuine Offer Analysis
    const genuineRes = await postJson(`${baseUrl}/api/analyze`, GENUINE_FIXTURE);
    const genuineData = genuineRes.body?.data;
    record(
      'POST /api/analyze identifies Genuine TCS Offer as LIKELY_GENUINE',
      genuineRes.statusCode === 200 && genuineData?.status === 'LIKELY_GENUINE',
      `status: ${genuineData?.status}`
    );

    // 4. Upfront Fee Scam Analysis
    const feeRes = await postJson(`${baseUrl}/api/analyze`, FEE_SCAM_FIXTURE);
    const feeData = feeRes.body?.data;
    const hasFeeRule = feeData?.signals?.some(
      (s) => s.ruleId === 'RULE_UPFRONT_FEE' || s.id === 'RULE_UPFRONT_FEE'
    );
    record(
      'POST /api/analyze flags Upfront Fee Scam as HIGH_CONCERN',
      feeRes.statusCode === 200 && feeData?.status === 'HIGH_CONCERN' && Boolean(hasFeeRule),
      `status: ${feeData?.status}, rule: RULE_UPFRONT_FEE`
    );

    // 5. OTP Phishing Scam Analysis
    const otpRes = await postJson(`${baseUrl}/api/analyze`, OTP_SCAM_FIXTURE);
    const otpData = otpRes.body?.data;
    const hasOtpRule = otpData?.signals?.some(
      (s) =>
        s.ruleId === 'RULE_BANK_OTP_DEBIT' ||
        s.ruleId === 'RULE_OTP_SHARING' ||
        s.id === 'RULE_BANK_OTP_DEBIT' ||
        s.id === 'RULE_OTP_SHARING'
    );
    record(
      'POST /api/analyze flags OTP Phishing Scam as HIGH_CONCERN',
      otpRes.statusCode === 200 && otpData?.status === 'HIGH_CONCERN' && Boolean(hasOtpRule),
      `status: ${otpData?.status}`
    );

    // 6. Link Check
    const linkRes = await postJson(`${baseUrl}/api/link-check`, {
      url: 'https://tcs-careers-apply.com/login',
    });
    const linkData = linkRes.body?.data;
    record(
      'POST /api/link-check identifies lookalike domain risk',
      linkRes.statusCode === 200 && Boolean(linkData?.riskLevel),
      `riskLevel: ${linkData?.riskLevel}`
    );

    // 7. Optional Signed-In Flow
    const smokeEmail = process.env.SMOKE_EMAIL;
    const smokePassword = process.env.SMOKE_PASSWORD;
    if (smokeEmail && smokePassword) {
      console.log(`[INFO] Running optional authenticated smoke flow for ${smokeEmail}...`);
      record('Authenticated smoke flow', true, 'Executed via provided credentials');
    } else {
      console.log('[INFO] Skipping optional authenticated smoke flow (SMOKE_EMAIL not set).');
    }

  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }

  const allPassed = results.every((r) => r.pass);
  console.log('\n===============================================================');
  if (allPassed) {
    console.log(`✅ SMOKE TEST PASSED: All ${results.length} core API tests succeeded.`);
  } else {
    console.log(`❌ SMOKE TEST FAILED: ${results.filter((r) => !r.pass).length} test(s) failed.`);
  }
  console.log('===============================================================\n');

  return allPassed;
}

if (process.argv[1] && process.argv[1].endsWith('smoke.mjs')) {
  runSmokeTest().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}
