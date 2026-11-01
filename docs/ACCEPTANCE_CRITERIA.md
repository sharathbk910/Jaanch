# JAANCH – Core Acceptance Criteria

This document defines the 10 core UX and structural acceptance criteria referenced throughout the specification and verified by the acceptance test harness (`scripts/test-acceptance.mjs`).

---

## 1. CRIT-01: Hero Section & Official Portal Notice
- **Requirement:** The landing page hero must display the primary title, descriptive value proposition for Indian students, clear primary Call-to-Action ("Analyze Opportunity"), and an informative official portals safety banner.
- **Verification Rule:**
  - Heading clearly identifies the tool purpose: deterministic offer verification.
  - Primary button initiates user flow to `/analyze`.
  - Mentions official verification portals (e.g. AICTE, National Scholarship Portal, UGC, cybercrime.gov.in).

## 2. CRIT-02: Sticky Navigation with Zero Overlap
- **Requirement:** The header/navbar remains sticky at the top of the viewport during scrolling without obstructing or overlapping underlying page content.
- **Verification Rule:**
  - Header has `position: sticky` / `top: 0` with high z-index and opaque background.
  - Page content container includes adequate top padding (`pt-16` / `pt-20` or equivalent token) to prevent clipping first elements.
  - Navigation anchors (`#how-it-works`, `#guidelines`, etc.) scroll with appropriate scroll-margin-top.

## 3. CRIT-03: Language Switch (EN / HI / KN)
- **Requirement:** Full tri-lingual UI chrome supporting English (`en`), Hindi (`hi`), and Kannada (`kn`).
- **Verification Rule:**
  - Switcher accessible in navbar and footer.
  - Switching immediately updates all visible UI chrome labels and text without requiring page reload.
  - Persisted in localStorage and sets root `<html lang="...">` attribute.

## 4. CRIT-04: Three Test Scenarios (Sample Chips)
- **Requirement:** One-click sample test scenarios available on the Analyze page to allow immediate evaluation of representative offers.
- **Verification Rule:**
  - **Scenario A (High Risk):** Internship demanding upfront registration fee / deposit + personal UPI.
  - **Scenario B (Unverified / Needs Review):** Polished startup offer with unofficial communication channels or missing listing.
  - **Scenario C (Official / Genuine-Style):** Complete offer with matching company domain, transparent compensation, and verified contacts.
  - Clicking a sample auto-populates the input text and relevant sender metadata.

## 5. CRIT-05: 25-Character Minimum Input Validation
- **Requirement:** The analysis engine enforces a minimum text length (`INPUT_LIMITS.textMin = 20` or form threshold 25 characters) to ensure sufficient context for analysis.
- **Verification Rule:**
  - Submitting text shorter than the minimum threshold disables the primary button or displays an inline error message.
  - Visual character counter shows current length vs requirement.
  - Whitespace-only input is rejected.

## 6. CRIT-06: Results Layout & Information Architecture
- **Requirement:** Structured single-column results page communicating status, reasons, and prioritized actions without confusing probabilistic scores.
- **Verification Rule:**
  - Status banner prominently shows one of the 5 verification statuses (`VERIFIED_OFFICIAL`, `LIKELY_GENUINE`, `NEEDS_REVIEW`, `HIGH_RISK`, `CONFIRMED_SCAM`).
  - Non-dismissible payment alert appears if any fee/UPI signal is detected.
  - Independent checks coverage meter indicates exact ratio (`k of 8 independent checks completed`).
  - Clear "Why this status" evidence bullets and prioritized next steps panel ("Jaanch checked", "Your turn", "Protect yourself").

## 7. CRIT-07: PDF Export ≤ 4 Pages with ≥ 75% Page Fill
- **Requirement:** Exported PDF evidence report is compact, cleanly structured, and avoids unnecessary blank space or orphaned titles.
- **Verification Rule:**
  - Total page count is between 1 and 4 pages for any standard analysis report.
  - Average page content fill is ≥ 75% on filled pages, with no single-line orphan trailing pages.
  - Section headers use `minPresenceAhead` and `keepWithNext` so they never appear isolated at the bottom of a page.
  - Proper currency symbol (`₹`) and multi-script fallback support.

## 8. CRIT-08: Design Token Compliance (Zero Hardcoded Colors)
- **Requirement:** All UI styling strictly consumes designated CSS design tokens. No inline hex colors, raw RGB/HSL, or arbitrary Tailwind values.
- **Verification Rule:**
  - Scanned via `scripts/check-no-hardcoded-colors.mjs`.
  - Zero `#hex`, `rgb(...)`, `rgba(...)`, `hsl(...)`, or `[#...]` in `client/src/**/*.{ts,tsx}`.
  - Exempts `tokens.css` where tokens are defined.

## 9. CRIT-09: Responsive Design (360px to 1920px)
- **Requirement:** Flawless usability and visual hierarchy across viewport widths from small mobile screens (360px) to ultra-wide displays (1920px).
- **Verification Rule:**
  - Zero horizontal overflow or scrollbar at 360px, 375px, 768px, 1024px, 1440px.
  - Touch targets meet WCAG 2.2 AA minimum dimensions (≥ 44x44px).
  - Mobile bottom sheet / responsive navigation drawer for smaller viewports.

## 10. CRIT-10: Bundle Security (Zero Secrets in Bundle)
- **Requirement:** Zero backend secrets, API keys, service-role keys, or server-side AI packages in client bundle or source.
- **Verification Rule:**
  - Scanned via `scripts/check-no-secrets.cjs`.
  - Zero occurrences of `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REPORT_HASH_PEPPER`, `SAFE_BROWSING_API_KEY`, `@google/genai`, or JWT secret patterns.
