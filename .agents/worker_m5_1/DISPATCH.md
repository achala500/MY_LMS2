# DISPATCH

You are worker_m5_1 (Worker for Milestone M5).
Working directory: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_m5_1\
Authoritative Requirements: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md
Project Blueprint: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md
Scope: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\sub_orch_m5\SCOPE.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Build and verify Milestone M5: Student Personal Dashboard & Admin Dashboard.

You own exclusively:
1. `src/js/views/dashboardView.js`: Student Personal Dashboard component:
   - Read-only profile card with all member details.
   - Interactive Apple Wallet Digital ID card preview with 3x PNG download button.
   - Personal stats bento cards: streak counter, total hours, per-subject breakdown, average focus and productivity.
   - Past study history table with dates, subject breakdowns, reflections, and proof photo preview modal.
   - Embedded / quick-access daily study form with read-only lock awareness.
2. `src/js/views/adminView.js`: Protected Admin Dashboard component:
   - Email whitelist security check (`admin@studysync.lk`). Unauthorized users see a 403 Forbidden glassmorphism screen.
   - Tab 1: Group Analytics & Streak Leaderboard (KPI cards, top streak leaders, stream distribution).
   - Tab 2: Members Directory (search, filters by stream/school/status, CSV export).
   - Tab 3: Daily Logs Inspector (search, date/stream/student filters, full-size photo preview modal, CSV export).
3. Updates to `src/js/app.js` to mount `#dashboard`, `#admin`, and `#history` routes.
4. `tests/m5-verification.test.js`: Comprehensive automated unit tests for M5.

Run verification:
- Verify all E2E tests (`node tests/e2e-runner.js`), M5 tests (`node tests/m5-verification.test.js`), and full test suite (`npm test`) pass 100%.
- Verify zero `alert(` calls in all files.
- Document all implementation and test outputs in `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_m5_1\handoff.md`.
