# JAANCH – Requirements Traceability Matrix

> [!NOTE]
> `docs/SPEC_ORIGINAL.md` is currently marked as **UNVERIFIED** pending verbatim specification input from the user.
> This traceability matrix maps the current numbered sections and protocol items present in `docs/SPEC_ORIGINAL.md` to project phases and statuses.

---

## 1. Operating Contract & Safety Protocol

| Section Number | Requirement Summary | Target Phase | Status |
|---|---|---|---|
| **0.1** | Mission: Complete Jaanch web application, working one phase at a time | All Phases | In Progress |
| **0.2** | Spec references: Later instructions take precedence, conservative decisions recorded | All Phases | Active |
| **0.3.1** | Git safety: Clean initial commit, work on branch | Phase 1 | **DONE** |
| **0.3.2** | Local commit only: No unauthorized push, merge, or remote modification | All Phases | Active |
| **0.3.3** | Zero secret commits: Ignore `.env`, commit only `.env.example`, no message logging | Phase 1 | **DONE** |
| **0.3.4** | Branch guard / hook check | Phase 1 | **DONE** |
| **0.3.5** | Cross-platform compatibility: Node scripts, LF attributes | Phase 1 | **DONE** |
| **0.3.6** | Dependency management: Pin stable dependencies, verify peer dependencies | Phase 1 | **DONE** |
| **0.4.1** | Phase gate: Note phase-start commit | All Phases | Active |
| **0.4.2** | Test-first implementation: Tests written alongside implementation | All Phases | Active |
| **0.4.3** | Cumulative verification: All linters, typechecks, and tests green at phase end | All Phases | Active |
| **0.4.4** | Phase reports: Record what was built, commands, PASS/FAIL criteria | All Phases | Active |
| **0.4.5** | State tracking: Update `docs/STATE.md` and commit with conventional commit message | All Phases | Active |
| **0.4.6** | Rollback on failure: Reset to phase-start commit if critical errors occur | All Phases | Active |
| **0.4.7** | Zero stubs: No placeholder mocks or visual-only implementations | All Phases | Active |
| **0.7.H0** | Human Gate H0: Confirm machine, Node >= 20, Git setup | Phase 1 | **DONE** |
| **0.7.H1** | Human Gate H1: Database setup & user auth verification | Phase 4 | Pending |
| **0.7.H2** | Human Gate H2: Review final runbook, smoke tests, and deploy readiness | Phase 11 | Pending |

---

## 2. Implementation Phases & Milestones

| Phase | Milestone Name | Key Deliverables | Status |
|---|---|---|---|
| **Phase 1** | Workspace & Tooling | Monorepo structure, root scripts, linters, security scanners, acceptance test harness, spec records | **DONE** |
| **Phase 2** | Shared Core | Zod schemas, 8 core detection rules, PII redaction, entity extraction, lookalike link heuristics, status determination, 25 test fixtures | Pending |
| **Phase 3** | Server API | Express server architecture, request validation, rate limits, health checks, error handling | Pending |
| **Phase 4** | Database & Auth | Supabase PostgreSQL schema, RLS policies, Express JWT verification, peppered entity hashing | Pending |
| **Phase 5** | Client Foundation | Vite React structure, editorial CSS design tokens, client API service, routing, local state | Pending |
| **Phase 6A** | UI – Landing Page | Hero section, official portal notices, how-it-works cards, student guidelines | Pending |
| **Phase 6B** | UI – Analyzer | Offer text input, file upload with in-browser extraction, sample chips, consent toggles | Pending |
| **Phase 6C** | UI – Results & PDF | Verdict banner, why bullets, next steps panel, compact PDF generation (≤ 4 pages) | Pending |
| **Phase 6D** | UI – Auth & History | User login/signup, saved checks, history filters, account data deletion | Pending |
| **Phase 7** | Shared Intelligence & Moderation | Scam reports submission, moderator confirmation workflows, indicator matching | Pending |
| **Phase 8** | AI / ML Layer | Optional Gemini integration, schema grounding, graceful fallbacks | Pending |
| **Phase 9** | WhatsApp Integration | Pre-formatted sharing intents with confirmed threat indicators only (no auto-send) | Pending |
| **Phase 10** | Verification & QA | End-to-end evaluation, accessibility auditing (WCAG AA), responsive testing (360px+) | Pending |
| **Phase 11** | Deployment & Runbook | Production build verification, deploy configuration, doctor script, final runbook | Pending |

---

## 3. Environment & Configuration Specifications

| Requirement Reference | Description | Status |
|---|---|---|
| **Appendix A.1** | Server environment variables template (`server/.env.example`) | **DONE** |
| **Appendix A.2** | Client environment variables template (`client/.env.example`) | **DONE** |
| **Appendix B.1** | Platform & cross-OS safety | **DONE** |
| **Appendix B.2** | Specification ambiguity resolution (conservative precedence) | **DONE** |
| **Appendix B.3** | Zero secret leakage guarantee | **DONE** |
