# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 2 – Shared Core Complete
- **Current Tag:** `phase-2-done` (pending commit)
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/shared` fully compiled and tested (100% eval score on 25 fixtures)

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
  3. Server API (Next)
  4. Database and auth
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
  - `@jaanch/server`: Minimal skeleton referencing `@jaanch/shared`.
  - `@jaanch/client`: Minimal skeleton referencing `@jaanch/shared`.
- **Phase 2 Verification Checklist:**
  - [x] Package compiles cleanly to `dist/` with ESM and declaration types
  - [x] Zod schemas: domains, consentFlags, status (4 verdicts), signals, entities, intelMatch
  - [x] 8 rules implemented with exact IDs, multilingual (EN/HI/KN/Hinglish), clause-scoped negation, whole-word context quotes
  - [x] Status computation matrix documented in `docs/RULES.md`
  - [x] NFKC normalization, homoglyph folding, zero-width stripping, rupee preservation
  - [x] PII redaction: Aadhaar, phones, UPI, personal emails with preserved domain
  - [x] Lookalike domain detection with Levenshtein and known brand matching
  - [x] 25 corpus fixtures evaluated via `npm run eval -w shared` with 100% accuracy (25/25)
  - [x] ReDoS safety verified with 100,000-character adversarial inputs (< 1s execution)
  - [x] 81 unit/integration tests passing cleanly across 8 test suites

---

## 5. Next Steps
- Commit Phase 2 files.
- Tag repository: `phase-2-done`.
- Proceed to **Phase 3 – Server API**: Express REST API, rate limiting, request validation, safe error handling, healthchecks.
