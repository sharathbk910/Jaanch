/**
 * Manual End-to-End Verification of all 3 Scenarios against the local Express Server.
 * Runs exact client pipeline: Input -> Client Redaction -> HTTP POST /api/analyze -> Response Validation.
 */
import http from 'node:http';
import { createApp } from '../server/src/app.js';
import { redactText, AnalyzeResultSchema } from '../shared/src/index.js';

const SCENARIOS = [
  {
    name: 'Scenario 1: Genuine Internship Selection',
    domain: 'internship',
    channel: 'email',
    claimedOrg: 'Tata Consultancy Services',
    sender: {
      email: 'careers@tcs.com',
      domain: 'tcs.com',
      isOfficialCorporateDomain: true,
    },
    rawText: `Dear Candidate,
Congratulations! We are pleased to offer you an internship position as a Software Engineering Intern at Tata Consultancy Services (TCS) starting June 2026.
Reporting Location: TCS Olympus, Hiranandani Estate, Thane, Maharashtra 400607.
Stipend: ₹35,000 per month.
Please review the appointment terms on the official TCS NextStep portal at https://nextstep.tcs.com/campus/#/login and submit your acceptance within 7 business days.
TCS will never ask for security deposits, laptop fees, or bank transfers during the hiring process.

Warm regards,
TCS Campus Recruitment Team
hr@tcs.com`,
    expectedStatus: 'LIKELY_GENUINE',
  },
  {
    name: 'Scenario 2: Upfront Laptop Deposit Fee Scam',
    domain: 'job',
    channel: 'whatsapp',
    claimedOrg: 'Other / Unlisted Organization',
    sender: {
      email: 'careers@tcs-careers-apply.com',
      phone: '+91 98765 43210',
    },
    rawText: `URGENT: TCS Careers Offer Letter.
Congratulations! You are selected as Associate Software Engineer.
Deposit ₹3,500 refundable laptop security deposit within 2 hours via UPI to tcs.hr@okaxis or your job offer stands cancelled.
Contact HR on WhatsApp +91 98765 43210 immediately with payment screenshot.`,
    expectedStatus: 'HIGH_CONCERN',
    expectedRule: 'RULE_UPFRONT_FEE',
  },
  {
    name: 'Scenario 3: Scholarship OTP Phishing Scam',
    domain: 'scholarship',
    channel: 'sms',
    claimedOrg: 'State Bank of India',
    sender: {
      phone: '+91 91234 56789',
    },
    rawText: `URGENT: Your National Scholarship Scheme grant of ₹25,000 is approved by State Bank of India.
To credit your account immediately, share the 6-digit OTP received on your mobile with official agent on WhatsApp +91 91234 56789.
Failure to share OTP within 15 minutes will result in permanent scholarship cancellation and penalty under DBT guidelines.`,
    expectedStatus: 'HIGH_CONCERN',
    expectedRule: 'RULE_BANK_OTP_DEBIT',
  },
];

async function main() {
  console.log('===============================================================');
  console.log(' JAANCH END-TO-END SCENARIO VERIFICATION (LOCAL SERVER)');
  console.log('===============================================================\n');

  // Boot local test server on random high port
  process.env.NODE_ENV = 'test';
  process.env.PORT = '0';
  process.env.REPORT_HASH_PEPPER = 'test-pepper-must-be-at-least-24-characters-long';
  process.env.ENABLE_THIRD_PARTY_CHECKS = 'false';

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 8080;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Local test server running on ${baseUrl}\n`);

  let allPassed = true;

  for (const scenario of SCENARIOS) {
    console.log(`---------------------------------------------------------------`);
    console.log(`TESTING: ${scenario.name}`);
    console.log(`---------------------------------------------------------------`);

    // Step 1: Client-Side Redaction (Pipeline Phase 6B)
    const redaction = redactText(scenario.rawText);
    console.log(`[Client Redaction] Masked ${redaction.redactionCount} PII entities.`);
    console.log(`[Sanitized Text] "${redaction.redactedText.replace(/\n/g, ' ').slice(0, 100)}..."`);

    // Step 2: Build Typed Payload with Consent Defaults (all false)
    const payload = {
      text: redaction.redactedText,
      domain: scenario.domain,
      channel: scenario.channel,
      sender: scenario.sender,
      consentFlags: {
        aiAnalysis: false,
        shareIndicators: false,
      },
      inputType: 'raw_text',
      saveToHistory: false,
    };

    console.log(`[Network Request] POST /api/analyze`);
    console.log(`  Payload: ${JSON.stringify(payload, null, 2)}`);

    // Step 3: Send HTTP Request to local server
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      allPassed = false;
      continue;
    }

    const responseBody = await response.json();
    console.log(`[Server Response] HTTP 200 OK`);

    // Step 4: Validate with Shared Zod Schema
    const parseResult = AnalyzeResultSchema.safeParse(responseBody.data);
    if (!parseResult.success) {
      console.error(`❌ Zod Schema Validation Failed:`, parseResult.error.format());
      allPassed = false;
      continue;
    }

    const result = parseResult.data;
    console.log(`[Verdict] ${result.status} (Confidence: ${result.confidenceScore}%)`);
    console.log(`[Triggered Signals] ${result.signals.length} signal(s)`);
    result.signals.forEach((s) => {
      console.log(`  - [${s.severity.toUpperCase()}] ${s.ruleId}: ${s.title}`);
      console.log(`    Evidence: "${s.evidence}"`);
    });

    // Step 5: Assert Expected Verdict & Rules
    if (result.status !== scenario.expectedStatus) {
      console.error(
        `❌ Verdict mismatch: Expected ${scenario.expectedStatus}, got ${result.status}`
      );
      allPassed = false;
    } else {
      console.log(`✓ Status matches expected: ${result.status}`);
    }

    if (scenario.expectedRule) {
      const matched = result.signals.some((s) => s.ruleId === scenario.expectedRule);
      if (!matched) {
        console.error(`❌ Expected rule ${scenario.expectedRule} was NOT triggered!`);
        allPassed = false;
      } else {
        console.log(`✓ Required rule triggered: ${scenario.expectedRule}`);
      }
    }

    console.log(`✓ PASSED\n`);
  }

  // Teardown server safely
  server.close((err) => {
    if (allPassed && !err) {
      console.log('===============================================================');
      console.log(' ✅ ALL 3 SCENARIOS END-TO-END VERIFICATION: 100% PASSED');
      console.log('===============================================================');
    } else {
      console.error('❌ One or more scenarios failed end-to-end verification.');
      process.exit(1);
    }
  });
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
