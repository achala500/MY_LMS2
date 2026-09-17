# Phase 0 Codebase Survey Handoff Report

## 1. Observation
- Inspected the entire StudySync project codebase across `src/js/`, `src/css/`, `backend/`, `server/`, `tests/`, `index.html`, `verify.html`, `firebase.json`, and `package.json`.
- Identified all 9 active API endpoints in `src/js/api.js` (`checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`, `verifyMember`, `updateProfile`, `adminUpdateMember`, `getAdminData`, `getAnalytics`, `ping`).
- Observed the strict protocol requirement in `src/js/api.js` (lines 40–55) and `backend/Code.gs` (lines 121–135): All requests to `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec` must use `POST` with `Content-Type: text/plain;charset=utf-8` to bypass Google CORS preflight restrictions and 302 redirects.
- Observed the 3-sheet database structure in `backend/Code.gs`: `Members` (10 columns, unique lowercased email key in Column C, unique Study ID in Column A), `DailyLogs` (19 columns, composite key `[Study ID, Date of Study]`), and `Analytics` (KPI block and 14-column leaderboard).
- Observed the Apple Wallet ID Card Canvas 2D engine in `src/js/idcard.js`: base dimensions $480 \times 302\text{ px}$, high-resolution 3x export $1440 \times 906\text{ px}$ at 300 DPI, with gold EMV chip, metallic gradients (Bio vs Maths), scannable QR code box, and microtext security ribbons.
- Observed the pure JS QR Code engine in `src/js/qr.js`: Galois Field $GF(256)$ arithmetic, Reed-Solomon polynomial division, Model 2 byte mode, encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`.
- Observed the 306 Sri Lankan school autocomplete dataset in `src/js/schools.js` across all 9 provinces and 25 districts with custom school fallback.
- Observed the dual 1–10 slider engine in `src/js/slider.js` with 4 qualitative score tiers (Distracted 1–3, Moderate 4–6, High 7–8, Deep Flow 9–10).
- Observed the client-side canvas compression pipeline in `src/js/utils.js`: JPEG quality 0.75, max 1600px bounding box, target size $< 400\text{ KB}$.
- Observed the super admin whitelist security in `src/js/views/adminView.js` (`alwisachalaanurada@gmail.com`, `admin@studysync.lk`, `lead.organizer@gmail.com`, `studysync.admin@gmail.com`) with a styled 403 Forbidden screen.

## 2. Logic Chain
1. The project must be rebuilt into a modern Next.js 14 App Router application with TypeScript, Tailwind CSS, and shadcn/ui components (`ORIGINAL_REQUEST.md`).
2. Firebase Hosting serves static assets; therefore, Next.js must be configured with `output: 'export'` to generate a static export in `out/`, and `firebase.json` must be updated to `"public": "out"`.
3. Because the build is purely static (`output: 'export'`), server actions and dynamic Node.js server routes are unavailable; all data fetching, authentication state management, and Canvas rendering must execute purely client-side with `'use client'`.
4. The live Google Apps Script backend (`Code.gs`) cannot be altered and strictly expects `Content-Type: text/plain;charset=utf-8` for POST payloads. The Next.js API client must maintain this exact header and JSON stringification contract.
5. All 27 inventory features mapped across M1–M6 (Landing, Google Auth, Sequential ID Allocation, Daily Form, 1–10 Dual Sliders, Apple Wallet ID Pass Canvas + 3x PNG Download, Personal Stats Bento, Searchable History Table, Super Admin Directorate, Standalone Public Verification, Toast Engine, and Image Compression) can be cleanly mapped onto shadcn/ui primitives (`Button`, `Card`, `Command`, `Dialog`, `Table`, `Tabs`, `Badge`, `Progress`, `Select`, `Input`, `Toaster`).

## 3. Caveats
- Google Apps Script web apps have a cold-start execution delay (typically 1.5–3.5s). The Next.js client must maintain client-side loading spinners and optimistic UI updates.
- Firebase Auth in a static Next.js export requires standard client-side Firebase JS SDK (v10 modular `firebase/app`, `firebase/auth`).
- `backend/` and `tests/` directories must remain untouched during the rebuild.

## 4. Conclusion
The codebase survey is complete. The system architecture, API contracts, mathematical algorithms, rendering parameters, database schemas, and edge case rules have been comprehensively documented in `.agents/teamwork_preview_explorer_survey_1/survey_codebase.md`. The project is fully prepared for Phase 1 architectural setup and subsequent milestone implementations.

## 5. Verification Method
- Inspect the survey document at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_survey_1\survey_codebase.md`.
- Run mock server via `node server/mock-server.js` and verify endpoint responses.
- Run `npm test` to verify current test harness execution.
