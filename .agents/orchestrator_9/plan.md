# Plan — StudySync Stabilization & Production Verification

## Overview
Stabilize the StudySync Sri Lankan A/L Portal with offline digital pass verification, live camera QR scanning, dynamic weekly planner sync with real session logs, and rigorous zero-defect build verification (`tsc`, `npm test`, `npm run build`).

## Acceptance Criteria
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run build` completes successfully with clean static page generation.
- [ ] `npm test` passes 100% across all tiers without regressions.
- [ ] Camera QR scanner operates smoothly in live video feed and photo upload fallback modes.
- [ ] `/pass` route mirrors the official digital student pass and caches credentials for offline access.
- [ ] Admin submission review workflow moves approved student logs to the "Reviewed Archive" view.
- [ ] Weekly planner metrics reflect real recorded study hours from `localDb.getLogs()`.

## Phase 0: Parallel Survey & Codebase Audit
Spawn 3 specialized Explorers to conduct deep technical investigations without code modification:
1. **survey_explorer_pass**: Inspect `/pass`, `/id-card`, pass components, `safeStorage` integration, offline caching behavior, QR rendering, and print/wallet export.
2. **survey_explorer_scanner**: Inspect `/verify`, `/admin`, `jsqr` usage, camera video stream handling, canvas decoding, photo upload fallback, candidate verification flow, and submission archival in `safeStorage`.
3. **survey_explorer_planner_build**: Inspect `/calendar`, `localDb.getLogs()`, subject distributions, recovery gauges, exam sprint milestones, direct `localStorage` usage across the codebase, existing TypeScript compiler errors (`tsc --noEmit`), test suites (`npm test`), and build status (`npm run build`).

## Phase 1: Synthesis & Milestone Refinement
Synthesize survey reports into actionable implementation packages:
- **Milestone 1**: Offline Digital Pass & Route Mirroring (`/pass`, `/id-card`, `safeStorage`)
- **Milestone 2**: Camera QR Code Scanner & Admittance Verification (`/verify`, `/admin`, `jsqr`, archival)
- **Milestone 3**: Dynamic Weekly Planner & Syllabi Balance Sync (`/calendar`, `localDb.getLogs()`, `safeStorage`)
- **Milestone 4**: Complete Zero-Defect Build & Automated Test Suite Verification (`tsc`, `npm test`, `npm run build`)

## Phase 2: Milestone Iteration Loops
For each milestone:
1. Dispatch Worker with Explorer findings, explicit file boundaries, and integrity warning.
2. Dispatch 2 independent Reviewers.
3. Dispatch 2 independent Challengers for stress/boundary testing.
4. Dispatch Forensic Auditor (`teamwork_preview_auditor`) for integrity verification.
5. Evaluate gate in `GATE_STATUS.md` (unanimous APPROVE + CLEAN audit required).

## Phase 3: Final Verification & Sentinel Handoff
Verify all 7 acceptance criteria, produce complete handoff report, and send completion message to Sentinel.
