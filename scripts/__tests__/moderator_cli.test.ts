import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { execSync } from 'node:child_process';

const cliPath = path.resolve(__dirname, '..', 'moderator-cli.ts');

describe('Phase 7: Moderator CLI Tooling (scripts/moderator-cli.ts)', () => {
  it('displays help when --help flag or no command is passed', () => {
    const output = execSync(`npx tsx "${cliPath}" --help`, { encoding: 'utf8' });
    expect(output).toContain('JAANCH MODERATOR CLI');
    expect(output).toContain('npx tsx scripts/moderator-cli.ts hash');
    expect(output).toContain('npx tsx scripts/moderator-cli.ts list');
    expect(output).toContain('npx tsx scripts/moderator-cli.ts confirm');
  });

  it('correctly hashes an indicator and outputs 64-character hex hash', () => {
    const output = execSync(`npx tsx "${cliPath}" hash upi "scam.target@okaxis"`, {
      encoding: 'utf8',
    });
    expect(output).toContain('Type: upi');
    expect(output).toContain('Value: scam.target@okaxis');
    expect(output).toMatch(/Peppered Hash:\s+[a-f0-9]{64}/);
  });

  it('normalizes domains and produces valid hash', () => {
    const output = execSync(`npx tsx "${cliPath}" hash domain "https://fake-tcs-portal.net/apply"`, {
      encoding: 'utf8',
    });
    expect(output).toContain('Type: domain');
    expect(output).toMatch(/Peppered Hash:\s+[a-f0-9]{64}/);
  });

  it('exits with error when invalid entity type is specified', () => {
    let failed = false;
    try {
      execSync(`npx tsx "${cliPath}" hash invalid_type "test"`, {
        stdio: 'pipe',
        encoding: 'utf8',
      });
    } catch (err: any) {
      failed = true;
      expect(err.stderr.toString()).toContain('Invalid entity type');
    }
    expect(failed).toBe(true);
  });

  it('executes list command without unhandled exception', () => {
    const output = execSync(`npx tsx "${cliPath}" list`, { encoding: 'utf8' });
    expect(output).toContain('reported entities');
  });
});
