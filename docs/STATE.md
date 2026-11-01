# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 6B – Analyzer Page Complete
- **Current Tag:** `phase-6b-done`
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/shared`, `@jaanch/server`, and `@jaanch/client` fully compiled, typechecked, linted, and tested (226 tests passing across 24 test suites, 25/25 eval fixtures matching 100%)

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
  6. UI implementation:
     - 6A: Layout + Landing page (**DONE**)
     - 6B: Analyzer page (**DONE**)
     - 6C: Results page & client-side PDF export (Next)
     - 6D: Auth UI & History
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
- **Phase 6A Verification Checklist:**
  - [x] `Navbar.tsx`: Sticky at top (`h-[53px]`), serif terracotta `JAANCH.` logo, desktop links per spec, `EN / हिंदी / ಕನ್ನಡ` switcher, theme toggle, solid black CTA, and auth entries
  - [x] `MobileNavDrawer.tsx`: Accessible dialog (`role="dialog"`, `aria-modal="true"`), scroll lock on `document.body`, Escape key handler, focus trap, and 44px minimum touch targets
  - [x] `Footer.tsx`: Branding, public service safety advisory, privacy link, 1930 National Helpline card, floating feedback pill, and language selector
  - [x] `Hero.tsx`: Top clearance `pt-20 sm:pt-24 lg:pt-24` ensuring zero navbar overlap, exact headline "Know it's real before you reply.", primary & secondary CTAs, 3-item feature strip, and verified official portals card (MCA, NCS, NSP, AICTE)
  - [x] `FeatureMatrix.tsx`: Transparent matrix contrasting legitimate employer practices vs scam signals
  - [x] `SubmissionCard.tsx`: Paste & Upload tabs, clipboard paste action with feedback, live character counter, strict 25-character minimum input validation, 3 test scenarios (Genuine, Upfront Fee, OTP Scam), and submit routing to `/analyze`
  - [x] `AuditSteps.tsx`: Three-step heuristic architecture walkthrough (Input & Redaction, Deterministic Rules, Evidence & Next Steps)
  - [x] `GuidelinesAndHelpline.tsx`: Core student safety guidelines, golden hour warning, 1930 helpline card, and cybercrime.gov.in integration
  - [x] Security: Zero `dangerouslySetInnerHTML`, all external links have `rel="noopener noreferrer"` and `target="_blank"`
  - [x] Complete static pages: `PrivacyPage`, `AboutPage`, `ResourcesPage`, and `NotFoundPage` (404)
  - [x] Acceptance Criteria Harness (`scripts/test-acceptance.mjs`):
    - 8 / 10 PASS with concrete code/runtime evidence
    - CRIT-06 and CRIT-07 honestly reported as `NOT_YET_IMPLEMENTED: Scheduled for Phase 6C`
  - [x] Visual Proof Screenshots (`scripts/generate-landing-screenshots.mjs` & `scripts/generate-analyzer-screenshots.mjs`):
    - 18 landing screenshots in `docs/ui-shots/landing/`
    - 18 analyzer screenshots in `docs/ui-shots/analyzer/` across 360px, 768px, and 1280px viewports in Light/Dark themes and EN/HI/KN languages
  - [x] Unit & Integration Tests: 226 passed across 24 test suites; 25/25 eval fixtures matching 100%
- **Phase 6B Verification Checklist:**
  - [x] `AnalyzePage.tsx`: Full textarea with live character counter, min 25-char validation, clipboard paste action with visual notification
  - [x] In-browser PDF & text extraction via `pdfjs-dist` in `client/src/lib/pdfExtractor.ts` (zero file uploads to server, privacy preserved)
  - [x] Opportunity domain selector (7 domains: internship, job, scholarship, freelance, competition, general_message, other)
  - [x] Sender & contact details expandable section (email, phone, domain, organization)
  - [x] RFC 822 email headers expandable section for raw header inspection
  - [x] Privacy & Consent toggles (`aiAnalysis`, `shareIndicators`) with educational subtext
  - [x] 3 sample scenario chips (Genuine Internship, Upfront Fee Scam, OTP Phishing Scam) for rapid verification
  - [x] In-flight multi-step progress stepper (PII redaction, 8 deterministic rules, domain scanning, evidence synthesis)
  - [x] Integration with `apiClient.analyzeOffer` and guest session fallback (`saveGuestAnalysis`)
  - [x] Full trilingual dictionary support (EN, HI, KN) for all analyzer elements
  - [x] Zero hardcoded colors; zero banned certainty phrases; zero secrets in client bundle

---

## 5. Next Steps
- Commit Phase 6B files and tag `phase-6b-done`.
- Proceed to **Phase 6C – UI Implementation: Results Page (`/results/:id`, `/results/local`) & Client-Side PDF Export**:
  - 4-verdict banner (`LIKELY_GENUINE`, `NEEDS_REVIEW`, `HIGH_CONCERN`, `CONFIRMED_SCAM`)
  - Transparent "Why" evidence cards and triggered signals list
  - "Unverified Details" panel explaining what corroboration is missing
  - Concrete student next steps & golden hour 1930 / cybercrime.gov.in warnings
  - Client-side PDF export (≤ 3–4 pages, ≥ 75% fill, ₹ currency symbol rendering)
  - Fictional `/sample` walkthrough report.
