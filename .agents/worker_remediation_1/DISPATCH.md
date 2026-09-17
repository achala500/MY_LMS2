## 2026-08-27T09:23:22Z
You are Worker 1 (Full-Stack UI/UX, Gamification & Data Export Engineer) for the StudySync Sri Lankan A/L web application overhaul.

Working Directory: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_remediation_1
Workspace Root: c:\Users\alwis\Documents\antigravity\dazzling-bardeen
Original Request File: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md
Project File: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md

Explorer Reports:
- Test Triage: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\explorer_test_triage_1\handoff.md
- Backend Architecture: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\explorer_backend_sec_1\analysis.md
- Frontend Architecture: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\explorer_frontend_ui_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implementation Tasks (Requirements R1 through R9):

1. **R1: Google Material UI/UX Design System & Theme Engine (Dark/Light Mode)**:
   - Create `src/components/layout/ThemeProvider.tsx` using `next-themes` (`ThemeProvider as NextThemesProvider`, `attribute="class"`, `defaultTheme="dark"`, `enableSystem`).
   - In `src/app/layout.tsx`, wrap children inside `ThemeProvider`.
   - In `src/app/globals.css`, add comprehensive `.light` design tokens (`--background: 210 40% 98%`, `--foreground: 222.2 84% 4.9%`, `--card: 0 0% 100%`, `--card-foreground: 222.2 84% 4.9%`, `--border: 214.3 31.8% 91.4%`, `--muted: 210 40% 96.1%`, `--muted-foreground: 215.4 16.3% 46.9%`, etc.) with high contrast.
   - Create `src/components/layout/ThemeToggle.tsx` (using `useTheme` from `next-themes` and `Sun`/`Moon` icons from `lucide-react`) and integrate it into `src/components/layout/Header.tsx`.
   - Verify that all cards, texts, and navigation look immaculate in both Dark and Light modes.

2. **R2: Gamification Engine & Milestone Celebrations**:
   - Create `src/lib/gamification.ts`:
     - Calculate XP based on total study hours (e.g. 100 XP per hour) and streak bonuses (e.g. +50 XP per day of active streak).
     - Calculate Levels (Level 1: Novice, Level 2: Apprentice, Level 3: Scholar, Level 4: Achiever, Level 5: Expert, Level 6: Master, Level 7: Grandmaster).
     - Evaluate Achievement Badges with unlock status and progress:
       - "7-Day Streak" (Active streak >= 7)
       - "14-Day Streak" (Active streak >= 14)
       - "30-Day Master" (Active streak >= 30)
       - "50h Club" (Total hours >= 50)
       - "100h Club" (Total hours >= 100)
       - "Subject Equilibrium Master" (Subject balance score >= 85%)
       - "Early Bird" (Has logged early morning study sessions)
       - "Night Owl" (Has logged late night study sessions)
   - Create `src/lib/confetti.ts`: Zero-dependency HTML5 Canvas particle confetti burst for celebratory moments.
   - Create `src/lib/audio.ts`: Web Audio API synthesized melodic chime for milestone achievement celebrations (with safety checks for browser audio context).
   - Create `src/components/dashboard/GamificationShelf.tsx`: Level badge, XP progress bar with numeric counter, and interactive Achievement Badges grid with tooltip info.
   - Integrate `GamificationShelf` into `src/app/dashboard/page.tsx`.
   - In `src/app/daily/page.tsx`, trigger confetti burst and milestone audio chime upon successful daily log submission.

3. **R3: Automated Parent/Teacher PDF Study Report Generator**:
   - Enhance `src/components/dashboard/AcademicReportModal.tsx`:
     - Add Date Range Filter selector: "Weekly (Last 7 Days)", "Monthly (Last 30 Days)", "All-Time".
     - Calculate Total Hours, Daily Average Hours, and Subject Breakdown for the selected range.
     - Include a formal Parent/Teacher Cognitive AI Remarks section summarizing student consistency, subject pacing, and recommendations.
     - Render an embedded scannable verification QR code canvas encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`.
     - Provide 1-click Print/PDF styling via `window.print()` and RFC 4180 CSV export.

4. **R4 & R7: Multi-Format Analytics & Database Export Engine**:
   - In `src/lib/utils.ts`:
     - Implement `generateExcelXmlString(members, logs)` (Microsoft XML Spreadsheet 2003 format with typed cells and formula sanitization).
     - Implement `downloadExcelFile(filename, xmlString)`.
     - Implement `generateSqlDump(members, logs)` (DDL `CREATE TABLE` and DML `INSERT INTO` statements for PostgreSQL/MySQL/SQLite).
     - Implement `downloadSqlFile(filename, sqlString)`.
   - In `src/app/admin/page.tsx`, update the export controls to provide 4 distinct 1-click export actions: CSV, JSON, Excel (.xlsx/XML), and Relational SQL Dump (.sql).

5. **R5, R6, R8: Suite Integrations**:
   - Verify `CognitiveAdvisorCard`, `ZScoreVelocityGauge`, `CognitiveFatigueRadar`, and `WhatIfSimulator` render cleanly.
   - Verify Telegram webhook and security routines remain fully intact.

6. **R9: Verification & Testing**:
   - Run `npm test` and ensure 100% tests pass (334+ tests).
   - Run `node tests/e2e-runner.js` and ensure all 5 tiers pass.
   - Run `npm run build` and ensure Next.js static export succeeds into `out/` with zero TypeScript or build errors.
   - Write your implementation report to `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_remediation_1\handoff.md`.
   - Message the orchestrator with your results and command outputs.
