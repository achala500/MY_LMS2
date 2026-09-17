# Scope: Milestone M5 — Student Personal Dashboard & Admin Dashboard

## Architecture & Scope
Implement the Student Personal Dashboard (`src/js/views/dashboardView.js`) and Protected Admin Dashboard (`src/js/views/adminView.js`) with complete metrics calculations, history table with photo modals, email whitelist security, members directory with CSV export, filterable global study logs, group analytics, and streak leaderboard.

## Deliverables
- `src/js/views/dashboardView.js`: Student Personal Dashboard Component:
  - Read-only profile card with registration info and glowing status pill.
  - Apple Wallet Digital ID card interactive preview with 1-click "Download Digital ID (3x High-Res PNG)" button.
  - Personal stats bento grid: Current study streak (flame indicator), total study hours progress, per-subject hours breakdown bars, average focus & productivity meters.
  - Embedded / quick-access Daily Study Form.
  - Past Study History: interactive, scrollable list/table of past daily submissions with hours, scores, reflections, and clickable photo proof preview modal.
- `src/js/views/adminView.js`: Protected Admin Dashboard Component:
  - Whitelist security check (`ADMIN_EMAILS` array including `admin@studysync.lk`). Unauthorized users see a styled 403 Forbidden glassmorphism screen.
  - Tab 1: Group Overview & Analytics Hub:
    - Group KPI metric cards (Total Registered Members, Active Members, Total Group Hours, Logs Submitted Today, Group Avg Focus/Productivity).
    - Top Streaks Leaderboard with Gold/Silver/Bronze crown badges.
    - Stream Distribution breakdown (Bio vs. Maths).
  - Tab 2: Members Directory:
    - Full members table (Study ID, Full Name, Email, Gender, Telegram, School, Stream, Optional Subject, Registration Date, Status).
    - Search by Name/ID and filters by Stream, School, Status.
    - Export Members as CSV button.
  - Tab 3: Daily Logs Inspector:
    - Searchable, filterable table of all group daily study logs.
    - Filter by Date Range, Stream, or Student ID.
    - Full-size photo proof preview modal on thumbnail click.
    - Export Logs as CSV button.
- Updates to `src/js/app.js` to mount `#dashboard`, `#admin`, and `#history` routes.
- `tests/m5-verification.test.js`: Unit & integration tests covering dashboard metrics, streak calculations, admin authorization, CSV export formatting, and view lifecycle.

## Rules & Quality Criteria
- Zero `alert()` calls (use `Toast`).
- Admin view strictly protected by email whitelist.
- Responsive mobile-first layout.
