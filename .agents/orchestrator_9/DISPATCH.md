# DISPATCH

## 2026-09-17T03:28:15Z

You are the PROJECT ORCHESTRATOR for StudySync Sri Lankan A/L Portal.
Working directory: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\orchestrator_9`
Project root directory: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`

Authoritative request from `.agents/ORIGINAL_REQUEST.md` (specifically under `## 2026-09-17T03:27:09Z`):
- R1. Offline Digital Pass & Route Mirroring:
  - Deploy full offline pass caching and seamless route symmetry for `/pass` and `/id-card`.
  - Ensure student credentials, verified state, and QR identity load immediately via `safeStorage` without requiring internet connectivity.
  - Preserve print and wallet export options.

- R2. Camera QR Code Scanner & Admittance Verification:
  - Provide live camera scanning and photo upload QR decoding using `jsqr` across administrative and public verification routes (`/verify` and `/admin`).
  - Enable one-tap candidate verification and automatic archival for reviewed submissions into `safeStorage`.

- R3. Dynamic Weekly Planner & Syllabi Balance Sync:
  - Connect `/calendar` to real session logs (`localDb.getLogs()`) to compute dynamic subject distributions, rest/recovery gauges, and exam sprint milestones.
  - Replace any remaining direct `localStorage` calls with resilient `safeStorage`.

- R4. Complete Zero-Defect Build & Test Suite Verification:
  - Resolve all TypeScript compilation issues (`npx tsc --noEmit` must exit with 0 errors).
  - Ensure 100% test pass rate across all tiers (`npm test`).
  - Produce a clean, fully hydrated static production export (`npm run build`).

Acceptance Criteria:
- [ ] `npx tsc --noEmit` exits with status code 0.
- [ ] `npm run build` completes successfully with clean static page generation.
- [ ] All test suites in `npm test` pass with 100% success rate without regressions.
- [ ] Camera QR scanner operates smoothly in both live video feed and photo upload fallback modes.
- [ ] `/pass` route mirrors the official digital student pass and caches credentials for offline access.
- [ ] Admin submission review workflow moves approved student logs to the "Reviewed Archive" view.
- [ ] Weekly planner metrics reflect real recorded study hours from `localDb.getLogs()`.

## 2026-09-17T03:32:54Z

DIRECTIVE UPDATE FROM PARENT / SENTINEL:
1. Omni Design Standards (`C:\Users\alwis\.gemini\antigravity\skills\Omni`):
   - Strict palette preservation: Keep existing light card surfaces (#fef8f4, #ffffff), dark contours & typography (#19202e, #1d1b19), and accents (#c85a32, #fcd34d, #fa7268, #456644, #fb923c).
   - Follow Apple HIG layout hierarchy, clean typography, and Material Design 3 tokens.
   - Fluid spring physics and tactile micro-interactions with zero layout shifts.
2. Accidental Data Loss Prevention (`C:\Users\alwis\.gemini\config\skills\accidental-data-loss-prevention\SKILL.md`):
   - STOP AND VERIFY before running any destructive commands or modifying production data. Never delete, drop, or truncate without explicit consent. Preserve backup repositories.
3. Backend & Full-System Architecture:
   - Ensure real backend/localDb synchronization works reliably without unhandled Firebase Auth race conditions or unhandled rejections during hydration.
   - Ensure all storage access is routed through safeStorage with in-memory fallback for private browsing.
   - Maintain 0 TypeScript static analysis errors (`npx tsc --noEmit`), pass automated tests (`npm test`), and verify clean static build export (`npm run build`).

