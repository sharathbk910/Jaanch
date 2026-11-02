# JAANCH Database Architecture & Operations (docs/DB.md)

Specification Authority: `docs/SPEC_ORIGINAL.md` (Decision D14), `docs/SPEC_ADDENDUM.md`, and Phase 4 Requirements.

---

## 1. Overview & Security Architecture

The Jaanch database infrastructure is built on PostgreSQL with Supabase, enforcing multi-user security, private history isolation, role boundaries, and audit logging.

### Core Security Guarantees
1. **Row Level Security (RLS) on Every Table:** RLS is enabled on all tables without exception. Default behavior for unauthenticated/unpermitted operations is denial.
2. **Strict User Isolation:** Authenticated users can only select, insert, update, or delete their own rows (`auth.uid() = user_id` or `auth.uid() = id`).
3. **No Moderator Blanket Access to Submissions:** Moderators receive no blanket read permissions over users' private offer submissions or detection results.
4. **Role Protection:** A database trigger (`trg_protect_profile_role`) prevents users from modifying their own `role` enum (`user` | `moderator`). Role changes are restricted to `service_role` and database superusers.
5. **Audit Log Privacy & Security:** `audit_logs` has RLS enabled with **zero policies** for ordinary users. Insertions occur exclusively via the server's `service_role` client. Metadata never contains raw message text or unredacted user input.
6. **Zero Service-Role Key in Request Handling (Decision D11):** All user requests use per-request user-scoped clients with the public anon key and the user's validated JWT.

---

## 2. Enumerated Types

| Enum | Allowed Values | Purpose |
|------|----------------|---------|
| `user_role` | `user`, `moderator` | Access control role for user profiles |
| `opportunity_domain` | `job`, `internship`, `scholarship`, `freelance`, `competition`, `other`, `general_message` | Offer domain categorization |
| `input_type` | `raw_text`, `screenshot`, `pdf_document` | Input channel format |
| `risk_level` | `HIGH_RISK`, `NEEDS_VERIFICATION`, `NO_MAJOR_WARNING_SIGNS` | Link risk triage |
| `signal_category` | `payment`, `urgency`, `data_request`, `missing_details`, `channel`, `too_good_to_be_true`, `link`, `sender_identity`, `source_authenticity`, `reported_record`, `content_quality` | Rule classification categories |
| `signal_severity` | `critical`, `high`, `medium`, `low`, `info` | Signal risk levels |
| `signal_source` | `rule`, `ai_observed` | Signal origin (rule or AI observation) |
| `channel_type` | `whatsapp`, `telegram`, `email`, `sms`, `job_portal`, `other` | Communication vector |
| `verification_status` | `LIKELY_GENUINE`, `NEEDS_REVIEW`, `HIGH_CONCERN`, `CONFIRMED_SCAM` | 4-verdict analysis outcome |
| `check_outcome` | `pass`, `fail`, `unknown`, `not_run`, `user_attested`, `none_found` | Verification item status |
| `entity_type` | `email`, `domain`, `phone`, `upi`, `bank_account` | Threat indicator type |
| `entity_status` | `reported`, `unverified`, `ai_flagged`, `suspicious`, `confirmed`, `dismissed`, `disputed` | Threat intelligence lifecycle |
| `org_kind` | `corporation`, `government`, `educational`, `ngo`, `other` | Organization type |

---

## 3. Database Schema Tables

### 3.1 `profiles`
Mirrors `auth.users` for profile metadata and RBAC roles.
- `id` (UUID, PK, `REFERENCES auth.users(id) ON DELETE CASCADE`)
- `display_name` (TEXT)
- `role` (`user_role`, NOT NULL, DEFAULT `'user'`)
- `preferred_language` (TEXT, NOT NULL, DEFAULT `'en'`)
- `default_share_indicators` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### 3.2 `submissions`
Private user submissions created when an authenticated student analyzes an offer with `saveToHistory = true`.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `user_id` (UUID, NOT NULL, `REFERENCES auth.users(id) ON DELETE CASCADE`)
- `input_type` (TEXT, NOT NULL)
- `domain` (TEXT)
- `channel` (TEXT)
- `text_hash` (TEXT, NOT NULL)
- `redacted_text` (TEXT, NULLABLE — stored only if the user explicitly opts in to share indicators)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### 3.3 `detection_results`
Deterministic rule signals and confidence metrics linked to private submissions.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `submission_id` (UUID, NOT NULL, `REFERENCES submissions(id) ON DELETE CASCADE`)
- `status` (TEXT, NOT NULL)
- `confidence` (NUMERIC, NOT NULL)
- `signals` (JSONB, NOT NULL, DEFAULT `'[]'::jsonb`)
- `schema_version` (TEXT, NOT NULL, DEFAULT `'1.0.0'`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### 3.4 `audit_logs`
Immutable record of sensitive authentication, deletion, and role events.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `actor_id` (UUID, `REFERENCES auth.users(id) ON DELETE SET NULL`)
- `action` (TEXT, NOT NULL, e.g. `'history.delete'`, `'account.data_erasure'`, `'auth.role_denied'`)
- `entity` (TEXT, NOT NULL, e.g. `'submission'`, `'account'`, `'role_guard'`)
- `entity_id` (TEXT)
- `meta` (JSONB, NOT NULL, DEFAULT `'{}'::jsonb` — strictly sanitized: no user message text)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### 3.5 Registry & Supporting Tables
- `organizations`: Verified companies and government portals (`needs_team_review = true` per D10).
- `reported_entities`: Salted threat intelligence indicators (`REPORT_HASH_PEPPER`).
- `scam_reports`: Student-reported fraudulent entities.
- `analyses`, `analysis_signals`, `analysis_unknowns`, `checklist_items`, `analysis_checks`, `link_checks`, `recruiter_challenges`: Comprehensive analysis models.
- `feedback`, `page_feedback`: Feedback telemetry.

---

## 4. Row Level Security (RLS) Policies

| Table | Operation | Role / Target | Policy Rule |
|-------|-----------|---------------|-------------|
| `profiles` | SELECT | `authenticated` | `auth.uid() = id` |
| `profiles` | INSERT | `authenticated` | `auth.uid() = id` |
| `profiles` | UPDATE | `authenticated` | `auth.uid() = id` (trigger blocks role changes) |
| `profiles` | DELETE | `authenticated` | `auth.uid() = id` |
| `submissions` | SELECT | `authenticated` | `auth.uid() = user_id` |
| `submissions` | INSERT | `authenticated` | `auth.uid() = user_id` |
| `submissions` | UPDATE | `authenticated` | `auth.uid() = user_id` |
| `submissions` | DELETE | `authenticated` | `auth.uid() = user_id` |
| `detection_results` | SELECT | `authenticated` | Submissions link matches `auth.uid()` |
| `detection_results` | INSERT | `authenticated` | Submissions link matches `auth.uid()` |
| `detection_results` | UPDATE | `authenticated` | Submissions link matches `auth.uid()` |
| `detection_results` | DELETE | `authenticated` | Submissions link matches `auth.uid()` |
| `audit_logs` | ALL | Ordinary users | **DENIED** (No policies; insert via service role only) |
| `organizations` | SELECT | `authenticated`, `anon` | `true` (Public read-only) |
| `scam_reports` | INSERT | `authenticated` | `auth.uid() = user_id` |
| `page_feedback` | INSERT | `authenticated`, `anon` | `true` |

---

## 5. Migration & Down-Migration Procedure

All migrations are maintained in `supabase/migrations/` as numbered SQL files.

### 5.1 Applying Migrations (Up)
Execute in exact numerical order in the Supabase SQL Editor:
1. `supabase/migrations/0001_enums_tables.sql`
   - Enables `uuid-ossp` and `pg_trgm`.
   - Creates all enums and tables (`profiles`, `submissions`, `detection_results`, `audit_logs`, `organizations`, etc.).
2. `supabase/migrations/0002_rls_functions.sql`
   - Enables RLS across all tables.
   - Deploys user isolation policies and role protection triggers.
   - Installs RPC functions: `handle_new_user`, `protect_profile_role_update`, `check_reported_entities`, `submit_scam_report`, `submit_page_feedback`.
3. `supabase/migrations/0003_seed_organizations.sql`
   - Seeds ≈44 trusted organizations and apex portals (`needs_team_review = true` and `demo-verified.jaanch.ai`).

### 5.2 Rolling Back Migrations (Down)
Execute in reverse numerical order:
1. `supabase/migrations/0003_seed_organizations.down.sql`
   - Removes seeded organization rows.
2. `supabase/migrations/0002_rls_functions.down.sql`
   - Drops triggers, trigger functions, and security definer RPC functions.
3. `supabase/migrations/0001_enums_tables.down.sql`
   - Drops all tables and enums using `CASCADE`.

### 5.3 Git Rollback
If a clean repository rollback to Phase 3 is required:
```bash
git reset --hard phase-3-done
```

---

## 6. Reserved Schema & Future Evolution Tables

The following 8 tables declared in `supabase/migrations/0001_enums_tables.sql` are **reserved for future phases** and are not yet wired into production server routes:

1. `analyses` (historical offer analysis runs; current system persists via `submissions` and `detection_results`)
2. `analysis_signals` (normalized relational signals per analysis)
3. `analysis_unknowns` (normalized unverified items per analysis)
4. `checklist_items` (user portal verification checklist items)
5. `analysis_checks` (individual sub-check run results)
6. `link_checks` (persisted link analysis history)
7. `recruiter_challenges` (generated challenge emails audit log)
8. `scam_reports` (individual scam incident reports; currently managed via `intel_records`)

These tables are preserved in migrations with complete down-migration scripts for forward compatibility without incurring schema migration debt.


