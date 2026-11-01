# JAANCH – Project State

## 1. Specification Status Notice
> [!WARNING]
> **`docs/SPEC_ORIGINAL.md` status:** **UNVERIFIED**.
> The verbatim content for `docs/SPEC_ORIGINAL.md` will be provided directly by the user. It is preserved without modifications and treated as unverified until confirmed.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 1 – Workspace, Spec Files, Root Tooling (Correction Completed)
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Clean monorepo foundation

---

## 3. Approved Decision & Architecture Summary
- **Verdicts:**
  - `LIKELY_GENUINE`: Passed corroborating checks; no scam indicators found.
  - `NEEDS_REVIEW`: Incomplete details, missing verification, or unverified contact.
  - `HIGH_CONCERN`: Hard disqualifiers present (fees, credential demands, urgency).
  - `CONFIRMED_SCAM`: Matched an intelligence record confirmed fraudulent by a human moderator.
  *(CONFIRMED_SCAM is only reachable via moderator-confirmed intelligence records, never from text alone).*
- **Intelligence-Record Lifecycle:**
  `reported` ──▶ `unverified` ──▶ `ai_flagged` ──▶ `suspicious` ──▶ `confirmed`, plus `dismissed`, `disputed`.
  *(One report or weak AI match never confirms; only a human moderator confirms).*
- **Approved Roadmap (11 Phases):**
  1. Workspace
  2. Shared core (schemas, 8 rules, redaction, extraction, lookalike, status, 25 fixtures)
  3. Server API
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
  - `@jaanch/shared`: Minimal typed skeleton.
  - `@jaanch/server`: Minimal typed skeleton.
  - `@jaanch/client`: Minimal typed skeleton.
- **Verification Suites:**
  - `check-no-secrets.cjs`: Operational, verified via unit tests.
  - `check-no-hardcoded-colors.mjs`: Operational, verified via unit tests.
  - `check-banned-phrases.cjs`: Operational, verified via unit tests.
  - `test-acceptance.mjs`: Operational, reporting 10 core criteria as `NOT_YET_IMPLEMENTED`.

---

## 5. Next Steps
- Next Phase: **Phase 2 – Shared core** (schemas, 8 rules, redaction, extraction, lookalike, status, 25 fixtures).
