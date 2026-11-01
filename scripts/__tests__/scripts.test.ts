import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { runAcceptanceHarness } from '../test-acceptance.mjs';

const tempDir = path.resolve(__dirname, 'temp_fixtures');

describe('Security & Tooling Scripts Validation', () => {
  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('check-no-secrets.cjs', () => {
    const scriptPath = path.resolve(__dirname, '..', 'check-no-secrets.cjs');

    it('fails when GEMINI_API_KEY is present', () => {
      const violatingFile = path.join(tempDir, 'leak.ts');
      fs.writeFileSync(violatingFile, 'const key = "GEMINI_API_KEY";');

      let failed = false;
      try {
        execSync(`node "${scriptPath}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (err: any) {
        failed = true;
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain('GEMINI_API_KEY');
      }
      expect(failed).toBe(true);
    });

    it('fails when JWT-like secret pattern is present', () => {
      const violatingFile = path.join(tempDir, 'jwt.ts');
      fs.writeFileSync(violatingFile, 'const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";');

      let failed = false;
      try {
        execSync(`node "${scriptPath}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (err: any) {
        failed = true;
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain('JWT secret pattern');
      }
      expect(failed).toBe(true);
    });

    it('passes on clean source files', () => {
      const cleanFile = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(cleanFile, 'export const safe = true;');

      const output = execSync(`node "${scriptPath}" "${tempDir}"`, { encoding: 'utf8' });
      expect(output).toContain('[check-no-secrets] PASSED');
    });
  });

  describe('check-no-hardcoded-colors.mjs', () => {
    const scriptPath = path.resolve(__dirname, '..', 'check-no-hardcoded-colors.mjs');

    it('fails when hardcoded hex color is present', () => {
      const violatingFile = path.join(tempDir, 'badColor.tsx');
      fs.writeFileSync(violatingFile, 'const color = "#ff5500";');

      let failed = false;
      try {
        execSync(`node "${scriptPath}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (err: any) {
        failed = true;
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain('#ff5500');
      }
      expect(failed).toBe(true);
    });

    it('fails when rgb/hsl functional color is present', () => {
      const violatingFile = path.join(tempDir, 'badRgb.tsx');
      fs.writeFileSync(violatingFile, 'const style = { color: "rgb(255, 0, 0)" };');

      let failed = false;
      try {
        execSync(`node "${scriptPath}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (err: any) {
        failed = true;
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain('rgb(255, 0, 0)');
      }
      expect(failed).toBe(true);
    });

    it('fails when Tailwind arbitrary hex is present', () => {
      const violatingFile = path.join(tempDir, 'badTailwind.tsx');
      fs.writeFileSync(violatingFile, 'export function Comp() { return <div className="bg-[#123456]" />; }');

      let failed = false;
      try {
        execSync(`node "${scriptPath}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (err: any) {
        failed = true;
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain('[#123456]');
      }
      expect(failed).toBe(true);
    });

    it('exempts tokens.css from color checks', () => {
      const tokenFile = path.join(tempDir, 'tokens.css');
      fs.writeFileSync(tokenFile, ':root { --color-primary: #123456; }');

      const output = execSync(`node "${scriptPath}" "${tempDir}"`, { encoding: 'utf8' });
      expect(output).toContain('[check-no-hardcoded-colors] PASSED');
    });

    it('passes on clean tokenized TSX file', () => {
      const cleanFile = path.join(tempDir, 'clean.tsx');
      fs.writeFileSync(cleanFile, 'export function Comp() { return <div className="bg-primary text-text-main" />; }');

      const output = execSync(`node "${scriptPath}" "${tempDir}"`, { encoding: 'utf8' });
      expect(output).toContain('[check-no-hardcoded-colors] PASSED');
    });
  });

  describe('check-banned-phrases.cjs', () => {
    const scriptPath = path.resolve(__dirname, '..', 'check-banned-phrases.cjs');

    it('fails when a certainty claim is present', () => {
      const violatingFile = path.join(tempDir, 'badPhrase.ts');
      fs.writeFileSync(violatingFile, 'export const msg = "This offer is 100% safe and verified genuine";');

      let failed = false;
      try {
        execSync(`node "${scriptPath}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (err: any) {
        failed = true;
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain('100% safe');
      }
      expect(failed).toBe(true);
    });

    it('passes on clean phrase text', () => {
      const cleanFile = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(cleanFile, 'export const msg = "Evidence indicates low indicators of fraud.";');

      const output = execSync(`node "${scriptPath}" "${tempDir}"`, { encoding: 'utf8' });
      expect(output).toContain('[check-banned-phrases] PASSED');
    });
  });

  describe('test-acceptance.mjs', () => {
    it('honestly reports NOT_YET_IMPLEMENTED in Phase 1', async () => {
      const results = await runAcceptanceHarness();
      expect(results.length).toBe(10);
      for (const res of results) {
        expect(res.status).toBe('NOT_YET_IMPLEMENTED');
      }
    });
  });
});
