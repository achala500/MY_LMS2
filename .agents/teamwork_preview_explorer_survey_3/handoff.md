# Phase 0 Architecture & Tech Stack Survey — Handoff Report

## 1. Observation

Direct observations from the environment and codebase investigation:
- **Node.js Environment**: Node.js `v25.2.0` and npm `11.6.2` installed on Windows (`run_command` output: `v25.2.0`, `11.6.2`).
- **Existing `package.json`**: Located at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\package.json`, configured with `"type": "module"`, scripts `"test": "node --test tests/*.test.js"`, `"test:e2e": "node tests/e2e-runner.js"`, dependencies `"cors": "^2.8.5"` and `"express": "^4.19.2"`.
- **Existing Test Suite**: Located at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\tests\e2e-runner.js`. Executing `node tests/e2e-runner.js` ran 327 tests across Tiers 1-5 (Tier 1: 135, Tier 2: 135, Tier 3: 28, Tier 4: 5, Tier 5: 24) with 327 passed, 0 failed in 0.08s.
- **Backend & Database Contracts**: `backend/Code.gs` and `server/mock-server.js` implement 7 authoritative endpoints (`checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`, `verifyMember`, `getAdminData`, `getAnalytics`). All live API requests target `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec` using HTTP POST with `Content-Type: text/plain;charset=utf-8` to spreadsheet `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`.
- **Firebase Auth Setup**: `index.html` lines 48-63 load Firebase v10 compat SDK scripts (`https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js` and `firebase-auth-compat.js`) initializing project `studysync-al-2026` (`apiKey: AIzaSyAjK2y49ia3YnDY3L1bMhwasAQGRikvAHA`, `authDomain: studysync-al-2026.firebaseapp.com`).
- **Firebase Hosting Configuration**: `firebase.json` lines 1-53 specify `"public": "."` with rewrites for `/verify/**` and `**`.

## 2. Logic Chain

1. **Static Export Feasibility (Obs 1, 2, 6)**: Since Firebase Hosting serves static assets and the backend API is an external Google Apps Script endpoint, configuring Next.js 14 App Router with `output: 'export'` and `distDir: 'out'` will output clean HTML/JS/CSS to `out/`. Pointing `firebase.json`'s `"public"` to `"out"` preserves zero-downtime Firebase Hosting deployments.
2. **Auth Integration Strategy (Obs 5)**: In Next.js App Router static export, loading Firebase compat SDK v10 in `src/app/layout.tsx` via `<Script strategy="beforeInteractive">` ensures `window.firebase` is initialized before client hydration, allowing `AuthContext` to attach `onAuthStateChanged` listeners for persistent Google authentication without bundle size overhead.
3. **Component Architecture (Obs 4, 6)**: The 6 views (`landing`, `register`, `dashboard`, `dailyForm`, `admin`, `verify`) map cleanly to shadcn/ui primitives (`button`, `card`, `dialog`, `table`, `tabs`, `command`, `popover`, `select`, `input`, `textarea`, `progress`, `badge`, `sonner`, `avatar`, `skeleton`) and Lucide icons.
4. **School Autocomplete & Form Dynamics (Obs 4)**: The 270+ Sri Lankan schools dataset from `src/js/schools.js` integrates into shadcn's `Command` combobox with popover filtering, and stream selection dynamically limits the daily log form to the 3 registered stream subjects.
5. **Canvas 2D Porting (Obs 4)**: The Apple Wallet ID pass renderer (`src/js/idcard.js`) and QR matrix generator (`src/js/qr.js`) rely solely on standard HTML5 Canvas 2D APIs and pure math, allowing direct conversion into React client components with 3D tilt hover and 3x PNG export (`1440x906px`).
6. **Zero Regression Guarantee (Obs 3, 4)**: Preserving `tests/` and `backend/` untouched guarantees that the existing 327 E2E tests continue to validate core business logic, domain rules, and sheet column schemas throughout migration.

## 3. Caveats

- In Next.js 14 static export, pages utilizing `useSearchParams()` (specifically `src/app/verify/page.tsx` for `?id=...` parameter lookup) must be wrapped inside a React `<Suspense>` boundary to avoid Next.js build compilation bailout.
- `images: { unoptimized: true }` must be explicitly declared in `next.config.mjs` since static hosting lacks the dynamic Node.js image optimization service.
- The Google Sign-In popup requires valid OAuth authorized domains (`localhost`, `127.0.0.1`, and `studysync-al-2026.firebaseapp.com` / `studysync-al-2026.web.app`). The local direct email modal must be retained as a resilient fallback.

## 4. Conclusion

The technical survey establishes a complete, non-breaking roadmap for rebuilding StudySync into a Next.js 14 App Router application with TypeScript, Tailwind CSS, and shadcn/ui. The static export model perfectly aligns with Firebase Hosting requirements, keeps all live Apps Script and Firebase Auth contracts functional, and provides a modern, maintainable component foundation.

Detailed architecture specifications, component inventories, directory layouts, and phased roadmaps are documented in `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_survey_3\architecture_survey.md`.

## 5. Verification Method

To independently verify the survey findings and baseline test integrity:
1. Run the existing master test runner:
   ```bash
   node tests/e2e-runner.js
   ```
   (Verify that 327/327 tests pass across Tiers 1-5).
2. Inspect the architectural survey document:
   ```bash
   view_file c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_survey_3\architecture_survey.md
   ```
3. Invalidation Conditions: Any modification that alters the Apps Script POST payload format (`Content-Type: text/plain;charset=utf-8`), breaks the 327 regression test suite, or introduces dynamic server-side runtime dependencies incompatible with `output: 'export'`.
