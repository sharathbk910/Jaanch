# JAANCH – Requirements Traceability Matrix

This matrix maps every requirement, architecture decision, and feature from `docs/SPEC_ORIGINAL.md` and `docs/SPEC_ADDENDUM.md` to its designated implementation phase and current status.

---

## 1. Feature Inventory (F01 – F24)

| ID | Requirement / Feature | Spec Source | Implementation Phase | Current Status |
|---|---|---|---|---|
| **F01** | Landing page (hero + official portals card, facts band, how-it-works, guidelines card, helpline card, footer) | SPEC_ORIGINAL 0.6 | Phase 9 | Pending |
| **F02** | Header/nav/mobile sheet/skip link/footer/floating feedback pill, hash navigation | SPEC_ORIGINAL 0.6 | Phase 9 | Pending |
| **F03** | Language switch EN / HI / KN (header + footer, persisted, `<html lang>`) | SPEC_ORIGINAL 0.6 | Phase 8 | Pending |
| **F04** | Analyze page: paste text, upload screenshot/PDF with in-browser OCR, sample chips, offer type, More options | SPEC_ORIGINAL 0.6 | Phase 10 | Pending |
| **F05** | Input routing (misplaced email/URL/phone/UPI) with visible notices | SPEC_ORIGINAL 0.6 | Phase 4 | Pending |
| **F06** | Extraction: entities, organization, role, 10-detail completeness with clean whole-word quotes | SPEC_ORIGINAL 0.6 | Phase 4 | Pending |
| **F07** | Deterministic rule engine (full catalog, negation guards, hard disqualifiers) | SPEC_ORIGINAL 0.6 | Phase 3 | Pending |
| **F08** | Sender email analysis, header parsing (SPF/DKIM/DMARC), DNS policy lookup | SPEC_ORIGINAL 0.6 | Phase 7 | Pending |
| **F09** | Lookalike/impersonation detection, link inspector, reserved-domain note | SPEC_ORIGINAL 0.6 | Phase 3, Phase 7 | Pending |
| **F10** | Organization registry search/match; reported-entities lookup & reporting (hashed) | SPEC_ORIGINAL 0.6 | Phase 6, Phase 7 | Pending |
| **F11** | Status engine (5 statuses, reasons), paymentAlert, coverage k-of-8, pattern insights | SPEC_ORIGINAL 0.6 | Phase 5 | Pending |
| **F12** | RDAP domain age; (flagged) CT-log, Safe Browsing, official-listing fetch/compare | SPEC_ORIGINAL 0.6 | Phase 7 | Pending |
| **F13** | Optional Gemini context, challenge email, safe reply, link explanation (with fallbacks) | SPEC_ORIGINAL 0.6 | Phase 7 | Pending |
| **F14** | Results page (status banner, payment alert, why, 3-part next steps, signals, evidence report, link inspector) | SPEC_ORIGINAL 0.6 | Phase 10 | Pending |
| **F15** | Attestations + checklist persistence (saved) / session state (guest) | SPEC_ORIGINAL 0.6 | Phase 6, Phase 10 | Pending |
| **F16** | Export: PDF (react-pdf, ≤ 4 pages, ₹ renders, ≥ 75% fill), Print, JSON | SPEC_ORIGINAL 0.6 | Phase 10 | Pending |
| **F17** | `/sample` fictional report walkthrough | SPEC_ORIGINAL 0.6 | Phase 10 | Pending |
| **F18** | Dedicated link checker page (`/link-check`) | SPEC_ORIGINAL 0.6 | Phase 10 | Pending |
| **F19** | Verification Guide (`/resources`), About, Privacy pages | SPEC_ORIGINAL 0.6 | Phase 9, Phase 10 | Pending |
| **F20** | Auth (email/password + Google), history (filters, delete one/all), settings, account-data delete | SPEC_ORIGINAL 0.6 | Phase 6, Phase 10 | Pending |
| **F21** | Security: helmet, CORS allowlist, rate limits, body limits, SSRF safeFetch, RLS | SPEC_ORIGINAL 0.6 | Phase 6, Phase 7 | Pending |
| **F22** | Fixtures/corpus regression suite + `npm run eval` | SPEC_ORIGINAL 0.6 | Phase 3 | Pending |
| **F23** | Accessibility (WCAG 2.2 AA), responsive 360–1920px, performance budgets | SPEC_ORIGINAL 0.6 | Phase 8–11 | Pending |
| **F24** | Runbook, doctor/smoke scripts, deployment configuration | SPEC_ORIGINAL 0.6 | Phase 11 | Pending |

---

## 2. Final-State Architectural Decisions (D1 – D16)

| Decision | Summary | Phase | Status |
|---|---|---|---|
| **D1** | Single clean-room repo; typed workspaces (`client`, `server`, `shared`) | Phase 1 | **DONE** |
| **D2** | 5-level status model (`VERIFIED_OFFICIAL` to `CONFIRMED_SCAM`); link checks keep 3-level | Phase 2, Phase 5 | Pending |
| **D3** | Full rule catalog with negation guards; k-of-8 coverage metric; `none_found` outcome | Phase 3, Phase 5 | Pending |
| **D4** | 3-part next steps; clean PDF evidence report without orphan headings | Phase 5, Phase 10 | Pending |
| **D5** | Light theme editorial design tokens; no dark mode gradients; designated routes | Phase 8, Phase 9 | Pending |
| **D6** | Single-column results layout; mobile section chips; collapsed evidence on mobile | Phase 10 | Pending |
| **D7** | Guest analysis held in `sessionStorage`; zero server persistence for unauthenticated | Phase 7, Phase 10 | Pending |
| **D8** | Safe reply hidden for High Risk / Confirmed Scam; "I already paid" defaults OFF | Phase 5, Phase 10 | Pending |
| **D9** | AI strictly optional server-side; schema-grounded with `findSpan`; fail soft | Phase 7 | Pending |
| **D10** | Third-party checks disabled by default (`ENABLE_THIRD_PARTY_CHECKS=false`); RDAP on | Phase 7 | Pending |
| **D11** | No ML layer; no Supabase service-role key in request handling | Phase 1, Phase 6 | **DONE** |
| **D12** | Min text length enforced (`INPUT_LIMITS.textMin`); UI shows real constants | Phase 2, Phase 10 | Pending |
| **D13** | Multilingual UI chrome in EN / HI / KN | Phase 8 | Pending |
| **D14** | Consolidated database migrations directly creating final schema with RLS | Phase 6 | Pending |
| **D15** | Self-hosted local fonts (Noto Sans Devanagari/Kannada); zero CDNs | Phase 8 | Pending |
| **D16** | Privacy copy audit against code reality (`docs/privacy-copy-check.md`) | Phase 11 | Pending |

---

## 3. Core Acceptance Criteria (CRIT-01 – CRIT-10)

| ID | Criterion | Verification Harness | Status |
|---|---|---|---|
| **CRIT-01** | Hero Section & Official Portal Notice | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-02** | Sticky Navigation with Zero Overlap | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-03** | Language Switch (EN / HI / KN) | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-04** | Three Test Scenarios (Sample Chips) | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-05** | 25-Character Minimum Input Validation | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-06** | Results Layout & Information Architecture | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-07** | PDF Export ≤ 4 Pages with ≥ 75% Page Fill | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-08** | Design Token Compliance (No Hardcoded Colors) | `check-no-hardcoded-colors.mjs` | **PASS** |
| **CRIT-09** | Responsive Design (from 360px) | `test-acceptance.mjs` | NOT_YET_IMPLEMENTED |
| **CRIT-10** | Bundle Security (No Secrets in Bundle) | `check-no-secrets.cjs` | **PASS** |
