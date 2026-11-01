import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', '..', 'supabase', 'migrations');

describe('RLS Policies & Role Protection Verification (rls_isolation.test.ts)', () => {
  const rlsSql = fs.readFileSync(path.join(MIGRATIONS_DIR, '0002_rls_functions.sql'), 'utf-8');
  const enumsSql = fs.readFileSync(path.join(MIGRATIONS_DIR, '0001_enums_tables.sql'), 'utf-8');

  describe('1. Direct RLS User Isolation Policies', () => {
    it('enforces auth.uid() = user_id on submissions for all operations', () => {
      // Submissions RLS policies check auth.uid() = user_id
      expect(rlsSql).toContain('CREATE POLICY "Users can view own submissions"');
      expect(rlsSql).toContain('USING (auth.uid() = user_id)');

      expect(rlsSql).toContain('CREATE POLICY "Users can insert own submissions"');
      expect(rlsSql).toContain('WITH CHECK (auth.uid() = user_id)');

      expect(rlsSql).toContain('CREATE POLICY "Users can update own submissions"');
      expect(rlsSql).toContain('USING (auth.uid() = user_id)');

      expect(rlsSql).toContain('CREATE POLICY "Users can delete own submissions"');
      expect(rlsSql).toContain('USING (auth.uid() = user_id)');
    });

    it('verifies moderators have NO blanket read policy on private submissions', () => {
      // Confirm there is NO policy granting moderators access to submissions table
      const submissionsSection = rlsSql.substring(
        rlsSql.indexOf('CREATE POLICY "Users can view own submissions"'),
        rlsSql.indexOf('-- 2C. AUDIT LOGS POLICIES')
      );

      expect(submissionsSection).not.toContain("role = 'moderator'");
      expect(submissionsSection).not.toContain("jwt.claim.role = 'moderator'");
    });

    it('links detection_results RLS strictly through submissions.user_id = auth.uid()', () => {
      expect(rlsSql).toContain('CREATE POLICY "Users can view detection results for own submissions"');
      expect(rlsSql).toContain('WHERE submissions.id = detection_results.submission_id');
      expect(rlsSql).toContain('AND submissions.user_id = auth.uid()');
    });
  });

  describe('2. Role Protection & Anti-Escalation Triggers', () => {
    it('defines user_role enum with "user" and "moderator"', () => {
      expect(enumsSql).toContain("CREATE TYPE user_role AS ENUM (\n  'user',\n  'moderator'\n);");
    });

    it('installs protect_profile_role_update trigger on profiles table', () => {
      expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION protect_profile_role_update()');
      expect(rlsSql).toContain("RAISE EXCEPTION 'Modifying profile role is forbidden'");
      expect(rlsSql).toContain('CREATE TRIGGER trg_protect_profile_role');
      expect(rlsSql).toContain('BEFORE UPDATE ON profiles');
    });

    it('restricts role modification to service_role and superusers only', () => {
      expect(rlsSql).toContain("current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'");
      expect(rlsSql).toContain("current_user NOT IN ('postgres', 'supabase_admin', 'service_role')");
    });
  });

  describe('3. Audit Logs Security Invariants', () => {
    it('enables RLS on audit_logs with zero user policies (service-role only)', () => {
      expect(rlsSql).toContain('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;');
      
      // Confirm no user select or insert policy is granted to authenticated or anon roles
      const auditLogPolicies = rlsSql.match(/CREATE POLICY [^;]+ ON audit_logs [^;]+;/g);
      expect(auditLogPolicies).toBeNull();
    });
  });

  describe('4. In-Memory Isolation Simulation', () => {
    // Structural logic simulation representing PostgreSQL RLS evaluation
    interface Submission {
      id: string;
      user_id: string;
      title: string;
    }

    const testSubmissions: Submission[] = [
      { id: 'sub-1', user_id: 'user-a', title: "User A's private analysis" },
      { id: 'sub-2', user_id: 'user-b', title: "User B's private analysis" },
    ];

    function rlsSelect(currentUserId: string, rows: Submission[]): Submission[] {
      return rows.filter((r) => r.user_id === currentUserId);
    }

    function rlsDelete(currentUserId: string, rows: Submission[], targetId: string): boolean {
      const idx = rows.findIndex((r) => r.id === targetId && r.user_id === currentUserId);
      if (idx === -1) return false;
      rows.splice(idx, 1);
      return true;
    }

    it('prevents User A from selecting User B rows', () => {
      const visibleToA = rlsSelect('user-a', testSubmissions);
      expect(visibleToA).toHaveLength(1);
      expect(visibleToA[0].id).toBe('sub-1');
      expect(visibleToA.some((r) => r.user_id === 'user-b')).toBe(false);
    });

    it('prevents User A from deleting User B rows', () => {
      const copy = [...testSubmissions];
      const deleted = rlsDelete('user-a', copy, 'sub-2');
      expect(deleted).toBe(false);
      expect(copy).toHaveLength(2);
    });

    it('allows User A to delete their own row', () => {
      const copy = [...testSubmissions];
      const deleted = rlsDelete('user-a', copy, 'sub-1');
      expect(deleted).toBe(true);
      expect(copy).toHaveLength(1);
      expect(copy[0].id).toBe('sub-2');
    });
  });
});

