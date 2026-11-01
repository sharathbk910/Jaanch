# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 6C – Results Page & Client-Side PDF Export Complete
- **Current Tag:** `phase-6c-done`
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/shared`, `@jaanch/server`, and `@jaanch/client` fully compiled, typechecked, linted, and tested (236 tests passing across 25 test suites, 25/25 eval fixtures matching 100%, 10/10 acceptance criteria PASS)

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
     - 6C: Results page & client-side PDF export (**DONE**)
     - 6D: Auth UI & History (Next)
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
  - [x] `Analyze.tsx` & `AnalyzePage.tsx`: Full textarea with live character counter, min 25-char validation, clipboard paste action with visual notification
  - [x] Opportunity domain selector (7 domains: internship, job, scholarship, freelance, competition, general_message, other)
  - [x] Communication channel selector (7 channels: email, whatsapp, telegram, sms, linkedin, website, other)
  - [x] Claimed organization selector (curated list of verified Indian organizations + custom input)
  - [x] Sender & contact details expandable section (email, phone, domain) and raw RFC 822 email headers
  - [x] Privacy & Consent toggles (`aiAnalysis`, `shareIndicators`, `saveToHistory` — ALL DEFAULT OFF)
  - [x] Client-side PII redaction preview displaying live masked text and redaction count before submit
  - [x] In-browser document extractor with 5MB security limit; rejects oversized and unsupported files
  - [x] Lazy-loaded Tesseract.js OCR supporting English, Hindi, and Kannada (`eng`, `hin`, `kan`), with progress bar and cancel button
  - [x] `pdfjs-dist` in-browser text extraction with automatic OCR fallback for scanned image-only PDFs and visual notice
  - [x] Zero raw files leave the browser; OCR/PDF text treated as untrusted and rendered only as plain text
  - [x] Typed API client with Zod-validated response; network error handling with retry state preserving input
  - [x] Test suite (`AnalyzePage.test.tsx`, `pdf_and_ocr_extraction.test.ts`): verifies consent defaults, PII redaction before send, error paths, and logs real network payloads
  - [x] `scripts/verify-scenarios-e2e.ts`: 100% end-to-end verification of all 3 sample scenarios against the local server
- **Phase 6C Verification Checklist:**
  - [x] `StatusBanner.tsx`: 4-verdict banner (`LIKELY_GENUINE`, `NEEDS_REVIEW`, `HIGH_CONCERN`, `CONFIRMED_SCAM`) with 4px colored accent border, mono eyebrow, serif status headline, meaning description, confidence pill, and 2px coverage meter track (`8 of 8 checks evaluated`)
  - [x] `PaymentAlert.tsx`: Non-dismissible emergency banner when upfront fee, UPI handle, or bank OTP is detected. Features one-click `tel:1930` call link and `cybercrime.gov.in` portal link
  - [x] `WhyThisStatus.tsx`: Evidence-backed bullet list detailing why the verdict was reached based on triggered signals, corroboration, or missing items
  - [x] `SignalCard.tsx`: Severity badge (`critical`, `high`, `medium`, `low`, `info`), title, mono quoted evidence, and educational "Why it matters"
  - [x] `UnverifiedPanel.tsx`: Structured panel listing uncorroborated identifiers and missing official confirmation
  - [x] `ExtractedEntitiesCard.tsx`: Grid displaying detected UPI IDs, phone numbers, websites/links, fee amounts, and claimed organizations
  - [x] `NextSteps.tsx`: 3-part actionable guidance: 1) What Jaanch checked; 2) Interactive student action checklist with checkable items; 3) Emergency "I already paid" toggle revealing golden-hour 1930 procedures
  - [x] `PdfReportDocument.tsx`: Compact, high-density `@react-pdf/renderer` document adhering to $\le 4$ pages, $\ge 75\%$ page fill, proper currency formatting, and helpline notices
  - [x] `PdfExport.ts`: Lazy PDF generator creating Blob and triggering immediate download as `jaanch-audit-${auditId}.pdf`
  - [x] `ResultsActions.tsx`: Action toolbar for "Download PDF Report", "Print Report", "Export JSON", and "Audit Another Offer"
  - [x] `ResultsPage.tsx`: Full Results Page (`/results/:id`, `/results/local`) with mobile sticky section chips, guest session fallback, plus the interactive `SamplePage` (`/sample`) allowing one-click walkthrough between Genuine, Needs Review, and Fee Scam scenarios
  - [x] `client/src/__tests__/ResultsPage.test.tsx`: 10/10 component tests covering empty state, banner, payment alert, why bullets, signal cards, unverified details, entities, next steps, PDF/print actions, and sample walkthrough switcher
  - [x] Acceptance Criteria Harness (`scripts/test-acceptance.mjs`):
    - **10 / 10 PASS (100% complete!)**
    - CRIT-01 through CRIT-10 all green with runtime verification
  - [x] Visual Proof Screenshots (`scripts/generate-results-screenshots.mjs`):
    - 18 results screenshots generated in `docs/ui-shots/results/` across 360px, 768px, and 1280px viewports in Light/Dark themes and EN/HI/KN languages
  - [x] Unit & Integration Tests: 236 passed across 25 test suites; 25/25 eval fixtures matching 100%

---

## 5. Next Steps
- Commit Phase 6C files and tag `phase-6c-done`.
- Proceed to **Phase 6D – UI Implementation: Auth UI & History (`/login`, `/signup`, `/history`, `/settings`)**:
  - `LoginPage.tsx` and `SignupPage.tsx` using Supabase Auth (email/password + Google auth)
  - `HistoryPage.tsx` with paginated submission history, domain filters, status badges, and single/all item deletion (`DELETE /api/history/:id`, `DELETE /api/account/data`)
  - `SettingsPage.tsx` for user preferences, language defaults, and privacy account data erasure
  - Wire route guards for protected routes and connect with `server/` auth endpoints.
