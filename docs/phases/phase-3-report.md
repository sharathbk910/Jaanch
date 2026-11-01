# Phase 3 – Server API Report

**Phase:** Phase 3 – Server API  
**Date:** 2026-11-01  
**Status:** PASS  

---

## 1. Objectives & Deliverables Built

### Express Server Architecture (`server/src/`)
1. **Application Factory (`server/src/app.ts`):**
   - Configures strict security middleware stack: Request ID (`X-Request-Id`), Helmet with API-strict CSP (`default-src 'none'`), CORS restricted to `CLIENT_ORIGINS`, Pino HTTP logger with redaction, strict JSON content-type validation, 256 KB JSON body limit, rate limiters, route handlers, 404 handler, and central error handler.
   - Clean export for `supertest` testing and direct execution.
2. **Environment Validation (`server/src/config/env.ts`):**
   - Zod-validated configuration for `PORT` (8080), `CLIENT_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `REPORT_HASH_PEPPER` (≥ 24 characters), `GEMINI_API_KEY` (optional), `GEMINI_MODEL`, `ENABLE_THIRD_PARTY_CHECKS` (default false), and rate-limit parameters.
   - **Production Startup Invariant:** When `NODE_ENV === 'production'`, missing pepper, pepper shorter than 24 chars, or default placeholder pepper throws an exception and refuses to start.
3. **Safe Outbound HTTP (`server/src/lib/safeFetch.ts`):**
   - Built on `undici` with pinned resolved IP via custom lookup agent to prevent DNS rebinding (TOCTOU attacks).
   - Rejects loopback (`127.0.0.0/8`, `::1`), RFC 1918 private (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), cloud metadata (`169.254.169.254`, `fe80::/10`), CGNAT (`100.64.0.0/10`), unspecified (`0.0.0.0`), multicast/reserved, and IPv4-mapped IPv6.
   - Strictly enforces HTTPS only (`BLOCKED_PROTOCOL`).
   - Re-validates every redirect hop.
   - Timeouts and max-bytes enforcement.
   - **Server Invariant:** The server NEVER fetches URLs found in user messages.
4. **Pino Logger (`server/src/lib/logger.ts`):**
   - Configured with strict redaction paths: `req.headers.authorization`, `req.headers.cookie`, `req.body`, `body`, `text`, `rawText`, `*.password`, `*.token`, `*.secret`, `*.pepper`.
   - Guarantees zero student text or PII in logs.
5. **Rate Limiting (`server/src/middleware/rateLimiter.ts`):**
   - Built on `express-rate-limit` behind a store interface abstraction (`RateLimitStoreProvider`, in-memory now, ready for Redis/persistence in Phase 11).
   - Per-IP rate limiting per route returning standardized JSON 429 response.
6. **Authentication Interface (`server/src/middleware/auth.ts`):**
   - Defines `authenticate` middleware interface.
   - Returns 401 Unauthorized until Phase 4 supplies the Supabase JWT implementation.
7. **Central Error Handler (`server/src/middleware/errorHandler.ts`):**
   - Handles malformed JSON (400), payload limit > 256 KB (413), CORS rejection (403), SSRF/SafeFetch errors (400), and internal errors (500).
   - **Zero Stack Leaks:** Stack traces and sensitive credentials never leak to clients.

### API Routes Implemented
- `GET /api/health`: Healthcheck returning uptime, ISO timestamp, semantic version (`1.0.0`).
- `GET /api/history`: Authenticated route returning 401 Unauthorized pending Phase 4.
- `POST /api/analyze`: Zod-validated endpoint running shared deterministic rules. Optional Gemini signal only if consent + key (server-side, redacted input, schema-validated, labelled "AI-observed", can never change the status).
- `POST /api/link-check`: Lookalike + structural checks + RDAP domain age via `safeFetch` to RDAP service. Failure yields status `"unknown"`, never `"pass"`. Returns 3-level risk enum (`HIGH_RISK`, `NEEDS_VERIFICATION`, `NO_MAJOR_WARNING_SIGNS`) with `observed` vs `unverified` arrays.
- `GET /api/resources`: Official government portals (AICTE, NSP, NCS, UGC, Cybercrime) and helplines (1930, 1915).
- `POST /api/feedback` & `POST /api/feedback/page`: User and page feedback collection endpoints.
- `POST /api/analyses/:id/official-listing`: Feature-flagged stub per spec line 130.
- `POST /api/reports/lookup`: Entity threat lookup stub ready for Phase 4 database.

---

## 2. Test Suites (`server/src/__tests__/`)

1. **`api.test.ts` (20 tests):**
   - `GET /api/health` 200 metadata & request ID.
   - `GET /api/history` 401 unauthorized.
   - `POST /api/analyze` input validation (empty body, text < 20 chars, unsupported content-type 415, oversized payload 413).
   - `POST /api/analyze` rule execution (legitimate invite, upfront fee, Hinglish fee, Kannada fee, vague offer).
   - `POST /api/link-check` 3-level risk enum, lookalike detection, shorteners, raw IP, punycode.
   - Security headers (API strict CSP `default-src 'none'`), CORS allowlist enforcement, per-IP rate limiting (429).
2. **`safeFetch.test.ts` (14 tests):**
   - Blocked IP ranges: loopback (`127.0.0.1`), RFC 1918 private (`10.0.0.1`, `172.16.0.1`, `192.168.0.1`), metadata (`169.254.169.254`), CGNAT (`100.64.0.1`), unspecified, multicast, IPv6 equivalents (`::1`, `fe80::1`, `fc00::1`), IPv4-mapped IPv6.
   - Routable public IPs allowed (`8.8.8.8`, `1.1.1.1`).
   - Strict HTTPS only (rejects HTTP, FTP, file).
   - Localhost and internal domain rejection.
   - Anti-rebinding with pinned resolved IP.
   - Redirect-to-private IP hop rejection.
3. **`invariants.test.ts` (8 tests):**
   - **Invariant 1:** AI observation can NEVER change offer verification status.
   - **Invariant 2:** `CONFIRMED_SCAM` is unreachable from text input alone.
   - **Invariant 3:** The server NEVER fetches URLs found in user messages.
   - **Invariant 4:** Zero secrets in any API response or log.
   - **Invariant 5:** Production refusal on missing or placeholder `REPORT_HASH_PEPPER`.

---

## 3. Real Verification Results

| Check / Verification | Target | Result | Status |
|---|---|---|---|
| Server Tests (`npm test -w server`) | 3 suites, 42 tests | 42 / 42 passed (1.42s) | **PASS** |
| All Workspace Tests (`npm test`) | 11 suites, 123 tests | 123 / 123 passed (1.75s) | **PASS** |
| Corpus Fixture Eval (`npm run eval`) | 25 corpus fixtures | 25 / 25 passed (100.0% accuracy) | **PASS** |
| TypeScript Typecheck (`npm run typecheck`) | Strict mode across shared, server, client | 0 errors | **PASS** |
| Linter & Security Scanners (`npm run lint`) | No secrets, no hardcoded colors, no banned phrases | 0 violations | **PASS** |
| Manual Curl Proof (`scripts/curl-runner.mjs`) | Real HTTP responses from running server | All 6 endpoints verified with headers & JSON | **PASS** |

---

## 4. Exit Status
All requirements for Phase 3 – Server API are fulfilled and verified.
