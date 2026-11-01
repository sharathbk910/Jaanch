# JAANCH – Project State

## 1. Project Overview
- **Project Name:** Jaanch (Student Offer Verification & Trust Safety Platform)
- **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Indian Students)
- **Current Phase:** Phase 1 – Workspace, Spec Files, Root Tooling
- **Current Tag:** `phase-1-done` (pending commit)
- **Node Version:** v24.19.0 (LTS >= 20 required)
- **Repository State:** Initialized clean-room monorepo

---

## 2. Workspaces & Tooling Status
- **Root:**
  - npm workspaces configured: `shared`, `server`, `client`.
  - Scripts: `dev`, `build`, `test`, `typecheck`, `lint`, `eval`, `check:no-secrets`, `check:colors`, `check:banned-phrases`, `test:acceptance`.
- **Workspaces:**
  - `@jaanch/shared`: Minimal typed skeleton with `JAANCH_VERSION`.
  - `@jaanch/server`: Minimal typed skeleton referencing `@jaanch/shared`.
  - `@jaanch/client`: Minimal typed skeleton referencing `@jaanch/shared`.
- **Security & Linters:**
  - `check-no-secrets.cjs`: Operational, checks client files for server keys and JWT patterns.
  - `check-no-hardcoded-colors.mjs`: Operational, scans client TSX files for `#hex`, `rgb/rgba/hsl`, and arbitrary Tailwind values (exempts `tokens.css`).
  - `check-banned-phrases.cjs`: Operational, checks client/server/shared against `banned-phrases.json` with empty allowlist.
  - `test-acceptance.mjs`: Operational, reports on 10 core criteria honestly (`NOT_YET_IMPLEMENTED` in Phase 1).

---

## 3. Specification & Documentation Authority
- `docs/SPEC_ORIGINAL.md`: Primary specification, verbatim prompt authority, read-only.
- `docs/SPEC_ADDENDUM.md`: Approved architecture additions and locked decisions.
- `docs/ACCEPTANCE_CRITERIA.md`: 10 core UX and structural criteria defined.
- `docs/TRACEABILITY.md`: Traceability matrix mapping requirements to phases.
- `docs/spec/SPEC_PACK.md`: Full specification pack (Parts A–G).
- `docs/reference/`: Reference UI mockups and design assets.

---

## 4. Phase 1 Verification Checklist
- [x] Node >= 20 verified (`v24.19.0`)
- [x] `git init` completed
- [x] `.gitignore` ignores `node_modules`, `dist`, `coverage`, `.env*` (preserves `.env.example`)
- [x] `.editorconfig` configured (UTF-8, LF, 2 spaces)
- [x] Root `package.json` with 3 workspaces and standard dev/build/test/typecheck/lint scripts
- [x] Workspace skeletons compile cleanly (`npm run build`, `npm run typecheck`)
- [x] Root security and linter scripts created and tested
- [x] Unit tests in `scripts/__tests__` verify failure on violations and pass on clean files
- [x] Acceptance test harness reports 10 criteria honestly
- [x] `.env.example` templates created for server and client without real values

---

## 5. Next Steps
- Commit Phase 1 files.
- Tag repository: `phase-1-done`.
- Proceed to **Phase 2 – Shared Foundation (Pure TypeScript)**: Zod schemas, status enums, policy configurations, text segmentation, and entity models.
