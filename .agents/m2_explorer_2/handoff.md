# Exploration Report: Feature 11 (Drag-and-Drop Rescheduling) & Feature 12 (Past Study History Overlay)

**Explorer**: Explorer 2 (Milestone 2: Google Calendar Study Suite & DnD)  
**Date**: 2026-08-27  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\m2_explorer_2`  
**Target Delivery Files**:
- `src/types/calendar.ts`
- `src/lib/calendar/scheduleEngine.ts`
- `src/lib/calendar/historyOverlay.ts`
- `src/hooks/useStudySchedule.ts`
- `src/components/calendar/StudyBlockItem.tsx`
- `src/components/calendar/PastStudyBlockDrawer.tsx`
- `src/components/calendar/WeekView.tsx` / `DayView.tsx` / `MonthView.tsx`

---

## 1. Observation

### 1.1 Requirements & Interface Contracts in Authoritative Documents
- **`PROJECT.md` lines 26-28 & 81-98**:
  - Feature 11: "Drag-and-Drop Rescheduling: Native drag-and-drop study block rescheduling across days and time slots with live schedule recalculation."
  - Feature 12: "Past Study History Overlay: Automatically overlay past study logs (`AppContext.history`) as colored time blocks on the calendar."
  - `StudyBlock` interface specification:
    ```typescript
    export interface StudyBlock {
      id: string;
      title: string;
      subject: string;
      date: string; // YYYY-MM-DD
      startTime: string; // HH:MM (24-hour)
      endTime: string; // HH:MM (24-hour)
      durationHours: number;
      color?: string;
      notes?: string;
      isCompleted?: boolean;
      meetingLink?: string;
      meetingType?: 'jitsi' | 'gmeet' | 'zoom';
      source?: 'manual' | 'ai_schedule' | 'gcal_import' | 'history_overlay';
    }
    ```

### 1.2 Existing Data Models & History Structure
- **`src/types/logs.ts` lines 8-69**:
  - `StudySession` supports `id`, `subject`, `hours`, `startTime` (e.g. `"08:30"`), `endTime` (e.g. `"10:00"`), `focus`, `productivity`, `notes`, `topic`, `color`.
  - `DailyLogEntry` contains `studyId`, `dateOfStudy` (YYYY-MM-DD), `sessions?: StudySession[]`, `subjects?: SubjectLog[]`, `subject1Hours`, `subject2Hours`, `subject3Hours`, `totalHours`, `focusScore`, `productivityScore`, `notes`, `proofPhotoUrl`.
- **`src/context/AppContext.tsx` lines 19-25, 73-125**:
  - `history: DailyLogEntry[]` is loaded on mount from `ApiClient.getStudentHistory(member.studyId, member.email)`.
  - `refreshHistory()` triggers re-fetching and updates state.
  - `recordDailyLogOptimistic()` performs local optimistic updates.

### 1.3 Time Duration & Badge Styling Utilities
- **`src/lib/utils.ts` lines 1065-1086**:
  - `calculateDurationFromTimes(start: string, end: string): number` parses `HH:MM` strings, computes decimal hours, and seamlessly handles overnight rollover (e.g., `"23:00"` to `"01:30"` = `2.5` hours).
  - `formatHoursHuman(hours: number): string` formats decimal hours into friendly strings like `"1h 30m"` or `"45m"`.
- **`src/components/dashboard/SessionBadges.tsx` lines 18-98**:
  - `getSubjectBadgeConfig(subjectName: string)` provides canonical subject color mappings:
    - Biology: Emerald (`#10B981`, `bg-emerald-500/15`, `text-emerald-300`)
    - Combined Maths: Indigo (`#6366F1`, `bg-indigo-500/15`, `text-indigo-300`)
    - Physics: Purple (`#A855F7`, `bg-purple-500/15`, `text-purple-300`)
    - Chemistry: Amber (`#F59E0B`, `bg-amber-500/15`, `text-amber-300`)
    - ICT: Cyan (`#06B6D4`, `bg-cyan-500/15`, `text-cyan-300`)
    - Agriculture: Lime (`#84CC16`, `bg-lime-500/15`, `text-lime-300`)
    - Unrecognized/Other: Zinc (`#71717A`)

### 1.4 Existing Modals & Drawers
- **`src/components/dashboard/SessionDetailDrawer.tsx` lines 40-298**:
  - Existing `SessionDetailDrawer` dialog inspects a `DailyLogEntry` with session breakdowns, time chips (`Clock` icon), focus/energy stats, remarks, and photo proof zoom.

---

## 2. Logic Chain

### 2.1 Feature 11: Drag-and-Drop Rescheduling Mechanics

#### A. DnD Event Pipeline (HTML5 Native + Touch-Resilience)
1. **Drag Source (`StudyBlockItem`)**:
   - Only scheduled blocks (`source !== 'history_overlay'`) are draggable (`draggable={true}`).
   - `onDragStart`:
     - Payload attached via `e.dataTransfer.setData('application/json', JSON.stringify({ blockId, sourceDate, sourceStartTime, durationHours }))`.
     - `e.dataTransfer.effectAllowed = 'move'`.
     - Set local dragging state (e.g., `isDragging = true`, opacity 40%, grabbing cursor).
   - `onDragEnd`: Reset drag state.
2. **Drop Targets (`TimeSlotCell` in Week/Day View, `DayCell` in Month View)**:
   - In **Week/Day View**, each slot corresponds to a specific date (`YYYY-MM-DD`) and time (`HH:MM` on 30-minute or 15-minute grid boundaries: `06:00`, `06:30`, ..., `23:30`).
   - `onDragOver`: Call `e.preventDefault()` to enable dropping; activate visual hover highlight (`bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30`).
   - `onDragLeave`: Remove hover highlight.
   - `onDrop`: Extract `blockId`, `targetDate`, `targetStartTime`. Compute new `endTime = addHoursToTimeString(targetStartTime, durationHours)`.
   - In **Month View**, drop targets are day cells (`YYYY-MM-DD`). The block's `date` updates to `targetDate`, retaining its original `startTime` and `endTime`.

#### B. Touch Screen Fallback for Mobile (375px+ Viewports)
- Native HTML5 Drag and Drop does not fire touch events on iOS Safari / Android Chrome.
- To ensure compliance with R1 (375px mobile responsiveness):
  1. Add a tactile **Quick Reschedule** action popover/sheet triggered on long-press or tap on the block's `...` action menu on mobile viewports.
  2. The mobile sheet presents:
     - Day picker (`Today`, `Tomorrow`, `Pick Date`)
     - Time slot picker (`Morning 08:30`, `Afternoon 14:00`, `Evening 19:00`, or custom time)
     - 1-tap "Move Block" action.
  3. This guarantees fluid rescheduling on both desktop pointer devices and mobile touchscreens.

#### C. Instant Live Schedule Recalculation Engine
When a block is rescheduled (`rescheduleBlock(blockId, targetDate, targetStartTime)`):
1. **Time Math**:
   ```typescript
   export function recalculateBlockTimes(
     startTime: string,
     durationHours: number
   ): { startTime: string; endTime: string } {
     const [h, m] = startTime.split(':').map(Number);
     const totalMins = h * 60 + m + Math.round(durationHours * 60);
     const endH = Math.floor(totalMins / 60) % 24;
     const endM = totalMins % 60;
     const formattedEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
     return { startTime, endTime: formattedEnd };
   }
   ```
2. **Aggregates Recalculation**:
   - Group blocks by date and calculate daily scheduled hours per date.
   - Recalculate per-subject breakdown for the day.
   - Instant visual update with zero page reload.
3. **Collision & Overlap Partitioning (Google Calendar Layout Algorithm)**:
   - When multiple blocks share overlapping time slots on the same day:
     - Sort blocks by `startTime` ascending, then `durationHours` descending.
     - Group colliding blocks into clusters.
     - For cluster with $N$ concurrent columns, assign column index $k \in [0, N-1]$.
     - CSS layout:
       - `top`: `(startMinutes - dayStartMinutes) * pxPerMin`
       - `height`: `durationMinutes * pxPerMin`
       - `width`: `calc(100% / ${N} - 4px)`
       - `left`: `calc(${(k * 100) / N}% + 2px)`
   - This ensures zero visual clipping and identical aesthetics to Google Calendar desktop.

---

### 2.2 Feature 12: Past Study History Overlay Architecture

#### A. History to StudyBlock Synthesis Pipeline
`AppContext.history` contains historical `DailyLogEntry` records. The synthesis utility `convertHistoryToStudyBlocks(history, subjectColors)` transforms them into `StudyBlock` objects:

1. **For logs WITH `sessions` array containing `startTime` & `endTime`**:
   - Map each session directly to a `StudyBlock` with:
     - `id: \`history_\${log.studyId}_\${log.dateOfStudy}_\${sess.id || idx}\``
     - `title: \`\${sess.subject} (Completed)\``
     - `subject: sess.subject`
     - `date: log.dateOfStudy`
     - `startTime: sess.startTime`
     - `endTime: sess.endTime`
     - `durationHours: sess.hours`
     - `color: subjectColors[sess.subject] || getSubjectBadgeConfig(sess.subject).hex`
     - `notes: sess.notes || sess.topic`
     - `isCompleted: true`
     - `source: 'history_overlay'`
     - `focusRating: sess.focus || log.focusScore || 8`
     - `productivityRating: sess.productivity || log.productivityScore || 8`
     - `proofPhotoUrl: log.proofPhotoUrl || log.proofUrl`

2. **For legacy logs WITHOUT start/end times (duration-only or subject hours)**:
   - Extract subject sessions using `log.subjects` or scalar `subject1Hours`, `subject2Hours`, `subject3Hours`.
   - Allocate into standard realistic study windows:
     - Session 1: `08:30` to `08:30 + hours`
     - Session 2: `14:00` to `14:00 + hours`
     - Session 3: `19:00` to `19:00 + hours`
   - Compute `endTime` deterministically.

#### B. Read-Only Inspection Interaction
- When a user clicks a `source === 'history_overlay'` block:
  - Opens `PastStudyBlockDrawer` (or reuses `SessionDetailDrawer`).
  - Displays:
    - Subject Badge & Full Subject Name
    - Study Date & Exact Completed Duration (`2.5 hrs`)
    - Focus Rating (1-10) with Qualitative Indicator (e.g. `🔥 Deep Flow (9/10)`)
    - Productivity Score (1-10)
    - Session Topic & Study Notes
    - Verified Study Proof thumbnail with zoom modal
    - "Verified Past Log" lock badge indicating read-only status.

---

### 2.3 Interaction Between Past History Blocks & Scheduled Future Blocks

| Dimension | Past History Blocks (`source: 'history_overlay'`) | Scheduled Future Blocks (`source: 'manual' \| 'ai_schedule' \| 'gcal_import'`) |
| :--- | :--- | :--- |
| **Draggability** | 🔒 `draggable={false}`, cursor `pointer` | 🖐️ `draggable={true}`, cursor `grab` |
| **Visual Style** | Solid frosted background, subtle opacity, checkmark badge (`CheckCircle2`), "Completed" pill | Crisp vibrant border, left color bar, clock icon (`Clock`), drag handle (`GripVertical`) |
| **Editable** | Read-only inspection drawer | Full edit modal (change subject, times, notes, delete) |
| **Storage Source** | `AppContext.history` (Google Sheets backend) | `localStorage` (`studysync_schedule_blocks_${studyId}`) |
| **Toggle Visibility**| Controllable via "Show Past History" toolbar toggle switch | Always visible |
| **Timeline Boundary**| Displays on past dates and today (if logged) | Displays on today and future dates (or past uncompleted) |

---

## 3. Recommended Data Structures & Signatures

### 3.1 Extended Calendar Types (`src/types/calendar.ts`)
```typescript
export interface StudyBlock {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  durationHours: number;
  color?: string;
  notes?: string;
  isCompleted?: boolean;
  meetingLink?: string;
  meetingType?: 'jitsi' | 'gmeet' | 'zoom';
  source?: 'manual' | 'ai_schedule' | 'gcal_import' | 'history_overlay';
  // History Overlay Metadata
  focusRating?: number;
  productivityRating?: number;
  topic?: string;
  proofPhotoUrl?: string;
  originalLogId?: string;
}

export interface SubjectColorMap {
  [subjectName: string]: string; // Hex color code e.g. '#10b981'
}

export interface DragBlockPayload {
  blockId: string;
  sourceDate: string;
  sourceStartTime: string;
  durationHours: number;
  subject: string;
}

export interface DailyScheduleSummary {
  date: string;
  totalPlannedHours: number;
  totalCompletedHours: number;
  blocksCount: number;
  subjectBreakdown: Record<string, number>;
}
```

### 3.2 Schedule Management Hook (`src/hooks/useStudySchedule.ts`)
```typescript
export interface UseStudyScheduleReturn {
  // State
  scheduledBlocks: StudyBlock[];
  historyBlocks: StudyBlock[];
  allBlocks: StudyBlock[]; // merged + filtered
  subjectColors: SubjectColorMap;
  showHistoryOverlay: boolean;
  activeDragBlock: DragBlockPayload | null;

  // Actions
  createBlock: (block: Omit<StudyBlock, 'id'>) => StudyBlock;
  updateBlock: (id: string, updates: Partial<StudyBlock>) => void;
  deleteBlock: (id: string) => void;
  rescheduleBlock: (blockId: string, targetDate: string, targetStartTime: string) => void;
  updateSubjectColor: (subject: string, colorHex: string) => void;
  setShowHistoryOverlay: (show: boolean) => void;
  setActiveDragBlock: (payload: DragBlockPayload | null) => void;
  getDailySummary: (date: string) => DailyScheduleSummary;
}
```

---

## 4. Caveats

1. **Overnight Sessions**: If a study session starts at `23:30` and lasts 2 hours, `endTime` wraps past midnight (`01:30`). The collision engine and duration calculator in `src/lib/utils.ts` already handle overnight calculations, but the visual block in Week/Day view should clamp display to 23:59 or split across midnight boundary.
2. **Local Storage Scoping**: Scheduled future blocks must be scoped by student `studyId` (`studysync_schedule_${studyId}`) so different signed-in users on the same machine do not see each other's custom schedules.
3. **No Caveats on Backend / Static Export**: All calendar DnD and overlay features operate 100% client-side, making them 100% compatible with Next.js static export (`output: 'export'`).

---

## 5. Conclusion

1. **Feature 11 (DnD Rescheduling)** is fully viable via HTML5 Native Drag and Drop augmented with a mobile-friendly quick-reschedule sheet. The live recalculation engine computes new start/end times and daily subject totals instantly with zero latency.
2. **Feature 12 (Past Study History Overlay)** seamlessly integrates with `AppContext.history`, transforming both multi-session logs and legacy logs into rich, read-only colored study blocks with focus scores, notes, and proof photo inspections.
3. **Interaction Protocol** establishes a clear visual and functional boundary: past logs are immutable and checked-off; scheduled blocks are active, draggable, and editable.

---

## 6. Verification Method

1. **Automated Unit Testing (`tests/m2-calendar-dnd.test.js`)**:
   - Test `calculateDurationFromTimes` and `recalculateBlockTimes` with various time slots and durations (0.5h, 1.5h, 2.75h).
   - Test `convertHistoryToStudyBlocks` synthesizing both session-rich logs and legacy logs.
   - Test `rescheduleBlock` state update logic (date change, time recalculation, total hours recalculation).
   - Test collision partitioning algorithm for overlapping blocks.
2. **Execution Command**:
   ```bash
   node --test tests/m2-*.test.js
   npm test
   npm run build
   ```
3. **UI / Interactive Verification**:
   - Drag a scheduled study block from Tuesday 10:00 to Thursday 14:30; verify new start/end times (`14:30 - 16:00`) and updated daily summary cards.
   - Inspect a past study block; verify read-only drawer opens with exact focus score, subject color, and study notes.
   - Toggle "Show Past History" switch; verify past blocks show and hide instantly.
