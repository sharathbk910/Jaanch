# JAANCH Threat Intelligence Architecture (docs/INTEL.md)

## 1. Overview & Objective
The core objective of the Jaanch Shared Threat Intelligence Network is:
> **"Person A's verified scam protects Person B, without leaking Person A's data."**

When an Indian student (Person A) receives a fraudulent job, scholarship, or internship offer and reports it:
1. All personal student identifiable information (PII) is permanently scrubbed before transmission or storage.
2. The scrubbed text is canonically normalized and hashed using HMAC-SHA256 with the secret server pepper (`REPORT_HASH_PEPPER`).
3. Extracted contact and payment indicators (UPI handles, domains, URLs, phone numbers) are peppered-hashed and masked.
4. Exact duplicate submissions from other students link to the same record (deduplication) and advance community corroboration without double-counting.
5. Once investigated and confirmed by an authorized human moderator, any future student (Person B) analyzing the same message or matching contact indicators is immediately warned with verdict `CONFIRMED_SCAM`.

---

## 2. Intelligence Record Lifecycle & Governance
The intelligence lifecycle states are distinct and governed by strict safety invariants:

```text
reported ──▶ unverified ──▶ ai_flagged ──▶ suspicious ──▶ confirmed
   │                                                         ▲
   ├──▶ dismissed                                            │
   └──▶ disputed                                     (Moderator only)
```

### Promotion Rules & Constants
- **`MIN_REPORTERS_FOR_SUSPICIOUS = 3`**: A record transitions from `reported` / `unverified` to `suspicious` only when it receives reports from $\ge 3$ distinct accounts.
- **`NEW_ACCOUNT_COOLOFF_HOURS = 24`**: To prevent Sybil attacks and astroturfed defamation campaigns, only reports from accounts older than 24 hours satisfy the promotion threshold.
- **`ai_flagged`**: If an incoming report is submitted from an offer where deterministic rule evaluation flagged `HIGH_CONCERN`, the record status is elevated to `ai_flagged`.
- **`confirmed` (Human Moderator Gate)**: **NOTHING auto-confirms.** Neither report volume nor algorithmic scores can elevate a record to `confirmed`. Elevation to `confirmed` requires an explicit, audited action by an authorized human moderator.
- **`disputed`**: Anyone can contest a record via `POST /api/disputes`. Contested records transition to `disputed` pending moderator review.
- **`dismissed` / `retract`**: Moderators can dismiss uncorroborated records or retract false flags with a mandatory reason written to `moderation_actions`.

---

## 3. Database Schema (Migration 0004)
The schema is partitioned into five tables with Row Level Security (RLS) on each:

1. **`domain_allowlist`**:
   - Contains known-legitimate government portals (`mca.gov.in`, `scholarships.gov.in`, `aicte-india.org`, `ncs.gov.in`, `gov.in`, `nic.in`), premier educational institutions (`ac.in`, `edu.in`), and verified corporations (`tcs.com`, `infosys.com`, `wipro.com`, `sbi.co.in`, `google.com`, `microsoft.com`).
   - **Hard Invariant:** A moderator confirmation is **strictly blocked** if any indicator domain matches an allowlisted domain.

2. **`intel_records`**:
   - Primary shared intelligence record table.
   - `id UUID PRIMARY KEY`, `public_id TEXT UNIQUE` (`JNC-INTEL-XXXXXXXX`).
   - `status entity_status NOT NULL DEFAULT 'reported'`.
   - `scrubbed_text TEXT NOT NULL` (sanitized PII only, zero raw submissions).
   - `normalized_hash TEXT NOT NULL` (HMAC-SHA256 with `REPORT_HASH_PEPPER`).
   - `first_reported_at`, `confirmed_at`, `confirmed_by UUID REFERENCES auth.users(id)`.

3. **`intel_indicators`**:
   - Contact and payment indicators extracted from reported scams.
   - `type` (`url`, `domain`, `phone`, `upi`).
   - `value_hash TEXT NOT NULL` (peppered HMAC-SHA256).
   - `masked_display TEXT NOT NULL` (e.g. `tc***@okaxis`, `+91 9876****10`, `su***.net`).

4. **`intel_reports`**:
   - Links users to records with `UNIQUE(record_id, reporter_id)` to deduplicate multiple submissions from the same user.
   - RLS strictly restricts SELECT so reporters can see only their own report rows (`reporter_id = auth.uid()`).

5. **`moderation_actions`**:
   - Immutable audit trail recording every state transition (`confirm`, `dismiss`, `dispute`, `retract`, `edit_scrubbing`) with moderator ID, timestamp, and mandatory written justification.

---

## 4. Matching Rules in `/api/analyze`
Offer analysis matches threat intelligence using a two-tier strategy:

1. **Tier 1: Exact Normalized Text Match**
   - The analyzed text is canonically normalized (`NFKC`, homoglyphs folded, whitespace collapsed) and hashed with `REPORT_HASH_PEPPER`.
   - Checks `intel_records(normalized_hash)`.
   - If matched and `status === 'confirmed'`:
     - Verdict becomes `CONFIRMED_SCAM` (Confidence: 99%).
     - Critical rule signal: `RULE_CONFIRMED_FRAUD_RECORD`.
     - Explanation: *"Matches a moderator-confirmed record in the Jaanch Scam Intelligence Network."*
   - If matched and `status === 'suspicious'` or `'ai_flagged'`:
     - **Verdict is UNCHANGED** (heuristic verdict preserved).
     - Informational signal: `RULE_SUSPICIOUS_REPORTED_RECORD`.
     - Explanation: *"Similar to reported messages under active community review."*

2. **Tier 2: Indicator Peppered-Hash Match**
   - Extracted UPI handles, emails, phones, URLs, and domains are peppered-hashed and queried against `intel_indicators`.
   - If matched to a confirmed record:
     - Verdict becomes `CONFIRMED_SCAM` (Confidence: 98%).
   - If matched to a suspicious or flagged record:
     - Verdict is UNCHANGED.

3. **Privacy & Reporting Anonymity Rule**:
   - Public analysis responses never reveal individual reporter identities or timestamps.
   - Reporter counts are aggregated and never exposed under threshold values.

---

## 5. Security & Anti-Abuse Controls

### Poisoning & Defamation Resistance
- Anonymous users cannot submit threat reports. Reports require authentication (`requireAuth`) and explicit `shareIndicators: true` consent.
- Rate limiting: strictly 10 reports per user per day.
- New accounts ($< 24$h) cannot trigger promotion to `suspicious`.
- Allowlisted domains can **never** be confirmed as scams. Attempting to confirm a record with an allowlisted indicator throws `ALLOWLISTED_DOMAIN_BLOCKED`.

### Zero Raw-Submission Leak
- There is **no database path** between `submissions` (private user offer history) and `intel_records`.
- Reports are populated exclusively with `scrubbed_text` (all names, phones, Aadhaar, and amounts masked via `redactText`).
- Moderators can further edit and sanitize scrubbed text via `PATCH /api/moderation/records/:id/scrubbing`.

---

## 6. First Moderator Bootstrap Guide
In a fresh Supabase deployment, no users have the `moderator` role by default. System administrators promote the first moderator using the standalone bootstrap script:

```bash
# Using user email
npx tsx scripts/bootstrap-moderator.ts --email admin@jaanch.ai

# Using Supabase auth.users UUID
npx tsx scripts/bootstrap-moderator.ts --user-id 018fa34c-1234-7000-8000-000000000000
```

### Safety Requirements:
1. `SUPABASE_SERVICE_ROLE_KEY` is required in the server environment (`server/.env`).
2. The service role key is **never** bundled or accessible to the client (`check:no-secrets` enforced).
3. The promotion writes an audit log entry (`BOOTSTRAP_MODERATOR_ROLE`) into `audit_logs`.
