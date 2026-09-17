# Milestone 2 Exploration Report: Google Calendar Study Suite (Feature 10)

## 1. Observation

### Codebase Inspection Findings
- **Types Directory (`src/types/`)**: Currently contains `ai.ts`, `api.ts`, `auth.ts`, `global.d.ts`, `logs.ts`, `member.ts`, and `testMarks.ts`. `src/types/calendar.ts` is not yet created.
- **Context (`src/context/AppContext.tsx`)**:
  - Exposes `history: DailyLogEntry[]`, `logs: DailyLogEntry[]`, `member: MemberData | null`, `user: any`, `activeStreak: number`, `stats: StudentStats`.
  - `history` items contain `dateOfStudy`, `sessions: StudySession[]`, `subjects: SubjectLog[]`, `subject1Hours`, `subject2Hours`, `subject3Hours`, `totalHours`, `focusScore`, `notes`, providing full data for the **Past Study History Overlay** (Feature 12).
- **Header Component (`src/components/layout/Header.tsx`)**:
  - `navLinks` array currently contains: `/dashboard` (Dashboard), `/daily` (Daily Log), `/tests` (Tests & AI), `/id-card` (ID Card), and `/admin` (Admin).
  - Adding `/calendar` ('Calendar') with `Calendar` icon from `lucide-react` directly wires into both desktop navigation bar and mobile dropdown drawer.
- **Visual Design & Theming (`src/lib/constants.ts`, `src/lib/utils.ts`, `tailwind.config.ts`, `next-themes`)**:
  - Theme switching is handled cleanly via `next-themes` (`ThemeProvider`, `useTheme()`).
  - Colors and cards utilize `bg-zinc-900/60 backdrop-blur-md border border-zinc-800` in dark mode and clean slate in light mode.
- **Existing Test Suite (`tests/`)**:
  - Baseline execution via `npm test` runs 398 tests across 63 test suites with a 100% pass rate (0 failures).

---

## 2. Logic Chain

### A. Requirements Breakdown for Feature 10 & Related Features
1. **Interactive Calendar Views (`/calendar`)**:
   - **Month View**: 7-column calendar matrix (Monday to Sunday) displaying day number, daily study hour rollup pill, draggable study block chips, "+N more" expansion popover, and click-to-add empty date slots.
   - **Week View**: 7-day hourly time grid (60-minute slots, scrollable 00:00–23:00 with default scroll to morning 07:00), dynamic red/indigo current time indicator bar, absolute block positioning with overlap collision detection, and drag-and-drop slot rescheduling.
   - **Day View**: Single-day hourly schedule with full-width event cards, quick daily metrics bar (total planned, completed, and past history hours), subject color distribution gauge, and action buttons.

2. **Official Google Calendar Subject Color Palette & Customizer**:
   - **Biology**: `#10B981` (Google Emerald / Basil)
   - **Combined Maths**: `#4F46E5` (Google Indigo / Blueberry)
   - **Physics**: `#8B5CF6` (Google Purple / Grape)
   - **Chemistry**: `#F59E0B` (Google Amber / Tangerine)
   - **ICT**: `#06B6D4` (Google Cyan / Peacock)
   - **Agriculture**: `#84CC16` (Google Lime / Pistachio)
   - **General / Other**: `#64748B` (Slate)
   - Extended 12-color swatch palette for custom choices: Emerald, Indigo, Purple, Amber, Cyan, Lime, Rose (`#F43F5E`), Banana (`#EAB308`), Teal (`#14B8A6`), Blue (`#3B82F6`), Fuchsia (`#D946EF`), Slate (`#71717A`).
   - Color picker customizer modal with dual **Light Mode** and **Dark Mode** preview cards, text luminance contrast checks (WCAG 2.1), custom hex input, and "Reset to Defaults" button.
   - Persisted in `localStorage` under key `studysync_subject_colors_v1`.

3. **Drag-and-Drop Study Block Rescheduling (Feature 11)**:
   - Native HTML5 drag-and-drop API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) to ensure zero bundle bloat and 100% static export compatibility.
   - Draggable in Month view across days (updates `date`).
   - Draggable in Week view across days and hourly slots (updates `date`, `startTime`, `endTime`).
   - Draggable in Day view across hourly slots (updates `startTime`, `endTime`).
   - Live schedule recalculation + immediate optimistic state update + `localStorage` persistence + sonner toast notification.

4. **Past Study History Overlay (Feature 12)**:
   - Reads `AppContext.history` and transforms each `DailyLogEntry` into `StudyBlock` entries with `source: 'history_overlay'`.
   - Renders with a distinct "Logged / Verified" badge icon, distinctive semi-transparent accent styling, and immutable read-only protection.
   - Switchable via "Past History Overlay" toggle switch in the calendar header.

5. **Header Navigation (Feature 13)**:
   - Update `navLinks` in `src/components/layout/Header.tsx` to include `/calendar` with `Calendar` icon.

---

## 3. Caveats
- **Local Persistence First**: Since the Google Apps Script backend primarily stores submitted daily logs and member profiles, planned future study blocks are persisted locally in `localStorage` (`studysync_study_blocks_v1`) and synced with `AppContext.history` for completed logs.
- **Milestone 3 Extension Hooks**: Features like AI schedule generation, RFC 5545 `.ics` export/import, Jitsi/Meet virtual room generation, and lockscreen countdown widgets will build directly upon this foundation. Placeholders / modal triggers should be cleanly architected so Milestone 3 can connect effortlessly.

---

## 4. Conclusion & Architecture Blueprint for Worker

### Recommended File Structure
```
src/
├── types/
│   └── calendar.ts                     # TypeScript definitions for calendar & study suite
├── lib/
│   └── calendar/
│       ├── colors.ts                   # Google Calendar palettes, WCAG contrast, customizer storage
│       ├── storage.ts                  # LocalStorage CRUD for study blocks & view filters
│       ├── dateUtils.ts                # Date formatting, week grid generators, timezone helpers
│       ├── historyOverlay.ts           # Transformation of AppContext.history into study blocks
│       └── dnd.ts                      # Drag and drop payload encoding and slot recalculation
├── components/
│   └── calendar/
│       ├── StudyCalendar.tsx           # Main orchestrator component (View mode, state, modals)
│       ├── CalendarHeader.tsx          # Navigation (< Today >), view tabs, Add Block, Color Picker, History toggle
│       ├── MonthView.tsx               # 7-column month grid, hour rollups, chips, +N popover, DnD
│       ├── WeekView.tsx                # 7-day hourly grid, red current time bar, overlap layout, DnD
│       ├── DayView.tsx                 # Detailed single-day hourly schedule, stats bar, rich cards, DnD
│       ├── CalendarEventCard.tsx       # Reusable event card/chip with theme styling & drag handles
│       ├── StudyBlockModal.tsx         # Create / Edit study block modal with duration auto-calc
│       └── SubjectColorPickerModal.tsx # Color customizer modal with dark/light preview & Google palette
└── app/
    └── calendar/
        └── page.tsx                    # Dedicated /calendar page route
```

### Detailed Component & Contract Specifications

#### 1. Data Contracts (`src/types/calendar.ts`)
```typescript
export type CalendarViewMode = 'month' | 'week' | 'day';

export interface StudyBlock {
  id: string;
  title: string;
  subject: string; // e.g. "Biology", "Combined Maths", "Physics", "Chemistry", "ICT", "Agriculture", "General"
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour format)
  endTime: string; // HH:MM (24-hour format)
  durationHours: number; // Decimal hours
  color?: string; // Hex color code
  notes?: string;
  topic?: string;
  isCompleted?: boolean;
  meetingLink?: string;
  meetingType?: 'jitsi' | 'gmeet' | 'zoom';
  source?: 'manual' | 'ai_schedule' | 'gcal_import' | 'history_overlay';
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectColorMap {
  [subjectName: string]: string; // Subject -> Hex Color
}

export interface DragDropStudyBlockPayload {
  blockId: string;
  sourceDate: string;
  durationHours: number;
  startTime: string;
  endTime: string;
}
```

#### 2. Color Palette Engine (`src/lib/calendar/colors.ts`)
- **Official Google Calendar Palette**:
  - `Biology`: `#10B981` (Emerald / Basil)
  - `Combined Maths`: `#4F46E5` (Indigo / Blueberry)
  - `Physics`: `#8B5CF6` (Purple / Grape)
  - `Chemistry`: `#F59E0B` (Amber / Tangerine)
  - `ICT`: `#06B6D4` (Cyan / Peacock)
  - `Agriculture`: `#84CC16` (Lime / Pistachio)
  - `General`: `#64748B` (Slate)
- **Utilities**:
  - `getSubjectDefaultColor(subject: string): string`
  - `getContrastTextColor(hex: string): string` (WCAG 2.1 relative luminance check)
  - `getSubjectThemeStyle(hex: string, isDark: boolean): { background: string; border: string; text: string; badge: string }`
  - `getSavedSubjectColors(): SubjectColorMap`
  - `saveSubjectColors(colors: SubjectColorMap): void`
  - `resetSubjectColors(): SubjectColorMap`

#### 3. Drag & Drop Engine (`src/lib/calendar/dnd.ts`)
- Native HTML5 Drag and Drop event handlers:
  - `handleDragStart(e, block)`: sets `text/plain` JSON payload.
  - `handleMonthDrop(e, targetDate, onMove)`: parses payload, updates date, calls callback.
  - `handleWeekDrop(e, targetDate, targetHour, onMove)`: parses payload, recalculates start/end time based on dropped slot, updates date and time.
  - `handleDayDrop(e, targetHour, onMove)`: recalculates start/end time.

#### 4. Header Navigation Update (`src/components/layout/Header.tsx`)
```typescript
import { Calendar } from 'lucide-react';

// In navLinks array:
{
  href: '/calendar',
  label: 'Calendar',
  icon: Calendar,
  show: true,
},
```

---

## 5. Verification Method

To independently verify the implementation:
1. **Type Validation & Static Compilation**:
   ```bash
   npm run build
   ```
   Ensures zero TypeScript errors and successful Next.js static export.
2. **Automated Unit & E2E Test Suite**:
   ```bash
   npm test
   ```
   Validates that all 398+ existing tests pass with 0 failures and new calendar utility tests succeed.
3. **Interactive UI Verification**:
   - Navigate to `/calendar` on desktop and mobile.
   - Verify Month, Week, and Day views switch smoothly.
   - Test dragging a study block to reschedule date and time slot.
   - Test opening the Color Customizer modal, selecting swatches, checking dark/light mode preview, and resetting defaults.
   - Test toggling the "Past History Overlay" switch to verify historical logs from `AppContext.history` display as colored blocks.
