## 2026-08-26T09:44:43Z

You are a Worker implementing Milestone 2: Data Layer, Auth & API Client.
Your working directory is: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_worker_m2`
Project root: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
Must read:
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\sub_orch_m2\SCOPE.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m2_1\plan_api.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m2_2\plan_auth.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m2_3\plan_utils.md`

Exclusive Write Ownership:
- `src/types/api.ts`, `src/types/member.ts`, `src/types/logs.ts`, `src/types/auth.ts`
- `src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/schools.ts`, `src/lib/utils.ts`, `src/lib/constants.ts`
- `src/context/AuthContext.tsx`, `src/context/AppContext.tsx`
- `src/app/not-found.tsx`
- `src/app/layout.tsx` (wrap providers around children)
Note: Do NOT modify existing `backend/` or `tests/` directories.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implementation Tasks:
1. Implement `src/types/api.ts`, `src/types/member.ts`, `src/types/logs.ts`.
2. Implement `src/lib/constants.ts` (Apps Script URL, Spreadsheet ID, Firebase config, stream subjects, admin emails).
3. Implement `src/lib/schools.ts` (306 Sri Lankan schools with search/filter helpers).
4. Implement `src/lib/utils.ts` (cn, canvas image downscaling, streak math, stream subject rules, date helpers, CSV exporter).
5. Implement `src/lib/api.ts` (`ApiClient` with all 9 methods using HTTP POST `Content-Type: text/plain;charset=utf-8` to Google Apps Script).
6. Implement `src/lib/auth.ts` and `src/context/AuthContext.tsx` (Firebase Google Sign-In, direct email login, persistence, admin detection for `alwisachalaanurada@gmail.com`).
7. Implement `src/context/AppContext.tsx` (global state for current member, logs history, today's status, refresh actions).
8. Implement `src/app/not-found.tsx` (custom dark theme 404 page).
9. Update `src/app/layout.tsx` to wrap children with `AuthProvider` and `AppProvider`.
10. Run `npm run build` or `npx next build` to verify clean static export with zero TypeScript errors.
11. Run `node tests/e2e-runner.js` to ensure all 327 tests pass.
12. Write a comprehensive handoff report at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_worker_m2\handoff.md` and report back.
