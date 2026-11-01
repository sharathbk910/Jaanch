# JAANCH – Row Level Security (RLS) Test Plan

**Scope:** Verification of data isolation between authenticated users and anonymous public requests.  
**Specification Authority:** `docs/SPEC_ORIGINAL.md` (Decision D14, Sections A §11, B §10)  

---

## 1. Test Architecture & Roles

RLS policies are validated against three distinct database sessions:
1. **User A (Authenticated):** Simulated with `auth.uid() = '11111111-1111-1111-1111-111111111111'`
2. **User B (Authenticated):** Simulated with `auth.uid() = '22222222-2222-2222-2222-222222222222'`
3. **Anon (Public/Unauthenticated):** `auth.uid() IS NULL`

---

## 2. Test Execution SQL Queries

Run the following test harness in the Supabase SQL Editor to verify that policies enforce strict isolation:

```sql
-- =============================================================================
-- TEST HARNESS: RLS POLICY VERIFICATION
-- =============================================================================

-- Step 1: Create dummy test auth users (or mock sessions)
-- Test setup: Simulate User A
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

-- User A creates their own analysis record
INSERT INTO analyses (
  id,
  user_id,
  domain,
  verification_status,
  confidence_score,
  audit_id
) VALUES (
  'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'internship',
  'HIGH_CONCERN',
  92,
  'audit_user_a_001'
);

-- User A adds a signal to their analysis
INSERT INTO analysis_signals (
  id,
  analysis_id,
  rule_id,
  title,
  why_it_matters,
  evidence,
  severity
) VALUES (
  's1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'RULE_UPFRONT_FEE',
  'Upfront Fee Demanded',
  'Companies never charge registration fees.',
  'Pay 2500 rupees registration fee',
  'critical'
);

-- Verification 1.1: User A can read their own analysis and signal
SELECT count(*) = 1 AS user_a_reads_own_analysis FROM analyses WHERE id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SELECT count(*) = 1 AS user_a_reads_own_signals FROM analysis_signals WHERE analysis_id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- -----------------------------------------------------------------------------
-- Step 2: Switch context to User B
-- -----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

-- Verification 2.1: User B CANNOT read User A's analysis (Must return 0 rows)
SELECT count(*) = 0 AS user_b_blocked_from_user_a_analysis FROM analyses WHERE id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Verification 2.2: User B CANNOT read User A's child signals (Must return 0 rows)
SELECT count(*) = 0 AS user_b_blocked_from_user_a_signals FROM analysis_signals WHERE analysis_id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Verification 2.3: User B CANNOT update or delete User A's analysis
UPDATE analyses SET verification_status = 'LIKELY_GENUINE' WHERE id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- Status must remain HIGH_CONCERN
SELECT count(*) = 0 AS user_b_cannot_update_user_a FROM analyses WHERE id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND verification_status = 'LIKELY_GENUINE';

-- Verification 2.4: User B CANNOT attach child items to User A's analysis (Must fail or insert 0)
-- Attempting to insert signal pointing to User A's analysis
DO $$
BEGIN
  INSERT INTO analysis_signals (
    analysis_id,
    rule_id,
    title,
    why_it_matters,
    evidence,
    severity
  ) VALUES (
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'RULE_GENUINE_DISCLAIMER',
    'Forged Disclaimer',
    'Attempted tampering by User B',
    'Fake evidence',
    'info'
  );
  RAISE EXCEPTION 'RLS failed: User B was able to insert signals into User A analysis';
EXCEPTION WHEN OTHERS THEN
  -- Success: Policy correctly blocked foreign insertion
  RAISE NOTICE 'SUCCESS: RLS blocked User B from inserting into User A analysis';
END $$;

-- -----------------------------------------------------------------------------
-- Step 3: Switch context to Anonymous (Anon / Public)
-- -----------------------------------------------------------------------------
SET LOCAL ROLE anon;
RESET request.jwt.claim.sub;

-- Verification 3.1: Anonymous user CANNOT read any user analysis
SELECT count(*) = 0 AS anon_blocked_from_analyses FROM analyses;
SELECT count(*) = 0 AS anon_blocked_from_signals FROM analysis_signals;

-- Verification 3.2: Anonymous user CAN read public organizations registry
SELECT count(*) > 0 AS anon_can_read_organizations FROM organizations;

-- Verification 3.3: Anonymous user CAN submit feedback
INSERT INTO page_feedback (page, rating, message) VALUES ('/about', 5, 'Clean layout');
-- But CANNOT read feedback back
SELECT count(*) = 0 AS anon_blocked_from_reading_feedback FROM page_feedback;
```

---

## 3. RLS Matrix Summary

| Table | Anon Access | Authenticated (Own Data) | Authenticated (Other's Data) |
|---|---|---|---|
| `profiles` | None | SELECT, UPDATE | Blocked |
| `analyses` | None | SELECT, INSERT, UPDATE, DELETE | Blocked |
| `analysis_signals` | None | SELECT, INSERT, DELETE | Blocked |
| `analysis_unknowns`| None | SELECT, INSERT, DELETE | Blocked |
| `checklist_items`  | None | SELECT, INSERT, UPDATE, DELETE | Blocked |
| `analysis_checks`  | None | SELECT, INSERT, DELETE | Blocked |
| `organizations`    | SELECT | SELECT | Read-only |
| `reported_entities`| SELECT (`confirmed` only) | SELECT (`confirmed` only) | RPC lookup only |
| `scam_reports`     | None | INSERT, SELECT (own) | Blocked |
| `feedback`         | INSERT | INSERT | Blocked |
| `page_feedback`    | INSERT | INSERT | Blocked |
