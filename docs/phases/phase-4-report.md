# Phase 4 – Database & Auth (Human Gate H1) Report

**Phase:** Phase 4 – Database & Auth  
**Date:** 2026-11-01  
**Status:** PASS (Gate H1 Reached: SQL Files Complete, Standing by for User Execution)  

---

## 1. Deliverables Built

### 1.1 Consolidated SQL Migrations (`supabase/migrations/`)
1. **`0001_enums_tables.sql`:**
   - 12 PostgreSQL enumerated types (`opportunity_domain`, `input_type`, `risk_level`, `signal_category`, `signal_severity`, `signal_source`, `channel_type`, `verification_status` [4-verdict], `check_outcome`, `entity_type`, `entity_status` [7-state lifecycle], `org_kind`).
   - Extensions enabled: `uuid-ossp` and `pg_trgm`.
   - 13 core relational tables: `profiles`, `organizations`, `analyses`, `analysis_signals`, `analysis_unknowns`, `checklist_items`, `analysis_checks`, `link_checks`, `recruiter_challenges`, `reported_entities`, `scam_reports`, `feedback`, `page_feedback`.
   - Unique constraints (`UNIQUE(analysis_id, step_key)`, `UNIQUE(primary_domain)`, `UNIQUE(value_hash)`) and trigram/GIN indexes for performant lookups.
2. **`0002_rls_functions.sql`:**
   - Row Level Security (RLS) enabled on all 13 tables.
   - Comprehensive user data isolation policies for authenticated users vs anonymous public queries.
   - 4 Security Definer RPC functions and triggers:
     - `handle_new_user()` on `auth.users` creating student profile.
     - `check_reported_entities(p_hashes TEXT[])` for safe threat lookup without leaking private reports.
     - `submit_scam_report(...)` for atomic user report recording and aggregation into `reported_entities`.
     - `submit_page_feedback(...)` for anonymous/authenticated page ratings.
3. **`0003_seed_organizations.sql`:**
   - Seeded 44 verified organizations and apex government portals.
   - Decision D10 enforced: Every row has `needs_team_review = true`.
   - Decision D10 enforced: Includes clearly labelled demo row (`demo-verified.jaanch.ai`).

### 1.2 Entity Hashing Infrastructure
- **`scripts/hashEntity.mjs`:** Standalone CLI and library utility generating salted SHA-256 hashes using `REPORT_HASH_PEPPER` with entity-specific normalization. Outputs moderator confirmation SQL snippets.
- **`scripts/hashEntity.d.mts`:** TypeScript declarations for the ESM hashing module.
- **`server/src/lib/hashing.ts`:** Native TypeScript entity hashing utility for the server API.
- **`server/src/lib/supabase.ts`:** Per-request user-scoped Supabase client helper enforcing RLS and zero service-role keys in request handling (Decision D11).

### 1.3 Documentation
- **`docs/DB_SCHEMA.md`:** Entity-Relationship diagram, full table columns, foreign keys, and enum specifications.
- **`docs/SUPABASE_SETUP.md`:** Step-by-step instructions for running migrations, configuring Auth (Email + Google), redirect URLs, dev tips, and moderation workflows.
- **`docs/RLS_TESTS.md`:** Concrete test plan with exact SQL queries verifying isolation between User A, User B, and Anon roles.

---

## 2. Test Verification Checklist

| Test Suite / Check | Scope | Result | Status |
|---|---|---|---|
| SQL Lint & Migration Suite (`sql-lint.test.ts`) | Verifies all 3 migrations, 12 enums, 13 tables, RLS on all tables, functions, ≥ 40 seed rows | 6 / 6 passed | **PASS** |
| Entity Hashing & Normalization (`hashing.test.ts`) | Verifies normalization, case insensitivity, pepper salting, parity between server & CLI | 9 / 9 passed | **PASS** |
| Full Workspace Vitest Suite (`npm test`) | 13 test files across shared, server, scripts | 138 / 138 passed | **PASS** |
| Corpus Regression Suite (`npm run eval`) | 25 corpus fixtures evaluated | 25 / 25 passed (100.0%) | **PASS** |
| Monorepo Typecheck (`npm run typecheck`) | Strict mode without `any` across workspaces | 0 errors | **PASS** |
| Monorepo Linters (`npm run lint`) | No secrets, no hardcoded colors, no banned phrases | 0 violations | **PASS** |

---

## 3. Human Gate H1 Status
All SQL migration files, documentation, and tooling are complete and verified.  
Per Operating Contract 0.7 (Human Gate H1): The agent stops and instructs the user to run the SQL in their Supabase project and confirm setup.
