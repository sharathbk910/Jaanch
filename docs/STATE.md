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
- **Repository State:** Green monorepo; `@jaanch/shared`, `@jaanch/server`, and `@jaanch/client` fully compiled, typechecked, linted, and tested (211 tests passing across 22 test suites, 25/25 eval fixtures matching 100%)

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
  5. Client foundation (Vite React, exact spec tokens, dark-mode overrides, fonts, tailwind.config.ts, translations.ts, LanguageContext, ThemeProvider, WCAG AA contrast tests, 360px glyph check, I18N_REVIEW.md) (**DONE**)
  6. UI implementation (6A Landing, 6B Analyzer, 6C Results/PDF, 6D Auth UI) (Next)
  7. Shared intelligence and moderation
  8. AI/ML
  9. WhatsApp
  10. Verification
  11. Deployment

---

## 4. Current Tooling & Verification Status
- **Root Scripts:** `dev`, `build`, `test`, `typecheck`, `lint`, `eval`, `check:no-secrets`, `check:colors`, `check:banned-phrases`, `check:glyphs`, `test:acceptance`.
- **Workspaces:**
  - `@jaanch/shared`: Production deterministic core library, compiles to `dist/` (ESM + types), exports map.
  - `@jaanch/server`: Express REST API server with security middlewares, SSRF safeFetch with pinned IP, Pino redaction, rate limiting, JWT verification, user isolation, history persistence, audit logging, healthcheck, link inspection, offer analysis, and entity hashing.
  - `@jaanch/client`: Vite React 18 SPA with exact spec tokens, Google Fonts + self-hosted fallbacks, responsive shell, accessible navigation, i18n EN/HI/KN, TanStack Query, typed API client, and guest session store.
- **Phase 5 Verification Checklist:**
  - [x] Vite + React 18 + TS + Tailwind + React Router compiling to `client/dist/`
  - [x] Exact spec variables in `client/src/styles/tokens.css` (`--color-background #F9F8F3`, `--color-surface`, `--color-foreground`, `--color-muted-foreground`, `--color-muted-subtle`, `--color-terracotta`, `--color-primary`, `--color-border-pill`, `--color-border`), fonts, radii, focus rings, dark-mode overrides
  - [x] Semantic status tokens for 4-verdict model: `high-concern`, `needs-review`, `likely-genuine`, `confirmed`
  - [x] Zero raw colors anywhere else (`npm run check:colors` passes cleanly)
  - [x] `index.html`: Google Fonts (Newsreader, Plus Jakarta Sans, Noto Sans Devanagari, Noto Sans Kannada, JetBrains Mono) + inline flash prevention script (`jaanch_theme` and `jaanch_language`)
  - [x] `client/tailwind.config.ts`: Mapping colors and fonts to CSS variables with Indic font stack fallbacks
  - [x] `translations.ts`: Complete EN/HI/KN dictionaries across 10 sections (`navigation`, `hero`, `features`, `submissionCard`, `auditSteps`, `guidelines`, `footer`, `auth`, `errors`, `statusLabels`)
  - [x] `LanguageContext.tsx`: `currentLang`, `setLang`, `t`, `localStorage` key `jaanch_language`, dynamic `<html lang>` sync, wrapped in `main.tsx`
  - [x] `ThemeProvider`: Persisted `light` / `dark` / `system` with `localStorage` key `jaanch_theme`, dark class / data-theme sync, wrapped in `main.tsx`
  - [x] `docs/I18N_REVIEW.md`: Complete enumeration of all HI and KN strings for native-speaker review (clearly marked unreviewed draft)
  - [x] Unit/Integration Tests:
    - Every key exists in EN, HI, KN
    - Language switch persists and updates `<html lang>`
    - Dark mode and light mode tokens meet WCAG AA contrast ($\ge 4.5:1$ text/bg pairs computed)
    - Total tests: 211 passing across 22 test suites; 25/25 fixtures evaluated
  - [x] Automated glyph render verification at 360px:
    - Headless Chromium screenshot verification of Hindi and Kannada glyphs
    - Zero tofu / replacement `\uFFFD` characters detected
    - Screenshots captured in `docs/ui-shots/glyph-render-hi-360px.png` and `docs/ui-shots/glyph-render-kn-360px.png`
    - Check automated via `npm run check:glyphs`

---

## 5. Next Steps
- Commit Phase 5 updates and update git tag `phase-5-done`.
- Proceed to **Phase 6A – UI Implementation: Landing Page**:
  - Hero section with CTA and official portal notice
  - Facts band (3 cards)
  - "How Jaanch audits an offer in three steps" (01, 02, 03)
  - Guidelines card & helpline card
  - Verification with Playwright and visual comparison.
