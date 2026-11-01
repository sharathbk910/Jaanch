# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 4 – Database & Auth Complete (Human Gate H1)
- **Current Tag:** `phase-4-done` (pending commit)
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/server` and `@jaanch/shared` fully compiled, typechecked, linted, and tested (138 tests passing, 25/25 eval fixtures matching 100%)

---

## 3. Approved Decision & Architecture Summary
- **Verdicts (Approved 4-Verdict Model):**
  - `LIKELY_GENUINE`: Passed corroborating checks; no scam indicators found.
  - `NEEDS_REVIEW`: Incomplete details, missing verification, or unverified contact.
  - `HIGH_CONCERN`: Hard disqualifiers present (fees, credential demands, urgency).
  - `CONFIRMED_SCAM`: Matched an intelligence record confirmed fraudulent by a human moderator.
  *(CONFIRMED_SCAM is only reachable via moderator-confirmed intelligence records in Phase 7, never from text alone).*
- **Intelligence-Record Lifecycle:**
  `reported` ──▶ `unverified` ──▶ `ai_flagged` ──▶ `suspicious` ──▶ `confirmed`, plus `dismissed`, `disputed`.
  *(One report or weak AI match never confirms; only a human moderator confirms).*
- **Approved Roadmap (11 Phases):**
  1. Workspace (**DONE**)
  2. Shared core (schemas, 8 rules, redaction, extraction, lookalike, status, 25 fixtures) (**DONE**)
  3. Server (Express, Helmet API CSP, CORS, Pino redaction, safeFetch with pinned IP, rate limiting, routes, invariants) (**DONE**)
  4. Database and auth (SQL migrations, RLS on all tables, seed organizations, hashing utility, H1 gate) (**DONE**)
  5. Client foundation (Next)
  6. UI implementation (6A Landing, 6B Analyzer, 6C Results/PDF, 6D Auth UI)
  7. Shared intelligence and moderation
  8. AI/ML
  9. WhatsApp
  10. Verification
  11. Deployment

---

## 4. Current Tooling & Verification Status
- **Root Scripts:** `dev`, `build`, `test`, `typecheck`, `lint`, `eval`, `check:no-secrets`, `check:colors`, `check:banned-phrases`, `test:acceptance`.
- **Workspaces:**
  - `@jaanch/shared`: Production deterministic core library, compiles to `dist/` (ESM + types), exports map.
  - `@jaanch/server`: Express REST API server with security middlewares, SSRF safeFetch with pinned IP, Pino redaction, rate limiting, validation, healthcheck, link inspection, offer analysis, and entity hashing.
  - `@jaanch/client`: Minimal skeleton referencing `@jaanch/shared`.
- **Phase 4 Verification Checklist:**
  - [x] Consolidated migrations `0001_enums_tables.sql`, `0002_rls_functions.sql`, `0003_seed_organizations.sql`
  - [x] 12 PostgreSQL enums matching spec and 4-verdict model directly
  - [x] 13 core tables with constraints and trigram indexes
  - [x] Row Level Security (RLS) enabled on all 13 tables
  - [x] 4 Security Definer RPC functions & triggers (`handle_new_user`, `check_reported_entities`, `submit_scam_report`, `submit_page_feedback`)
  - [x] 44 organizations seeded with `needs_team_review = true` and demo row (Decision D10)
  - [x] Entity hashing utility `scripts/hashEntity.mjs` and `server/src/lib/hashing.ts` using `REPORT_HASH_PEPPER`
  - [x] Per-request user-scoped Supabase client `server/src/lib/supabase.ts` with zero service-role keys (Decision D11)
  - [x] Comprehensive documentation in `docs/DB_SCHEMA.md`, `docs/SUPABASE_SETUP.md`, and `docs/RLS_TESTS.md`
  - [x] 138 unit/integration tests passing cleanly across 13 test suites (including SQL lint and entity hashing)
  - [x] Human Gate H1 instructions prepared for the user

---

## 5. Next Steps
- Commit Phase 4 files.
- Tag repository: `phase-4-done`.
- **Human Gate H1:** Present setup instructions to the user to execute the SQL migrations in Supabase, configure Auth, create `.env` files, and reply "ready".
- Proceed to **Phase 5 – Client Foundation**: Vite React setup, editorial design tokens, shell, navigation, i18n scaffolding.
