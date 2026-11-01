# JAANCH (जांच / ಜಾಂಚ್)

> **Digital Trust & Safety Platform for Indian Students**  
> *Know it's real before you reply.*

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/badge/Node->=%2020.0.0-green.svg)](https://nodejs.org/)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests Passing](https://img.shields.io/badge/Tests-425%20Passing-brightgreen.svg)]()
[![Corpus Eval](https://img.shields.io/badge/Eval-25%2F25%20(100%25)-brightgreen.svg)]()

---

## Overview

**Jaanch** is a specialized trust and safety web application designed to protect Indian students and fresh graduates from fraudulent employment offers, fake internship schemes, scholarship fee traps, and financial phishing.

Built from scratch with strict privacy guarantees, deterministic heuristics, client-side PII redaction, and human-in-the-loop threat intelligence, Jaanch gives students immediate clarity on suspicious communications without storing or exposing their sensitive personal data.

---

## Key Capabilities

1. **Deterministic Rule Engine:**
   - 15 rule families covering upfront deposit traps, urgent coercive deadlines, lookalike domain typosquatting, bank OTP demands, impersonation of authority, fake job/task scams, and remote-access app installation requests.
   - Multilingual support across English, Hindi, Kannada, and colloquial Hinglish.
   - Robust negation guards preventing false alarms on legitimate employer disclaimers.

2. **Client-Side Privacy & Zero-Knowledge Architecture:**
   - Client-side redaction masks emails, phone numbers, UPI IDs, bank accounts, and Aadhaar numbers before network dispatch.
   - In-browser document OCR (`Tesseract.js`) and PDF extraction (`pdfjs-dist`); zero student files are ever uploaded to backend servers.
   - Unauthenticated guest analyses are stored in `sessionStorage` only, persisting zero rows to the server database.

3. **Approved 4-Verdict Decision Model:**
   - `LIKELY_GENUINE`: Verified against corroborating signals; no disqualifiers detected.
   - `NEEDS_REVIEW`: Incomplete details, missing verification, or unverified contact information.
   - `HIGH_CONCERN`: Hard disqualifiers present (upfront deposits, OTP sharing, coercive urgency).
   - `CONFIRMED_SCAM`: Matched a community threat intelligence record explicitly confirmed by a human moderator.

4. **Shared Scam Intelligence & Human Moderation:**
   - Cryptographic peppered hashes (`HMAC-SHA256`) allow cross-matching scam indicators without revealing reporter identities.
   - Distinct intelligence record lifecycle: `reported ──▶ unverified ──▶ ai_flagged ──▶ suspicious ──▶ confirmed`.
   - Strict governance: Weak AI or single reports **never** auto-confirm. Only authorized human moderators confirm records.
   - Protected allowlist: Recognized public institutions (`tcs.com`, `aicte-india.org`, `gov.in`, `edu.in`, `nic.in`) can never be confirmed as scams.

5. **WhatsApp Scam-Alert Sharing:**
   - Deterministic localized alert builder (`en`, `hi`, `kn`) generating safe `https://wa.me/?text=...` warnings.
   - Modal preview with editable textarea, character limits, and excerpt toggle.
   - **Zero Auto-Send:** No background WhatsApp APIs; the student must review and press Send inside WhatsApp.

6. **Official Indian Portals Integration & Emergency Protection:**
   - One-click checks against AICTE Internship Portal, National Scholarship Portal (NSP), Ministry of Corporate Affairs (MCA), and National Career Service (NCS).
   - Direct emergency helpline integration with **National Cyber Crime Helpline `1930`** and `cybercrime.gov.in`.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT SPA (React + Vite)                  │
│  - Design Tokens (Light Theme Editorial)                        │
│  - Client-Side PII Masking & In-Browser OCR / PDF               │
│  - Accessible Navigation (WCAG 2.2 AA, 360px+ Responsive)       │
│  - Multilingual UI (English / हिंदी / ಕನ್ನಡ)                     │
└────────────────┬───────────────────────────────┬────────────────┘
                 │ (Stateless JSON API)          │ (Public Anon Key)
                 ▼                               ▼
┌─────────────────────────────────┐   ┌───────────────────────────┐
│       SERVER (Express + Node)   │   │       SUPABASE POSTGRES   │
│  - SafeFetch (SSRF Protection)  │   │  - Row Level Security     │
│  - Rate Limiting & Helmet CSP   │   │  - Multi-User Isolation   │
│  - Deterministic Rules Engine   │   │  - pg_trgm & pgvector     │
│  - Optional Gemini Embeddings   │   │  - Moderation Audit Logs  │
└─────────────────────────────────┘   └───────────────────────────┘
```

---

## Repository Structure

```text
jaanch/
├── client/              # React 18 SPA (Vite, Tailwind, TanStack Query)
│   ├── src/components/  # Accessible, token-styled UI components
│   ├── src/pages/       # Landing, Analyze, Results, Auth, Moderation
│   └── src/lib/         # Client-side PII masking, OCR, API client
├── server/              # Express REST API
│   ├── src/routes/      # Analyze, links, moderation, reports, whatsapp
│   ├── src/middleware/  # SSRF protection, JWT auth, rate limiters
│   └── src/lib/         # Threat intelligence repository, safeFetch
├── shared/              # Core business logic & schemas (@jaanch/shared)
│   ├── src/rules/       # 15 deterministic rule families
│   ├── src/share/       # WhatsApp alert builder & length budgeter
│   └── src/fixtures/    # 25 benchmark evaluation fixtures
├── supabase/migrations/ # Consolidated PostgreSQL migrations & down scripts
├── scripts/             # Verification, doctor, smoke, and audit tools
└── docs/                # Architecture records, runbook, and spec tracking
```

---

## Quick Start

### 1. Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### 2. Setup
```bash
# Install dependencies
npm ci

# Configure environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Run environment diagnosis
npm run doctor
```

### 3. Run Development Stack
```bash
npm run dev
```
- Client: `http://localhost:5173`
- Server: `http://localhost:8080` (health: `http://localhost:8080/api/health`)

---

## Verification & Quality Commands

| Command | Purpose |
|---|---|
| `npm test` | Runs all 42 test suites (425 passing tests) |
| `npm run eval` | Evaluates 25 golden corpus fixtures (100% Accuracy) |
| `npm run eval:ml` | Calibrates similarity & semantic embedding thresholds |
| `npm run doctor` | Validates environment variables, Node version, and reachability |
| `npm run smoke` | End-to-end API smoke test on core analysis routes |
| `npm run test:acceptance` | Verifies all 10 core acceptance criteria |
| `npm run verify:scenarios` | Validates 3 golden test scenarios against local server |
| `npm run check:no-secrets` | Scans for exposed API keys, service roles, or JWT tokens |
| `npm run check:colors` | Guarantees zero hardcoded hex/rgb colors in client code |
| `npm run check:banned-phrases`| Verifies zero ungrounded certainty claims in copy |
| `npm run check:glyphs` | Validates Devanagari and Kannada glyph rendering at 360px |
| `npm run build` | Full production build of shared, server, and client |

---

## Deployment Targets

- **Frontend:** [Vercel](https://vercel.com) (`client/vercel.json` SPA rewrites).
- **Backend:** [Render](https://render.com) (`render.yaml`) or Docker (`Dockerfile`).
- **Database:** [Supabase](https://supabase.com) (PostgreSQL 15+ with RLS).

See [`docs/RUNBOOK.md`](docs/RUNBOOK.md) for full operational, deployment, and rollback procedures.

---

## Disclaimers & Ethics

Jaanch evaluates automated heuristic signals, verified organization directories, and confirmed community threat indicators. Analysis does not prove an opportunity is genuine or fraudulent. Students must always corroborate independently through official regulatory portals before paying fees or sharing identity documents.

