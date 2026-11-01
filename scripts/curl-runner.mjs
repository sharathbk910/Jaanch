import { spawn, execSync } from 'node:child_process';
import http from 'node:http';

console.log('[Runner] Starting server process...');
const serverProc = spawn('node', ['server/dist/server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '8080',
  },
});

function waitForServer(retries = 30) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = http.get('http://127.0.0.1:8080/api/health', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry(remaining);
        }
      });
      req.on('error', () => retry(remaining));
    };

    const retry = (remaining) => {
      if (remaining <= 0) {
        reject(new Error('Server failed to start in time'));
      } else {
        setTimeout(() => attempt(remaining - 1), 200);
      }
    };

    attempt(retries);
  });
}

try {
  await waitForServer();
  console.log('[Runner] Server is ready on http://127.0.0.1:8080\n');

  console.log('=== 1. CURL PROOF: GET /api/health ===');
  const h = execSync('curl.exe -i -s http://127.0.0.1:8080/api/health', { encoding: 'utf-8' });
  console.log(h);

  console.log('=== 2. CURL PROOF: GET /api/history (401 Auth) ===');
  const hist = execSync('curl.exe -i -s http://127.0.0.1:8080/api/history', { encoding: 'utf-8' });
  console.log(hist);

  console.log('=== 3. CURL PROOF: POST /api/link-check (Lookalike Domain) ===');
  const link = execSync(
    'curl.exe -i -s -X POST http://127.0.0.1:8080/api/link-check -H "Content-Type: application/json" -d "{\\"url\\":\\"https://tcs-careers-portal.net/apply\\"}"',
    { encoding: 'utf-8' }
  );
  console.log(link);

  console.log('=== 4. CURL PROOF: POST /api/analyze (Scam Upfront Fee) ===');
  const scam = execSync(
    'curl.exe -i -s -X POST http://127.0.0.1:8080/api/analyze -H "Content-Type: application/json" -d "{\\"text\\":\\"Congratulations! You are selected as Intern at TechCorp. Please pay 2500 rupees registration fees to hr@upi to secure your seat.\\",\\"domain\\":\\"internship\\"}"',
    { encoding: 'utf-8' }
  );
  console.log(scam);

  console.log('=== 5. CURL PROOF: POST /api/analyze (Legitimate Offer) ===');
  const clean = execSync(
    'curl.exe -i -s -X POST http://127.0.0.1:8080/api/analyze -H "Content-Type: application/json" -d "{\\"text\\":\\"Infosys Campus Connect: Congratulations! You are selected for Summer Internship 2026. Official notice: We never ask for any payment or registration fee at any stage.\\",\\"domain\\":\\"internship\\",\\"sender\\":{\\"organization\\":\\"Infosys\\",\\"isOfficialCorporateDomain\\":true}}"',
    { encoding: 'utf-8' }
  );
  console.log(clean);

  console.log('=== 6. CURL PROOF: GET /api/resources ===');
  const res = execSync('curl.exe -i -s http://127.0.0.1:8080/api/resources', { encoding: 'utf-8' });
  console.log(res);

} finally {
  serverProc.kill();
  console.log('[Runner] Server process terminated.');
}
