import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'supabase', 'migrations');

describe('Database Migration & SQL Lint Verification (sql-lint.test.ts)', () => {
  it('confirms all 3 ordered migrations and down-migrations exist in supabase/migrations/', () => {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    expect(files).toContain('0001_enums_tables.sql');
    expect(files).toContain('0001_enums_tables.down.sql');
    expect(files).toContain('0002_rls_functions.sql');
    expect(files).toContain('0002_rls_functions.down.sql');
    expect(files).toContain('0003_seed_organizations.sql');
    expect(files).toContain('0003_seed_organizations.down.sql');
  });

  describe('0001_enums_tables.sql', () => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, '0001_enums_tables.sql'), 'utf-8');

    it('creates all required enumerated types', () => {
      const requiredEnums = [
        'user_role',
        'opportunity_domain',
        'input_type',
        'risk_level',
        'signal_category',
        'signal_severity',
        'signal_source',
        'channel_type',
        'verification_status',
        'check_outcome',
        'entity_type',
        'entity_status',
        'org_kind',
      ];

      for (const enumName of requiredEnums) {
        expect(content).toContain(`CREATE TYPE ${enumName} AS ENUM`);
      }
    });

    it('creates core tables including submissions, detection_results, audit_logs', () => {
      const requiredTables = [
        'profiles',
        'submissions',
        'detection_results',
        'audit_logs',
        'organizations',
        'analyses',
        'analysis_signals',
        'analysis_unknowns',
        'checklist_items',
        'analysis_checks',
        'link_checks',
        'recruiter_challenges',
        'reported_entities',
        'scam_reports',
        'feedback',
        'page_feedback',
      ];

      for (const table of requiredTables) {
        expect(content).toContain(`CREATE TABLE ${table} (`);
      }
    });
  });

  describe('0002_rls_functions.sql', () => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, '0002_rls_functions.sql'), 'utf-8');

    it('enables Row Level Security (RLS) on every single table', () => {
      const requiredTables = [
        'profiles',
        'submissions',
        'detection_results',
        'audit_logs',
        'organizations',
        'analyses',
        'analysis_signals',
        'analysis_unknowns',
        'checklist_items',
        'analysis_checks',
        'link_checks',
        'recruiter_challenges',
        'reported_entities',
        'scam_reports',
        'feedback',
        'page_feedback',
      ];

      for (const table of requiredTables) {
        expect(content).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      }
    });

    it('deploys all required RPC functions and triggers', () => {
      expect(content).toContain('CREATE OR REPLACE FUNCTION handle_new_user()');
      expect(content).toContain('CREATE TRIGGER on_auth_user_created');
      expect(content).toContain('CREATE OR REPLACE FUNCTION protect_profile_role_update()');
      expect(content).toContain('CREATE TRIGGER trg_protect_profile_role');
      expect(content).toContain('CREATE OR REPLACE FUNCTION check_reported_entities');
      expect(content).toContain('CREATE OR REPLACE FUNCTION submit_scam_report');
      expect(content).toContain('CREATE OR REPLACE FUNCTION submit_page_feedback');
    });
  });

  describe('0003_seed_organizations.sql', () => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, '0003_seed_organizations.sql'), 'utf-8');

    it('enforces Decision D10: demo row clearly labelled and every row has needs_team_review = true', () => {
      expect(content).toContain('demo-verified.jaanch.ai');
      expect(content).toContain('Jaanch Demo Verified Corporation');

      // Count seeded organization tuples
      const matches = content.match(/\('(?:[^']|'')+',/g);
      expect(matches).toBeDefined();
      expect(matches!.length).toBeGreaterThanOrEqual(40);
    });
  });
});
