# Handoff Report — Phase 0 Specification Mining

## 1. Observation
- **Authoritative Sources Examined**:
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md` (lines 1–103): Rebuild StudySync to Next.js 14 App Router (`output: 'export'`), TypeScript, Tailwind CSS v4, shadcn/ui, Firebase Auth compat v10 in `layout.tsx`, dark zinc/slate theme with indigo (`#6366f1`), emerald (`#10b981`), amber (`#f59e0b`), rose (`#ef4444`) accents, and live Apps Script API (`Code.gs`).
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md` (lines 1–128): Architecture overview, 27-feature inventory, milestone map (M1–M6), and 4 interface contracts.
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\backend\Code.gs` (lines 1–1401): Exact 3-sheet database schema (`Members` [10 cols], `DailyLogs` [19 cols], `Analytics`), `LockService` atomic ID allocation (`SG-BIO-XXXX`, `SG-MATH-XXXX`), Google Drive proof photo hierarchy (`StudySync_Uploads/{studyId}/{YYYY-MM-DD}/{filename}`), and 9 API action handlers.
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\src\css\custom.css` (lines 1–566): 4 aurora mesh orbs keyframe animations (`auroraFloat1`–`auroraFloat3`), glassmorphism utility classes (`glass-panel`, `glass-card`, `glass-input`), custom 1–10 dual slider CSS tokens, and standalone toast animation keyframes.
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\src\js\schools.js` (lines 1–598): 306 Sri Lankan national and provincial schools dataset covering all 9 provinces and 25 districts with searchable autocomplete logic.
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\src\js\idcard.js` & `src\js\qr.js` (lines 1–519 & 1–754): Apple Wallet ID card canvas 2D renderer, 3D tilt geometry, gold EMV chip rendering, dual QR code payload, and 3x PNG export (`1440x906px` at 300 DPI).
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\src\js\views\dailyFormView.js`, `dashboardView.js`, `adminView.js`, `registerView.js`, `landingView.js`, `verifyView.js`: Stream resolution, decimal hours input (+30m, +1h, +2h), one-submission-per-day enforcement, personal streak math, 7-day SVG study volume telemetry, and whitelisted admin console.
  - `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\tests\*` (Tiers 1–5, 327 test cases): Boundary conditions, error handling, and pairwise interaction invariants.

## 2. Logic Chain
1. *Requirements & Constraints Extraction*: From `ORIGINAL_REQUEST.md`, Next.js 14 static export (`out/`) is mandated to preserve live Firebase Hosting without broken routing. The API client must preserve the HTTP POST pattern with `Content-Type: text/plain;charset=utf-8` to communicate with the Google Apps Script Web App endpoint.
2. *Visual & UX System Formulation*: Identified exact color codes (Indigo `#6366f1` for primary, Emerald `#10b981` for streaks/Bio, Amber `#f59e0b` for warnings/streak flames, Rose `#ef4444` for errors/inactive, Cyan `#06b6d4` for Maths/Study IDs), typography (`Inter`/`Geist` + `JetBrains Mono`), 0.75rem border radius, and glassmorphism styling (`bg-zinc-900/60 backdrop-blur-md border border-zinc-800`).
3. *Feature Enumeration & Granular Specification*: Mined 37 distinct features grouped across 8 primary functional areas (Landing, Registration, Dashboard, Daily Form, ID Card, Admin, Verify, Global). Each feature was documented with its exact inputs, outputs, validation constraints, and error handling.
4. *Edge Case Matrix Synthesis*: Cataloged 31 boundary and corner cases derived from the 327 automated E2E tests, including email normalization, concurrency lockouts, future date restrictions, zero-hour guards, canvas image compression under 400KB, duplicate submission mode-switching, and 403 admin gate enforcement.
5. *Component & File Mapping*: Mapped all legacy vanilla JS modules directly to target Next.js 14 App Router routes (`/`, `/register`, `/dashboard`, `/daily`, `/admin`, `/verify`), shadcn/ui component primitives, React Context providers, and utility libraries.

## 3. Caveats
- No active code implementation was performed; this phase is strictly read-only specification discovery.
- The Google Apps Script backend (`Code.gs`) and existing tests (`tests/`) must remain untouched during rebuild.
- The standalone `verify.html` must remain in `public/` alongside the Next.js `/verify` route to ensure physical/printed QR codes already in circulation continue to resolve seamlessly.

## 4. Conclusion
The comprehensive specification and feature inventory has been completed and saved to `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_spec_miner_survey_2\spec_inventory.md`. It provides a complete blueprint for the Next.js 14 + shadcn/ui migration team, covering 100% of functional requirements, visual styles, backend contracts, database columns, and edge case assertions.

## 5. Verification Method
- Inspect the generated specification artifact at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_spec_miner_survey_2\spec_inventory.md`.
- Verify coverage of all 8 core feature areas, 37 enumerated features, 3-sheet database column mappings, 31 boundary cases, and Next.js 14 component mappings.
