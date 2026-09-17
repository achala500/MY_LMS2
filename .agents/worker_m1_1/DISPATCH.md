# DISPATCH — worker_m1_1

You are the Implementation Worker for **Milestone 1: Offline Digital Pass & Route Mirroring**.
Your working directory: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_m1_1`

## Mandatory Reading
1. `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md` (under `## 2026-09-17T03:27:09Z`)
2. `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\survey_explorer_pass_1\report.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Omni Master Directives
- Follow Apple HIG layout hierarchy, clean typography, Material Design 3 tokens.
- Strict palette preservation: Keep existing light card surfaces (#fef8f4, #ffffff), dark contours & typography (#19202e, #1d1b19), and accents (#c85a32, #fcd34d, #fa7268, #456644, #fb923c).
- Fluid spring physics and tactile micro-interactions with zero layout shifts.
- Accidental Data Loss Prevention: STOP AND VERIFY before running destructive commands. Never delete, drop, or truncate without explicit consent.

## Exclusive File Ownership
You have exclusive write access to:
- `src/app/id-card/page.tsx`
- `src/app/pass/page.tsx`
- `src/components/layout/Header.tsx`
- `src/app/globals.css`
- `src/lib/walletPass.ts`
- `public/sw.js`
- `firebase.json`

DO NOT modify files outside this set.

## Tasks
1. **TypeScript Compilation Fix in `src/app/id-card/page.tsx`**:
   - Replace `member` with `effectiveMember` (guarded by `if (effectiveMember)`) at lines 507, 513, and 521.
   - In `copyVerificationLink` (line 129), use `effectiveMember?.studyId || 'STUDY-2026'`.
2. **Resilient Multi-Source Offline Pass Caching in `src/app/id-card/page.tsx`**:
   - Initialize `offlinePass` with cascading checks: `safeStorage.getJson('studysync_offline_pass', null)` -> fallback to `safeStorage.getJson('studysync_member', null)`.
   - When `effectiveMember` is present, cache it automatically via `safeStorage.setJson('studysync_offline_pass', effectiveMember)`.
   - In `totalHours` calculation, fallback to `effectiveMember?.totalHoursLogged || effectiveMember?.totalHours || 0` when `logs` is empty.
3. **Direct 3x PNG Download CTA in `src/app/id-card/page.tsx`**:
   - Add a "Download Card Image (3x PNG)" button on the main action toolbar that invokes `IdCard.downloadPass(effectiveMember, 3)` directly with a toast notification.
4. **Route Mirroring & Navigation Symmetry**:
   - Verify `src/app/pass/page.tsx` renders `DigitalStudentPassPage`.
   - In `src/components/layout/Header.tsx`, ensure "Student Pass" active pill highlights on both `/id-card` and `/pass` routes (`pathname === '/id-card' || pathname === '/pass'`).
   - In `firebase.json`, add rewrite rule for `/pass/**` -> `/id-card.html`.
5. **Print Styles**:
   - In `src/app/globals.css`, add `@media print` rules hiding `header, footer, nav, aside, .print-hidden` and setting body/main background to `#ffffff`.
6. **Service Worker Offline Cache**:
   - In `public/sw.js`, add `cache.put()` on successful 200 GET responses so offline navigation and reload serve cached pages properly.
7. **Wallet Pass Barcode URL**:
   - In `src/lib/walletPass.ts`, ensure `verifyUrl` uses `/verify.html?id=` and provide safe defaults for optional fields.
8. **Verification**:
   - Run `npx tsc --noEmit` and verify 0 errors.
   - Run `npm test` and verify 100% pass (602+ tests).
   - Write full findings, changed files, and test output to `handoff.md`.
