# JAANCH – Specification Addendum & Architecture Decisions

This document records the approved project additions, locked architectural decisions, and approved extensions that supplement the core specifications.

---

## 1. Locked Stack & Chosen Layers

| Layer | Component & Configuration |
|---|---|
| **Database** | Supabase PostgreSQL with Row Level Security (RLS) on all tables |
| **Authentication** | Supabase Auth with Express JWT verification (stateless token verification using anon/public keys, never service-role in runtime requests) |
| **Search & Vectors** | `pg_trgm` (trigram fuzzy matching) and `pgvector` (for optional embeddings) |
| **Client Document Parsing** | In-browser `pdfjs-dist` (local text extraction in browser, zero student file uploads to server) |
| **Deployment Targets** | Vercel (Client SPA) + Render (Node.js Express Server) |

---

## 2. Presentation (PPT) Additions & UI Reconciliations

- **AICTE & Government Portal Links:** Prominent references to AICTE internship portal, NSP, UGC, and 1930 / cybercrime.gov.in.
- **"Unverified" Panel:** Dedicated explanation panel for offers where no scam indicators were triggered but positive verification is absent.
- **Three-Level Link Risk Labels:** Hyperlink assessments remain strictly separated with the 3-level model:
  - `HIGH RISK`
  - `NEEDS VERIFICATION`
  - `NO MAJOR WARNING SIGNS`
- **Precision / Recall / F1 Reporting:** Regression evaluations across corpus fixtures report Precision, Recall, and F1 metrics based on real runs (no invented numbers).

---

## 3. Approved Extensions (P2 – P5)

### Extension P2: Verdict Model & CONFIRMED_SCAM
The core offer analysis verdict model consists of four statuses:
1. `LIKELY_GENUINE`: Passed checks with corroborating evidence, no disqualifiers.
2. `NEEDS_REVIEW`: Incomplete details, missing verification, or subtle concerns.
3. `HIGH_CONCERN`: Hard disqualifiers present (e.g. upfront fee, credentials demand, urgency).
4. `CONFIRMED_SCAM`: Matched against an intelligence record confirmed fraudulent by a human moderator.

> [!IMPORTANT]
> `CONFIRMED_SCAM` can ONLY be produced via a moderator-confirmed intelligence record. It can **never** be generated from message text alone.

### Extension P3: Narrow Banned-Phrase Exemption
- Strict non-verdict policy prohibits ungrounded certainty claims (e.g. "guaranteed genuine", "100% safe", "definitely a scam").
- A narrow exemption is granted solely for confirmed-record status copy when a moderator has explicitly confirmed fraudulent records.
- All other UI, rule descriptions, and AI explanations remain bound by the banned-phrases restriction.

### Extension P4: Consent Flag `shareIndicators`
- The analysis payload accepts an optional `shareIndicators` boolean flag (defaulting to `false`).
- PII redaction remains mandatory and default across all payloads.
- If enabled, non-PII salted hashes of identified indicators may be shared with the community threat database.

### Extension P5: Domain Enum Extensions
The opportunity domain enum includes:
- `internship`
- `scholarship`
- `job`
- `freelance`
- `competition`
- `general_message`

### Font Fallbacks
- Noto Sans Devanagari and Noto Sans Kannada bundled locally as font fallbacks for multilingual text rendering without external CDN calls.

---

## 4. Intelligence-Record Lifecycle

The lifecycle of threat intelligence records in the database is distinct and separate from the offer verdict:
```text
reported ──▶ unverified ──▶ ai_flagged ──▶ suspicious ──▶ confirmed
   │                                                         ▲
   ├──▶ dismissed                                            │
   └──▶ disputed                                     (Moderator only)
```
- **Lifecycle states:** `reported`, `unverified`, `ai_flagged`, `suspicious`, `confirmed`, `dismissed`, `disputed`.
- **Governance:** One user report or weak AI match **never** confirms a record. Only an authorized human moderator can elevate a record to `confirmed`.

---

## 5. Privacy & WhatsApp Rules

- **Zero Auto-Send:** The system **never** automatically transmits WhatsApp, SMS, or external messages.
- **Confirmed Only:** Any user-initiated WhatsApp share intent links share only confirmed indicators and verified resources, never raw or unredacted student text.

---

## 6. 11-Phase Project Roadmap

1. **Phase 1 – Workspace:** Root tooling, linters, security scanners, acceptance criteria harness, spec records.
2. **Phase 2 – Shared Core:** TypeScript schemas, 8 core detection rules, PII redaction, entity extraction, lookalike link detection, status determination, 25 test fixtures.
3. **Phase 3 – Server API:** Express REST API, rate limiting, request validation, safe error handling, healthchecks.
4. **Phase 4 – Database & Auth:** Supabase PostgreSQL migrations, RLS policies, Express JWT verification, entity hashing with pepper.
5. **Phase 5 – Client Foundation:** Vite React application setup, design token system, routing, API client, local state management.
6. **Phase 6 – UI Implementation:**
   - **Phase 6A:** Landing Page (Hero, how-it-works, portal links, guidelines)
   - **Phase 6B:** Analyzer (text input, file drop, client-side extraction, consent toggles)
   - **Phase 6C:** Results & PDF (verdict banner, why bullets, next steps, PDF generation)
   - **Phase 6D:** Auth UI & History (login, signup, saved analyses, deletion)
7. **Phase 7 – Shared Intelligence & Moderation:** Scam report submissions, moderator review workflows, indicator matching.
8. **Phase 8 – AI/ML:** Optional Gemini assistance, schema-grounded extraction, fallback resilience when AI is disabled.
9. **Phase 9 – WhatsApp:** Secure WhatsApp sharing link generation with confirmed indicators only.
10. **Phase 10 – Verification:** End-to-end testing, accessibility auditing (WCAG AA), responsive testing, performance budgets.
11. **Phase 11 – Deployment:** Production builds, environment verification, Docker/Render/Vercel configs, runbook documentation.
