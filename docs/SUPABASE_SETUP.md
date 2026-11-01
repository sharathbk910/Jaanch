# JAANCH – Supabase Setup & Operations Guide (Human Gate H1)

This guide provides step-by-step instructions for initializing, configuring, and operating the Supabase PostgreSQL database and authentication infrastructure for **Jaanch**.

---

## 1. Project Creation

1. Log into your [Supabase Dashboard](https://app.supabase.com) and click **New Project**.
2. Set **Project Name** to `Jaanch` (or your preferred identifier).
3. Set a strong database password and choose your preferred region (e.g. `ap-south-1` Mumbai).
4. Wait for the project initialization to complete.
5. In **Project Settings** > **API**, note your:
   - **Project URL** (`SUPABASE_URL`)
   - **anon / public key** (`SUPABASE_ANON_KEY`)

> [!CAUTION]
> Never copy or use the `service_role` secret in client or runtime API request handling.
> Authoritative Decision D11 dictates that the server strictly enforces RLS using the user's JWT with the anon key.

---

## 2. Execute SQL Migrations in Order

Navigate to the **SQL Editor** in the Supabase Dashboard. Execute the three migration scripts in exact numerical order:

### Step 1: Run `0001_enums_tables.sql`
- Creates all 12 enumerated types.
- Enables `uuid-ossp` and `pg_trgm` extensions.
- Instantiates all 13 core tables with constraints and indexes.
- Path: [supabase/migrations/0001_enums_tables.sql](file:///c:/Code Meet/Jaanch AI/supabase/migrations/0001_enums_tables.sql)

### Step 2: Run `0002_rls_functions.sql`
- Enables Row Level Security (RLS) across all tables.
- Establishes user data isolation policies.
- Deploys the four security-definer RPC functions:
  - `handle_new_user()` (auth user trigger)
  - `check_reported_entities(p_hashes)` (threat lookup)
  - `submit_scam_report(...)` (atomic reporting and aggregation)
  - `submit_page_feedback(...)`
- Path: [supabase/migrations/0002_rls_functions.sql](file:///c:/Code Meet/Jaanch AI/supabase/migrations/0002_rls_functions.sql)

### Step 3: Run `0003_seed_organizations.sql`
- Seeds ≈ 40 widely impersonated companies, IT services, banks, and apex government education portals.
- Enforces Decision D10: Every seeded row has `needs_team_review = true`.
- Includes the clearly labelled demo row (`demo-verified.jaanch.ai`).
- Path: [supabase/migrations/0003_seed_organizations.sql](file:///c:/Code Meet/Jaanch AI/supabase/migrations/0003_seed_organizations.sql)

---

## 3. Authentication Configuration

Navigate to **Authentication** in the Supabase Dashboard:

### 3.1 Providers
1. **Email Provider:** Enable Email provider.
   - *Local Dev Tip:* Under **Auth** > **Providers** > **Email**, toggle **Confirm email** to `OFF` during local testing to immediately authenticate test accounts without sending real emails.
2. **Google OAuth Provider (Optional):**
   - Enable Google provider.
   - Supply Client ID and Client Secret from your Google Cloud Console.

### 3.2 URL Configuration
Under **Authentication** > **URL Configuration**:
- **Site URL:** Set to `http://localhost:5173` (or production domain).
- **Redirect URLs:** Add:
  - `http://localhost:5173/**`
  - `http://localhost:5173/history`
  - `http://localhost:5173/settings`
  - `https://your-production-app.vercel.app/**`

---

## 4. Environment Configuration (`.env`)

Create your local `.env` files from the provided `.env.example` templates:

### In `server/.env`:
```bash
NODE_ENV=development
PORT=8080
CLIENT_ORIGINS=http://localhost:5173
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>

# Generate a cryptographically secure pepper (min 24 characters)
REPORT_HASH_PEPPER=your-secure-random-pepper-at-least-24-chars-long
```

### In `client/.env`:
```bash
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 5. Threat Intelligence Moderation Workflow

When an indicator is investigated and confirmed fraudulent by a human moderator:

1. Generate the salted entity hash using the local CLI utility:
   ```bash
   node scripts/hashEntity.mjs domain scam-portal-fake-tcs.net
   ```
2. The script outputs the normalized hash and the confirmation SQL snippet:
   ```sql
   UPDATE reported_entities
   SET status = 'confirmed',
       notes = 'Confirmed fraudulent by moderator review',
       confirmed_at = now()
   WHERE value_hash = '<calculated-hash>';
   ```
3. Run this query in the Supabase SQL editor.
4. Once elevated to `confirmed`, offers containing this indicator will evaluate to `CONFIRMED_SCAM` via the `check_reported_entities` RPC function.

