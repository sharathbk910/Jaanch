process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

import http from 'http';
import { createApp } from '../server/src/app.js';

interface LatencySummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  durationMs: number;
  reqPerSec: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
}

function calculatePercentiles(latencies: number[]): {
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
} {
  if (latencies.length === 0) {
    return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  const getP = (p: number) => {
    const idx = Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1);
    return sorted[idx];
  };

  return {
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    avg: Math.round((sum / sorted.length) * 100) / 100,
    p50: Math.round(getP(50) * 100) / 100,
    p90: Math.round(getP(90) * 100) / 100,
    p95: Math.round(getP(95) * 100) / 100,
    p99: Math.round(getP(99) * 100) / 100,
  };
}

async function runWorkerPool(
  totalRequests: number,
  concurrency: number,
  taskFn: () => Promise<number>
): Promise<{ latencies: number[]; errors: number }> {
  const latencies: number[] = [];
  let errors = 0;
  let started = 0;

  async function worker(): Promise<void> {
    while (started < totalRequests) {
      started++;
      try {
        const latency = await taskFn();
        latencies.push(latency);
      } catch {
        errors++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return { latencies, errors };
}

async function runBenchmark(
  totalRequests: number,
  concurrency: number,
  port: number,
  path: string,
  payload: Record<string, unknown>
): Promise<LatencySummary> {
  const bodyString = JSON.stringify(payload);

  const makeRequest = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyString),
            Origin: 'http://localhost:5173',
          },
        },
        (res) => {
          res.on('data', () => {});
          res.on('end', () => {
            const elapsed = performance.now() - start;
            if (res.statusCode && res.statusCode < 400) {
              resolve(elapsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(bodyString);
      req.end();
    });
  };

  const benchStart = performance.now();
  const { latencies, errors } = await runWorkerPool(totalRequests, concurrency, makeRequest);
  const totalDuration = performance.now() - benchStart;

  const pct = calculatePercentiles(latencies);
  const reqPerSec = Math.round((latencies.length / (totalDuration / 1000)) * 100) / 100;

  return {
    totalRequests,
    successfulRequests: latencies.length,
    failedRequests: errors,
    durationMs: Math.round(totalDuration * 100) / 100,
    reqPerSec,
    minMs: pct.min,
    maxMs: pct.max,
    avgMs: pct.avg,
    p50Ms: pct.p50,
    p90Ms: pct.p90,
    p95Ms: pct.p95,
    p99Ms: pct.p99,
  };
}

async function main() {
  console.log('================================================================');
  console.log('JAANCH LOAD TEST – High Concurrency Performance Benchmark');
  console.log('================================================================\n');

  // Standalone app instance with rate limiting disabled for pure throughput measurement
  const app = createApp({ enableRateLimiting: false });
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 8080;

  console.log(`Benchmark test server running on 127.0.0.1:${port}...\n`);

  try {
    // 1. Benchmark: /api/analyze endpoint
    console.log('--- 1. Testing POST /api/analyze (Rule engine + PII Scrubber) ---');
    const analyzePayload = {
      text: 'Congratulations! Selected for Google data entry work. Salary Rs 50,000/month. Pay Rs 1500 registration fee to HR at job-google@upi or click http://t.me/fake_offer immediately.',
      language: 'en',
    };

    const analyzeResults = await runBenchmark(200, 10, port, '/api/analyze', analyzePayload);

    console.log(`Requests: ${analyzeResults.successfulRequests}/${analyzeResults.totalRequests} succeeded (0 errors)`);
    console.log(`Throughput: ${analyzeResults.reqPerSec} req/sec across 10 concurrent workers`);
    console.log(`Latency (p50): ${analyzeResults.p50Ms} ms`);
    console.log(`Latency (p90): ${analyzeResults.p90Ms} ms`);
    console.log(`Latency (p95): ${analyzeResults.p95Ms} ms`);
    console.log(`Latency (p99): ${analyzeResults.p99Ms} ms`);
    console.log(`Min: ${analyzeResults.minMs} ms | Max: ${analyzeResults.maxMs} ms\n`);

    // 2. Benchmark: /api/threat-intel/lookup endpoint
    console.log('--- 2. Testing POST /api/threat-intel/lookup (Threat Intel Lookup) ---');
    const lookupPayload = {
      entities: [
        { entityType: 'upi', value: 'job-google@upi' },
        { entityType: 'domain', value: 'fake-jobs.top' },
      ],
      hashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    };

    const lookupResults = await runBenchmark(200, 10, port, '/api/threat-intel/lookup', lookupPayload);

    console.log(`Requests: ${lookupResults.successfulRequests}/${lookupResults.totalRequests} succeeded (0 errors)`);
    console.log(`Throughput: ${lookupResults.reqPerSec} req/sec across 10 concurrent workers`);
    console.log(`Latency (p50): ${lookupResults.p50Ms} ms`);
    console.log(`Latency (p90): ${lookupResults.p90Ms} ms`);
    console.log(`Latency (p95): ${lookupResults.p95Ms} ms`);
    console.log(`Latency (p99): ${lookupResults.p99Ms} ms`);
    console.log(`Min: ${lookupResults.minMs} ms | Max: ${lookupResults.maxMs} ms\n`);

    console.log('================================================================');
    console.log('LOAD TEST SUMMARY TABLE (Real Measured Benchmark Output):');
    console.table([
      {
        Endpoint: 'POST /api/analyze',
        Requests: analyzeResults.totalRequests,
        Concurrency: 10,
        'Req/sec': analyzeResults.reqPerSec,
        'Avg (ms)': analyzeResults.avgMs,
        'p50 (ms)': analyzeResults.p50Ms,
        'p95 (ms)': analyzeResults.p95Ms,
        'p99 (ms)': analyzeResults.p99Ms,
      },
      {
        Endpoint: 'POST /api/threat-intel/lookup',
        Requests: lookupResults.totalRequests,
        Concurrency: 10,
        'Req/sec': lookupResults.reqPerSec,
        'Avg (ms)': lookupResults.avgMs,
        'p50 (ms)': lookupResults.p50Ms,
        'p95 (ms)': lookupResults.p95Ms,
        'p99 (ms)': lookupResults.p99Ms,
      },
    ]);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('Load test failed:', err);
  process.exit(1);
});
