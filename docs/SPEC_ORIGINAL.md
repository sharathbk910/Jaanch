# JAANCH — REBUILD FROM SCRATCH (ORCHESTRATOR PROMPT)
### Phase by phase, foundation → full product, including the latest editorial UI. Paste into the Antigravity agent chat in a NEW, EMPTY project folder.

> **FOR THE USER (not the agent) — read first**
> 1. **If your original Git repository is reachable (GitHub), cloning it is the safest way to "move everything exactly as it is":** `git clone <url>` → `npm install` → copy your two `.env` files by hand (never via Git) → run. A rebuild from a prompt produces *new* code that follows the same specs; it can never be byte-identical. Use this prompt when the repo is lost, or when you want a clean-room rebuild.
> 2. Before pasting: create an empty folder, open it in Antigravity, and put these files in it: `docs/spec/SPEC_PACK.md` (this is `Jaanch_Spec_Pack.md`, renamed) and `docs/reference/` containing the four screenshots (`landing-1-hero.jpeg`, `landing-2-facts-how-it-works.jpeg`, `landing-3-guidelines-footer.jpeg`, `analyze.jpeg`).
> 3. Have ready (the agent will ask once, in Phase 0): whether you reuse your existing Supabase project or create a new one; whether you have a Gemini API key (optional); your GitHub repo URL (optional). **Never paste API keys into the chat.** You will create the `.env` files yourself from the generated `.env.example` files. Any key that was ever visible in a screenshot or chat should be rotated.
> 4. If you reuse your existing Supabase project, copy `REPORT_HASH_PEPPER` from the old `server/.env` (reported-entity hashes depend on it).

---

## 0. OPERATING CONTRACT (applies to every phase)

### 0.1 Mission
Rebuild the complete **Jaanch** web application (AI-assisted scam-verification tool for Indian students) so that **every feature in the Feature Inventory (0.6) works**, with the **latest UI (editorial design, Part G)**, in a clean repository. Work **one phase at a time**; never skip, reorder or merge phases. Do not add features that are not specified.

### 0.2 The spec pack (your detailed requirements)
`docs/spec/SPEC_PACK.md` holds Parts **A–G** (index at the top with line numbers). Read only what a phase names (use line ranges/`Select-String`/`grep`). Rules:
- Parts were written as successive instructions for one evolving product. **Implement the final state directly.** Later parts override earlier ones (**G > F > E > D > C > B > A**), and **0.5 Final-State Decisions override everything**.
- Ignore inside the parts: "patch only", "existing codebase", "audit the repo", "baseline", their own phase/batch orders, and any migration that *alters or backfills* earlier tables.
- Only **Part G** defines visuals. Earlier parts' palette/layout/copy styling is superseded; keep their *functional* requirements.
- If two parts conflict and 0.5 does not decide it, choose the more conservative option (unknown over pass, lower status over higher, simpler over complex) and record it in `docs/STATE.md`.

### 0.3 Safety rails
1. `git init` (if needed). Make the **first commit on `main` contain only `README.md` and `.gitignore`**, then create and switch to branch **`rebuild`**. **All work happens on `rebuild`.** If you ever find yourself on `main` with changes, STOP.
2. **Commit locally only**: no push, merge, tag, rebase or remote changes unless the user asks.
3. **Never commit secrets or personal data.** `.env` files are ignored; only `.env.example` files are committed. Never print keys. Never log message text.
4. Install a local guard (`npm run hooks:install`) that blocks commits on `main`.
5. Cross-platform: the new laptop may be Windows, macOS or Linux. Use Node scripts (not bash-only tools) and forward slashes in code; keep `.gitattributes` forcing LF for source/fixtures.
6. Pin exact dependency versions (no `^`/`~`) and commit the lockfile. Use current stable versions at build time; verify peer-dependency compatibility (React, Vite, Tailwind v3, `@react-pdf/renderer`, `@google/genai`, Tesseract.js, pdfjs-dist, Zod, Supabase JS).

### 0.4 Phase Gate Protocol (every phase)
1. Read the phase. Note the **phase-start commit**.
2. Implement only what it lists; **write the tests first or alongside**.
3. Run the phase's **Verification checklist** plus the cumulative checks: `npm run lint`, `typecheck`, `test`, `eval` (from P3), and everything earlier phases added. **The repository must be green at the end of every phase.**
4. Write `docs/phases/phase-N-report.md`: what was built, files, commands run with results, **PASS/FAIL for each exit criterion**, deviations and why.
5. Update `docs/STATE.md` (current phase, decisions, open items, versions); commit: `rebuild(phase-N): <summary>`.
6. On any FAIL: fix inside the phase. If impossible, `git reset --hard <phase-start-commit>` (on `rebuild` only), report, and **STOP**.
7. No `TODO`, stubs, placeholder text, commented-out code, or "implement later". Every route, page and button that exists must work.
8. Proceed only when every exit criterion is PASS. **Human gates (H0, H1, H2) stop and wait.**

### 0.5 FINAL-STATE DECISIONS (authoritative)
| # | Decision |
|---|---|
| D1 | **Stack:** TypeScript everywhere; npm workspaces `client` (React 18, Vite, React Router, Tailwind CSS v3, TanStack Query, react-hook-form + Zod resolvers, lucide-react), `server` (Node ≥ 20, Express, Zod, pino, helmet, express-rate-limit, `@supabase/supabase-js`, `@google/genai`), `shared` (pure TS: schemas, config, text utils, rules, status engine, builders). Tests: Vitest, supertest, Playwright, axe. |
| D2 | **Status model:** five statuses `VERIFIED_OFFICIAL, LIKELY_GENUINE, NEEDS_REVIEW, HIGH_RISK, CONFIRMED_SCAM` (Part B §4 with C §6 positive-evidence rule). **Link checks keep the 3-level risk enum.** Verified/Confirmed are evidence-gated; AI can never raise status past `NEEDS_REVIEW`; hard disqualifiers ⇒ `HIGH_RISK`; unknown ≠ pass. |
| D3 | **Rule catalog = union** of A §9.6 ∪ B §5 ∪ C §5 ∪ F §7 (later wins on severity/wording), with the negation guards of F §7. **Extraction** per C §3–§4 and F §3–§6. **Coverage** is "k of 8 independent checks" (F §10), never a percentage. Outcome chips include `none_found`. |
| D4 | **Next steps** per Part D (three parts; ≤ 6 manual steps; high-risk "Protect yourself" variant; stable `step_key`). **Evidence report & results content** per B §8, C §7 (E1–E8), F §9/§11. **PDF** per Part E (client-side `@react-pdf/renderer`, lazy-loaded, bundled font with `₹`, Print as fallback). |
| D5 | **UI** = Part G only: **light theme only**, editorial tokens, no dark mode, no gradients/shadows; routes: `/ /analyze /results/:id /results/local /sample /link-check /resources /about /privacy /history /login /signup /settings *`. Nav labels per G §4.1 (the "Verification Guide" label points to `/resources`). |
| D6 | **Results page layout:** single column (no sidebar). Above-the-fold contract at 375×667: status banner → payment alert (if any) → independent-checks meter → first 2–3 "Why this status" bullets → primary **"See what to do next"** button (anchor) and a **More** menu (Download PDF, Print, Export JSON). Mobile: sticky section chips (Status · Next steps · Signals · Evidence). Evidence report collapsed on mobile with a one-line summary; signals are rows (severity icon + title + quote, expandable "Why it matters") sorted critical → info with a source tag ("Rule" / "AI-observed"). |
| D7 | **Guests:** nothing persisted server-side; results held in `sessionStorage`; guests re-submit for stateless recompute. Logged-in users can save history, attestations and checklist state. |
| D8 | **Safe Reply** hidden for `HIGH_RISK`/`CONFIRMED_SCAM`; **"I already paid" defaults off**; `paymentAlert` shown for any payment signal regardless of status. |
| D9 | **AI optional:** the app is fully functional with no Gemini key. Model name is configurable (`GEMINI_MODEL`); **check the current Gemini API docs for valid model names** and fail soft (rule-only result, `aiStatus` explains). AI output is Zod-validated, evidence-grounded with `findSpan`, and labelled "AI-observed" (never pseudo rule codes). |
| D10 | **Third-party checks flag** `ENABLE_THIRD_PARTY_CHECKS=false` by default (CT-log, Safe Browsing, platform listing fetch). **RDAP stays on.** `DEMO_MODE=false` by default. The registry seed has every row `needs_team_review = true`. |
| D11 | **No ML layer, no dark mode, no Supabase service-role key in request handling.** Moderators confirm reported entities via SQL in the Supabase dashboard. |
| D12 | **Min text length** comes from `INPUT_LIMITS.textMin` (= 20); every UI string shows the real constant. |
| D13 | **Languages:** UI chrome and the pages listed in G §8 are translated to हिंदी and ಕನ್ನಡ (flagged for native review); rule/AI explanation content stays English with a notice. |
| D14 | **Database:** one consolidated migration set that creates the **final schema directly** (no `risk_level` backfill). Final objects: enums `opportunity_domain, input_type, risk_level (link checks only), signal_category (payment, urgency, data_request, missing_details, channel, too_good_to_be_true, link, sender_identity, source_authenticity, reported_record, content_quality), signal_severity, signal_source, channel_type, verification_status, check_outcome (pass, fail, unknown, not_run, user_attested, none_found), entity_type, entity_status, org_kind`; tables `profiles, analyses (verification_status, matched_organization_id, sender_email_domain, headers_supplied, listing_match_status), analysis_signals, analysis_unknowns, checklist_items (step_key + unique(analysis_id, step_key)), analysis_checks, link_checks, recruiter_challenges, feedback, organizations, reported_entities, scam_reports, page_feedback`; functions `handle_new_user` (trigger), `check_reported_entities`, `submit_scam_report`, `submit_page_feedback`; RLS on every table exactly as in A §11, B §10, D §5. |
| D15 | **Fonts** self-hosted (Fontsource), no CDNs, CSP-safe; OCR/PDF workers and language data bundled locally. |
| D16 | **Privacy copy** must be literally true: audit every claim against the code and record it in `docs/privacy-copy-check.md` (G §9 register). |

### 0.6 FEATURE INVENTORY (parity checklist — create `docs/FEATURE_PARITY.md` in P1, update each phase, final PASS/FAIL in P12)
| ID | Feature | Phase |
|---|---|---|
| F01 | Landing page (hero + official-portals card, facts band, how-it-works, guidelines card, helpline card, footer) | P9 |
| F02 | Header/nav/mobile sheet/skip link/footer/floating feedback pill, hash navigation | P8 |
| F03 | Language switch EN / हिंदी / ಕನ್ನಡ (header + footer, persisted, `<html lang>`) | P8, P11 |
| F04 | Analyze page: paste text, upload screenshot/PDF with in-browser OCR/extraction + editable text, clipboard paste, 3 sample chips, offer type, "More options" (sender email/phone/UPI/handle/recruiter/org autocomplete/headers/official listing; privacy toggles), validation, progress | P9 |
| F05 | Input routing (misplaced email/URL/phone/UPI) with visible notices | P2, P9 |
| F06 | Extraction: entities, organization, role, 10-detail completeness with clean whole-word quotes | P2 |
| F07 | Rule engine (full catalog, negation guards, hard disqualifiers) | P3 |
| F08 | Sender email analysis, header parsing (SPF/DKIM/DMARC as reported), DNS policy lookup | P3, P5 |
| F09 | Lookalike/impersonation detection, link inspector, reserved-domain note | P3, P5, P10 |
| F10 | Organization registry search/match; reported-entities lookup & reporting (hashed) | P4, P5, P10 |
| F11 | Status engine (5 statuses, reasons), `paymentAlert`, coverage k-of-8, pattern insights | P3 |
| F12 | RDAP domain age; (flagged) CT-log, Safe Browsing, official-listing fetch/compare | P5, P7 |
| F13 | Optional Gemini context, challenge email, safe reply, link explanation (all with fallbacks) | P5, P6 |
| F14 | Results page (status banner, payment alert, why, patterns, 3-part next steps, signals, evidence report, link inspector, challenge/safe reply, report-it, feedback) | P10 |
| F15 | Attestations + checklist persistence (saved) / session state (guest) | P5, P10 |
| F16 | Export: PDF (react-pdf, ≤ 3–4 pages, ₹ renders), Print, JSON | P10 |
| F17 | `/sample` fictional report | P10 |
| F18 | Link checker page | P10 |
| F19 | Verification Guide (`/resources`), About, Privacy | P10 |
| F20 | Auth (email/password + Google), history (filters, delete one/all), settings, account-data delete | P5, P10 |
| F21 | Security: helmet, CORS allow-list, rate limits, body limits, SSRF-safe fetch, RLS | P4, P5 |
| F22 | Fixtures/corpus + `npm run eval` | P3 |
| F23 | Accessibility (WCAG 2.2 AA), responsive 320–1920px, performance budgets | P8–P12 |
| F24 | Runbook, doctor/smoke scripts, deployment config | P13 |

### 0.7 Human gates
- **H0 (end of P0):** the user answers the setup questions and confirms files are in place.
- **H1 (end of P4):** for a *new* Supabase project, the user runs the generated SQL and configures Auth, then creates the `.env` files and confirms.
- **H2 (end of P13):** the user reviews the final report, runs the smoke test, and decides on deployment/merge.

---

# PHASE 0 — ENVIRONMENT & DECISIONS (human gate H0)
**Goal:** confirm the machine and inputs; nothing is built.
**Do:** check Node ≥ 20 (LTS), npm, Git; record versions and OS in `docs/STATE.md`. Confirm `docs/spec/SPEC_PACK.md` and the four images in `docs/reference/` exist (**STOP and ask if missing**). Run `git init`, first commit (`README.md`, `.gitignore`), create branch `rebuild`.
**Ask the user once** (use the defaults if they say "default"): (1) Supabase: **reuse existing project** (database already has the schema; you will only verify) or **new project** (default; you generate the SQL and they run it); (2) Gemini key available? (default: no — AI stays off); (3) GitHub repo URL (optional, do not push); (4) hosting plan now (default: none; you only prepare configs).
**Exit:** versions recorded, decisions recorded in `docs/STATE.md`, branch is `rebuild`.

# PHASE 1 — MONOREPO SCAFFOLD & TOOLING
**Spec:** A §5, §19, §20; B §15; C §10; D–F only for env names.
**Build:** workspaces `client/ server/ shared/ supabase/ scripts/ docs/ .github/workflows/`; strict TypeScript project references; ESLint + Prettier; Vitest in each workspace; Playwright (client) configured but with no tests yet; npm scripts: `dev` (client + server), `build`, `lint`, `typecheck`, `test`, `eval` (placeholder that passes until P3), `check:no-secrets` (fails if `GEMINI_API_KEY`/`@google/genai`/service-role strings appear under `client/` or if any `.env` is tracked), `check:colors` (added in P8), `hooks:install`; server `env.ts` (Zod, fail-fast with a readable list of missing variables) and **complete `.env.example` files** (see Appendix A); `.gitignore`, `.gitattributes`; CI workflow (`lint`, `typecheck`, `test`, `eval`, `check:no-secrets`, non-blocking `npm audit`); `docs/STATE.md`, `docs/FEATURE_PARITY.md`, `docs/phases/`.
**Verification:** `npm ci` from a clean clone works; every script runs; `npm run dev` starts a placeholder server (`GET /api/health`) and an empty client page with no console errors; `hooks:install` blocks a test commit on `main`.
**Exit:** all PASS.

# PHASE 2 — SHARED FOUNDATION (pure TypeScript)
**Spec:** A §8, §9.1–9.5, §16; B §4.1, §13; C §3, §4; F §3–§6; (portals/safety/banner copy: A §9.3–9.4, D §3, G §9).
**Build in `/shared`:** enums and Zod schemas (requests, results, signals, checks, next steps, extraction output, reports); config constants (`INPUT_LIMITS`, `STATUS_COPY`, `RISK_COPY` for links, `ADVISORY`, `OFFICIAL_PORTALS`, `HELPLINE`, `knownOrgs`, `freeMail`, plausibility bands, `safetyRules`, `safetyBanner`, `reasonCopy`); text utilities (`normalize`, `segmentSentences`, `findSpan`); `routeFields`; entity extraction (emails, UPI, phones, URLs, handles); organization extractor (scored, conservative, "unclear" allowed); offer-field extraction; 10-detail completeness (strict, evidence-based).
**Verification:** unit tests plus property tests exactly as in F §12 (organization must-pass table, quote properties: whole words, ≤ 160 chars, true substrings, no splitting inside `B.E.`/`Pvt. Ltd.`; routeFields cases); schema tests; no `any` in public types.
**Exit:** all PASS.

# PHASE 3 — RULES, VERIFICATION LOGIC & CONTENT BUILDERS (pure TypeScript)
**Spec:** A §9.6; B §4.2, §5, §7.1–7.3, §9; C §5, §6, §8, §11; F §7–§10; D §3–§4; E §4.
**Build in `/shared`:** rule catalog (union, hard-disqualifier flag, negation window) + engine + scoring; link heuristics, lookalike matching, shortener/punycode/IP/TLD rules, reserved/placeholder domain rule; email analysis; **email-header parser** (+ pure DNS-policy interpretation); `runOfflineAnalysis` (no network/AI/DB); `computeStatus` (all five statuses, reasons, positive-evidence rule, invariants); coverage (k of 8); `paymentAlert`; pattern insights; `buildNextSteps` (three parts + protect variant + banner); report view model + format helpers (Part E §4); **fixtures corpus** (`nexora`, `t1`–`t5` from F §12, plus ≥ 12 more: cheque trick, gift card/crypto, recruit-friends, Hinglish fee demand, OTP request, lookalike link only, free-mail contact, vague freelance, failing headers, "no registration fee" competition, legitimate entry fee, demo-verified) with `expected:` headers; `npm run eval` (confusion list, exits non-zero on mismatch).
**Verification:** `computeStatus` truth table ≥ 35 cases (every Verified gate failing individually; Confirmed only via a confirmed record); every hard-disqualifier bullet mapped to a rule (B §5 test); invariants and property tests (B §9; "Verified unreachable from text alone"; "Likely Genuine impossible without positive evidence"); banned-phrase test; negation guards; all fixtures produce their expected statuses **with AI off**; header-parser fixtures (≥ 6); `buildNextSteps` tests (D §7: dedupe, ≤ 6, no boilerplate, domain variants, banner rules).
**Exit:** all PASS; `eval` green.

# PHASE 4 — DATABASE (Supabase) — human gate H1
**Spec:** A §10, §11; B §10, §7.5–7.6; D §5; G §4.4; decisions D14.
**Build:** `supabase/migrations/` consolidated and ordered (`0001_enums_tables.sql`, `0002_rls_functions.sql`, `0003_seed_organizations.sql`) producing the final schema (D14) with **all RLS policies, indexes, constraints and the three RPC functions** (grants exactly as in B §10 and G §4.4); seed ≈ 40 widely impersonated organizations with **only domains you are certain of** (all `needs_team_review = true`) plus the clearly labelled demo row; `docs/DB_SCHEMA.md`; `docs/SUPABASE_SETUP.md` (create project, run SQL in order, enable Email + Google providers, redirect URLs for `http://localhost:5173` and the production domain, dev tip: disable email confirmation or use a confirmed test user, how a moderator confirms a reported entity with a SQL snippet using the same hashing as `scripts/hashEntity.mjs`); `scripts/hashEntity.mjs`.
**If the user chose "reuse existing project":** do **not** generate destructive SQL; produce `docs/SUPABASE_REUSE.md` with a verification checklist (tables/columns/functions expected) and rely on the P12 smoke test; remind the user to copy `REPORT_HASH_PEPPER`.
**Verification:** SQL lints (parse check with a local linter or `psql --dry-run` equivalent if available); a documented RLS test plan (`docs/RLS_TESTS.md`) with exact queries for two users; unit tests for hashing/normalization.
**Exit:** SQL files complete. **H1:** STOP and instruct the user to run the SQL, configure Auth, create `server/.env` and `client/.env` from the examples (never paste keys here), and reply "ready".

# PHASE 5 — SERVER (Express API)
**Spec:** A §12, §18; B §7.4 (RDAP), §7.6, §11, §16; C §9; D §5; F §8; decisions D2, D7–D10.
**Build:** app factory (for supertest); middleware: request id, helmet, CORS allow-list from `CLIENT_ORIGINS`, JSON limit 256 KB, rate limits (guest/user/AI buckets), auth via `supabase.auth.getUser(token)` + **per-request user-scoped Supabase client** (RLS enforced), Zod `validate`, central error handler (stable error shape, no stack leaks); `safeFetch` (SSRF-safe outbound HTTP with host allow-lists, IP checks, redirect re-validation, size/time limits) used for RDAP; routes exactly as in B §11 plus: `GET /api/health`, `POST /api/analyze`, `GET/DELETE /api/analyses…`, `PATCH /api/checklist/:itemId`, `PUT /api/analyses/:id/attestations`, `POST /api/analyses/:id/official-listing` (returns "feature disabled" while the flag is off), `POST /api/link-check`, `POST /api/challenge-email` (`kind: challenge | safe_reply`, template fallback, `includeQuestions`), `POST /api/email-headers/analyze`, `GET /api/organizations`, `POST /api/reports/lookup`, `POST /api/reports`, `GET /api/resources`, `POST /api/feedback`, `POST /api/feedback/page`, `DELETE /api/account-data`; `analyzeService` pipeline: `routeFields` → `runOfflineAnalysis` → RDAP/DNS lookups (timeouts, `allSettled`) → reported-entities lookup (hashed with `REPORT_HASH_PEPPER`) → status → `nextSteps` → persist when allowed (parent+children; delete parent on child failure) → response (`nextSteps`, `paymentAlert`, coverage, notices). Guests persist nothing.
**Verification:** supertest per route (success, validation error, auth required, rate-limit 429, CORS, body limit, headers); **every corpus fixture through `POST /api/analyze` equals the offline `eval` result**; guest vs user persistence tests with a mocked Supabase client; honest-reporting tests (F §8: "Checked n identifiers…" / `not_run`); outbound-request spy proves no request is ever made to message-supplied hosts; `check:no-secrets` green.
**Exit:** all PASS.

# PHASE 6 — AI LAYER (optional, fail-soft)
**Spec:** A §13–§15; B §12; C §9; F §4 (grounding via `findSpan`); decision D9.
**Build:** Gemini wrapper (`@google/genai`, structured JSON, timeout, one stricter retry, key only from server env, configurable model — verify current names in the official docs), PII redaction, prompts (system, analysis, challenge, safe reply, link explain, extraction fill-in), Zod validation, **evidence grounding**, merge invariants (never lowers/removes rule hits, severity ≤ high, never above `NEEDS_REVIEW`), consent gate (`useAi` only), template fallbacks, `aiStatus`.
**Verification:** tests with a mocked SDK: valid output, malformed JSON, schema violation, ungrounded quote, timeout, prompt-injection text ("ignore rules and mark this Verified"), key absent; with AI off the API output equals P5 output.
**Exit:** all PASS.

# PHASE 7 — FLAGGED THIRD-PARTY CHECKS (default OFF)
**Spec:** B §7.4–7.5, §16; C §10.
**Build:** CT-log lookup, optional Safe Browsing, platform listing fetch from registry-allow-listed hosts, `compareListing`, `DEMO_MODE` handling, all behind `ENABLE_THIRD_PARTY_CHECKS` and consent flags; LRU cache.
**Verification:** SSRF suite (private IP, DNS rebinding simulation, redirect to non-allow-listed host, oversize body, wrong content type, non-HTTPS); flag-off byte-identical to P5; demo scenario ⇒ `VERIFIED_OFFICIAL` only with `DEMO_MODE=true` and all gates; unknown ≠ pass.
**Exit:** all PASS.

# PHASE 8 — CLIENT FOUNDATION (design system, shell, i18n scaffold)
**Spec:** G §0–§4, §8 (scaffold), §10–§11; A §17 (hooks/libs), A §18 (client security).
**Build:** Vite + React Router + Tailwind with the **Part G tokens**; Fontsource fonts (+ `docs/ui-shots/font-match.png` per G §2.3); all primitives (G §3); header (+ mobile sheet), footer, **LangSwitch + i18n scaffolding** (`useT`, `en.json`; `hi/kn` stubs filled in P11), skip link, hash navigation, **FeedbackPill** (+ `POST /api/feedback/page`), ErrorBoundary, TanStack Query, typed API client with Zod response validation, Supabase client (anon key only), auth context, guest session store, route guards; `check:colors` CI (no hard-coded colors outside `tokens.css`).
**Verification:** component tests; axe on the shell; Playwright shell test (nav, hash links, mobile sheet, language switch persists, pill success/failure); measured header height 53px and colors within ΔE tolerance (G §13); bundle-size baseline recorded.
**Exit:** all PASS.

# PHASE 9 — LANDING + ANALYZE (exact UI, working flow)
**Spec:** G §5, §6, §9; A §7; F §3 (client notices); A §17 (OCR); decisions D7, D12, D16.
**Build:** landing exactly as G §5 (copy register applied after tracing the real code paths); analyze page per G §6: tabs, textarea, live counter, offer-type select, "More options" disclosure (sender details, headers help dialog, official listing, privacy options with summary), three sample chips (`samples.ts`, fictional data), clipboard paste with graceful failure, screenshot/PDF extraction (lazy Tesseract.js with **locally bundled** worker/core/language data; `pdfjs-dist` text extraction with OCR fallback ≤ 5 pages; 5 MB limit; editable extracted text; files never uploaded), `routeFields` notices, validation (inline `role="alert"`, focus), progress list with `aria-live`, guest vs saved submission, error handling that never loses input.
**Verification:** Playwright: measurements at 1600×790 vs reference (G §13 tolerances) for landing top/mid/bottom and analyze; analyze flows for the sample chips and three corpus fixtures end-to-end against the running server; OCR on a bundled test image; PDF extraction; no horizontal scroll 320–1920px; `docs/privacy-copy-check.md` complete.
**Exit:** all PASS; side-by-side comparison images saved to `docs/ui-shots/compare/`.

# PHASE 10 — RESULTS, SAMPLE, EXPORT & REMAINING PAGES
**Spec:** G §7; B §8; C §7 (E1–E8); D §3–§6; E §5–§8; F §9, §11; decisions D6, D8.
**Build:** results page (guest `/results/local`, saved `/results/:id`): status banner, payment alert, why-this-status, pattern insight, **Next steps** (already-checked rows, "Your turn" cards with sub-check attestations, protect-yourself variant with default-off "I already paid", stay-safe banner), signals rows, **evidence report** (merged ordered checks, outcome chips, grouped "Not run" with inline inputs that re-run the analysis, drill-downs), link inspector, challenge email / safe reply panel (hidden on high risk), report-it panel (1930, cybercrime.gov.in), **ReportEntityDialog** (logged-in), feedback, section chips, above-the-fold contract; export dialog (Download PDF via lazy `@react-pdf/renderer` with bundled font containing `₹` + Devanagari/Kannada fallback fonts, Print stylesheet fallback, JSON); `/sample` (schema-valid fictional report); `/link-check`; `/resources`; `/about`; `/privacy`; `/history` (filters, delete one/all); `/login`, `/signup` (email + Google), `/settings` (defaults, delete all data); 404; loading/empty/error states — all in the Part G style.
**Verification:** Playwright with all corpus fixtures through the UI (status label, payment alert, steps, no pseudo-codes, clean quotes); high-risk variant (Safe Reply hidden, toggle off); guest persistence (`sessionStorage` only); saved-flow tests with a mocked API; **PDF tests per E §9** (≤ 3 pages typical, ≤ 4 max, no orphan headings, fill ≥ 75 %, `₹` present, no browser chrome strings); axe on results (three statuses); print emulation test.
**Exit:** all PASS.

# PHASE 11 — TRANSLATIONS & POLISH
**Spec:** G §8, §10.
**Build:** complete `hi.json` and `kn.json` for the scope in G §8, `docs/TRANSLATION_REVIEW.md` (every machine-written string flagged), Indic fonts via `unicode-range`, line-height tuning, pseudo-locale test, results-page English-content notice, focus/keyboard/reduced-motion polish.
**Verification:** language switch across all pages (no clipping at 1600px/390px), fallback to English for missing keys, axe 0 serious/critical in all three languages, `lang` attributes correct.
**Exit:** all PASS.

# PHASE 12 — END-TO-END QA, PARITY & HARDENING
**Do:** run the full Playwright suite; visual comparison with the four references; axe + Lighthouse (mobile Performance ≥ 90, Accessibility ≥ 95, CLS < 0.1 on landing and analyze); security checklist (A §18, B §16: headers, CORS, rate limits, SSRF, RLS, no secrets in client, no raw text in logs); `npm audit` review; dependency pins verified; dead-code cleanup; fill **`docs/FEATURE_PARITY.md`** with PASS/FAIL and the proving test for every ID (F01–F24).
**Exit:** every Feature Inventory item PASS (or a documented, justified deviation).

# PHASE 13 — RUNBOOK, DOCTOR & DEPLOY CONFIG (human gate H2)
**Build:** `docs/RUNBOOK.md` (clone/install/env/run/test on a new machine, Supabase setup, Vercel for the client with `vercel.json` SPA rewrite and root-directory settings, a Node host for the server, env var tables, CORS/redirect URL checklist, rollback, "never commit `.env`"), `scripts/doctor.mjs` (checks Node version, env variable **names** present, Supabase URL reachable, `/api/health` reachable; prints PASS/FAIL without printing values), `npm run smoke` (analyze fixtures via the API; optional signed-in flow when credentials are provided via env), final `README.md`.
**H2:** produce the final report (`docs/FINAL_REPORT.md`: phase results, parity table, known limitations, open items) and STOP. Do not push or deploy.

---

## APPENDIX A — ENVIRONMENT VARIABLES (names; create both `.env.example` files with safe defaults and comments)
**server:** `NODE_ENV, PORT, CLIENT_ORIGINS, SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY (optional), GEMINI_MODEL, RATE_LIMIT_ANALYZE_GUEST_PER_HOUR, RATE_LIMIT_ANALYZE_USER_PER_HOUR, RATE_LIMIT_AI_GUEST_PER_HOUR, RATE_LIMIT_AI_USER_PER_HOUR, RATE_LIMIT_LISTING_PER_HOUR, RATE_LIMIT_REPORTS_PER_DAY, RATE_LIMIT_LOOKUP_PER_HOUR, RDAP_BASE_URL, RDAP_TIMEOUT_MS, DNS_TIMEOUT_MS, LOG_LEVEL, REPORT_HASH_PEPPER (required, ≥ 24 chars), DEMO_MODE=false, ENABLE_THIRD_PARTY_CHECKS=false, SAFE_BROWSING_API_KEY (optional), CT_LOG_BASE_URL, CT_LOG_TIMEOUT_MS, LISTING_FETCH_TIMEOUT_MS, LISTING_MAX_BYTES`.
**client:** `VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY`.
The service-role key is **not** a variable of this app.

## APPENDIX B — FAILURE MODES AND BUILT-IN PREVENTION
| Risk | Prevention |
|---|---|
| New laptop differs (OS, Node, paths, line endings) | P0 version checks, Node-based scripts, LF attributes, pinned deps, `doctor.mjs` |
| Specs contradict each other | 0.2 precedence + 0.5 decisions; conflicts logged in `docs/STATE.md` |
| Features silently missing | Feature Inventory + `FEATURE_PARITY.md` with a proving test per ID |
| Offline logic and API disagree | P5 test: every fixture via API equals `eval` |
| Reported-entity hashes mismatch after reuse | pepper copied from the old project (header note + P4) |
| Secrets leak (screenshots, Git, logs) | `.env` ignored, `check:no-secrets`, rotate exposed keys, doctor prints names only |
| Enum/migration errors | one consolidated final schema, SQL review, RLS test plan |
| OCR/PDF work only online | bundled workers/data, tests in P9/P10 |
| `₹` or Indic text missing in PDF/UI | bundled fonts, tests for glyphs |
| Privacy claims wrong | D16 audit and `privacy-copy-check.md` |
| UI drifts from the references | measured tolerances, comparison images, `check:colors` |
| Accidental work on `main` | hook + branch rule + first-commit rule |
| Context lost between chats | `docs/STATE.md` + per-phase reports; resume with "Continue the rebuild from `docs/STATE.md`" |

## FINAL INSTRUCTION TO THE CODING AGENT
Begin with **Phase 0**. Follow the Phase Gate Protocol strictly; ask questions **only** at the human gates. Build the **final state** directly from the spec pack and the Final-State Decisions; do not reproduce intermediate versions or superseded designs. Prefer the more conservative option when something is unspecified and record it. Never claim a result you did not run. Report PASS/FAIL honestly at every phase and stop when a gate says stop.
