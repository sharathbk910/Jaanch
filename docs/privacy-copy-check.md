# JAANCH – Privacy Copy & Code Audit (Decision D16)

> [!NOTE]
> This audit verifies every public privacy, confidentiality, and data handling claim across the Jaanch application against the concrete codebase implementation.
> Specification Authority: `docs/SPEC_ORIGINAL.md` (Part A §18, Part B §16, Decision D16).

---

## 1. Executive Summary
- **Audit Date:** 2026-11-01
- **Status:** **100% VERIFIED & CONFORMANT**
- **Violations Found:** 0
- **Unverified Claims:** 0

All public-facing claims made in `PrivacyPage.tsx`, `AnalyzePage.tsx`, `LandingPage.tsx`, `translations.ts`, and educational dialogs strictly match the code implementation in `@jaanch/client`, `@jaanch/server`, and `@jaanch/shared`.

---

## 2. Privacy Claim Verifications

### Claim 1: "Files never leave your browser"
- **User-Facing Copy:**
  - *EN:* *"Files never leave your browser. Document text and OCR are extracted locally on your device using client-side WebAssembly."* (`translations.ts: analyzer.fileDropSub`)
  - *HI:* *"फ़ाइलें आपके ब्राउज़र से बाहर कभी नहीं जाती हैं।"*
  - *KN:* *"ಫೈಲ್‌ಗಳು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಿಂದ ಹೊರಗೆ ಹೋಗುವುದಿಲ್ಲ."*
- **Code Implementation:**
  - Document parser in [`client/src/lib/documentExtractor.ts`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/lib/documentExtractor.ts):
    - Uses local `pdfjs-dist/build/pdf.mjs` running in-memory with bundled Web Worker.
    - Uses local `tesseract.js` optical character recognition running entirely via WebAssembly.
    - File input is processed via `FileReader.readAsArrayBuffer()` in the browser runtime.
    - **Zero network fetch or upload dispatches** exist in `documentExtractor.ts`.
- **Proving Test:**
  - [`client/src/__tests__/pdf_and_ocr_extraction.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/__tests__/pdf_and_ocr_extraction.test.ts): Proves client-side text extraction without any network request.
- **Verdict:** **PASS (Verified)**

---

### Claim 2: "Pre-Submission Client-Side PII Scrubbing (Redaction Preview)"
- **User-Facing Copy:**
  - *EN:* *"Client-Side Redaction: What Jaanch sends. Review the sanitized text before submit."* (`translations.ts: analyzer.redactionPreviewTitle`)
- **Code Implementation:**
  - In [`client/src/pages/Analyze.tsx`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/pages/Analyze.tsx#L290-L318):
    - Runs `redactText(textToAnalyze)` locally before any API dispatch.
    - Masks Aadhaar numbers (`\b\d{4}\s?\d{4}\s?\d{4}\b`), Indian phone numbers (`+91 ...`), personal email user parts, UPI IDs (`\b[\w.-]+@[\w.-]+\b`), and banking details.
    - The network request payload sends only `clientRedacted.redactedText`.
  - Defense-in-depth: [`server/src/routes/analyze.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/routes/analyze.ts) re-applies `redactText` server-side before processing or threat intel lookup.
- **Proving Test:**
  - [`client/src/__tests__/AnalyzePage.test.tsx`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/__tests__/AnalyzePage.test.tsx): Captures network payload, asserting raw Aadhaar and phone numbers are absent and replaced with redaction tokens.
  - [`shared/src/__tests__/privacy.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/shared/src/__tests__/privacy.test.ts): 100% regex coverage across Indian entity types.
- **Verdict:** **PASS (Verified)**

---

### Claim 3: "Privacy & Consent Toggles Default to OFF"
- **User-Facing Copy:**
  - *EN:* *"Consent controls: AI Analysis, Share Threat Indicators, and Save to History are optional and default to OFF."*
- **Code Implementation:**
  - In [`client/src/pages/Analyze.tsx`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/pages/Analyze.tsx#L106-L108):
    ```ts
    const [aiAnalysis, setAiAnalysis] = useState<boolean>(false);
    const [shareIndicators, setShareIndicators] = useState<boolean>(false);
    const [saveToHistory, setSaveToHistory] = useState<boolean>(false);
    ```
  - In [`shared/src/schemas/index.ts`](file:///c:/Code%20Meet/Jaanch%20AI/shared/src/schemas/index.ts#L65):
    ```ts
    export const ConsentFlagsSchema = z.object({
      aiAnalysis: z.boolean().default(false),
      shareIndicators: z.boolean().default(false),
    });
    ```
- **Proving Test:**
  - [`client/src/__tests__/AnalyzePage.test.tsx`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/__tests__/AnalyzePage.test.tsx): "guarantees consent defaults are all false and never transmits raw PII".
- **Verdict:** **PASS (Verified)**

---

### Claim 4: "Guest Analyses Are Strictly Ephemeral (Zero Database Storage)"
- **User-Facing Copy:**
  - *EN:* *"Continue as guest. No account required. Analyses are ephemeral and never stored on our servers."* (`translations.ts: auth.continueAsGuestNotice`)
- **Code Implementation:**
  - In [`server/src/routes/analyze.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/routes/analyze.ts#L180-L210):
    - Database insertion into `user_analyses` occurs **only** when `req.user` is present AND `saveToHistory === true`.
    - Unauthenticated guest submissions bypass database insertion completely.
  - In [`client/src/pages/Analyze.tsx`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/pages/Analyze.tsx#L328-L336):
    - Guest results are saved to browser `sessionStorage` via `saveGuestAnalysis()` and cleared on tab closure.
- **Proving Test:**
  - [`server/src/__tests__/auth_dashboard_e2e.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/__tests__/auth_dashboard_e2e.test.ts): Proves guest analysis generates zero rows in the database, and unauthenticated requests to `/api/history` return 401.
- **Verdict:** **PASS (Verified)**

---

### Claim 5: "Zero Student Message Text in Server Logs"
- **User-Facing Copy:**
  - *Internal & Architecture Invariant:* SPEC_ORIGINAL Section 0.3.3 and Decision D7.
- **Code Implementation:**
  - Logger configured in [`server/src/lib/logger.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/lib/logger.ts):
    ```ts
    redact: {
      paths: [
        'req.body.text',
        'req.body.scrubbedText',
        'req.body.sender',
        'req.headers.authorization',
        '*.password',
        '*.token',
        '*.secret',
      ],
      censor: '[REDACTED]',
    }
    ```
  - Pino logger strips request body text before serialization to stdout or logfiles.
- **Proving Test:**
  - [`server/src/__tests__/invariants.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/__tests__/invariants.test.ts): Asserts log outputs never contain raw user text or authentication tokens.
- **Verdict:** **PASS (Verified)**

---

### Claim 6: "Cryptographic One-Way Hashing for Threat Intelligence"
- **User-Facing Copy:**
  - *EN:* *"Person A's verified scam protects Person B without leaking Person A's data."* (`docs/INTEL.md`)
- **Code Implementation:**
  - In [`server/src/lib/hashing.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/lib/hashing.ts):
    - Normalized offer text is hashed with HMAC-SHA256 keyed with secret `REPORT_HASH_PEPPER` ($\ge 24$ chars).
    - Extracted indicators (UPI, phone, domain, URL) are normalized and hashed with HMAC-SHA256 before insertion into `intel_indicators`.
    - Plaintext indicators are never stored; only one-way hashes and masked displays (e.g., `+91 98*** **210`, `user***@okaxis`) are stored.
- **Proving Test:**
  - [`server/src/__tests__/hashing.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/__tests__/hashing.test.ts): Verifies peppered HMAC output, one-way irreversibility, and masked displays.
- **Verdict:** **PASS (Verified)**

---

### Claim 7: "Right to Permanent Erasure (DPDP Act / GDPR)"
- **User-Facing Copy:**
  - *EN:* *"Erase Account & Analysis Data: Permanently delete your account and all associated audit history."* (`translations.ts: settings.dangerZoneTitle`)
- **Code Implementation:**
  - In [`server/src/routes/account.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/routes/account.ts) and [`client/src/pages/AuthPages.tsx`](file:///c:/Code%20Meet/Jaanch%20AI/client/src/pages/AuthPages.tsx):
    - Requires typing exact "DELETE" confirmation string.
    - `DELETE /api/account/data` triggers cascading deletion across `user_analyses`, `saved_analyses`, and Supabase user profiles.
- **Proving Test:**
  - [`server/src/__tests__/auth_and_history.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/__tests__/auth_and_history.test.ts): Verifies complete data deletion and confirms `/api/history` returns empty set after erasure.
- **Verdict:** **PASS (Verified)**

---

### Claim 8: "No Message URLs Fetched Over the Network"
- **User-Facing Copy:**
  - *EN:* *"Suspicious URLs are analyzed structurally (domain syntax, IDN homoglyphs, excessive subdomains) without visiting or fetching the destination."*
- **Code Implementation:**
  - In [`server/src/routes/links.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/routes/links.ts):
    - URLs provided in messages are parsed with Node `URL` and evaluated using deterministic structural algorithms ([`shared/src/links/index.ts`](file:///c:/Code%20Meet/Jaanch%20AI/shared/src/links/index.ts)).
    - The server **never** makes an HTTP GET/POST request to the destination URL.
    - URL shorteners are transparently flagged with the notice *"cannot inspect without external fetch"*.
- **Proving Test:**
  - [`server/src/__tests__/ai_ml_phase8.test.ts`](file:///c:/Code%20Meet/Jaanch%20AI/server/src/__tests__/ai_ml_phase8.test.ts): Tests URL inspection with zero outbound HTTP requests to the target domain.
- **Verdict:** **PASS (Verified)**

---

## 3. Compliance Matrix

| Privacy Principle | Statutory / Spec Standard | Code Implementation | Test Evidence | Conformance |
|---|---|---|---|:---:|
| **Local Processing** | SPEC_ORIGINAL Part B §9 | `documentExtractor.ts` (WASM) | `pdf_and_ocr_extraction.test.ts` | **CONFORMANT** |
| **Data Minimization** | DPDP Act 2023 §6(1) | `redactText` before transmission | `privacy.test.ts` | **CONFORMANT** |
| **Consent Opt-In** | SPEC_ORIGINAL Part A §18 | Defaults all `false` | `AnalyzePage.test.tsx` | **CONFORMANT** |
| **Ephemeral Guest** | Decision D7 | `sessionStorage` only | `auth_dashboard_e2e.test.ts` | **CONFORMANT** |
| **Logging Hygiene** | Section 0.3.3 | Pino redaction rules | `invariants.test.ts` | **CONFORMANT** |
| **Peppered Hashes** | SPEC_ORIGINAL Part B §7.2 | HMAC-SHA256 (`REPORT_HASH_PEPPER`) | `hashing.test.ts` | **CONFORMANT** |
| **Right to Erasure** | DPDP Act 2023 §12(3) | `DELETE /api/account/data` | `auth_and_history.test.ts` | **CONFORMANT** |
| **Zero SSRF / Fetch** | Decision D10 | Pure structural URL inspection | `ai_ml_phase8.test.ts` | **CONFORMANT** |

