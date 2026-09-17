# Implementation Plan: Expandable History Table with Session Badges & Details Drawer

**Target Milestone**: M1 (Multi-Session Logger & History Badges/Drawer)  
**Author**: `m1_explorer_2`  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`  
**Target Files**:
- `src/components/dashboard/SessionBadges.tsx` (New Component)
- `src/components/dashboard/SessionDetailDrawer.tsx` (New Component)
- `src/app/dashboard/page.tsx` (Integration & Expandable History Table)

---

## 1. Executive Summary & Problem Scope

### 1.1 Objective
Enhance the Student Dashboard (`/dashboard`) study history table with:
1. **Compact Colored Session Badges (`SessionBadges.tsx`)**: Display high-density, legible colored badges (e.g. `[Bio: 2.0h]`, `[Phys: 1.5h]`, `[Chem: 1.0h]`) inside history table rows, mapping to the student's study sessions and subjects.
2. **Session Detail Drawer (`SessionDetailDrawer.tsx`)**: An interactive slide-over drawer / modal showing the complete session breakdown for any selected day—including exact start/end timestamps (e.g. `08:30 – 10:00`), individual focus and productivity ratings (1–10), session topics, specific session notes, and proof photo previews.
3. **Expandable History Rows & Responsive Mobile Cards**: An inline row accordion for rapid in-place scanning on desktop, and a low-density card layout for mobile viewports (down to 375px) with zero text clipping.
4. **Ergonomic Design & Everyday Human Language**: Minimum 44–48px touch targets, warm supportive English (no robotic jargon), and spacious low-density layouts following the project design guidelines.

### 1.2 Data Schema Parity
The solution fully supports both:
- **New multi-session logs** with `log.sessions: StudySession[]` containing `id`, `subject`, `hours`, `startTime`, `endTime`, `focus`, `productivity`, `notes`, `topic`.
- **Legacy daily logs** with `log.subjects: SubjectLog[]` or scalar fields (`subject1Hours`, `subject2Hours`, `subject3Hours`), guaranteeing zero regression for older records.

---

## 2. Component Specifications

### 2.1 Component 1: `SessionBadges.tsx` (`src/components/dashboard/SessionBadges.tsx`)

#### Purpose
Renders compact, color-coded badges for all sessions or subjects recorded in a daily study log.

#### Subject Color & Abbreviation Configuration
| Subject | Abbreviation | Color Palette | Tailwind Classes |
| :--- | :--- | :--- | :--- |
| **Biology** | `Bio` | Emerald Green | `bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25` |
| **Combined Maths** | `Maths` | Indigo Blue | `bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25` |
| **Physics** | `Phys` | Purple / Violet | `bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25` |
| **Chemistry** | `Chem` | Amber / Gold | `bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25` |
| **ICT** | `ICT` | Cyan / Sky | `bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25` |
| **Agriculture** | `Agri` | Lime Green | `bg-lime-500/15 text-lime-300 border-lime-500/30 hover:bg-lime-500/25` |
| **Other / Fallback** | 4-letter prefix | Zinc / Slate | `bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700` |

#### Interface Contract
```typescript
export interface SessionBadgesProps {
  log: DailyLogEntry;
  sessions?: StudySession[];
  maxVisible?: number; // Defaults to 3; shows "+N more" badge when exceeded
  size?: 'sm' | 'md';
  onBadgeClick?: (session?: StudySession, log?: DailyLogEntry) => void;
  className?: string;
  showTimeRange?: boolean;
}
```

#### Extraction Logic
1. If `log.sessions` is present and non-empty:
   - Extract valid sessions with `hours > 0`.
   - If total sessions exceed `maxVisible`, show first `maxVisible` badges followed by a `+N more` interactive pill.
2. Fallback to `log.subjects`:
   - Filter items where `hours > 0`.
3. Fallback to scalar fields (`subject1Hours`, `subject2Hours`, `subject3Hours`):
   - Construct synthetic sessions for non-zero values.
4. Tooltip & Title:
   - Hovering displays: `"[Subject]: [X.X]h (Focus: [F]/10) - [Topic/Time if present]"`.

---

### 2.2 Component 2: `SessionDetailDrawer.tsx` (`src/components/dashboard/SessionDetailDrawer.tsx`)

#### Purpose
Slide-over drawer (or modal sheet on mobile) displaying the comprehensive breakdown of study sessions for a selected date.

#### Interface Contract
```typescript
export interface SessionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DailyLogEntry | null;
  studentName?: string;
  streamName?: string;
  onViewProof?: (proofUrl: string) => void;
}
```

#### Key Sections
1. **Header & Context**:
   - Formatted Date (e.g. `Tuesday, August 25, 2026`).
   - Summary Badges: Total Hours (`6.5h`), Total Sessions (`3 Sessions`), Focus Average (`9/10 • Deep Focus`).
   - Accessible Close button (minimum 44x44px touch target).
2. **Individual Session Cards**:
   - Each session rendered as an elevated card with subject color accent border.
   - Header with subject badge + start/end time pill (`08:30 – 10:00` or `Duration: 1.5h`).
   - Visual Focus Rating indicator (1–10 rating with color bar or star rating).
   - Topic / Chapter badge (e.g. `Topic: Organic Chemistry Reaction Mechanisms`).
   - Session Notes block with comfortable typography and speech bubble styling.
3. **Daily Overall Notes**:
   - Card displaying general day reflections (`log.notes`).
4. **Study Proof Image**:
   - Embedded proof thumbnail with 1-click full-screen zoom button triggering `onViewProof(url)`.
5. **Ergonomic Footer**:
   - Minimum 44px primary action button ("Close Details").

---

### 2.3 Dashboard History Table Integration (`src/app/dashboard/page.tsx`)

#### Table Features
1. **Inline Expandable Row (Accordion Mode)**:
   - `expandedRowKeys: Record<string, boolean>` state.
   - Clickable chevron (`ChevronDown` / `ChevronRight`) toggles row expansion.
   - Expanded row reveals a neat sub-grid with session time blocks, topics, and focus badges without opening the full drawer.
2. **Slide-Over Detail Drawer Integration**:
   - Clicking "Inspect", "View Details", or clicking a session badge opens the `SessionDetailDrawer`.
3. **Responsive Mobile Layout**:
   - Desktop: Full data table with Date, Sessions (badges), Total Hours, Focus/Prod, Notes, Actions, Proof.
   - Mobile (<640px): Low-density study card list with large touch targets (min 44px height), badges flex-wrap, and "View Session Breakdown" button.
4. **Enhanced Search**:
   - Search matches date, subject names, session topics, and notes.

---

## 3. Component Source Code Blueprints

### 3.1 `src/components/dashboard/SessionBadges.tsx`
```tsx
'use client';

import React from 'react';
import { DailyLogEntry, StudySession } from '@/types/logs';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface SessionBadgesProps {
  log: DailyLogEntry;
  sessions?: StudySession[];
  maxVisible?: number;
  size?: 'sm' | 'md';
  onBadgeClick?: (session?: StudySession, log?: DailyLogEntry) => void;
  className?: string;
  showTimeRange?: boolean;
}

export function getSubjectBadgeConfig(subjectName: string): {
  abbr: string;
  fullName: string;
  badgeClass: string;
  dotColor: string;
  borderColor: string;
  hex: string;
} {
  const normalized = (subjectName || '').trim().toLowerCase();

  if (normalized.includes('bio')) {
    return {
      abbr: 'Bio',
      fullName: 'Biology',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
      dotColor: 'bg-emerald-400',
      borderColor: 'border-emerald-500/30',
      hex: '#10b981',
    };
  }
  if (normalized.includes('math') || normalized.includes('comb')) {
    return {
      abbr: 'Maths',
      fullName: 'Combined Maths',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
      dotColor: 'bg-indigo-400',
      borderColor: 'border-indigo-500/30',
      hex: '#6366f1',
    };
  }
  if (normalized.includes('phys')) {
    return {
      abbr: 'Phys',
      fullName: 'Physics',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
      dotColor: 'bg-purple-400',
      borderColor: 'border-purple-500/30',
      hex: '#a855f7',
    };
  }
  if (normalized.includes('chem')) {
    return {
      abbr: 'Chem',
      fullName: 'Chemistry',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
      dotColor: 'bg-amber-400',
      borderColor: 'border-amber-500/30',
      hex: '#f59e0b',
    };
  }
  if (normalized.includes('ict') || normalized.includes('info') || normalized.includes('tech')) {
    return {
      abbr: 'ICT',
      fullName: 'ICT',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25',
      dotColor: 'bg-cyan-400',
      borderColor: 'border-cyan-500/30',
      hex: '#06b6d4',
    };
  }
  if (normalized.includes('agri')) {
    return {
      abbr: 'Agri',
      fullName: 'Agriculture',
      badgeClass: 'bg-lime-500/15 text-lime-300 border-lime-500/30 hover:bg-lime-500/25',
      dotColor: 'bg-lime-400',
      borderColor: 'border-lime-500/30',
      hex: '#84cc16',
    };
  }

  const shortName = subjectName ? (subjectName.length > 5 ? subjectName.slice(0, 4) : subjectName) : 'Sub';
  return {
    abbr: shortName,
    fullName: subjectName || 'Other Subject',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700/80',
    dotColor: 'bg-zinc-400',
    borderColor: 'border-zinc-700',
    hex: '#71717a',
  };
}

export function SessionBadges({
  log,
  sessions: explicitSessions,
  maxVisible = 3,
  size = 'sm',
  onBadgeClick,
  className,
  showTimeRange = false,
}: SessionBadgesProps) {
  // Extract session entries from log
  const items: Array<{
    id: string;
    subject: string;
    hours: number;
    startTime?: string;
    endTime?: string;
    focus?: number;
    notes?: string;
    topic?: string;
    sessionObj?: StudySession;
  }> = React.useMemo(() => {
    if (explicitSessions && explicitSessions.length > 0) {
      return explicitSessions.map((s, idx) => ({
        id: s.id || `sess_${idx}`,
        subject: s.subject || 'Subject',
        hours: Number(s.hours) || 0,
        startTime: s.startTime,
        endTime: s.endTime,
        focus: s.focus,
        notes: s.notes,
        topic: s.topic,
        sessionObj: s,
      }));
    }

    if (log.sessions && Array.isArray(log.sessions) && log.sessions.length > 0) {
      return log.sessions.map((s, idx) => ({
        id: s.id || `sess_${idx}`,
        subject: s.subject || 'Subject',
        hours: Number(s.hours) || 0,
        startTime: s.startTime,
        endTime: s.endTime,
        focus: s.focus,
        notes: s.notes,
        topic: s.topic,
        sessionObj: s,
      }));
    }

    if (log.subjects && Array.isArray(log.subjects) && log.subjects.length > 0) {
      return log.subjects
        .filter((s) => Number(s.hours) > 0)
        .map((s, idx) => ({
          id: `sub_${idx}`,
          subject: s.name,
          hours: Number(s.hours),
          focus: s.focus,
        }));
    }

    // Scalar fallbacks
    const fallbackList = [];
    const h1 = Number(log.subject1Hours ?? log.hoursSubject1 ?? 0);
    const h2 = Number(log.subject2Hours ?? log.hoursSubject2 ?? 0);
    const h3 = Number(log.subject3Hours ?? log.hoursSubject3 ?? 0);

    if (h1 > 0) fallbackList.push({ id: 's1', subject: log.subject1 || 'Subject 1', hours: h1 });
    if (h2 > 0) fallbackList.push({ id: 's2', subject: log.subject2 || 'Subject 2', hours: h2 });
    if (h3 > 0) fallbackList.push({ id: 's3', subject: log.subject3 || 'Subject 3', hours: h3 });

    return fallbackList;
  }, [log, explicitSessions]);

  if (items.length === 0) {
    return (
      <span className="text-[11px] text-zinc-500 font-mono italic">
        No sessions
      </span>
    );
  }

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visibleItems.map((item) => {
        const config = getSubjectBadgeConfig(item.subject);
        const timeStr = item.startTime && item.endTime ? `${item.startTime}–${item.endTime}` : '';
        const titleText = `${config.fullName}: ${item.hours.toFixed(1)}h${
          item.focus ? ` (Focus: ${item.focus}/10)` : ''
        }${timeStr ? ` [${timeStr}]` : ''}${item.topic ? ` - ${item.topic}` : ''}`;

        return (
          <button
            key={item.id}
            type="button"
            title={titleText}
            onClick={() => onBadgeClick?.(item.sessionObj, log)}
            className={cn(
              'inline-flex items-center gap-1 font-mono font-medium rounded-md border transition-all duration-150',
              config.badgeClass,
              size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
              onBadgeClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)} />
            <span className="font-semibold">{config.abbr}:</span>
            <span>{item.hours.toFixed(1)}h</span>
            {showTimeRange && timeStr && (
              <span className="text-[10px] opacity-75 hidden sm:inline-flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {timeStr}
              </span>
            )}
          </button>
        );
      })}

      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => onBadgeClick?.(undefined, log)}
          className={cn(
            'inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/80 text-zinc-300 font-mono font-medium hover:bg-zinc-700 transition-colors',
            size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
          )}
          title={`${remainingCount} more session${remainingCount > 1 ? 's' : ''}`}
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
}
```

---

### 3.2 `src/components/dashboard/SessionDetailDrawer.tsx`
```tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DailyLogEntry, StudySession } from '@/types/logs';
import { formatDate } from '@/lib/utils';
import { getSubjectBadgeConfig } from '@/components/dashboard/SessionBadges';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Zap,
  Target,
  Sparkles,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  BookOpen,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';

export interface SessionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DailyLogEntry | null;
  studentName?: string;
  streamName?: string;
  onViewProof?: (url: string) => void;
}

export function SessionDetailDrawer({
  open,
  onOpenChange,
  log,
  studentName,
  streamName,
  onViewProof,
}: SessionDetailDrawerProps) {
  if (!log) return null;

  const dateStr = log.dateOfStudy || log.date;
  const formattedDate = formatDate(dateStr || '', 'long');

  // Normalize sessions array
  const sessions: StudySession[] = React.useMemo(() => {
    if (log.sessions && Array.isArray(log.sessions) && log.sessions.length > 0) {
      return log.sessions;
    }

    if (log.subjects && Array.isArray(log.subjects) && log.subjects.length > 0) {
      return log.subjects
        .filter((s) => Number(s.hours) > 0)
        .map((s, idx) => ({
          id: `synth_${idx}`,
          subject: s.name,
          hours: Number(s.hours),
          focus: s.focus || log.focusScore || 8,
          productivity: s.productivity || log.productivityScore || 8,
        }));
    }

    // Scalar subject fallbacks
    const synthList: StudySession[] = [];
    const h1 = Number(log.subject1Hours ?? log.hoursSubject1 ?? 0);
    const h2 = Number(log.subject2Hours ?? log.hoursSubject2 ?? 0);
    const h3 = Number(log.subject3Hours ?? log.hoursSubject3 ?? 0);

    if (h1 > 0) {
      synthList.push({
        id: 's1',
        subject: log.subject1 || 'Subject 1',
        hours: h1,
        focus: log.focusScore || 8,
        productivity: log.productivityScore || 8,
      });
    }
    if (h2 > 0) {
      synthList.push({
        id: 's2',
        subject: log.subject2 || 'Subject 2',
        hours: h2,
        focus: log.focusScore || 8,
        productivity: log.productivityScore || 8,
      });
    }
    if (h3 > 0) {
      synthList.push({
        id: 's3',
        subject: log.subject3 || 'Subject 3',
        hours: h3,
        focus: log.focusScore || 8,
        productivity: log.productivityScore || 8,
      });
    }

    return synthList;
  }, [log]);

  const totalHours = Number(log.totalHours || sessions.reduce((acc, s) => acc + (Number(s.hours) || 0), 0)).toFixed(1);
  const avgFocus = log.focusScore || log.focusLevel || Math.round(
    sessions.reduce((acc, s) => acc + (s.focus || 8), 0) / (sessions.length || 1)
  );
  const avgProd = log.productivityScore || log.productivityLevel || Math.round(
    sessions.reduce((acc, s) => acc + (s.productivity || 8), 0) / (sessions.length || 1)
  );

  const proofUrl = log.proofPhotoUrl || log.proofUrl || log.photoProofUrl || log.proofImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Study Session Breakdown
            </span>
            {streamName && <span className="text-xs text-zinc-400">{streamName}</span>}
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 font-display">
            <Calendar className="h-5 w-5 text-indigo-400 shrink-0" />
            <span>{formattedDate}</span>
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-zinc-400">
            Full session breakdown, timestamps, and focus ratings for this study day.
          </DialogDescription>
        </DialogHeader>

        {/* 1. Day Summary Bento */}
        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">Total Time</span>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">{totalHours}h</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">Sessions</span>
            <div className="text-lg sm:text-xl font-extrabold text-cyan-400 font-mono">{sessions.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-0.5">
            <span className="text-[11px] text-zinc-400 font-medium">Focus / Energy</span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              {avgFocus}/10
            </div>
          </div>
        </div>

        {/* 2. Individual Sessions List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Logged Sessions ({sessions.length})</span>
            </h4>
          </div>

          {sessions.length === 0 ? (
            <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400">
              No session details recorded for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => {
                const config = getSubjectBadgeConfig(session.subject);
                const hasTime = session.startTime && session.endTime;

                return (
                  <div
                    key={session.id || index}
                    className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: config.hex }} />
                        <span className="text-sm font-bold text-white">{session.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${config.badgeClass}`}
                        >
                          {config.abbr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasTime && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                            <Clock className="h-3 w-3 text-cyan-400" />
                            {session.startTime} – {session.endTime}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-800/50">
                          {Number(session.hours || 0).toFixed(1)} hrs
                        </span>
                      </div>
                    </div>

                    {/* Topic and Focus Indicators */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-zinc-800/60">
                      {session.topic && (
                        <div className="flex items-center gap-1 text-zinc-300 font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                          <span>{session.topic}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[11px] text-zinc-400">
                          Focus: <strong className="text-white font-mono">{session.focus || 8}/10</strong>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400">
                          Productivity: <strong className="text-white font-mono">{session.productivity || 8}/10</strong>
                        </span>
                      </div>
                    </div>

                    {/* Individual Session Notes */}
                    {session.notes && (
                      <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                        &ldquo;{session.notes}&rdquo;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Overall Daily Notes */}
        {log.notes && (
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-1.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Overall Day Remarks</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">&ldquo;{log.notes}&rdquo;</p>
          </div>
        )}

        {/* 4. Study Proof Photo Preview */}
        {proofUrl && (
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Uploaded Study Proof</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProof?.(proofUrl)}
                className="h-7 text-xs text-indigo-400 hover:text-indigo-300"
              >
                <ExternalLink className="h-3 w-3 mr-1" /> View Full Resolution
              </Button>
            </div>

            <div
              onClick={() => onViewProof?.(proofUrl)}
              className="h-32 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 cursor-pointer hover:border-indigo-500/50 transition-all flex items-center justify-center relative group"
            >
              <img
                src={proofUrl}
                alt="Study proof thumbnail"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs font-medium text-white bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-700">
                  Click to Zoom
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Footer */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
          >
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 4. Integration Details for `src/app/dashboard/page.tsx`

### 4.1 State Additions
```tsx
const [selectedDrawerLog, setSelectedDrawerLog] = useState<DailyLogEntry | null>(null);
const [drawerOpen, setDrawerOpen] = useState(false);
const [expandedRowKeys, setExpandedRowKeys] = useState<Record<string, boolean>>({});

const toggleRowExpansion = (key: string) => {
  setExpandedRowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
};

const handleOpenDrawer = (log: DailyLogEntry) => {
  setSelectedDrawerLog(log);
  setDrawerOpen(true);
};
```

### 4.2 Table Header & Row Structure
```tsx
<Table>
  <TableHeader className="bg-zinc-950/50">
    <TableRow className="border-zinc-800/80">
      <TableHead className="w-8"></TableHead>
      <TableHead className="text-xs text-zinc-400 font-semibold">Date</TableHead>
      <TableHead className="text-xs text-zinc-400 font-semibold">Sessions & Subjects</TableHead>
      <TableHead className="text-xs text-zinc-400 font-semibold">Total Hours</TableHead>
      <TableHead className="text-xs text-zinc-400 font-semibold">Focus & Energy</TableHead>
      <TableHead className="text-xs text-zinc-400 font-semibold">Notes</TableHead>
      <TableHead className="text-xs text-zinc-400 font-semibold text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredLogs.map((log, index) => {
      const rowKey = log.timestamp || log.dateOfStudy || String(index);
      const isExpanded = !!expandedRowKeys[rowKey];

      return (
        <React.Fragment key={rowKey}>
          <TableRow className="border-zinc-800/50 hover:bg-zinc-800/30">
            <TableCell className="p-2 text-center">
              <button
                type="button"
                onClick={() => toggleRowExpansion(rowKey)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={isExpanded ? 'Collapse row' : 'Expand row'}
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </TableCell>
            <TableCell className="font-mono text-xs text-zinc-300 font-semibold whitespace-nowrap">
              {formatDate(log.dateOfStudy || log.date || '', 'short')}
            </TableCell>
            <TableCell>
              <SessionBadges log={log} onBadgeClick={() => handleOpenDrawer(log)} />
            </TableCell>
            <TableCell className="text-xs font-mono font-bold text-cyan-400">
              {Number(log.totalHours || 0).toFixed(1)}h
            </TableCell>
            <TableCell className="text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300">
                F:{log.focusScore || 8} | P:{log.productivityScore || 8}
              </span>
            </TableCell>
            <TableCell className="text-xs text-zinc-400 max-w-[180px] truncate">
              {log.notes || '—'}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDrawer(log)}
                className="h-8 px-2.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg"
              >
                <Layers className="h-3.5 w-3.5 mr-1" /> Details
              </Button>
              {proof && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProofUrl(proof)}
                  className="h-8 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </TableCell>
          </TableRow>

          {/* Inline Expanded Row Details */}
          {isExpanded && (
            <TableRow className="bg-zinc-950/40 border-zinc-800/80">
              <TableCell colSpan={7} className="p-4">
                <div className="rounded-xl p-3 bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Detailed Session Breakdown</span>
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(log)}
                      className="text-indigo-400 hover:underline text-[11px] font-medium"
                    >
                      Open Full Drawer →
                    </button>
                  </div>
                  <SessionBadges log={log} maxVisible={10} showTimeRange={true} onBadgeClick={() => handleOpenDrawer(log)} />
                  {log.notes && (
                    <p className="text-xs text-zinc-400 italic pt-1 border-t border-zinc-800">
                      Notes: {log.notes}
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      );
    })}
  </TableBody>
</Table>
```

---

## 5. Verification & Testing Plan

1. **Static Build Validation**:
   - Run `npm run build` to verify Next.js static export compilation with 0 TypeScript/ESLint errors.
2. **Automated Test Suites**:
   - Run `npm test` to verify zero regression across existing 334+ automated tests in `tests/`.
   - Run `node tests/e2e-runner.js` to verify Tiers 1–4 test runs pass with 100% success rate.
3. **Component Contract Verification**:
   - Verify `SessionBadges` handles:
     - Multi-session objects with start/end time
     - Multi-subject arrays
     - Scalar hours fallback
     - Zero sessions fallback
     - Truncation past `maxVisible`
   - Verify `SessionDetailDrawer`:
     - Renders correct dates, badges, focus ratings, notes, and proof image
     - Closes cleanly on Esc, backdrop click, or Close button
     - Satisfies minimum 44px touch target ergonomics.
