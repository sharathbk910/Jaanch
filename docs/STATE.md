# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 5 – Client Foundation Complete
- **Current Tag:** `phase-5-done`
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/shared`, `@jaanch/server`, and `@jaanch/client` fully compiled, typechecked, linted, and tested (186 tests passing across 20 test suites, 25/25 eval fixtures matching 100%)

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
  5. Client foundation (Vite React, Part G editorial tokens, shell, 53px header, i18n scaffolding, routing, primitives) (**DONE**)
  6. UI implementation (6A Landing, 6B Analyzer, 6C Results/PDF, 6D Auth UI) (Next)
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
  - `@jaanch/client`: Vite React 18 SPA with Part G editorial design system, self-hosted Fontsource fonts, responsive shell, accessible navigation, i18n EN/HI/KN, TanStack Query, typed API client, and guest session store.
- **Phase 5 Verification Checklist:**
  - [x] Vite + React 18 + Tailwind setup compiling to `client/dist/`
  - [x] Part G Editorial Design Tokens in `client/src/styles/tokens.css` (warm off-white `#FAF9F5`, `#141413`, accent `#E55A12` / `#C2410C`, 4-verdict status colors, outcome chips)
  - [x] Zero hardcoded colors in `.ts`/`.tsx` verified by `check-no-hardcoded-colors.mjs`
  - [x] Self-hosted Fontsource fonts (Newsreader, Inter, JetBrains Mono, Noto Sans Devanagari, Noto Sans Kannada) with zero external CDNs
  - [x] Editorial UI primitives: `Button`, `Card`, `VerdictBadge` (icon + label, never color alone), `OutcomeChip`, `Input`, `Textarea`, `SegmentedControl`
  - [x] App shell: `Header` with exact 53px height (`h-[53px]`), wordmark `JAANCH.`, desktop nav links per G §4.1 (`/analyze`, `/link-check`, `/resources`, `/about`), `MobileSheet`, `Footer` with 1930 helpline card, `SkipLink` to `#main-content`, `FeedbackPill` (`/api/feedback/page`), `ErrorBoundary`
  - [x] Multilingual scaffolding: `useT()`, `I18nProvider`, `LangSwitch`, `en.json`, `hi.json`, `kn.json`, persisting to `localStorage` and updating `<html lang>`
  - [x] Client data layer: typed `apiClient` with Zod validation, `getSupabase()` runtime loader preventing secret embedding in bundle, `guestSession` store using `sessionStorage` (Decision D7)
  - [x] Routing for all Decision D5 routes (`/`, `/analyze`, `/results/:id`, `/results/local`, `/sample`, `/link-check`, `/resources`, `/about`, `/privacy`, `/history`, `/login`, `/signup`, `/settings`, `*`)
  - [x] Server endpoint `GET /api/config` for runtime public Supabase configuration
  - [x] 186 unit/integration tests passing across 20 test suites; 25/25 corpus fixtures evaluated with 100% accuracy; zero secrets detected in client bundle

---

## 5. Next Steps
- Commit Phase 5 files and tag `phase-5-done`.
- Proceed to **Phase 6A – UI Implementation: Landing Page**:
  - Hero section with CTA and official portal notice
  - Facts band (3 cards)
  - "How Jaanch audits an offer in three steps" (01, 02, 03)
  - Guidelines card & helpline card
  - Verification with Playwright and visual comparison.
