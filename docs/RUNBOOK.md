# JAANCH – Operational & Deployment Runbook

> [!IMPORTANT]
> **Primary Security Invariants:**
> 1. **Never commit `.env` files or secret values** to Git, logs, or client-side bundles.
> 2. **Never use the Supabase Service-Role Key in the runtime application.** Runtime request handling must strictly use the anonymous key (`SUPABASE_ANON_KEY`) and stateless JWT verification with Row Level Security (RLS).
> 3. **The Salt Pepper (`REPORT_HASH_PEPPER`)** must be at least 24 cryptographically secure random characters and must remain uniform to preserve threat indicator lookup hashes.

---

## 1. System Prerequisites

Before configuring Jaanch on a new machine or deployment environment, verify:
- **Node.js**: `v20.0.0` or higher (verified with Node LTS `v20.x` through `v24.x`).
- **npm**: `v10.0.0` or higher.
- **Git**: `v2.40` or higher (configured for LF line endings).
- **PostgreSQL Database with Supabase**:
  - Required PostgreSQL extensions: `pgcrypto`, `pg_trgm`, `vector` (pgvector).
- **Optional API Keys**:
  - Google Gemini API (`GEMINI_API_KEY`) for semantic vector embeddings and AI explanations.

---

## 2. Local Setup from Scratch

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd "Jaanch AI"

# Install pinned dependencies across all workspaces (shared, server, client)
npm ci
```

### Step 2: Environment Configuration
Create the local `.env` files using the committed `.env.example` templates:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Edit `server/.env`:
- Set `REPORT_HASH_PEPPER` to a secure random string ($\ge 24$ characters).
- Configure your Supabase project URL and anonymous key:
  ```env
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOi...
  ```

Edit `client/.env`:
- Set the API backend base URL and matching Supabase anon credentials:
  ```env
  VITE_API_BASE_URL=http://localhost:8080/api
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
  ```

### Step 3: Database Schema Migrations & Seeding
Execute the SQL migrations in numerical order against your PostgreSQL / Supabase database:

1. `supabase/migrations/0001_initial_schema.sql` (Tables, enums, RLS policies)
2. `supabase/migrations/0002_verification_and_rules.sql` (Verification functions & rules)
3. `supabase/migrations/0003_seed_organizations.sql` (Verified Indian institutions seed)
4. `supabase/migrations/0004_shared_intel.sql` (Threat intelligence & moderation tables)
5. `supabase/migrations/0005_ai_ml_vector_similarity.sql` (`pg_trgm`, `pgvector`, HNSW indexes)

### Step 4: Bootstrap an Initial Moderator
To test or perform moderation actions on threat records:
```bash
npx tsx scripts/bootstrap-moderator.ts user@example.com
```

### Step 5: Start Local Development Stack
```bash
npm run dev
```
- **Backend API Server:** `http://localhost:8080` (health: `http://localhost:8080/api/health`)
- **Frontend SPA Client:** `http://localhost:5173`

---

## 3. Operational Health & Diagnostic Runbook

Execute the diagnostic and smoke tools to verify operational readiness:

### 1. Run the Environment Doctor
```bash
npm run doctor
```
Verifies:
- Node.js runtime version ($\ge 20.0.0$).
- Presence of all required environment variable names (without printing values).
- Absence of forbidden service-role keys.
- Minimum length of `REPORT_HASH_PEPPER`.
- Network reachability of Supabase and `/api/health`.

### 2. Run the Production Smoke Test
```bash
npm run smoke
```
Verifies live API behavior against running or ephemeral test instances:
- `GET /api/health`: 200 OK
- `GET /api/config`: 200 OK (anon config only)
- `POST /api/analyze`: Genuine offer classified as `LIKELY_GENUINE`
- `POST /api/analyze`: Upfront fee scam classified as `HIGH_CONCERN`
- `POST /api/analyze`: OTP phishing scam classified as `HIGH_CONCERN`
- `POST /api/link-check`: Typosquatting lookalike classified as `HIGH_RISK`

### 3. Full Verification & Quality Suite
```bash
# Run all 41 test suites
npm test

# Run deterministic 25-fixture evaluation
npm run eval

# Run ML & similarity threshold calibration
npm run eval:ml

# Run repo security and integrity scanners
npm run check:no-secrets
npm run check:colors
npm run check:banned-phrases
npm run check:glyphs

# Run acceptance criteria harness
npm run test:acceptance

# Run end-to-end scenario verification
npm run verify:scenarios

# Full monorepo build
npm run build
```

---

## 4. Production Cloud Deployment

### A. Client Deployment: Vercel (SPA)

The React client is packaged as a static Single Page Application (SPA).

1. **Vercel Project Setup:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or `client/`)
   - **Build Command:** `npm run build -w client`
   - **Output Directory:** `client/dist`
2. **SPA Routing Rewrites (`vercel.json`):**
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "cleanUrls": true,
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
         ]
       }
     ]
   }
   ```
3. **Environment Variables on Vercel:**
   | Variable | Description | Example |
   |---|---|---|
   | `VITE_API_BASE_URL` | Backend Express API base URL | `https://api.jaanch.ai/api` |
   | `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Public Supabase anon key | `eyJhbGciOi...` |

---

### B. Server Deployment: Render (Node.js Service)

The Express backend can be deployed via Render Web Service using `render.yaml`.

1. **Deploy via Render Blueprint (`render.yaml`):**
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npm run build -w shared && npm run build -w server`
   - **Start Command:** `npm run start -w server`
   - **Health Check Path:** `/api/health`
2. **Environment Variables on Render:**
   | Variable | Required | Default / Description |
   |---|---|---|
   | `NODE_ENV` | Yes | `production` |
   | `PORT` | Yes | `10000` (Render default) |
   | `CLIENT_ORIGINS` | Yes | Comma-separated allowed frontend origins (e.g. `https://jaanch.vercel.app`) |
   | `SUPABASE_URL` | Yes | `https://xyz.supabase.co` |
   | `SUPABASE_ANON_KEY` | Yes | Public anon key for JWT auth verification |
   | `REPORT_HASH_PEPPER` | Yes | Secret salt pepper ($\ge 24$ chars) |
   | `GEMINI_API_KEY` | No | Optional key for Gemini semantic embeddings |
   | `GEMINI_MODEL` | No | `gemini-2.5-flash` |
   | `LOG_LEVEL` | No | `info` |
   | `RDAP_BASE_URL` | No | `https://rdap.org` |
   | `RDAP_TIMEOUT_MS` | No | `5000` |

---

### C. Containerized Deployment: Docker

A production multi-stage `Dockerfile` is provided at the repository root.

```bash
# Build the production image
docker build -t jaanch-server:latest -f Dockerfile .

# Run the container with environment variables
docker run -d \
  --name jaanch-server \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e CLIENT_ORIGINS="https://jaanch.vercel.app" \
  -e SUPABASE_URL="https://xyz.supabase.co" \
  -e SUPABASE_ANON_KEY="eyJhbGci..." \
  -e REPORT_HASH_PEPPER="your-secret-pepper-minimum-24-chars-long" \
  jaanch-server:latest
```

---

## 5. Security & Redirect URL Configuration Checklist

### CORS (`CLIENT_ORIGINS`)
Ensure `CLIENT_ORIGINS` on the server exactly matches your frontend URLs:
```env
CLIENT_ORIGINS=https://jaanch.vercel.app,https://jaanch.ai
```

### Supabase Auth Redirect URLs
In Supabase Dashboard $\to$ Authentication $\to$ URL Configuration:
- **Site URL:** `https://jaanch.vercel.app` (or custom domain)
- **Redirect URLs:**
  - `https://jaanch.vercel.app/history`
  - `https://jaanch.vercel.app/login`
  - `http://localhost:5173/history` (for local development)

---

## 6. Incident Management & Rollback Runbook

### Code Rollback
If a defect is identified post-deployment:
```bash
# To rollback to a verified release tag:
git checkout phase-10-done

# Or hard reset working branch:
git reset --hard phase-10-done
npm ci
npm run build
```

### Database Migration Rollback
Each migration file has an accompanying down-migration script:
- `0005_ai_ml_vector_similarity.down.sql`
- `0004_shared_intel.down.sql`
- `0003_seed_organizations.down.sql`
- `0002_verification_and_rules.down.sql`
- `0001_initial_schema.down.sql`

Execute the appropriate `.down.sql` script via the Supabase SQL editor or CLI to revert the migration.

### Compromised Secret Rotation
If an API key is inadvertently exposed:
1. **Supabase Anon Key:** Rotate in the Supabase Dashboard $\to$ Settings $\to$ API, update `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`.
2. **Gemini API Key:** Revoke in Google AI Studio, generate a new key, and update `GEMINI_API_KEY` on Render.
3. **Report Hash Pepper:**
   - *Caution:* Rotating `REPORT_HASH_PEPPER` invalidates prior threat indicator lookup hashes.
   - If rotated, run a re-hashing migration on `intel_indicators(value_hash)` using the new pepper.

