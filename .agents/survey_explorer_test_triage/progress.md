# Progress: survey_explorer_test_triage
Last visited: 2026-09-12T05:15:00Z
Status: In progress - completed baseline test execution, static build verification, and gap analysis for R1-R4

## Completed Milestones:
1. Examined package.json, test scripts, and e2e-runner.js architecture.
2. Executed node tests/e2e-runner.js: 469/469 passed across Tiers 1-5 (Tier 1: 176, Tier 2: 175, Tier 3: 72, Tier 4: 5, Tier 5: 41).
3. Executed npm test: 423/423 passed across 73 suites, 0 failures, 0 skipped.
4. Executed npm run build: Next.js 14.2.24 static export to out/ succeeded with 10/10 pages generated cleanly and zero TypeScript errors.
5. Inspected code and test coverage for R1-R4:
   - Design tokens: UI components use #0F1114 / #F3F3F0, but globals.css :root still has legacy hsl values; no token regression tests exist.
   - Top navbar on /: Rendered via ConnectedHeader in layout.tsx; pathname === '/' condition does not hide navbar; no test asserts presence on /.
   - Visual route showcase: 3 cards (The Atelier, The Reading Room, The Studio Index) implemented in src/app/page.tsx; no tests verify editorial copy or elements.
   - Admin auth redirect: src/app/admin/page.tsx renders a 403 card instead of programmatic router.push redirect for unauthenticated users; API tests verify 403 response on ApiClient.getAdminData.
   - Admin 7-day study volume: Date mapping bug identified in src/app/admin/page.tsx where d.toISOString().substring(0, 10) causes UTC vs local date mismatch; contrast with normalizeDateToYmd() in StudyTrendChart.tsx.
   - Tests & AI Z-scores: Single composite Z-score headline implemented on /tests with TestAnalyticsTrends.tsx; dual gauge removed.
