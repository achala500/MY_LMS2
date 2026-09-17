# Handoff Report — survey_explorer_planner_build_1

## 1. Observation
1. **TypeScript Compiler (`npx tsc --noEmit`):**
   - Command: `npx tsc --noEmit`
   - Exit code: 1
   - Observed errors:
     ```
     src/app/id-card/page.tsx(507,32): error TS2322: Type 'MemberData | null' is not assignable to type 'MemberIdCardData'.
       Type 'null' is not assignable to type 'MemberIdCardData'.
     src/app/id-card/page.tsx(513,56): error TS2345: Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'.
       Type 'null' is not assignable to type 'WalletMemberPayload'.
     src/app/id-card/page.tsx(521,53): error TS2345: Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'.
       Type 'null' is not assignable to type 'WalletMemberPayload'.
     ```
   - No other files in the entire project have TypeScript compilation errors.
2. **Automated Test Suites (`npm test`):**
   - Command: `npm test`
   - Exit code: 0
   - Summary: 602 tests passed across 102 suites (0 failed, 0 cancelled, 0 skipped, duration 31.7s).
   - Tiers 1 through 5 are 100% green.
3. **Production Build (`npm run build`):**
   - Command: `npm run build`
   - Exit code: 1
   - Failed at Next.js type checking step with:
     `./src/app/id-card/page.tsx:507:32 Type error: Type 'MemberData | null' is not assignable to type 'MemberIdCardData'.`
4. **Calendar Page (`src/app/calendar/page.tsx`):**
   - Log ingestion: lines 489-498 call `localDb.getLogs()` directly, aggregating study logs across all students in the database rather than the authenticated student.
   - Multi-session parsing: Only checks legacy flat properties `hoursSubject1..3`, omitting session-based records in `log.sessions` and `log.subjects`.
   - Rest/Recovery gauge: Lines 513-514 use a naive calculation (`calculatedSleep = Math.max(5.5, Math.min(8.5, 24 - dailyStudyAvg - 10))`) despite `computeCognitiveFatigue` already existing in `src/lib/analytics/dataEngineering.ts`.
   - Countdown initialization: Line 388 hardcodes `'2026'` (`getExamCountdown('2026')`) instead of respecting `member?.examYear`.
   - Direct localStorage: Line 585 still invokes `localStorage.setItem('studysync_weekly_goal_hours', String(newGoal))`.
5. **Codebase-Wide `localStorage` Usage:**
   - 25+ direct `localStorage` and `sessionStorage` calls remain across `calendar`, `daily`, `tests`, `subjects`, `AuthContext`, `ScholarAvatarStudioModal`, `GoogleStudyCalendar`, `api.ts`, `calendar.ts`, `security.ts`, `biometrics.ts`, and `passwords.ts`.
   - An enterprise-grade fallback wrapper exists at `src/lib/storage/safeStorage.ts` ready for adoption.

## 2. Logic Chain
1. `npx tsc --noEmit` and `npm run build` both fail at the exact same location: lines 507, 513, and 521 in `src/app/id-card/page.tsx`. In that file, `member` is typed as `MemberData | null` from `useAuth()`. The offline pass logic introduced `effectiveMember = member || offlinePass`, but lines 507, 513, and 521 in the Apple Wallet modal still passed `member` to `<AppleWalletCard member={member} />` and `downloadAppleWalletPass(member)`.
2. Because `next.config.mjs` has `typescript: { ignoreBuildErrors: false }`, Next.js aborts `next build` on any type error. Resolving the `effectiveMember` guard in `src/app/id-card/page.tsx` will immediately clear all 3 compiler errors and unblock `npm run build`.
3. The calendar page (`src/app/calendar/page.tsx`) needs to display an authentic representation of the student's study momentum. Calling `localDb.getLogs()` without filtering by student ID causes data cross-contamination between students. Switching to `localDb.getStudentLogs(member?.studyId || '', member?.email || '')` and parsing `log.sessions` ensures multi-session data is correctly credited to stream subjects.
4. The fatigue and recovery engine in `src/lib/analytics/dataEngineering.ts` (`computeCognitiveFatigue`) was previously built with multi-factor weighting (focus, productivity, weekly volume vs 42h threshold, and streak pressure). Wiring this into `CalendarPage`'s Sleep & Rest Gauge will elevate the UI to a genuine cognitive burnout diagnostic tool.
5. Migrating remaining `localStorage` and `sessionStorage` calls to `safeStorage` and `safeSessionStorage` will guarantee zero-crash execution across iOS Safari Private Browsing, Brave Shields, and embedded WebViews.

## 3. Caveats
- `src/components/calendar/GoogleStudyCalendar.tsx` is an extensive, feature-rich component (Month/Week/Day views, drag-and-drop, subject color picker, Jitsi rooms), but it is currently unmounted by `src/app/calendar/page.tsx`. Any enhancements requested for `/calendar` should target `src/app/calendar/page.tsx` directly unless the product direction explicitly calls for integrating `GoogleStudyCalendar.tsx`.
- Legacy files `src/js/api.js` and `src/js/state.js` contain direct `localStorage` calls. These files are legacy vanilla JS artifacts preserved for backend contract reference; modifying them is unnecessary since the Next.js app operates entirely on `src/lib/api.ts` and `src/context/AuthContext.tsx`.

## 4. Conclusion
1. The codebase is remarkably healthy: `npm test` is **100% green** (602/602 passing across 102 suites).
2. The static build and TypeScript compilation are blocked **solely by 3 localized lines** in `src/app/id-card/page.tsx`. Fixing these 3 lines will restore zero-defect `tsc` and `npm run build` compliance immediately.
3. The dynamic weekly planner in `src/app/calendar/page.tsx` requires:
   - Student-scoped log querying (`localDb.getStudentLogs`)
   - Multi-session parsing (`log.sessions` / `log.subjects`)
   - Dynamic subject targets scaled by `weeklyGoalHours`
   - Integration with `computeCognitiveFatigue` for real burnout/sleep diagnostics
   - Dynamic `member.examYear` in exam sprint milestones
   - Migration of line 585 to `safeStorage`
4. Codebase-wide migration from direct `localStorage` to `safeStorage` is well-scoped across 11 files.

## 5. Verification Method
1. Run `npx tsc --noEmit` to verify TypeScript static analysis.
2. Run `npm test` to verify no regressions in the automated test suite.
3. Run `npm run build` to verify clean production static export into `out/`.
4. Inspect `src/app/calendar/page.tsx` to verify:
   - `localDb.getStudentLogs` is used.
   - `computeCognitiveFatigue` drives the Sleep & Rest Gauge.
   - `member?.examYear` is reflected in `getExamCountdown`.
   - `safeStorage.setItem` is used for `studysync_weekly_goal_hours`.
