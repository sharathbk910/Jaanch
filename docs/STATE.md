# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 3 – Server Complete
- **Current Tag:** `phase-3-done` (pending commit)
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/server` and `@jaanch/shared` fully compiled, typechecked, linted, and tested (123 tests passing, 25/25 eval fixtures matching 100%)

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
  4. Database and auth (Next)
  5. Client foundation
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
  - `@jaanch/server`: Express REST API server with security middlewares, SSRF safeFetch with pinned IP, Pino redaction, rate limiting, validation, healthcheck, link inspection, and offer analysis.
  - `@jaanch/client`: Minimal skeleton referencing `@jaanch/shared`.
- **Phase 3 Verification Checklist:**
  - [x] Express app factory (`createApp`) for isolated supertest testing
  - [x] Environment configuration validation with Zod (`server/src/config/env.ts`)
  - [x] Production startup refused on missing or placeholder `REPORT_HASH_PEPPER`
  - [x] SSRF-safe outbound HTTP client (`server/src/lib/safeFetch.ts`) on `undici` with pinned resolved IP
  - [x] HTTPS only enforced; IPv4/IPv6 private/loopback/link-local/metadata blocked
  - [x] Server never fetches URLs found in user messages
  - [x] Pino logger with strict body/header redaction and zero user text in logs
  - [x] Middlewares: `requestId` (UUID), `security` (Helmet API CSP), `cors` (allowlist), `rateLimiter` (store interface), `validate` (Zod), `errorHandler` (zero stack leaks)
  - [x] 256 KB JSON request body limit with 413 handling & strict Content-Type checking
  - [x] `GET /api/health` endpoint returning uptime, timestamp, version
  - [x] `GET /api/history` endpoint behind `authenticate` interface returning 401 until Phase 4
  - [x] `POST /api/analyze` endpoint calling `@jaanch/shared` with rate limiting, input validation, and optional AI signal (invariance enforced)
  - [x] `POST /api/link-check` endpoint returning 3-level risk enum (`HIGH_RISK`, `NEEDS_VERIFICATION`, `NO_MAJOR_WARNING_SIGNS`) with observed vs unverified lists
  - [x] 3 dedicated test files (`api.test.ts`, `safeFetch.test.ts`, `invariants.test.ts`) passing 42/42 tests
  - [x] Manual curl proof of each endpoint verified against running server
  - [x] `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run eval` all green

---

## 5. Next Steps
- Commit Phase 3 files.
- Tag repository: `phase-3-done`.
- Proceed to **Phase 4 – Database & Auth**: Supabase PostgreSQL migrations, RLS policies, Express JWT verification, entity hashing with pepper.
