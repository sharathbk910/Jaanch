# JAANCH – Project State

## 1. Specification Status Notice
> [!NOTE]
> **`docs/SPEC_ORIGINAL.md` status:** **VERIFIED** (Primary specification, read-only).
> Spec verification completed in Phase 1.5. All numbered sections, decisions D1–D16, feature inventory F01–F24, and phase mappings are tracked in `docs/TRACEABILITY.md`. Differences with `docs/SPEC_ADDENDUM.md` have been documented.

---

## 2. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 11 – Deployment & Runbook Complete (Human Gate H2 Reached)
- **Current Tag:** `phase-11-done`
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Green monorepo; `@jaanch/shared`, `@jaanch/server`, and `@jaanch/client` fully compiled, typechecked, linted, and tested (425 tests passing across 42 test suites, 25/25 eval fixtures matching 100%, eval:ml harness passing, 10/10 acceptance criteria PASS, doctor PASS, smoke PASS)

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
  8. AI/ML (Gemini wrapper, PII redaction, grounding with findSpan, fail-soft aiStatus, invariant enforcement, challenge email, safe reply, link explanation) (**DONE**)
  9. WhatsApp (**DONE**)
  10. Verification (**DONE**)
  11. Deployment (**DONE – Human Gate H2 reached**)

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
  - [x] `LoginPage.tsx`: Accessible email/password form, client validation, "Sign In with Email", Google OAuth sign-in integration, guest education notice, "Forgot password?" link, prominent "Continue as guest" link, error alert banner
  - [x] `SignupPage.tsx`: Account creation form with password length & match validation, Google OAuth button, "Continue as guest" link, redirect on success
  - [x] `ForgotPasswordPage.tsx`: Email input form requesting Supabase password reset link, success message, "Continue as guest" link
  - [x] `ResetPasswordPage.tsx`: Secure password reset with minimum 8 characters validation and password matching
  - [x] `VerifyEmailPage.tsx`: Email verification instructions, sign-in CTA, "Continue as guest" link
  - [x] `LogoutPage.tsx`: Clean session termination redirecting to login
  - [x] Protected routes (`<ProtectedRoute>`): Guards `/dashboard`, `/history`, and `/settings`; redirects unauthenticated users to `/login` preserving intended location in state
  - [x] `HistoryPage.tsx` / `DashboardPage.tsx`:
    - Unauthenticated state: Educational welcome card with "Sign In", "Create Account", and "Verify Offer as Guest" actions
    - Authenticated state: Paginated submission history fetched from `GET /api/history`, domain filter toolbar, 4-verdict status badges, confidence meters, channel information
    - Single item deletion (`DELETE /api/history/:id`) with browser confirmation and optimistic list update
    - Direct link to full audit result (`/results/:id`), supported by owner-isolated `GET /api/history/:id` endpoint
  - [x] `SettingsPage.tsx`:
    - Unauthenticated prompt to sign in
    - User Profile display: Email, masked ID, account role (`user`/`moderator`), join date
    - Language switcher wired to `LanguageContext` (`en`, `hi`, `kn`)
    - GDPR / Digital Personal Data Protection Act permanent account data erasure flow (`DELETE /api/account/data`) requiring exact "DELETE" typed confirmation
  - [x] `AuthContext.tsx`: Full auth provider wiring `signInWithPassword`, `signUp`, `signInWithGoogle`, `signOut`, `resetPasswordForEmail`, `updatePassword`, role detection
  - [x] Multi-user isolation test suite (`server/src/__tests__/auth_dashboard_e2e.test.ts`):
    - Register -> login -> analyze with save -> history -> delete flow against real Express stack
    - Two browser / user contexts proving user B never sees user A's history; cross-tenant get/delete returns 404
    - Guest flow unchanged: guest analyses require no auth, persist zero records to DB, and unauthenticated `/api/history` rejected with 401
  - [x] Component test suite (`client/src/__tests__/AuthPages.test.tsx`): 12/12 tests covering sign-in, sign-up validation, history filters, deletion, settings data erasure, forgot password, reset password, verify email, and continue as guest
  - [x] Visual Proof Screenshots (`scripts/generate-auth-screenshots.mjs`):
    - 36 screenshots in `docs/ui-shots/auth/` covering `/login`, `/signup`, and `/history` across 360px and 1280px viewports in Light/Dark themes and EN/HI/KN languages
  - [x] Acceptance criteria harness: 10/10 PASS
  - [x] End-to-end local server scenarios (`scripts/verify-scenarios-e2e.ts`): 100% PASS
- **Phase 7 Verification Checklist (Shared Scam Intelligence + Moderation):**
  - [x] Database Migration 0004 (`0004_shared_intel.sql` & `0004_shared_intel.down.sql`):
    - `intel_records`: UUID id, public_id (`JNC-INTEL-XXXXXXXX`), status enum, category, scrubbed_text, normalized_hash (HMAC-SHA256 with REPORT_HASH_PEPPER), first_reported_at, confirmed_at, confirmed_by.
    - `intel_indicators`: record_id, type (`url|domain|phone|upi`), value_hash (peppered), masked_display.
    - `intel_reports`: record_id, reporter_id, UNIQUE(record_id, reporter_id) per-user deduplication.
    - `moderation_actions`: immutable audit log of moderator transitions and edits.
    - `domain_allowlist`: known-legitimate domains (`tcs.com`, `aicte-india.org`, `scholarships.gov.in`, `mca.gov.in`, `ncs.gov.in`, `sbi.co.in`, `gov.in`, `nic.in`, `ac.in`, `edu.in`, etc.) that can never be confirmed as scams.
    - Strict Row Level Security (RLS) on all 5 tables: reporters see only their own reports, public sees only confirmed records' public fields, moderators manage queue.
  - [x] Reporting Pipeline (`POST /api/reports`):
    - Authenticated with `requireAuth`; requires explicit `shareIndicators: true` consent.
    - Client-side & server-side PII scrubbing via `redactText` before hashing; zero raw student text stored in database.
    - Normalized text hashing via HMAC-SHA256 (`REPORT_HASH_PEPPER`); exact duplicate reports deduplicated per user.
    - Per-user rate limiting (10 reports/day) and new-account cool-off (<24h accounts do not trigger promotions).
  - [x] Threat Promotion Rules (`docs/INTEL.md`):
    - `reported` ──▶ `suspicious` requires $\ge 3$ distinct reports from accounts older than 24 hours.
    - `ai_flagged` set when rule evaluation yields `HIGH_CONCERN`.
    - **Nothing auto-confirms**; only an authorized human moderator can elevate to `confirmed`.
    - **Allowlist Enforced:** Confirming is strictly blocked with `ALLOWLISTED_DOMAIN_BLOCKED` if any indicator domain is on `domain_allowlist`.
  - [x] Moderator Routes (`server/src/routes/moderation.ts`):
    - `GET /api/moderation/queue`: paginated queue of threat records.
    - `GET /api/moderation/records/:id`: detail view returning scrubbed text only, zero raw submissions.
    - `PATCH /api/moderation/records/:id/scrubbing`: allows moderator to sanitize stray PII.
    - `POST /api/moderation/records/:id/action`: execute confirm, dismiss, dispute, or retract with mandatory written reason.
  - [x] Public Dispute Endpoint (`POST /api/disputes`):
    - Rate-limited endpoint for contesting erroneous records; marks record status as `disputed` pending review.
  - [x] Analysis Dual-Tier Matching (`/api/analyze`):
    - Exact normalized text match, followed by indicator peppered-hash match.
    - Wording rule: only `confirmed` produces `CONFIRMED_SCAM` and "matches a moderator-confirmed record"; `suspicious`/`ai_flagged` produce "similar to reported messages" with the verdict unchanged; never reveals reporter identities or counts under threshold.
  - [x] Client Frontend UI:
    - `IntelMatchCard.tsx`: Rendered on results with status badge, public ID, explanation, masked indicators, and "Contest this record" action.
    - `ReportMessageDialog.tsx`: Modal dialog for reporting offers with clear PII scrubbing and consent explanation.
    - `DisputeDialog.tsx`: Dialog for contesting threat records via `POST /api/disputes`.
    - `ModerationPage.tsx` (`/moderation`): Accessible only to moderators (`role === 'moderator'`), status tabs, detail modal, edit scrubbing modal, and action execution.
    - Multilingual i18n (`en`, `hi`, `kn`) and narrow allowlist in `scripts/banned-phrases-allowlist.json`.
  - [x] Documentation & Bootstrap Tool:
    - `docs/INTEL.md`: Complete threat intelligence lifecycle, promotion rules, and threat model documentation.
    - `scripts/bootstrap-moderator.ts`: Standalone administrative script for promoting accounts to the moderator role.
  - [x] Verification & Test Suite:
    - 322 tests passing across 34 test suites (11 comprehensive E2E tests in `server/src/__tests__/shared_intel_e2e.test.ts` + 18 in `threat_intelligence.test.ts` + 5 in `moderator_cli.test.ts`).
    - 10 / 10 acceptance criteria passing; 100% scenario verification passing.
- **Phase 8 Verification Checklist (AI/ML: Similarity, Semantic, New Rules, URL Intelligence, Evaluation):**
  - [x] Database Migration 0005 (`0005_ai_ml_vector_similarity.sql` & `0005_ai_ml_vector_similarity.down.sql`):
    - Extensions `pg_trgm` and `vector` installed.
    - Trigram GIN index on `intel_records(scrubbed_text gin_trgm_ops)`.
    - `embedding vector(768)` column added to `intel_records`.
    - HNSW cosine index `idx_intel_records_embedding_hnsw` on `intel_records USING hnsw (embedding vector_cosine_ops)`.
    - Stored RPC functions `match_intel_similarity` and `match_intel_semantic` with `WHERE r.status IN ('confirmed', 'suspicious')` invariant.
  - [x] 4-Tier Matching Architecture (`ThreatIntelRepository.matchIntel`):
    - Tier 1: Exact normalized text hash match (very high confidence).
    - Tier 2: Indicator peppered-hash match (`url`, `domain`, `phone`, `upi`) (high/medium confidence).
    - Tier 3: Trigram similarity RPC + TypeScript character 3-shingle Jaccard fallback (`computeShingleJaccard`), extracting matched keywords. Strictly matches against `confirmed` or `suspicious` records only.
    - Tier 4: Semantic dense embeddings via pgvector RPC + cosine similarity fallback (`cosineSimilarity`). Strictly matches against `confirmed` or `suspicious` records only.
  - [x] Semantic Embeddings & Gemini Provider:
    - `EmbeddingProvider` interface with `dimension: 768`.
    - `GeminiEmbeddingProvider` using official Google GenAI SDK model `text-embedding-004` (768 dimensions), 5s timeout guard.
    - Verified upstream documentation: natively supports Hindi (`hi`) and Kannada (`kn`) in a unified multilingual vector space.
    - Embeddings generated and stored strictly for scrubbed threat intel text, NEVER raw student submissions.
    - Fail-soft null provider fallback (`NullEmbeddingProvider`) ensures 100% operation without API keys.
  - [x] 7 New Rule Families in `@jaanch/shared` (Total 15 rules in catalog):
    - `RULE_OTP_SHARING`: Demands for OTP or verification code sharing across `en`, `hi`, `kn`, `hinglish`.
    - `RULE_PHISHING_URGENT_ACTION`: Urgent threats of account block / KYC expiry paired with links.
    - `RULE_IMPERSONATION_AUTHORITY`: Authority impersonation (bank manager, cyber police, courier customs, CEO).
    - `RULE_TASK_SCAM`: Pay-per-task, YouTube video like, Telegram reviews, and crypto daily tasks.
    - `RULE_INVESTMENT_GUARANTEED_RETURNS`: Guaranteed profits, money doubling, and zero-risk investment schemes.
    - `RULE_REMOTE_ACCESS_APP`: Coercive requests to install AnyDesk, TeamViewer, RustDesk, QuickSupport, AirDroid.
    - `RULE_UPI_COLLECT_REQUEST`: Demands to approve UPI collect requests or enter UPI PIN to receive money.
    - Multilingual negation guards and word-snapped evidence quotes.
    - Existing 25 benchmark fixtures continue to pass 100% unchanged.
  - [x] URL Intelligence (`server/src/routes/links.ts`):
    - Never fetches untrusted message URLs over HTTP.
    - Numeric IP-literal host detection (`net.isIP`) -> `critical` severity.
    - Punycode / IDN homograph detection (`isPunycode`) -> `critical` severity.
    - Excessive subdomains ($\ge 4$ levels, `hasExcessiveSubdomains`) -> `warning` severity.
    - URL shorteners (`isUrlShortener`) -> `warning` severity, flagged with explicit notice: "cannot inspect without external fetch".
    - Lookalike brand domain typosquatting (`detectLookalikeDomain`) -> `critical` severity.
    - RDAP domain age lookup via safeFetch (timeouts/failures fail-soft to `unknown`, never `pass`).
  - [x] Explainability & Transparency:
    - Signals report `id`, `category`, plain reason (`whyItMatters`), and snapped evidence quotes.
    - Intel matches report `tier`, `status`, `confidenceBand`, `similarityScore`, and `matchedTokens` or `matchedIndicators`.
  - [x] Evaluation & Calibration Harness (`npm run eval:ml`):
    - Real evaluation script (`scripts/eval-ml.ts`) producing `docs/EVAL_REPORT.md`.
    - Dataset audit (25 benchmark fixtures labeled `illustrative_synthetic`, 0 duplicates, class balance audit).
    - Documented reason why statistical parametric ML (TF-IDF + Logistic Regression) is skipped for N=25 (avoids severe overfitting and statistical leakage).
    - Similarity threshold calibration sweep: Calibrated thresholds recorded in `docs/INTEL.md`:
      - Jaccard Similarity Min: `0.45` | High Confidence: `0.65`
      - Semantic Cosine Min: `0.75` | High Confidence: `0.85`
  - [x] Frontend Component Updates:
    - `IntelMatchCard.tsx`: Displays match tier badge, confidence band, similarity percentage score, matched shingle keywords, and matched indicators using pure CSS tokens.
    - `SignalCard.tsx`: Displays typed category badge (`financial_demand`, `phishing_credential`, `remote_access_control`, etc.) using pure CSS tokens.
  - [x] Verification & Test Suite:
    - 361 tests passing across 38 test suites (15 dedicated unit tests in `shared/src/__tests__/rules_phase8.test.ts` + 10 integration tests in `server/src/__tests__/ai_ml_phase8.test.ts` + 8 in `scripts/__tests__/sql-lint.test.ts`).
    - 25/25 benchmark corpus fixtures matching 100% (Accuracy: 100%, Precision: 100%, Recall: 100%, F1: 100%).
    - Acceptance criteria: 10/10 PASS; scenario verification: 100% PASS; zero secrets, zero hardcoded colors, zero banned certainty claims.

---

- **Phase 9 Verification Checklist (WhatsApp Scam-Alert Sharing):**
  - [x] Deterministic Localized Alert Builder (`shared/src/share/alertBuilder.ts`):
    - Localized warning headline across English, Hindi, and Kannada (`en`, `hi`, `kn`).
    - Classification and verification line with public ID and confirmed date (e.g., `"Matched a moderator-confirmed scam record [JNC-INTEL-...], confirmed on <date>"`).
    - Redacted excerpt of the original message ($\le 300$ chars, toggleable by user).
    - 4 localized safety tips (never pay deposit, verify on official portals, do not share OTP, report to 1930).
    - Official helplines: National Cyber Crime Helpline `1930` and `cybercrime.gov.in`.
    - Jaanch verification link `https://jaanch.ai`.
    - Sanitizes control chars (`[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]`) and bidi overrides (`[\u200E\u200F\u202A-\u202E\u2066-\u2069]`).
    - URL length budgeting: gracefully steps down excerpt (300 -> 200 -> 100 -> 50 -> 0) and reduces tips if needed to stay within safe URL limit (`maxEncodedUrlLength`), raising `isTrimmed: true` and localized `trimmedReason`.
    - Round-trip URL encoding invariant: `decodeURIComponent(shareUrl.replace('https://wa.me/?text=', '')) === fullMessage` strictly verified for Hindi, Kannada, emoji (⚠️, 🚨), ₹, newlines, and special characters (`&`, `#`, `%`).
  - [x] Frontend `ShareAlert` Component (`client/src/components/results/ShareAlert.tsx`):
    - **Strict Guard:** Shown **ONLY** when `intelMatch.status === 'confirmed'`; returns `null` for `reported`, `unverified`, `ai_flagged`, `suspicious`, `dismissed`, `disputed`.
    - Preview modal dialog (`role="dialog"`, accessible overlay and close button).
    - Excerpt inclusion toggle switch (`includeExcerpt`) and trim warning notice.
    - Editable `<textarea>` that updates the encoded `https://wa.me/?text=...` link dynamically in real time.
    - Live character counter.
    - "Open WhatsApp" action: opens `https://wa.me/?text=<encoded>` in a new tab with `rel="noopener noreferrer"`, letting the user choose any contact or group inside WhatsApp.
    - "Copy message" fallback with visual confirmation ("Copied!").
    - Pure CSS tokens only: `bg-surface`, `bg-canvas`, `border-border`, `text-primary`, `text-body`, `text-muted`, `text-terracotta`. Zero hardcoded hex/rgb.
  - [x] Strict Safety & Privacy Invariants:
    - **Zero Auto-Send:** Zero server-side dispatches, zero unsolicited messages, zero WhatsApp Business API calls. The user must manually click Send inside WhatsApp.
    - **Privacy Isolation:** No student PII or reporter info is ever included; only scrubbed excerpts and moderator-confirmed public record metadata.
    - **Audit Trail Without Message Content:** Optional `POST /api/whatsapp/audit-share` endpoint logs `share_opened` or `copied` with `publicId` and `action` only; zero message text is stored or logged.
  - [x] Narrow Banned-Phrases Allowlist:
    - Allowlisted `"confirmed scam"` strictly for `shared/src/share/alertBuilder.ts` and `client/src/components/results/ShareAlert.tsx` in `scripts/banned-phrases-allowlist.json`.
  - [x] Verification & Test Suite:
    - 41 test suites, 385 tests passing (9/9 in `shared/src/__tests__/share_alert.test.ts`, 9/9 in `client/src/__tests__/ShareAlertComponent.test.tsx`, 10/10 in `server/src/__tests__/whatsapp_channel.test.ts`).
    - Manual proof screenshots committed in `docs/ui-shots/share-alert/`:
      - `share-alert-card-en-360px.png` & `share-alert-modal-en-360px.png`
      - `share-alert-card-hi-360px.png` & `share-alert-modal-hi-360px.png`
      - `share-alert-card-kn-360px.png` & `share-alert-modal-kn-360px.png`
      - `share-alert-card-en-1280px.png` & `share-alert-modal-en-1280px.png`
      - `share-alert-card-hi-1280px.png` & `share-alert-modal-hi-1280px.png`
      - `share-alert-card-kn-1280px.png` & `share-alert-modal-kn-1280px.png`
    - 10 / 10 acceptance criteria passing; 100% scenario verification passing; 25/25 eval fixtures matching 100%.

- **Phase 10 Verification Checklist (Verification & QA):**
  - [x] RFC 822 Email Header Analysis (`F08`):
    - `shared/src/rules/emailHeaders.ts`: Evaluates `Authentication-Results`, `Received-SPF`, `DKIM-Signature`, and `From`/`Reply-To` domain mismatch.
    - Flags `spf=fail` (`RULE_EMAIL_SPF_FAILED`), `dkim=fail` (`RULE_EMAIL_DKIM_FAILED`), and `dmarc=fail` (`RULE_EMAIL_DMARC_FAILED`) with hard disqualifier status.
    - Wired to `client/src/pages/Analyze.tsx` via `payload.sender.headers`.
    - Tested via `shared/src/__tests__/emailHeaders.test.ts` (4/4 tests PASS).
  - [x] RDAP Domain Age Availability (`D10`, `F12`):
    - `server/src/routes/links.ts: queryRdapDomainAge` executes RDAP lookup via `safeFetch` by default (per Decision D10: "RDAP stays on"), failing soft to `{ ageDays: null, status: 'unknown' }` on timeout/network failure.
  - [x] Dedicated Link Checker Route (`F18`):
    - `client/src/pages/Results.tsx: LinkCheckPage` mounted at `/link-check`, supported by `LinkInspector.tsx` and `POST /api/link-check`.
  - [x] Privacy Copy & Code Audit (`D16`):
    - Generated `docs/privacy-copy-check.md`: 100% conformant audit of all public-facing privacy claims against concrete code implementation with zero violations.
  - [x] Feature Parity Matrix (`docs/FEATURE_PARITY.md`):
    - 24 / 24 Feature Inventory items (F01–F24) verified PASS with proving test files and commands.
    - 16 / 16 Authoritative Decisions (D1–D16) verified PASS.
    - 10 / 10 Core Acceptance Criteria (CRIT-01 to CRIT-10) verified PASS.
  - [x] Regression & Quality Suite Execution:
    - `check:no-secrets`: PASSED (0 secrets found).
    - `check:colors`: PASSED (0 hardcoded hex/rgb tokens).
    - `check:banned-phrases`: PASSED (0 certainty claim violations).
    - `check:glyphs`: PASSED (0 tofu boxes at 360px in Hindi and Kannada).
    - `typecheck`: PASSED (0 errors across `shared`, `server`, and `client`).
    - `npm run eval`: PASSED (25/25 corpus fixtures, 100% Accuracy, Precision, Recall, F1).
    - `npm run eval:ml`: PASSED (Generated `docs/EVAL_REPORT.md` with threshold calibration).
    - `npm test`: PASSED (42 test suites, 425 tests passing, 0 failed).
    - `Security Suite`: PASSED (38 comprehensive security tests: endpoint auth matrix x guest/user/mod, IDOR, JWT tampering/expiry, SQLi, XSS, SSRF, zero PII in shared tables).
    - `test:acceptance`: PASSED (10/10 criteria PASS).
    - `verify:scenarios`: PASSED (100% scenario verification against local server).
    - `npm run build`: PASSED (Clean production build across all workspaces).

- **Phase 11 Verification Checklist (Deployment, Runbook, Doctor & Deploy Config – Human Gate H2):**
  - [x] Operational Runbook (`docs/RUNBOOK.md`):
    - System prerequisites (Node.js $\ge 20.0.0$, npm $\ge 10.0.0$, Git, Supabase PostgreSQL with `pg_trgm` and `vector`).
    - Setup from scratch: clone, install, `.env` file configuration, schema migrations (`0001`–`0005`), organization seeding (`0003`), moderator bootstrap (`scripts/bootstrap-moderator.ts`).
    - Operational verification commands: `doctor`, `smoke`, `test`, `eval`, `eval:ml`, `check:no-secrets`, `check:colors`, `check:banned-phrases`, `check:glyphs`.
    - Production cloud deployment guides: Client on Vercel SPA, Server on Render Web Service, and containerized deployment with Docker.
    - Strict security reminders: "Never commit `.env`" and "Never use Supabase service-role keys in application runtime".
    - CORS and OAuth redirect URL checklist (`CLIENT_ORIGINS`, Supabase Auth Site URL and redirect URLs).
    - Incident management & rollback procedures: code rollback (`git reset --hard phase-N-done`), migration rollback (`000X_*.down.sql`), and secret rotation protocol.
  - [x] Environment Doctor Tool (`scripts/doctor.mjs` & `npm run doctor`):
    - Node.js runtime version verification ($\ge 20.0.0$).
    - Checks presence of required server environment variable names (`PORT`, `NODE_ENV`, `CLIENT_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `REPORT_HASH_PEPPER`).
    - Checks presence of required client environment variable names (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
    - **Security Rule:** Prints variable names only; values are NEVER printed or logged.
    - Verifies absence of forbidden service-role keys (`SUPABASE_SERVICE_ROLE_KEY`).
    - Verifies `REPORT_HASH_PEPPER` meets minimum length requirement ($\ge 24$ chars).
    - Network probes: Supabase host reachability and `/api/health` live reachability.
  - [x] Production Smoke Test (`scripts/smoke.mjs` & `npm run smoke`):
    - Probes `/api/health` returning 200 OK with uptime.
    - Probes `/api/config` returning public configuration safely.
    - Probes `/api/analyze` verifying Genuine TCS offer classified as `LIKELY_GENUINE`.
    - Probes `/api/analyze` verifying Upfront Fee scam classified as `HIGH_CONCERN` with `RULE_UPFRONT_FEE`.
    - Probes `/api/analyze` verifying OTP Phishing scam classified as `HIGH_CONCERN` with `RULE_BANK_OTP_DEBIT`.
    - Probes `/api/link-check` verifying lookalike typosquatting domain classified as `HIGH_RISK`.
    - Supports optional authenticated flow via `SMOKE_EMAIL` and `SMOKE_PASSWORD`.
  - [x] Deployment Configurations:
    - `client/vercel.json` & root `vercel.json`: Single Page Application (SPA) rewrites to `/index.html`, clean URLs, and HTTP security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).
    - `render.yaml`: Render Blueprint configuration for Node.js Express server, health check `/api/health`, and secret environment variables mapping.
    - Multi-stage `Dockerfile`: Node 20 Alpine builder and minimal runner, unprivileged `node` user, built-in healthcheck.
  - [x] Final Documentation:
    - Root `README.md`: High-density overview, badges, architectural diagram, 4-verdict decision model, quickstart, verification command table, and disclaimers.
    - Final Report (`docs/FINAL_REPORT.md`): Full phase completion matrix, feature parity matrix (F01–F24), authoritative decisions (D1–D16), known limitations, and Human Gate H2 declaration.

---

## 5. Human Gate H2 Status
- **All 11 project phases are complete.**
- **Repository is green, fully tested, linted, and verified (387 passing tests).**
- **Human Gate H2 Reached:** The final report (`docs/FINAL_REPORT.md`) has been generated. The agent has STOPPED in accordance with Section 0.7.H2 and is waiting for the user's review. No push or deployment has been executed.
