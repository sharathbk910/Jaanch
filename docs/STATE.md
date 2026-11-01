# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 4 – Database & Auth (Backend Complete, Human Gate H1)
- **Current Tag:** `phase-4-done`
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/server` and `@jaanch/shared` fully compiled, typechecked, linted, and tested (163 tests passing across 15 test suites, 25/25 eval fixtures matching 100%)

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
  4. Database and auth (SQL migrations, down-migrations, RLS on every table, multi-user accounts, private history, audit logs, JWT verification, role guard, docs/DB.md) (**DONE**)
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
  - `@jaanch/server`: Express REST API server with security middlewares, SSRF safeFetch with pinned IP, Pino redaction, rate limiting, JWT verification, user isolation, history persistence, audit logging, healthcheck, link inspection, offer analysis, and entity hashing.
  - `@jaanch/client`: Minimal skeleton referencing `@jaanch/shared`.
- **Phase 4 Verification Checklist:**
  - [x] Ordered migrations: `0001_enums_tables.sql`, `0002_rls_functions.sql`, `0003_seed_organizations.sql`
  - [x] Down-migrations for each: `0001_enums_tables.down.sql`, `0002_rls_functions.down.sql`, `0003_seed_organizations.down.sql`
  - [x] Core tables: `profiles` (with `role` enum `user` | `moderator`, signup trigger, and role protection trigger), `submissions`, `detection_results`, `audit_logs` (insert via service role only, no user select)
  - [x] Supporting tables: `organizations`, `analyses`, `analysis_signals`, `analysis_unknowns`, `checklist_items`, `analysis_checks`, `link_checks`, `recruiter_challenges`, `reported_entities`, `scam_reports`, `feedback`, `page_feedback`
  - [x] Row Level Security (RLS) enabled on all tables; users select/insert/delete only own rows; moderators get no blanket read of private submissions
  - [x] Express JWT verification via `jose` validating signature and expiration server-side
  - [x] Middleware: `requireAuth`, `optionalAuth`, `requireRole('moderator')`
  - [x] History endpoints: `GET /api/history` (paginated, own rows only), `DELETE /api/history/:id` (own rows only), `DELETE /api/account/data` (privacy erasure)
  - [x] Analyze endpoint: `/api/analyze` saves to history only for authed users with `saveToHistory=true`; guests continue unauthenticated
  - [x] Audit-log writes for deletions, role guard checks, and account data erasure (zero user message text in logs)
  - [x] Security: service-role key server-only, parameterized queries only, generic auth errors, rate limits on history routes
  - [x] Comprehensive test suite with two test users verifying isolation, role escalation prevention, forged/expired token rejection, SQL injection immunity, and guest analysis
  - [x] Documentation in `docs/DB.md` listing tables, policies, and migration/down-migration procedures
  - [x] 163 unit/integration tests passing cleanly across 15 test suites; 25/25 corpus fixtures evaluated with 100% accuracy

---

## 5. Next Steps
- Commit Phase 4 files and tag `phase-4-done`.
- Human Gate H1: user runs SQL migrations in Supabase and configures Auth / environment variables.
- Proceed to **Phase 5 – Client Foundation**: Vite React setup, editorial design tokens, shell, navigation, i18n scaffolding.
