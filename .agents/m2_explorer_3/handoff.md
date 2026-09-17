# Exploration Report: Milestone 2 — Calendar Modals, Controls, Navigation & Testing

**Agent**: `m2_explorer_3` (Explorer 3 — Milestone 2: Google Calendar Study Suite & DnD)  
**Date**: 2026-08-27  
**Working Directory**: `.agents/m2_explorer_3/`  
**Target Scope**: Feature 13 (Global Header Nav), `StudyBlockModal`, View Switching / Date Navigation Controls, Next.js App Router Integration (`src/app/calendar/page.tsx`), Static Export Compatibility, Responsive Design down to 375px, and M2 Unit Test Strategies.

---

## 1. Observation

### Exact Codebase Findings & Locations

1. **Global Header Navigation (`src/components/layout/Header.tsx`)**
   - In `src/components/layout/Header.tsx` (lines 65–97), `navLinks` currently contains:
     - Dashboard (`/dashboard`, icon: `LayoutDashboard`)
     - Daily Log (`/daily`, icon: `ClipboardPen`)
     - Tests & AI (`/tests`, icon: `BookOpen`)
     - ID Card (`/id-card`, icon: `CreditCard`)
     - Admin (`/admin`, icon: `Shield`, `adminOnly: true`)
   - The `/calendar` route is currently missing from both desktop navigation (lines 127–175) and mobile dropdown menu (lines 240–294).
   - The `lucide-react` library (version `^0.441.0` in `package.json`) exports the standard `Calendar` icon.

2. **App Router Layout & Provider Hierarchy (`src/app/layout.tsx` & `src/context/AppContext.tsx`)**
   - `src/app/layout.tsx` (lines 82–97) wraps the application inside `ThemeProvider`, `TooltipProvider`, `AuthProvider`, and `AppProvider`.
   - `ConnectedHeader` in `src/context/AppContext.tsx` (lines 285–299) automatically connects `useAuth()` and `useApp()` to `<Header />`.
   - `next.config.mjs` specifies `output: 'export'` (line 3) for static deployment to Firebase Hosting (`out/`).

3. **Domain Contracts and Data Structures (`PROJECT.md` & `src/types/`)**
   - `PROJECT.md` lines 81–113 define `StudyBlock`, `HomeworkAssignment`, and `SubjectColorMap`.
   - `src/types/logs.ts` (lines 8–19) defines `StudySession` with `subject`, `hours`, `startTime`, `endTime`, `focus`, `productivity`, `notes`, `topic`, `color`.
   - `src/types/calendar.ts` does not yet exist and must be created to formalize `StudyBlock`, `CalendarViewMode`, `DateNavigationState`, and modal payload interfaces.

4. **Available shadcn/ui Primitives (`src/components/ui/`)**
   - The project contains all necessary UI primitives: `dialog.tsx`, `popover.tsx`, `select.tsx`, `input.tsx`, `textarea.tsx`, `button.tsx`, `badge.tsx`, `tabs.tsx`, `card.tsx`, `tooltip.tsx`, `sonner.tsx`.
   - `EditProfileModal.tsx` in `src/components/dashboard/EditProfileModal.tsx` provides an established design pattern for dialog modals using dark glass styling (`bg-zinc-950/95 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl`).

5. **Existing Utilities and Math Engines (`src/lib/utils.ts`)**
   - `src/lib/utils.ts` contains date and time functions:
     - `getTodayDateString(d)` (lines 25–34)
     - `parseDateString(str)` (lines 39–53)
     - `formatDate(dateVal, style)` (lines 58–89)
     - `daysBetween(d1, d2)` (lines 112–118)
     - `calculateDurationFromTimes(start, end)` (lines 1065–1074)
     - `formatHoursHuman(hours)` (lines 1079–1086)

6. **Test Harness & Execution Environment (`package.json` & `tests/`)**
   - Test command: `node --test tests/*.test.js`.
   - Native Node.js test runner (`node:test` + `node:assert/strict`).
   - 411/412 automated tests pass across Tiers 1–5 and existing verification suites.

---

## 2. Logic Chain

From the direct observations above, we establish the technical requirements, design specifications, and implementation plans across the 4 core focus areas:

### A. Feature 13: Global Header Navigation Integration

1. **Navigation Item Placement**:
   - In `src/components/layout/Header.tsx`, add `/calendar` to `navLinks`:
     ```typescript
     {
       href: '/calendar',
       label: 'Calendar',
       icon: Calendar,
       show: true,
     }
     ```
   - Position: Placed between `/daily` and `/tests` (`/dashboard` -> `/daily` -> `/calendar` -> `/tests` -> `/id-card` -> `/admin`).
2. **Desktop Navigation**:
   - Automatically rendered by `navLinks.filter((item) => item.show).map(...)`.
   - Active state styling: `pathname === '/calendar'` applies `border border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-white shadow-sm font-semibold`.
3. **Mobile Drawer Navigation**:
   - Rendered in the mobile menu overlay.
   - Clicking the link triggers `setMobileMenuOpen(false)` to close the drawer.
   - Touch target: height minimum 44px with `px-3 py-2.5` padding.

---

### B. Calendar Modals Architecture (`StudyBlockModal.tsx`)

1. **File Location**: `src/components/calendar/StudyBlockModal.tsx`.
2. **Component Interface**:
   ```typescript
   export interface StudyBlockModalProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
     block?: StudyBlock | null;
     defaultDate?: string;      // YYYY-MM-DD
     defaultStartTime?: string; // HH:MM (e.g. "08:30")
     defaultEndTime?: string;   // HH:MM (e.g. "10:00")
     streamSubjects?: string[]; // e.g. ["Biology", "Chemistry", "Physics"]
     customColors?: Record<string, string>;
     onSave: (blockData: Omit<StudyBlock, 'id'> & { id?: string }) => void;
     onDelete?: (blockId: string) => void;
     onOpenVirtualRoom?: (block: StudyBlock) => void;
   }
   ```
3. **Modal Operation Modes**:
   - **Create Mode** (`block == null`):
     - Title: "Plan Study Session"
     - Subtitle: "Schedule a focused study block on your calendar."
     - Pre-fills with `defaultDate`, `defaultStartTime`, `defaultEndTime`, and first stream subject.
     - CTA: "Schedule Block" (`min-h-[44px]`, `bg-indigo-600 hover:bg-indigo-500`).
   - **Edit Mode** (`block != null` and `block.source !== 'history_overlay'`):
     - Title: "Edit Study Block"
     - Pre-fills with existing block values.
     - CTA: "Save Changes" + Destructive "Delete Block" button with trash icon.
   - **History Read-Only Mode** (`block.source === 'history_overlay'`):
     - Title: "Past Study Log Record"
     - Displays historical study data: Subject, Duration, Focus Level (1–10 badge), Productivity Rating (1–10 badge), Study Notes, and Proof Photo link (if uploaded).
     - Form inputs are disabled / rendered as styled summary cards.
4. **Form Controls & Real-Time Calculation Engine**:
   - **Topic / Title**: Text input with placeholder "e.g. Past Paper 2022 Section B".
   - **Subject Selector**: shadcn `Select` with stream subjects and icons.
   - **Date Picker**: HTML5 `input type="date"` or custom date selector.
   - **Start & End Time Pickers**: `input type="time"` (24-hour format).
   - **Live Duration Display**: Automatically computes decimal hours using `calculateDurationFromTimes(startTime, endTime)` and displays human-readable duration (`formatHoursHuman(durationHours)`).
   - **Google Calendar Color Palette**: Swatch selector with 8 standard colors:
     - Emerald (`#10b981`) — Biology
     - Indigo (`#6366f1`) — Combined Maths
     - Purple (`#a855f7`) — Physics
     - Amber (`#f59e0b`) — Chemistry
     - Cyan (`#06b6d4`) — ICT
     - Lime (`#84cc16`) — Agriculture
     - Rose (`#ef4444`) — Review / Urgent
     - Blue (`#3b82f6`) — Tuition / General
   - **Study Notes / Remarks**: shadcn `Textarea` for objectives and page numbers.
   - **Virtual Room Integration Hook**: Quick action button to attach a Jitsi/Google Meet link.
5. **Validation & Toast Feedback**:
   - Validates that topic or subject is selected.
   - Validates date format (`YYYY-MM-DD`).
   - Validates time interval (`durationHours > 0`).
   - Displays sonner toast alerts (`toast.error(...)` / `toast.success(...)`).

---

### C. Calendar View Switching & Date Navigation Controls (`CalendarHeader.tsx`)

1. **File Location**: `src/components/calendar/CalendarHeader.tsx`.
2. **View Switching Controls**:
   - Button group / tabs: `Month` (`CalendarDays`), `Week` (`Columns3`), `Day` (`Clock`).
   - Active view highlighted with `bg-indigo-600 text-white shadow-md font-semibold`.
   - Keyboard accessible with ARIA tab roles.
3. **Date Navigation Controls**:
   - **"Today" Button**: Instantly jumps to today's date (`new Date()`).
   - **Previous Button (`ChevronLeft`)**:
     - Month view: `-1 month` (adjusts year when navigating past January).
     - Week view: `-7 days`.
     - Day view: `-1 day`.
   - **Next Button (`ChevronRight`)**:
     - Month view: `+1 month` (adjusts year when navigating past December).
     - Week view: `+7 days`.
     - Day view: `+1 day`.
   - **Period Title Header**:
     - Month view: `August 2026` (`text-xl sm:text-2xl font-bold tracking-tight text-white font-display`).
     - Week view: `Aug 24 – Aug 30, 2026` (handles month and year boundary transitions).
     - Day view: `Thursday, August 27, 2026`.
   - **Mini Calendar / Date Picker Popover**: Quick jump popover allowing students to select any arbitrary date directly.
4. **Action Toolbar**:
   - `+ Plan Session` Primary Button (`min-h-[44px]` touch target, `bg-indigo-600`).
   - `Color Settings` Button (`Palette` icon): opens subject color customizer.
   - `AI Schedule` Button (`Sparkles` icon): triggers weekly AI schedule generator.
   - `Sync / Export` Button (`Download` icon): triggers GCal `.ics` export/import.

---

### D. App Router Integration & Static Export Architecture (`src/app/calendar/page.tsx`)

1. **Static Export Compatibility (`output: 'export'`)**:
   - Must include `'use client';` directive at the top of `src/app/calendar/page.tsx`.
   - No server-side runtime APIs (`cookies()`, `headers()`).
   - Client-side hydration safety:
     - Wrap localStorage reads and date initialization inside `useEffect` or check `mounted` state to guarantee zero hydration mismatch between server-rendered HTML and browser client.
2. **State Storage & Persistence Protocol**:
   - `StudyBlock[]` stored in `localStorage` under key `studysync_calendar_blocks_v1`.
   - Custom subject colors stored in `localStorage` under key `studysync_subject_colors_v1`.
   - Past study history sourced dynamically from `AppContext.history`.
3. **Responsive Design Down to 375px**:
   - Ergonomic touch targets: all buttons minimum 44–48px height (`h-11`/`h-12`).
   - Header controls wrap cleanly (`flex-col sm:flex-row`).
   - **Month View on 375px**:
     - 7-day grid with compact cell height (`min-h-[70px] sm:min-h-[110px]`).
     - Renders color dots or compact pills for study blocks.
     - Tapping any date cell opens a day detail popover or switches to Day view.
   - **Week View on 375px**:
     - Horizontally scrollable 7-day schedule grid with sticky left-hand time column (06:00 to 24:00).
   - **Day View on 375px**:
     - Full-width vertical hourly timeline with touch-friendly study block cards.
   - Zero text overflow: `break-words`, `truncate`, `overflow-hidden` on all block tags and containers.

---

### E. M2 Unit Test Strategies (`tests/m2-calendar-controls.test.js` & `tests/m2-calendar-views.test.js`)

We define 7 test suites covering all M2 components, mathematical operations, navigation algorithms, and contracts:

| # | Test Suite | Scope & Invariants | Verification Logic |
|---|---|---|---|
| 1 | **Date Arithmetic & Navigation** | Month matrix generation, 7-day week calculation, leap years, month/year boundaries | Verifies `getMonthMatrix(2026, 7)` returns 42 cells with correct padding; `navigateDate` handles Dec -> Jan and leap year Feb 29 |
| 2 | **Duration & Time Math** | Decimal hours calculation, 15m/45m increments, overnight midnight rollover | Tests `calculateDurationFromTimes('08:30', '10:00') === 1.5`, `calculateDurationFromTimes('23:00', '01:30') === 2.5`, zero duration on invalid inputs |
| 3 | **Study Block Validation** | Payload integrity, required field enforcement, XSS sanitization, conflict detection | Validates block schema; tests `findConflictingBlocks(blocks, newBlock)` detecting overlapping time intervals on the same day |
| 4 | **Google Calendar Subject Palettes** | Default 8-color mapping, custom user overrides, WCAG 2.1 AA contrast compliance | Verifies Biology -> Emerald `#10b981`, Combined Maths -> Indigo `#6366f1`, Physics -> Purple `#a855f7`, Chemistry -> Amber `#f59e0b`, ICT -> Cyan `#06b6d4`, Agriculture -> Lime `#84cc16` |
| 5 | **Past Study History Overlay Transformer** | Converting `DailyLogEntry[]` into `StudyBlock[]` with `source: 'history_overlay'` | Transforms multi-session and flat subject logs; ensures synthetic non-overlapping time slots; verifies read-only metadata preservation |
| 6 | **Drag-and-Drop Reschedule Math** | Moving blocks across dates/times, 15/30-min grid snapping, duration preservation | Tests moving 1.5h session from Mon 09:00 to Wed 14:00 ends at Wed 15:30; coordinate-to-time slot snapping |
| 7 | **Header Navigation & Route Integrity** | Verification of `/calendar` in `Header.tsx` `navLinks`, mobile menu toggle, link active state | Asserts `Header.tsx` includes `/calendar` with `Calendar` icon and desktop/mobile rendering |

---

## 3. Caveats

1. **Client-Side LocalStorage Scope**: Planned study blocks scheduled by students are stored client-side in browser `localStorage`. When the user is authenticated, study blocks can optionally sync with Google Calendar `.ics` export or Apps Script in subsequent milestones.
2. **Timezone Standardization**: All date arithmetic uses local browser time or standard Colombo timezone (`Asia/Colombo`), matching `appsscript.json` configuration.
3. **No Caveats Beyond Above**: All contracts, types, and architectural designs align with `ORIGINAL_REQUEST.md` and `PROJECT.md`.

---

## 4. Conclusion

1. **Header Navigation (Feature 13)** is ready for seamless implementation in `src/components/layout/Header.tsx` by adding `/calendar` with `Calendar` icon to `navLinks`.
2. **`StudyBlockModal`** provides a complete, ergonomic modal supporting Create, Edit, Delete, and Past Study Log Inspection modes, with real-time decimal hour calculation and Google Calendar color palettes.
3. **Calendar View & Date Controls** in `CalendarHeader.tsx` provide fast Month/Week/Day switching, Today/Prev/Next navigation, period headings, and mini calendar quick jump.
4. **App Router Integration** in `src/app/calendar/page.tsx` satisfies Next.js 14 static export (`output: 'export'`), zero-hydration errors, and 375px responsive ergonomics.
5. **Unit Test Strategies** are comprehensively specified across 7 distinct test suites to ensure 100% automated test pass rate.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Header Navigation Specification**:
   - Inspect `src/components/layout/Header.tsx` lines 65–97.
   - Verify `Calendar` icon import from `lucide-react`.
2. **Verify Duration Math & Time Utilities**:
   - Run: `node -e "import('./src/lib/utils.ts').then(u => { console.log(u.calculateDurationFromTimes('08:30', '10:00')); })"`
3. **Verify Build & Test Suite**:
   - Run project test runner: `npm test`
   - Run Next.js build: `npm run build`
4. **Invalidation Conditions**:
   - Invalidation if `/calendar` link is absent from mobile drawer.
   - Invalidation if `StudyBlockModal` fails to auto-calculate duration on start/end time change.
   - Invalidation if `next build` fails static export due to client-server hydration mismatch.
