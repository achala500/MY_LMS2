# Handoff Report: survey_explorer_backend_sec

## 1. Observation

This investigation directly examined the codebase across security boundaries, telemetry pipelines, mathematical models, scheduling algorithms, and student accountability surfaces.

In `src/app/admin/page.tsx` line 86, the component reads authentication state using `const { user, member, loading: authLoading, isAdmin } = useAuth()`. Authorization is evaluated on lines 203 to 207 based on `isAdmin`, `member?.role === 'admin'`, `ADMIN_EMAILS`, and `authorizedAdmins`. On lines 935 to 945, when `authLoading` finishes, the check `if (!user || !isAuthorized)` immediately renders a static 403 Forbidden screen with the text "Your account (Guest) does not have administrator privileges to access the StudySync Admin Console". The router is never invoked to redirect unauthenticated visitors to sign in. In contrast, the predecessor implementation in `src/js/views/adminView.js` lines 77 to 83 immediately redirected unauthenticated users with `window.location.hash = '#landing'` and issued an informative notification.

In `src/app/admin/page.tsx` lines 247 to 277, the 7-day study volume calculation iterates backward through seven days using `const dateStr = d.toISOString().substring(0, 10)`. It filters `logsList` using `String(logDate).startsWith(dateStr)`. In Sri Lanka time (UTC+5:30), `d.toISOString()` shifts backward by one day between midnight and 05:30. In `backend/Code.gs` lines 1494 to 1502 and line 2027, `dateOfStudy` values originate from Google Sheets cells and are processed by `formatDateValue`. In `src/components/dashboard/StudyTrendChart.tsx` lines 36 to 77, date strings are normalized using `normalizeDateToYmd` to account for `DD/MM/YYYY`, `YYYY-MM-DD`, and Date objects, whereas `admin/page.tsx` performs an unnormalized string prefix comparison. Furthermore, on lines 261 to 267 of `admin/page.tsx`, hours are aggregated using `subs[0]?.hours ?? l.subject1Hours ?? 0`, omitting session sums from `l.sessions` and the alternative property name `hoursSubject1`.

In `src/app/tests/page.tsx` lines 143 to 146, `calculateCompositeZScore(streamSubjects, testMarks)` computes the composite score using the Bayesian shrinkage model defined in `src/lib/analytics/dataEngineering.ts` lines 124 to 148 and lines 254 to 286. In `src/components/tests/TestAnalyticsTrends.tsx` lines 39 to 46, the score is rendered to four decimal places (`forecast.compositeZScore.toFixed(4)`) alongside a range. In `src/components/ai/WhatIfSimulator.tsx` lines 18 to 20 and lines 89 to 90, a second number is computed using `(baseForecast.compositeZScore + (studyHoursDelta * 0.02) + (targetScoreLift * 0.035)).toFixed(2)` and rendered under the headline "Estimated Z-Score", presenting two conflicting headlines on the same page.

In `src/lib/calendar.ts` line 166, `generateSmartAiWeeklySchedule` declares `targetWeeklyHours = 35`. However, summing the twenty-one slot entries defined in lines 176 to 210 yields 7.0 hours on Monday through Friday (35.0h), 7.5 hours on Saturday, and 6.0 hours on Sunday, which totals 48.5 hours per week rather than 35.0 hours.

In `src/app/dashboard/page.tsx`, `src/app/daily/page.tsx`, `src/app/calendar/page.tsx`, and `src/app/id-card/page.tsx`, the five core accountability surfaces were inspected. The daily logger provides dynamic multi-session logging with real-time automatic summation and manual override capability. The calendar provides month, week, and day views with past study history overlays, drag-and-drop rescheduling, and RFC 5545 export. The digital ID card generates an ISO/IEC 18004 compliant QR code encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID` and exports at 1440 by 906 pixels (3x scale, 300 DPI).

Automated test suites were executed. Running `npm test` passed 423 of 423 tests across 73 test suites in 25.9 seconds. Running `node tests/e2e-runner.js` passed 469 of 469 tests across all five tiers in 0.15 seconds.

## 2. Logic Chain

From the direct observation of lines 935 to 945 in `src/app/admin/page.tsx`, an unauthenticated visitor with `!user` receives the 403 Access Denied screen instead of being routed to the sign-in surface. By introducing a reactive redirection effect that triggers `router.replace('/?redirect=/admin&signin=1')` whenever `!authLoading && !user`, unauthenticated visitors will be guided directly to authentication, and student records remain fully protected.

From the direct observation of `d.toISOString().substring(0, 10)` and `String(logDate).startsWith(dateStr)` in `admin/page.tsx`, the 0h volume bug occurs because UTC conversion causes an off-by-one day drift against local Sri Lankan study dates, non-ISO formatted date strings fail the prefix comparison, and multi-session hours are omitted. Adopting the date normalization helper `normalizeDateToYmd` alongside local calendar date arithmetic (`new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - i)`) and full session aggregation resolves the mismatch, allowing active study dates to populate the daily volume chart accurately.

From the direct observation of `TestAnalyticsTrends.tsx` and `WhatIfSimulator.tsx`, displaying both a raw four-decimal score and a two-decimal simulated score under the heading "Estimated Z-Score" generates conflicting visual signals. Establishing a single authoritative headline at the top of the Tests page (`Estimated A/L Composite Z-Score: +1.85`) and renaming the simulator output to "Projected Scenario Outcome" harmonizes the numbers while preserving interactive exploration. Framing AI recommendations as direct actionable operations ("Ask about this topic", "Turn this into notes", "Schedule revision session") delivers structured guidance without floating orbs or conversational bubbles.

From the direct arithmetic summation of slots in `calendar.ts`, the hardcoded schedule totals 48.5 hours. Reallocating the schedule into 5.0 hours per day across seven days yields exactly 35.0 hours per week, with 12.0 hours for Subject 0 and 11.5 hours each for Subjects 1 and 2, achieving stream balance and preventing learner fatigue.

From the surface-by-surface inspection, the core learner accountability components meet the functional requirements of R3, requiring only styling alignment with authoritative dark/light tokens and unified action callouts.

## 3. Caveats

No live changes were made to application source files during this investigation, preserving complete system stability in accordance with read-only guidelines. The live Google Apps Script endpoint was evaluated based on code parity in `backend/Code.gs` and local server mock parity in `server/mock-server.js`. Timezone calculations were benchmarked against Asia/Colombo (UTC+5:30) as specified by the application domain.

## 4. Conclusion

The investigation successfully diagnosed all reported concerns in requirements R3 and R4. The admin authentication gate requires an explicit redirect effect for unauthenticated users. The admin 7-day study volume chart requires local calendar date arithmetic, date normalization, and session-aware hour summation to eliminate the 0h bug. The Tests page requires a singular authoritative headline and clearer labeling of simulation projections, coupled with embedded direct AI action buttons. The smart weekly study schedule requires slot calibration to deliver an exact 35.0-hour weekly allocation. The dashboard, daily log, calendar, and 300 DPI ID card are functionally mature and complete.

## 5. Verification Method

To independently verify these findings, execute the automated regression test suites:
1. Run `npm test` to verify unit, boundary, and pairwise suites (expect 423 of 423 tests passing).
2. Run `node tests/e2e-runner.js` to verify all end-to-end integration tiers (expect 469 of 469 tests passing across Tiers 1 through 5).
3. Inspect `src/app/admin/page.tsx` lines 935 to 967 to verify unauthenticated behavior, and inspect lines 247 to 277 to trace date comparison logic.
4. Inspect `src/lib/calendar.ts` lines 175 to 210 and sum slot hour fields to verify the 48.5-hour total.
5. Invalidate these conclusions if an existing middleware or wrapper already intercepts unauthenticated visits to `/admin` prior to client component mount, or if the backend endpoint transforms all incoming dates into UTC timestamps.
