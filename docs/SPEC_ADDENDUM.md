# JAANCH – Specification Addendum & Architecture Decisions

This document holds approved extensions, architecture clarifications, and locked technology decisions that supplement `docs/SPEC_ORIGINAL.md`.

---

## 1. Locked Stack & Architecture Layers

| Layer | Locked Component | Rationale & Configuration |
|---|---|---|
| **Database & Auth** | Supabase Postgres with Row Level Security (RLS) | Security definer functions for hashed entity lookups and scam submissions; RLS on all user data. |
| **Auth Verification** | Supabase Auth with Express JWT Verification | Client handles login/signup via `@supabase/supabase-js`; server validates JWT bearer tokens using `SUPABASE_ANON_KEY` / public key without service role key in request handling. |
| **Search Extensions** | `pg_trgm` & `pgvector` (optional embeddings) | Trigram matching for organization fuzzy searches; pgvector available for semantic similarity if embeddings are configured. |
| **Client OCR & PDF** | In-browser `tesseract.js` & `pdfjs-dist` | Zero student documents or images uploaded to server for parsing. All text extracted locally in-browser. |
| **Deployment Targets** | Vercel (Client SPA) + Render (Node.js Express Server) | Vercel SPA rewrites configured via `vercel.json`; Render/Docker container for Node server with healthcheck `/api/health`. |

---

## 2. Presentation (PPT) Reconciliations & UI Elements

- **AICTE & Government Portal Links:**
  - Direct links to AICTE Internship Portal, National Scholarship Portal (NSP), UGC Fake University Alerts, and Cybercrime Reporting Portal (`1930` / `cybercrime.gov.in`).
- **"Unverified" Status Panel:**
  - Dedicated informational panel for offers where no malicious signals were found, but corroborating official evidence is absent. Clearly distinguishes between "safe" and "unverified".
- **Three-Level Link Risk Labels:**
  - Hyperlink evaluation explicitly preserves the 3-level model:
    - `HIGH_RISK` (Phishing / lookalike brand / blacklisted IP or domain)
    - `NEEDS_VERIFICATION` (Shortener / unvetted newly registered domain / redirect hop)
    - `NO_MAJOR_WARNING_SIGNS` (Established official domain / clean reputation)
- **Precision / Recall / F1 Reporting:**
  - Evaluated via `npm run eval` across the 20+ fixture regression corpus. Metric outputs reported in phase logs without inventing synthetic numbers.

---

## 3. Approved Specification Extensions

### Extension P2: Five Verification Statuses
The core verification status model includes 5 evidence-gated states:
1. `VERIFIED_OFFICIAL`: Matched official organization listing and passed all hard-disqualifier checks.
2. `LIKELY_GENUINE`: Verified corporate domain or authenticated headers matching organization; no scam indicators.
3. `NEEDS_REVIEW`: Plausible offer but missing contact verification or official listing confirmation.
4. `HIGH_RISK`: Hard disqualifier present (upfront payment, credentials request, urgency, free-mail corporate claim).
5. `CONFIRMED_SCAM`: Matched an entity hash confirmed fraudulent in the moderator repository.

### Extension P3: Narrow Banned-Phrase Exemption for Confirmed-Record Copy
- Non-verdict policy strictly forbids probabilistic certainty claims (e.g. "guaranteed genuine", "100% safe").
- Narrow exemption granted strictly to `StatusBanner` and `STATUS_COPY` when rendering deterministic `CONFIRMED_SCAM` or `VERIFIED_OFFICIAL` status based on moderator records or official listing matches.
- All other copy (rules, AI prompts, next steps) remains forbidden from asserting ungrounded certainty.

### Extension P4: Consent Flag `shareIndicators`
- Analysis request accepts optional `shareIndicators: boolean` (defaults to `false`).
- Student message text is always redacted of PII before any persistence or external lookup.
- If `shareIndicators` is enabled by the user, salted entity hashes (email/phone/UPI) may be shared with the community defense repository.

### Extension P5: Domain Enum Extensions
`opportunity_domain` enum encompasses:
- `internship`
- `scholarship`
- `job`
- `freelance`
- `competition`
- `hackathon`
- `general_message`

### Typography & Multilingual Font Fallbacks
- Primary font: Inter / System Sans Serif.
- Fallback fonts self-hosted: **Noto Sans Devanagari** (Hindi) and **Noto Sans Kannada** (Kannada).
- Bundled locally to ensure zero external Google Fonts CDN calls and complete CSP compliance.

---

## 4. Entity Status Lifecycle & Moderator Authority

Entity status in `reported_entities` follows a strict lifecycle:
```text
reported ──▶ unverified ──▶ ai_flagged ──▶ suspicious ──▶ confirmed
   │                                                         ▲
   ├──▶ dismissed                                            │
   └──▶ disputed                                     (Moderator only)
```
- **Rule:** A single user report or weak AI match **never** confirms an entity.
- **Rule:** Only an authenticated human moderator running salted peppered hashes (`REPORT_HASH_PEPPER`) via SQL or CLI can elevate an entity to `confirmed`.

---

## 5. Privacy Safeguards & WhatsApp Sharing Rules

- **Zero Unprompted Messaging:** The application **never** automatically sends WhatsApp or SMS messages.
- **Confirmed Only Export:** WhatsApp sharing links (`https://api.whatsapp.com/send?text=...`) generate a pre-formatted advisory text containing only confirmed moderator indicators or verified portals, never unredacted student text.
- **Client-Side Document Processing:** PDF files and images uploaded by the user are decoded exclusively in browser memory. Raw document bytes are never transmitted to the backend.

---

## 6. Implementation Roadmap (Phases 1 to 11)

1. **Phase 1 – Workspace, Spec Files, Root Tooling:** Monorepo skeleton, root tooling, security scanners, acceptance criteria, spec records.
2. **Phase 2 – Shared Schemas, Enums & Core Policy:** Zod schemas, constants, status enum, policy definitions.
3. **Phase 3 – Deterministic Rule Catalog & Heuristics:** Offline rule engine, lookalikes, regex catalog, negation windows.
4. **Phase 4 – Entity Extraction, Organization & Completeness:** Conservative entity extractor, organization scoring, 10-detail completeness.
5. **Phase 5 – Status Engine & Decision Truth Table:** Stepwise status resolution, evidence gates, k-of-8 coverage metric.
6. **Phase 6 – Database Schema, Migrations & RLS:** Supabase migrations, security definer RPCs, peppered hashing.
7. **Phase 7 – Server Architecture & Safe Networking:** Express server, safeFetch SSRF protection, domain intel (RDAP, CT logs), optional Gemini.
8. **Phase 8 – Design System, Tokens & Multilingual Foundation:** Editorial CSS tokens, WCAG AA contrast, self-hosted fonts, en/hi/kn translations.
9. **Phase 9 – Landing Page & Navigation Experience:** Hero, facts band, how-it-works, responsive sticky nav, guidelines.
10. **Phase 10 – Offer Analyzer & Results Experience:** Multifaceted inputs, OCR, single-column results, PDF export, checklist.
11. **Phase 11 – End-to-End Verification, Acceptance & Parity Audit:** Full test evaluation, headless Chrome CDP verification, final documentation.
