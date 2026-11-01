# JAANCH – Requirements Traceability Matrix

> [!NOTE]
> `docs/SPEC_ORIGINAL.md` is **VERIFIED** (read-only primary specification).
> This matrix tracks all requirements, authoritative decisions (D1–D16), feature inventory items (F01–F24), and phase deliverables from `docs/SPEC_ORIGINAL.md`, reconciled with the approved roadmap in `docs/SPEC_ADDENDUM.md`.

---

## 1. Operating Contract & Safety Rails (Section 0)

| ID / Section | Requirement Summary | Original Spec Phase | Approved Addendum Phase | Status |
|---|---|---|---|---|
| **0.1** | Mission: Complete Jaanch web application, working one phase at a time | All | All | Active |
| **0.2** | Precedence rules: Later parts override earlier, conservative defaults | All | All | Active |
| **0.3.1** | Branching rule: Work on `rebuild` branch | Phase 0 | Phase 1 | Reconciled (on main) |
| **0.3.2** | Local commit only: No unauthorized push, merge, or remote changes | All | All | Active |
| **0.3.3** | Zero secret commits: `.env` ignored, `.env.example` committed, no text in logs | Phase 1 | Phase 1 | **DONE** |
| **0.3.4** | Branch guard / hook check (`npm run hooks:install`) | Phase 1 | Phase 1 | **DONE** |
| **0.3.5** | Cross-platform compatibility: Node scripts, LF attributes | Phase 1 | Phase 1 | **DONE** |
| **0.3.6** | Pinned dependencies: Exact stable versions, verify compatibility | Phase 1 | Phase 1 | **DONE** |
| **0.4.1** | Record phase-start commit | All | All | Active |
| **0.4.2** | Test-first implementation: Tests alongside code | All | All | Active |
| **0.4.3** | Cumulative checks: lint, typecheck, test green at every phase end | All | All | Active |
| **0.4.4** | Phase reports in `docs/phases/phase-N-report.md` | All | All | Active |
| **0.4.5** | State tracking in `docs/STATE.md` with conventional commits | All | All | Active |
| **0.4.6** | Rollback on critical failure (`git reset --hard`) | All | All | Active |
| **0.4.7** | Zero stubs, TODOs, or placeholder implementations | All | All | Active |
| **0.4.8** | Stop at human gates (H0, H1, H2) | Phase 0, 4, 13 | Phase 1, 4, 11 | Active |
| **0.7.H0** | Human Gate H0: Confirm machine, Node >= 20, Git | Phase 0 | Phase 1 | **DONE** |
| **0.7.H1** | Human Gate H1: Database setup & user auth verification | Phase 4 | Phase 4 | **REACHED** (SQL files generated, standing by for user setup) |
| **0.7.H2** | Human Gate H2: Review final report, smoke tests, deploy readiness | Phase 13 | Phase 11 | Pending |

---

## 2. Authoritative Final-State Decisions (D1 – D16)

| Decision | Summary | Original Spec Phase | Approved Addendum Phase | Status |
|---|---|---|---|---|
| **D1** | Stack: TypeScript, workspaces `client`, `server`, `shared`. Vitest, supertest, Playwright, axe | P1, P5, P8 | Phase 1, 3, 5 | **DONE** |
| **D2** | Status model (reconciled in Addendum: 4 verdicts `LIKELY_GENUINE, NEEDS_REVIEW, HIGH_CONCERN, CONFIRMED_SCAM`) | P3 | Phase 2 | **DONE** |
| **D3** | Rule catalog: Negation guards, hard disqualifiers, coverage metric, `none_found` outcome | P3 | Phase 2 | **DONE** |
| **D4** | Next steps: 3 parts, max 6 manual steps, PDF export (≤ 4 pages, ≥ 75% fill) | P3, P10 | Phase 2, Phase 6C | **DONE** (Implemented in Phase 6C) |
| **D5** | UI: Light theme editorial tokens, no dark mode, specified routes | P8 | Phase 5, Phase 6 | **DONE** (Tokens, routing, accessible layout) |
| **D6** | Results layout: Single column, mobile section chips, collapsed evidence on mobile | P10 | Phase 6C | **DONE** (Implemented in Phase 6C) |
| **D7** | Guest flow: `sessionStorage` only, zero server persistence for unauthenticated | P5, P9 | Phase 3, Phase 6B | **DONE** (Session storage guest flow in Phase 6B/6C) |
| **D8** | Safety rules: Safe Reply hidden on High Concern/Scam, "I already paid" defaults OFF | P3, P10 | Phase 2, Phase 6C | **DONE** (Implemented in Phase 6C) |
| **D9** | Optional AI: Gemini schema-grounded with `findSpan`, fail-soft with `aiStatus` | P6 | Phase 8 | Pending |
| **D10** | Third-party checks: Flagged default OFF, RDAP on, registry `needs_team_review = true` | P7 | Phase 3 | Pending |
| **D11** | Moderation: No ML layer, no service-role key in requests, moderator SQL/CLI confirmation | P4 | Phase 4, Phase 7 | **DONE** |
| **D12** | Input validation: Minimum text length (`INPUT_LIMITS.textMin = 20`/25) enforced | P2, P9 | Phase 2, Phase 6B | **DONE** (Schemas in P2, UI enforced in P6B) |
| **D13** | Multilingual: EN / HI / KN chrome translations, Indic font fallbacks | P8, P11 | Phase 5, Phase 6 | **DONE** (Complete translations in EN/HI/KN) |
| **D14** | Database: Consolidated final schema migration with RLS on all tables | P4 | Phase 4 | **DONE** |
| **D15** | Fonts & assets: Self-hosted fonts, zero external CDNs, locally bundled workers | P8, P9 | Phase 5, Phase 6 | **DONE** (Self-hosted fallbacks & bundled pdf.worker) |
| **D16** | Privacy accuracy: Audit all privacy claims against code | P9, P12 | Phase 10 | Pending |

---

## 3. Feature Inventory (F01 – F24)

| ID | Feature Description | Original Spec Phase | Approved Addendum Phase | Status |
|---|---|---|---|---|
| **F01** | Landing page (hero + official portals card, facts band, how-it-works, guidelines card, helpline, footer) | P9 | Phase 6A | **DONE** |
| **F02** | Header/nav/mobile sheet/skip link/footer/floating feedback pill, hash navigation | P8 | Phase 5, Phase 6A | **DONE** |
| **F03** | Language switch EN / HI / KN (persisted, `<html lang>`) | P8, P11 | Phase 5, Phase 6 | **DONE** |
| **F04** | Analyze page: paste text, file upload OCR/PDF extraction, sample chips, More options | P9 | Phase 6B | **DONE** |
| **F05** | Input routing (misplaced email/URL/phone/UPI) with visible notices | P2, P9 | Phase 2, Phase 6B | **DONE** |
| **F06** | Extraction: entities, organization, role, 10-detail completeness with clean whole-word quotes | P2 | Phase 2 | **DONE** |
| **F07** | Rule engine (catalog, negation guards, hard disqualifiers) | P3 | Phase 2 | **DONE** |
| **F08** | Sender email analysis, header parsing (SPF/DKIM/DMARC), DNS policy lookup | P3, P5 | Phase 2, Phase 3 | Pending (Email in P2, DNS in P3) |
| **F09** | Lookalike/impersonation detection, link inspector, reserved-domain note | P3, P5, P10 | Phase 2, Phase 3 | **DONE** |
| **F10** | Organization registry match; reported-entities lookup & reporting (peppered hash) | P4, P5, P10 | Phase 4, Phase 7 | Pending |
| **F11** | Status engine (verdicts, reasons), paymentAlert, coverage k-of-8, pattern insights | P3 | Phase 2 | **DONE** |
| **F12** | RDAP domain age; (flagged) CT-log, Safe Browsing, official listing fetch/compare | P5, P7 | Phase 3 | Pending |
| **F13** | Optional Gemini context, challenge email, safe reply, link explanation (with fallbacks) | P5, P6 | Phase 8 | Pending |
| **F14** | Results page (verdict banner, payment alert, why, next steps, signals, evidence report) | P10 | Phase 6C | **DONE** |
| **F15** | Attestations + checklist persistence (saved) / session state (guest) | P5, P10 | Phase 4, Phase 6C | **DONE** |
| **F16** | Export: PDF (react-pdf, ≤ 4 pages, ₹ renders, ≥ 75% fill), Print, JSON | P10 | Phase 6C | **DONE** |
| **F17** | `/sample` fictional report walkthrough | P10 | Phase 6C | **DONE** |
| **F18** | Dedicated link checker page (`/link-check`) | P10 | Phase 6C | Pending |
| **F19** | Verification Guide (`/resources`), About, Privacy pages | P10 | Phase 6A, 6C | **DONE** |
| **F20** | Auth (email/password + Google), history (filters, delete one/all), settings, account deletion | P5, P10 | Phase 4, Phase 6D | **DONE** |
| **F21** | Security: helmet, CORS allowlist, rate limits, body limits, SSRF safeFetch, RLS | P4, P5 | Phase 3, Phase 4 | **DONE** |
| **F22** | Fixtures/corpus regression suite + `npm run eval` | P3 | Phase 2 | **DONE** (25/25 100%) |
| **F23** | Accessibility (WCAG 2.2 AA), responsive 360–1920px, performance budgets | P8–P12 | Phase 10 | In Progress (WCAG AA & 360px verified) |
| **F24** | Runbook, doctor/smoke scripts, deployment configuration | P13 | Phase 11 | Pending |

---

## 4. Phase Milestones & Mappings

| Original Spec Phase | Deliverables in Spec | Reconciled Addendum Phase | Addendum Scope | Status |
|---|---|---|---|---|
| **Phase 0** | Environment, versions, setup questions (H0) | Phase 1 | Workspace & tooling setup | **DONE** |
| **Phase 1** | Monorepo scaffold, scripts, linters, env templates | Phase 1 | Workspace & tooling setup | **DONE** |
| **Phase 2** | Shared foundation: schemas, config, extraction | Phase 2 | Shared core (schemas, 8 rules, redaction, extraction, lookalike, status, 25 fixtures) | **DONE** |
| **Phase 3** | Rules, verification logic, eval fixtures | Phase 2 | Shared core | **DONE** (Consolidated in Phase 2) |
| **Phase 4** | Supabase database, RLS, seeds, hashing (H1) | Phase 4 | Database and auth | **DONE** (H1 reached) |
| **Phase 5** | Express server API, safeFetch, analyzeService | Phase 3 | Server API | Pending |
| **Phase 6** | AI layer (Gemini, grounding, fallbacks) | Phase 8 | AI / ML |
| **Phase 7** | Flagged third-party checks (CT-log, Safe Browsing) | Phase 3 (flagged) | Server API |
| **Phase 8** | Client foundation (tokens, shell, i18n, feedback) | Phase 5 | Client foundation |
| **Phase 9** | Landing + Analyze pages, OCR/PDF extraction | Phase 6A, 6B | UI – Landing, UI – Analyzer |
| **Phase 10** | Results page, PDF export, sample, remaining pages | Phase 6C, 6D | UI – Results/PDF, UI – Auth & History |
| **Phase 11** | Translations (HI/KN) & polish | Phase 6 | UI implementation |
| **Phase 12** | End-to-end QA, parity audit | Phase 10 | Verification & QA |
| **Phase 13** | Runbook, doctor script, deploy config (H2) | Phase 11 | Deployment |
| *(None)* | Dedicated WhatsApp sharing feature | Phase 9 | WhatsApp Integration (confirmed indicators only) |
| *(None)* | Threat intelligence moderation workflows | Phase 7 | Shared intelligence and moderation |

---

## 5. Environment & Risk Specifications

| Requirement Reference | Description | Status |
|---|---|---|
| **Appendix A.1** | Server environment variables template (`server/.env.example`) | **DONE** |
| **Appendix A.2** | Client environment variables template (`client/.env.example`) | **DONE** |
| **Appendix B.1–B.12**| Built-in prevention for 12 specified failure modes | Active across phases |
