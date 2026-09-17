# Survey & Specification Report: StudySync Calendar, Scheduling Suite, AI Scheduler, Virtual Rooms, Countdown Engine & Lockscreen Widget

**Author**: survey_explorer_2  
**Date**: 2026-08-27  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`  
**Primary Reference**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md` (Update 2026-08-27T11:15:52Z)  

---

## 1. Executive Summary

This report delivers an exhaustive technical survey, architecture blueprint, data contracts, and algorithmic specifications for implementing the **StudySync Study Calendar & Scheduling Suite**, **Smart AI Study Schedule Generator**, **1-Click Virtual Study Rooms**, **Two-Way Google Calendar Sync (RFC 5545)**, **Homework / Assignment Tracker**, **A/L Exam Countdown Engine**, and **Mobile Lockscreen Wallpaper / Widget Generator** within the StudySync Sri Lankan A/L Academic Accountability platform.

### Current Codebase Baseline
- **Framework**: Next.js 14.2.24 App Router with TypeScript, Tailwind CSS, and shadcn/ui components (`components.json`), configured with `output: 'export'` for static deployment to Firebase Hosting.
- **Existing Routes**: `/` (Landing), `/dashboard` (Student Dashboard), `/daily` (Daily Study Logger), `/tests` (Test Marks & Cognitive AI), `/id-card` (Apple Wallet Digital ID), `/admin` (Super Admin), `/register` (Registration), `/verify` (Public Verification), and `/not-found`.
- **Existing Data & Auth Layer**: Google Sign-In via Firebase Auth v10 compat SDK, Google Apps Script POST API (`Code.gs` / `server/mock-server.js`), Google Sheets database (`Members`, `DailyLogs`, `Analytics`, `TestMarks`).
- **Current Test Status**: 385/385 automated tests passing across Tiers 1–5 with zero regressions.
- **Calendar Status**: No `/calendar` page or calendar components currently exist. Calendar is a net-new comprehensive suite required at `/calendar` with unified cross-links in the global Header and Dashboard.

---

## 2. Pillar 1: Calendar Architecture & Routing Integration

### 2.1 Route & Navigation Mapping
- **New App Route**: `src/app/calendar/page.tsx`
  - Client component (`'use client'`) protected by authentication check (`useAuth`).
  - Unauthenticated users: Prompted to sign in or view an interactive guest demonstration.
  - Authenticated students: Full interactive calendar and scheduling suite loaded with user's stream subjects, past study logs, planned study blocks, and homework assignments.
- **Global Header Navigation (`src/components/layout/Header.tsx`)**:
  - Add `{ href: '/calendar', label: 'Calendar', icon: Calendar, show: true }` to `navLinks`.
  - Ensure desktop navigation menu and mobile hamburger drawer both include the Calendar link.
- **Student Dashboard Integration (`src/app/dashboard/page.tsx`)**:
  - Add a dedicated **"Upcoming Study Schedule & Deadlines"** card / quick widget with a 1-click CTA button: *"Open Full Study Calendar"* directing to `/calendar`.

### 2.2 Component Hierarchy Blueprint
```
src/
├── app/
│   └── calendar/
│       └── page.tsx                      # Main Calendar Page Container
├── components/
│   └── calendar/
│       ├── CalendarHeader.tsx            # View Switcher (Month/Week/Day), Date Navigator, Action Buttons
│       ├── MonthView.tsx                 # 7x5 / 7x6 Grid Month View with event badges
│       ├── WeekView.tsx                  # 7-day 24h Vertical Time Grid with draggable blocks
│       ├── DayView.tsx                   # Detailed single-day agenda grid with 30m slots
│       ├── StudyBlockCard.tsx            # Draggable study block component with subject styling
│       ├── PastHistoryOverlay.tsx        # Past study log overlay badge & details renderer
│       ├── AddStudyBlockModal.tsx        # Modal to create / edit scheduled study blocks
│       ├── AiScheduleModal.tsx           # 1-Click Smart AI Study Timetable Generator Modal
│       ├── VirtualRoomModal.tsx          # 1-Click Google Meet / Jitsi / Zoom Room Generator
│       ├── GoogleCalendarSyncModal.tsx   # Two-way sync: Add to GCal, RFC 5545 .ics Export/Import
│       ├── AssignmentTrackerDrawer.tsx   # Homework / Assignment sidebar tracker & manager
│       ├── CountdownWidgetModal.tsx      # A/L Exam countdown & Mobile Lockscreen Canvas Generator
│       └── SubjectColorPickerModal.tsx   # Custom subject color palette selector (GCal palette)
└── lib/
    └── calendar/
        ├── icsGenerator.ts               # RFC 5545 iCalendar serialization engine
        ├── icsParser.ts                  # Client-side RFC 5545 .ics text parser
        ├── aiScheduleGenerator.ts        # Stream & Exam Year tailored timetable algorithm
        ├── virtualRoomGenerator.ts       # Google Meet, Jitsi Meet WebRTC, Zoom URL generator
        ├── countdownEngine.ts            # A/L Exam (2026-2029) & Milestone countdown calculator
        ├── lockscreenCanvas.ts           # HTML5 Canvas 300 DPI high-res wallpaper renderer
        └── browserNotifications.ts       # Web Notification API scheduler & permission manager
```

---

## 3. Pillar 2: Month, Week, Day Calendar Views, Drag-and-Drop & Past Study Overlays

### 3.1 Interactive Calendar Views
1. **Month View (`MonthView.tsx`)**:
   - 7-column layout (Monday to Sunday, matching Sri Lankan academic convention).
   - Shows day numbers, current day highlight ring (indigo accent), and mini badges for:
     - Planned Study Blocks (colored by subject).
     - Completed Study Logs (solid checkmarked badge showing actual logged hours).
     - Homework / Assignment Deadlines (priority-colored badge).
     - External Imported Events (tuition classes / school tests).
   - Daily Total Hours badge in each day cell header (e.g. `[4.5 hrs planned | 3.0 hrs done]`).
   - Clicking a day cell opens quick event preview or switches to Day View.

2. **Week View (`WeekView.tsx`)**:
   - 7-day column grid with 24-hour vertical time axis (default viewport focused on 06:00 to 23:00 with scroll).
   - Time slots spaced at 30-minute intervals (48 vertical increments per day).
   - Current time red/indigo horizontal laser indicator.
   - Interactive study blocks positioned absolutely based on `startTime` (e.g. `08:30`) and `durationHours` (e.g. `1.5`).
   - Drag-and-drop handles for moving blocks between days or snapping to 15/30-minute intervals.
   - Resizable bottom edge for adjusting duration.

3. **Day View (`DayView.tsx`)**:
   - Single-day deep-focus view with large time slots.
   - Session cards showing: Subject title, Topic/Subtopic, Focus target, Meeting link button, Notes preview, and Checkmark completion toggle.
   - Parallel column for Homework due today.

### 3.2 Official Google Calendar Color Palette & Custom Subject Picker
- Standard Google Calendar Color Tokens supported:
  - **Peacock Blue** (`#039BE5` / `bg-sky-500`): Combined Maths / Physics default
  - **Basil Green** (`#0B8043` / `bg-emerald-600`): Biology / Agriculture default
  - **Amethyst Purple** (`#8E24AA` / `bg-purple-600`): Chemistry default
  - **Tangerine Orange** (`#F4511E` / `bg-orange-500`): ICT / Optional subjects
  - **Flamingo Pink** (`#E67C73` / `bg-rose-400`): Model Paper / Test blocks
  - **Banana Yellow** (`#F6BF26` / `bg-amber-400`): Revision / Theory summaries
  - **Graphite Slate** (`#616161` / `bg-zinc-500`): Break / Rest periods
  - **Cobalt Indigo** (`#3F51B5` / `bg-indigo-600`): Group study sessions
- Custom student color preferences persisted in `localStorage` under `studysync_subject_colors_v1`.

### 3.3 Drag-and-Drop Rescheduling Engine
- **Implementation**: Native HTML5 Drag and Drop API (`onDragStart`, `onDragOver`, `onDrop`) and pointer touch events for mobile responsiveness.
- **Snap-to-Grid**: Snaps to 15-minute / 30-minute increments (`minutes = Math.round(yOffset / slotHeight) * 30`).
- **Live Recalculation**:
  - Automatically updates total scheduled hours per day and per subject immediately on drop.
  - Updates local state and triggers optimistic save to `localStorage` (`studysync_calendar_blocks_v1`).

### 3.4 Past Study History Overlay
- Extracts all student study logs from `AppContext.history` (`DailyLogEntry[]` and `StudySession[]`).
- Overlays actual study sessions on past dates:
  - Visual distinction: Planned blocks have semi-transparent background with colored left border; Logged sessions have solid glass card with emerald checkmark icon, exact recorded hours, focus rating (1-10 pill), and photo proof indicator if attached.
  - Hovering / clicking a past log opens the session details drawer or `PhotoProofModal`.

---

## 4. Pillar 3: Two-Way Google Calendar Synchronization (RFC 5545 & Web Links)

### 4.1 RFC 5545 iCalendar Specification Compliance (`icsGenerator.ts`)
Generates standard MIME `text/calendar` payload complying with RFC 5545:
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StudySync//Sri Lankan A/L Study Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:StudySync A/L Study Schedule
X-WR-TIMEZONE:Asia/Colombo
BEGIN:VEVENT
UID:studysync-block-1724750000-01@studysync-al-2026.web.app
DTSTAMP:20260827T111500Z
DTSTART:20260828T030000Z
DTEND:20260828T050000Z
SUMMARY:StudySync: Biology — Unit 4 Plant Physiology
DESCRIPTION:Focus Target: 9/10\nStream: Biological Science\nVirtual Room: https://meet.jit.si/studysync-bio-room-4821\nNotes: Revise transpiration pull and stomatal mechanism.
LOCATION:Virtual Study Room / Home Desk
STATUS:CONFIRMED
CATEGORIES:Study,A/L Revision,Biology
END:VEVENT
END:VCALENDAR
```
- **Timezone Safety**: Converts local times (Asia/Colombo UTC+05:30) to Zulu UTC format (`YYYYMMDDTHHMMSSZ`) or includes `TZID=Asia/Colombo` definition.
- **1-Click Download**: Triggers browser file download `studysync_schedule_2026.ics`.

### 4.2 1-Click "Add to Google Calendar" Web Link Generator
Generates direct Google Calendar event creation URLs:
```typescript
export function generateGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}): string {
  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const startStr = formatGCalDate(event.startDate);
  const endStr = formatGCalDate(event.endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: event.description,
    location: event.location || 'StudySync Study Desk',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
```

### 4.3 Client-Side `.ics` File Parser (`icsParser.ts`)
- Allows students to upload `.ics` feeds exported from Google Calendar, school LMS, or tuition portals.
- Parses `BEGIN:VEVENT` blocks:
  - Extracts `SUMMARY` (Event Title), `DTSTART`, `DTEND`, `DESCRIPTION`, `LOCATION`, and `RRULE` (recurrence).
  - Merges parsed events into the calendar with a distinct "Imported External Event" badge.

---

## 5. Pillar 4: 1-Click Virtual Study Room Engine

### 5.1 Multi-Provider Meeting Link Generator (`virtualRoomGenerator.ts`)
Enables 1-click creation and sharing of study rooms attached to planned study blocks:

1. **Jitsi Meet (Zero-Login WebRTC — Recommended for Instant Group Study)**:
   - URL Format: `https://meet.jit.si/studysync-${streamSlug}-${subjectSlug}-${roomId}`
   - Features: No registration required, 100% free, end-to-end encrypted, built-in screen sharing, chat, and hand raise.
   - Example: `https://meet.jit.si/studysync-bio-genetics-session-8821`

2. **Google Meet (Google Account Integrated)**:
   - Direct launch URL: `https://meet.google.com/new` (initiates instant Google Meet room) or custom pre-arranged Google Meet code.

3. **Zoom (Custom / Personal Room Links)**:
   - URL Format: Student's saved Zoom Personal Meeting ID (PMI) link or `https://zoom.us/join`.

### 5.2 Collaborative Study Features
- **1-Click Copy Link**: Copies formatted invite to clipboard:
  > *"📚 StudySync Group Session: Combined Maths — Integration Past Papers\n⏰ Friday 08:30 - 10:30 AM\n🔗 Join Room: https://meet.jit.si/studysync-maths-integration-771"*
- **Telegram Share Button**: Opens `https://t.me/share/url?url=...&text=...` to share study room invites directly to student Telegram groups and channels.

---

## 6. Pillar 5: Smart AI Weekly Study Schedule Generator

### 6.1 Algorithmic Balancing Rules (`aiScheduleGenerator.ts`)
The Smart AI Scheduler generates an optimized 7-day study timetable based on:

1. **Stream-Specific Subject Matrix**:
   - **Biological Science**: Biology (mandatory), Chemistry (mandatory), Physics or Agriculture (optional).
   - **Physical Science**: Combined Maths (mandatory), Physics (mandatory), Chemistry or ICT (optional).

2. **Target Exam Year Pacing & Intensity**:
   - **2026 Batch (Exam Year)**: Intensive Pacing (35–45 hours/week), 50% past paper & timed revision blocks, morning deep focus slots (3h blocks).
   - **2027 Batch (Senior A/L)**: Moderate-High Pacing (28–35 hours/week), balanced theory consolidation + topical practice.
   - **2028 / 2029 Batches (Junior/Beginner A/L)**: Foundation Pacing (18–25 hours/week), theory emphasis, manageable 1.5h blocks.

3. **Cognitive Z-Score Bottleneck Prioritization**:
   - Integrates with `calculateCompositeZScore` and `calculateSubjectEntropyEquilibrium` from `dataEngineering.ts`.
   - Identifies the student's lowest scoring subject or lowest study allocation:
     - Automatically increases scheduled weekly time for the bottleneck subject by +30% to restore **Subject Equilibrium (target score > 85%)**.

4. **Circadian Rhythm & Focus Style Presets**:
   - **Balanced Default**: Morning (08:00–11:00 heavy subject), Afternoon (15:00–17:00 practice), Evening (19:30–21:30 revision).
   - **Early Bird (Morning Lark)**: 05:30–08:30 deep theory, 10:00–12:00 exercises, 16:00–18:30 revision, early rest.
   - **Night Owl**: 09:30–12:30 theory, 16:00–18:30 problem solving, 20:30–23:30 deep focus block.
   - **Built-in Pomodoro Intervals & Breaks**: Enforces 15–30 minute rest intervals between consecutive blocks to prevent cognitive fatigue.

### 6.2 1-Click Generation Flow (`AiScheduleModal.tsx`)
- Student opens modal, selects weekly target hours (e.g. 25h, 35h, 45h) and focus rhythm style.
- Clicks *"Generate My Optimized Schedule"*.
- AI computes balanced weekly allocations with preview table.
- Student clicks *"Apply to My Calendar"* to instantly populate the week's study blocks.

---

## 7. Pillar 6: Homework & Assignment Tracker Integration

### 7.1 Data Structure & Domain Model
```typescript
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';

export interface HomeworkAssignment {
  id: string;
  studyId: string;
  title: string;              // e.g. "Physics 2022 Part B Essay Questions"
  subject: string;            // e.g. "Physics"
  dueDate: string;            // YYYY-MM-DD
  dueTime?: string;           // HH:mm (e.g. "23:59")
  priority: AssignmentPriority;
  status: AssignmentStatus;
  estimatedHours: number;     // e.g. 2.0
  notes?: string;
  completedAt?: string;
  createdAt: string;
}
```

### 7.2 Calendar & Sidebar Integration
- **Side Drawer / Panel (`AssignmentTrackerDrawer.tsx`)**:
  - Filter tabs: All, Pending, In Progress, Completed.
  - Quick Add Assignment form: Title, Subject select, Due Date picker, Priority toggle, Estimated Hours.
  - 1-click status checkbox to toggle completion with congratulatory chime.
- **Calendar Overlay**:
  - Displays small priority badges directly on Month, Week, and Day views for the due date.
  - Urgent/Overdue items highlighted with pulsing rose accent (`bg-rose-500/20 text-rose-300 border-rose-500/40`).

---

## 8. Pillar 7: A/L Exam Countdown Engine & Mobile Lockscreen Widget Generator

### 8.1 Authoritative Exam Target Dates & Countdown Engine (`countdownEngine.ts`)
- **Official Sri Lankan G.C.E. A/L Examination Schedule Targets**:
  - **2026 Batch**: November 16, 2026 (`2026-11-16T08:30:00+05:30`)
  - **2027 Batch**: November 15, 2027 (`2027-11-15T08:30:00+05:30`)
  - **2028 Batch**: November 20, 2028 (`2028-11-20T08:30:00+05:30`)
  - **2029 Batch**: November 19, 2029 (`2029-11-19T08:30:00+05:30`)
- **Countdown Engine Computations**:
  - Computes exact `totalDays`, `hours`, `minutes`, `seconds`, and `progressPercentage` relative to a standard 2-year preparation baseline (730 days).
  - Milestone checkpoint countdowns: 1st Term Test, 2nd Term Test, School Model Paper Exam, Final A/L Exam.

### 8.2 Mobile Lockscreen Wallpaper / Widget Generator (`lockscreenCanvas.ts`)
Generates high-resolution, crisp smartphone wallpapers with live study stats and countdown numbers:
- **Canvas Output Dimensions**:
  - **Resolution**: 1080 x 2400 px (standard high-density 20:9) and 1290 x 2796 px (Apple iPhone Pro Max 300 DPI scale).
- **Design Layout & Visual Elements**:
  1. Deep obsidian gradient background (`#07090E` to `#0B0F19`) with soft cyan/indigo aurora mesh glow.
  2. Header Pill: `StudySync A/L • Target Batch [2026]`.
  3. Student Profile: Student Full Name (`member.fullName`) & Study ID (`member.studyId`) in JetBrains Mono.
  4. Stream Badge: `Biological Science` or `Physical Science`.
  5. Giant Hero Countdown: e.g. **`72`** in bold 140px SF Pro / Product Sans, sub-caption: `DAYS REMAINING UNTIL A/L EXAMS`.
  6. Consistency & Streak Stats: `Active Streak: 🔥 14 Days` | `Total Study: ⏱️ 185.5 hrs`.
  7. Subject Target Meters: Horizontal progress bars for the 3 registered stream subjects.
  8. Curated Sri Lankan A/L Motivational Quote:
     - *"Consistency is what transforms average into excellence. Every hour counted."*
     - *"Disciplined today, University tomorrow."*
     - *"ඔබේ ඉලක්කය කරා යන ගමනේ සෑම තත්පරයක්ම වටිනවා."*
- **1-Click High-Res PNG Download**: Exports downloadable PNG via `canvas.toBlob()`.

### 8.3 Browser Study Notifications (`browserNotifications.ts`)
- Wraps Web `Notification` API with safe fallback.
- Requests notification permissions cleanly upon user toggle.
- Scheduled checks every 60 seconds comparing current clock time with upcoming study blocks (alerts 10 minutes prior to session start).
- Integrates with `playSuccessChime()` audio engine.

---

## 9. Cross-Cutting Ergonomics, Natural Everyday Language & Low Density Layouts

### 9.1 Comfortable Big Buttons & Touch Ergonomics
- Minimum touch target height: **44–48px** (`h-11` or `h-12`).
- Generous padding: `px-6` to `px-8` on primary buttons.
- Clear tactile hover/active states with subtle scale feedback (`active:scale-[0.98]`).
- Clean icons paired with readable text labels.

### 9.2 Simple, Warm, Supportive Everyday English
- Strict prohibition of confusing, robotic, or overly dense academic jargon.
- Clear, friendly UI terminology:
  - *"Your Study Plan"* instead of *"Chronological Pedagogical Matrix"*
  - *"Start Studying Now"* instead of *"Initiate Academic Log Procedure"*
  - *"Add Study Block"* instead of *"Instantiate Temporal Segment"*
  - *"Your A/L Countdown"* instead of *"Examination Temporal Delta Gauge"*
  - *"Join Study Room"* instead of *"Execute WebRTC Video Conferencing Protocol"*

### 9.3 Spacious Low-Density Layouts
- Generous breathing room: Container padding `p-6` to `p-10`, section spacing `gap-6` to `gap-8`.
- No clutter: Complex details tucked cleanly into expandable drawers, popovers, or modal sheets.
- Zero text clipping: Explicit `break-words`, `truncate`, and responsive flex wraps tested down to 375px viewports.

---

## 10. Data Schemas & TypeScript Type Contracts

```typescript
// Calendar Study Block
export interface ScheduledStudyBlock {
  id: string;
  studyId: string;
  subject: string;
  topic?: string;
  date: string;               // YYYY-MM-DD
  startTime: string;          // HH:mm (e.g. "08:30")
  endTime: string;            // HH:mm (e.g. "10:30")
  durationHours: number;      // e.g. 2.0
  color?: string;             // Hex code or GCal color token
  focusTarget?: number;       // 1 - 10
  notes?: string;
  meetingUrl?: string;        // Google Meet / Jitsi / Zoom link
  meetingType?: 'jitsi' | 'google_meet' | 'zoom';
  isCompleted?: boolean;
  completedLogId?: string;
  isAiGenerated?: boolean;
  createdAt: string;
}

// Homework / Assignment Task
export interface HomeworkAssignment {
  id: string;
  studyId: string;
  title: string;
  subject: string;
  dueDate: string;            // YYYY-MM-DD
  dueTime?: string;           // HH:mm
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

// Exam Countdown Target
export interface ExamCountdownDetails {
  examYear: string;
  examDate: Date;
  totalDaysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  isPassed: boolean;
  formattedTargetDate: string;
  milestones: Array<{
    name: string;
    targetDate: Date;
    daysRemaining: number;
  }>;
}

// Calendar Preference Settings
export interface CalendarPreferences {
  defaultView: 'month' | 'week' | 'day';
  subjectColors: Record<string, string>;
  weeklyHourTarget: number;
  focusStyle: 'early_bird' | 'night_owl' | 'balanced';
  browserNotificationsEnabled: boolean;
  notificationLeadMinutes: number;
}
```

---

## 11. Recommended Implementation Plan & Architecture

| Phase | Target Deliverables | Key Components & Files |
|---|---|---|
| **Phase 1: Core Engine & Routing** | Route `/calendar`, Navigation links, TypeScript interfaces, Storage models | `src/app/calendar/page.tsx`, `src/types/calendar.ts`, `Header.tsx` |
| **Phase 2: Calendar Views & Drag-and-Drop** | Month, Week, Day view components, Google Calendar colors, DnD rescheduling, Past study history overlay | `MonthView.tsx`, `WeekView.tsx`, `DayView.tsx`, `StudyBlockCard.tsx`, `PastHistoryOverlay.tsx` |
| **Phase 3: Google Calendar Sync & Virtual Rooms** | RFC 5545 `.ics` generator & parser, 1-click GCal links, Jitsi/Meet/Zoom room generator | `icsGenerator.ts`, `icsParser.ts`, `virtualRoomGenerator.ts`, `GoogleCalendarSyncModal.tsx`, `VirtualRoomModal.tsx` |
| **Phase 4: Smart AI Scheduler & Homework Tracker** | Stream-tailored AI timetable generator, Assignment tracker drawer & calendar badges | `aiScheduleGenerator.ts`, `AiScheduleModal.tsx`, `AssignmentTrackerDrawer.tsx` |
| **Phase 5: Countdown Engine & Mobile Lockscreen Widget** | Live A/L countdown clock, HTML5 canvas 300 DPI wallpaper generator, Browser notifications | `countdownEngine.ts`, `lockscreenCanvas.ts`, `CountdownWidgetModal.tsx`, `browserNotifications.ts` |
| **Phase 6: Verification & QA Suite** | Comprehensive unit, edge-case, and E2E test suites (Tiers 1–5 parity, zero regressions) | `tests/calendar-scheduling.test.js`, `tests/e2e-runner.js` |

---

## 12. Automated Verification & Test Plan

1. **RFC 5545 iCalendar Conformance Tests**:
   - Verify generated `.ics` files validate strictly against RFC 5545 format (`BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID`, `BEGIN:VEVENT`, valid UTC `DTSTART`/`DTEND`).
   - Validate `.ics` parser accurately extracts events, timestamps, and recurring rules without time-drift.

2. **AI Schedule Generator Algorithm Tests**:
   - Verify weekly study schedules generated for Biological Science allocate 100% of time across Biology, Chemistry, and the registered optional subject.
   - Verify schedules for Physical Science allocate 100% of time across Combined Maths, Physics, and the registered optional subject.
   - Verify 2026 batch schedules allocate intensive targets (35–45h) and 2028/2029 allocate beginner targets (18–25h).
   - Verify subject bottleneck remediation correctly allocates extra time to low Z-score subjects.

3. **Countdown & Lockscreen Canvas Engine Tests**:
   - Verify exact remaining days calculation across 2026, 2027, 2028, and 2029 target exam dates.
   - Verify canvas wallpaper generation renders at standard resolutions (1080x2400 and 1290x2796) with zero NaN dimensions.

4. **Multi-Session & Study Logger Parity Tests**:
   - Ensure multi-session study logging, auto-calculation, and manual overrides integrate seamlessly with the calendar study history overlay.

5. **Build & Regression Suite**:
   - Ensure `npm test` and `node tests/e2e-runner.js` maintain 100% pass rate (385+ tests).
   - Ensure `npm run build` succeeds with zero TypeScript or Next.js static export errors into `out/`.
