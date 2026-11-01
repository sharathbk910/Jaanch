# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 7 – Shared Intelligence and Moderation Complete
- **Current Tag:** `phase-7-done`
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/shared`, `@jaanch/server`, and `@jaanch/client` fully compiled, typechecked, linted, and tested (288 tests passing across 31 test suites, 25/25 eval fixtures matching 100%, 10/10 acceptance criteria PASS)

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
     - 6D: Auth UI & History (**DONE**)
  7. Shared intelligence and moderation (**DONE**)
  8. AI/ML (Next)
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
  - [x] `Results.tsx` & `ResultsPage.tsx`: Two-column layout on desktop (`lg:grid lg:grid-cols-12`) with main audit stream (8 cols) and sticky sidebar jump navigation (4 cols) with anchor targets (`#verdict`, `#stop-protect`, `#why-status`, `#signals`, `#unverified`, `#portal-checklist`, `#response-generators`, `#link-inspector`, `#next-steps`)
  - [x] Educational Verdict Disclaimer: Explicit statement that "Jaanch evaluates automated heuristic signals and threat indicators. Analysis does not prove an opportunity is genuine or fraudulent. Always corroborate independently before paying money or sharing identity documents."
  - [x] `StopProtectCallout.tsx`: Prominent emergency banner for high concern offers with 1-click `tel:1930` call button, `cybercrime.gov.in` portal link, and 2-hour golden-window guidance to freeze bank/UPI transactions
  - [x] `PortalChecklist.tsx`: Interactive regulatory verification checklist for NSP (National Scholarship Portal: scholarships.gov.in), AICTE (Internship Portal: internship.aicte-india.org), MCA (Ministry of Corporate Affairs: mca.gov.in), and NCS (National Career Service: ncs.gov.in) with checkable state
  - [x] `ResponseGenerators.tsx`: Deterministic, localized (EN, HI, KN) templates with copy buttons; includes Challenge Email generator requesting CIN/AICTE credentials and Safe Reply generator; Safe Reply is strictly hidden for high concern / confirmed scam offers (Decision D8)
  - [x] `LinkInspector.tsx`: 3-level hyperlink integrity check (`Clean / No Major Warning Signs`, `Needs Caution / Unverified`, `High Risk / Typosquatting`) wired to `POST /api/link-check`, supporting detected URLs and manual input
  - [x] `ReportDocument.tsx` (`@react-pdf/renderer`): Compact high-density A4 PDF report strictly $\le 4$ pages, $\ge 75\%$ fill, no orphan headings, bundled Noto fonts and safe currency handling (`Rs.`), with original message excluded by default (opt-in appendix, redacted, $\le 1500$ chars)
  - [x] Plain-text security: All evidence quotes, titles, and extracted entities rendered strictly as text nodes (XSS inert in both UI and PDF export)
  - [x] Axe accessibility testing (`ResultsPage.test.tsx`): 0 critical or serious violations across all 3 statuses (`LIKELY_GENUINE`, `NEEDS_REVIEW`, `HIGH_CONCERN`)
  - [x] Full test suite: 260 tests passing across 28 test suites; 10/10 acceptance criteria passing; 100% scenario verification passing
- **Phase 6D Verification Checklist:**
  - [x] `LoginPage.tsx`: Accessible email/password form, client validation, "Sign In with Email", Google OAuth sign-in integration, guest education notice, error alert banner
  - [x] `SignupPage.tsx`: Account creation form with password length & match validation, Google OAuth button, redirect on success
  - [x] `HistoryPage.tsx`:
    - Unauthenticated state: Educational welcome card with "Sign In", "Create Account", and "Verify Offer as Guest" actions
    - Authenticated state: Paginated submission history fetched from `GET /api/history`, domain filter toolbar, 4-verdict status badges, confidence meters, channel information
    - Single item deletion (`DELETE /api/history/:id`) with browser confirmation and optimistic list update
    - Direct link to full audit result (`/results/:id`)
  - [x] `SettingsPage.tsx`:
    - Unauthenticated prompt to sign in
    - User Profile display: Email, masked ID, account role (`user`/`moderator`), join date
    - Language switcher wired to `LanguageContext` (`en`, `hi`, `kn`)
    - GDPR / Digital Personal Data Protection Act permanent account data erasure flow (`DELETE /api/account/data`) requiring exact "DELETE" typed confirmation
  - [x] `AuthContext.tsx`: Full auth provider wiring `signInWithPassword`, `signUp`, `signInWithGoogle`, `signOut`, role detection
  - [x] Component test suite (`client/src/__tests__/AuthPages.test.tsx`): 8/8 tests covering sign-in, sign-up validation, history filters, deletion, and settings data erasure
  - [x] Acceptance criteria harness: 10/10 PASS
  - [x] End-to-end local server scenarios (`scripts/verify-scenarios-e2e.ts`): 100% PASS
- **Phase 7 Verification Checklist:**
  - [x] Peppered Cryptographic Indicator Hashing: Deterministic SHA-256 peppered hashing (`REPORT_HASH_PEPPER`, >= 24 chars) for emails, domains, phones, UPI handles, and bank accounts. Zero raw indicator PII stored in DB.
  - [x] Community Threat Reporting: `POST /api/reports/entity` (authenticated with `requireAuth`, rate-limited to 10 reports/day), starting in `unverified` status. Repeated reports increment `report_count`.
  - [x] Threat Intelligence Lookup: `POST /api/threat-intel/lookup` (rate-limited to 60/hr). Unverified reports strictly masked to prevent defamation/abuse; only confirmed or suspicious matches returned.
  - [x] Decision D2 & Addendum Extension P2 Invariant:
    - `CONFIRMED_SCAM` can ONLY be produced when an indicator matches a moderator-confirmed record. Never from raw text alone.
    - Integrated in `/api/analyze`: matching confirmed records elevates the verdict to `CONFIRMED_SCAM` (confidence >= 98, critical rule `RULE_CONFIRMED_FRAUD_RECORD`).
  - [x] Moderator Role Guard: `requireRole('moderator')` guarding `GET /api/moderation/entities` and `POST /api/moderation/entities/:id/transition`. Rejects unauthorized users with 403 Forbidden.
  - [x] Audit Logging: Every state transition writes an audit entry with `actor_id`, `action: 'TRANSITION_ENTITY_STATUS'`, and metadata.
  - [x] Moderator CLI (`scripts/moderator-cli.ts`): `hash`, `list`, `confirm`, `dismiss`, and `dispute` commands for administrative workflow.
  - [x] Client UI Component (`ReportEntityDialog.tsx`): Accessible modal dialog (`role="dialog"`, `aria-modal="true"`), authentication check with sign-in prompt for guests, pre-filled indicator type and value, channel selector, notes, loading/error/success states. Integrated in `Results.tsx` and `ExtractedEntitiesCard.tsx`.
  - [x] Full test suite: 288 tests passing across 31 test suites; 10/10 acceptance criteria passing; 100% scenario verification passing.

---

## 5. Next Steps
- Commit Phase 7 files and tag `phase-7-done`.
- Proceed to **Phase 8 – AI/ML**:
  - Gemini API integration with schema-grounded response (`findSpan`)
  - Structured output signals, confidence calibration, and fail-soft behavior (`aiStatus`)
  - Multimodal understanding for screenshots and document verification.
