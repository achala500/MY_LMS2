# Orchestrator Plan — StudySync Redesign & Visual Routes Alignment

## Objective
Fulfill the authoritative user request at `.agents/ORIGINAL_REQUEST.md § 2026-09-12T05:06:22Z`:
- R1: Exact Design Tokens & Scoped Liquid Glass Chrome (Nav restored on `/`, tokens #0F1114/#F3F3F0, #17191D/#FFFFFF, #C24942/#9E2F29, #5FAE74/#2F7A45, borders rgba 0.08, zero external colors, editorial serif for measurements, sans for labels).
- R2: Landing Page Visual Route Showcase (Header: VISUAL ROUTES · PREMIUM WITHOUT THE PRODUCT-TEMPLATE FEEL, Headline: A learning space with a point of view, Subtitle, 3 distinct route cards: 01 The Atelier, 02 The Reading Room, 03 The Studio Index, retaining exam countdown, Google Auth/Study ID login, student verification).
- R3: Core Accountability Surfaces (Dashboard streak/hours/balance/next action, Daily Log friction-free entry & override, Calendar Month/Week/Day + DnD + .ics export, Tests & AI single composite Z-score headline, 300 DPI ID Card with ISO/IEC 18004 QR).
- R4: Security & Functional Bug Remediation (/admin Firebase auth + role checks redirecting unauthenticated, Admin 7-day study volume date mapping fix, Tests & AI single headline Z-score, AI 35-hour stream-balanced algorithm).
- R5: Full Verification & Deployment (100% pass on npm test [423/423], 100% pass on node tests/e2e-runner.js [469/469 across Tiers 1-5], clean static export npm run build to `out/`, deploy to Firebase Hosting).

## Execution Strategy
1. **Phase 0: Survey**:
   - Spawn 3 parallel Explorers:
     - `explorer_frontend_ui_1`: Inspect UI tokens, layout, navbar suppression removal on `/`, liquid glass scope, and landing page visual route cards.
     - `explorer_backend_sec_1`: Inspect `/admin` auth & role gates, admin 7-day study volume date mapping, Tests & AI dual Z-score harmonization, and AI timetable 35h allocation.
     - `explorer_test_triage_1`: Inspect existing unit test suite (`npm test`), E2E test suite (`tests/e2e-runner.js`), build config, and identify any failing tests or blockers.
2. **Phase 1: Feature Inventory & Decomposition**:
   - Aggregate explorer reports into `PROJECT.md`.
   - Organize into focused milestones.
3. **Phase 2: Milestone Iteration Loop**:
   - For each milestone: Explorer(s) -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor (1) -> Gate.
4. **Phase 3: Final Verification & Firebase Deployment**:
   - Run 100% automated test suite (423/423 unit, 469/469 E2E).
   - Verify `npm run build` static export.
   - Run Firebase deployment verification.
   - Deliver handoff and completion message.
