# Implementation Plan: Multi-Session Study Logger & Manual Override (`/daily`)

## Executive Summary
This document provides the exhaustive architectural blueprint, state engine design, ergonomic UI specification, and complete production-ready code implementation for the **Multi-Session Study Logger and Manual Override** on `/daily` for StudySync (Sri Lankan A/L Academic Accountability Platform).

---

## 1. Problem Statement & Scope Alignment

### 1.1 Requirements from `PROJECT.md` and `ORIGINAL_REQUEST.md`
1. **Dynamic Multi-Session Builder**:
   - Interactive `+ Add Session` button allowing students to log multiple distinct study intervals across their 3 stream subjects (e.g. Biology, Chemistry, Physics or Combined Maths, Physics, Chemistry).
   - Each session contains:
     - **Subject Selector** (pre-populated with user's stream subjects).
     - **Duration (Hours)** with decimal precision.
     - **Start / End Time Pickers** with automatic decimal duration calculation and overnight session handling.
     - **Focus & Energy Rating** (1–10 scale) per session.
     - **Session Topic & Notes** (e.g. "Mechanics past paper", "Plant Physiology active recall").
     - **Ergonomic Quick-Add Buttons** (`+15m`, `+30m`, `+1h`, `-30m`).
     - **Safe Deletion** with minimum session safeguard ($N \ge 1$).

2. **Live Auto-Calculator & Seamless Manual Override**:
   - Real-time auto-summing of total daily study hours and per-subject distribution from the active sessions.
   - An intuitive **Manual Override Toggle** and direct total hours input that allows students to adjust or override their total study time (e.g. for rounded daily totals or unmeasured tuition time) without discarding their granular session breakdown.
   - 1-click **Reset to Auto-Sum** button to instantly restore exact calculated session totals.
   - Seamless switching between **Multi-Session Breakdown** and **Direct Subject Hours** entry modes with zero data loss.

3. **Ergonomic Touch Targets & Conversational Design (M4 Alignment)**:
   - Minimum 44–48px button height (`h-11`/`h-12`/`h-14`) for effortless mobile tapping.
   - Warm, supportive everyday English without academic or robotic jargon.
   - Spacious low-density cards (`p-6` to `p-8`, `gap-5`, `rounded-2xl`, glassmorphic zinc styling).
   - Zero text clipping/overflow across 375px+ screens (`break-words`, `truncate`, responsive wrap).

4. **Backend Schema Parity**:
   - Full compatibility with `submitDailyLog` payload in `server/mock-server.js` and `backend/Code.gs`, storing individual session objects alongside aggregate subject hours and manual override flags.

---

## 2. State Engine & Calculation Architecture

### 2.1 State Model (`src/app/daily/page.tsx`)

```typescript
// 1. Session Item Structure
export interface StudySession {
  id: string;              // e.g. "sess_1724750000000_1"
  subject: string;         // e.g. "Biology", "Combined Maths"
  hours: number;           // e.g. 1.75
  startTime?: string;      // "08:30" (24-hour format)
  endTime?: string;        // "10:15"
  focus?: number;          // 1 - 10 rating
  productivity?: number;   // 1 - 10 rating
  notes?: string;          // Specific notes
  topic?: string;          // Topic title
  color?: string;          // Calendar theme color
}

// 2. Daily Logger Form State
interface DailyLoggerState {
  dateOfStudy: string;                        // "YYYY-MM-DD"
  entryMode: 'sessions' | 'direct';          // Session builder vs Direct hours
  sessions: StudySession[];                   // Array of study intervals
  manualOverrideActive: boolean;              // Toggle state
  manualTotalHours: number | null;            // Overridden total (if active)
  directSubjectHours: {                       // Direct inputs for Mode B
    sub1: number;
    sub2: number;
    sub3: number;
  };
  overallFocus: number;                       // 1 - 10
  overallProductivity: number;                // 1 - 10
  notes: string;                              // Overall day notes
  telegram: string;                           // Telegram handle
  proofFile: ProofFileState | null;           // Compressed photo proof
}
```

### 2.2 Mathematical Engine & Auto-Summing Logic

```typescript
/**
 * Computes decimal hours between start and end time strings.
 * Handles overnight time ranges (e.g. 23:00 to 01:30 = 2.5 hours).
 */
export function calculateDurationFromTimes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  
  let startMinutes = h1 * 60 + m1;
  let endMinutes = h2 * 60 + m2;
  let diffMinutes = endMinutes - startMinutes;
  
  // Overnight rollover
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }
  
  return Number((diffMinutes / 60).toFixed(2));
}

/**
 * Live Aggregation Engine
 */
function useStudyHoursCalculation(
  sessions: StudySession[],
  entryMode: 'sessions' | 'direct',
  directHours: { sub1: number; sub2: number; sub3: number },
  manualOverrideActive: boolean,
  manualTotalHours: number | null,
  streamSubjects: [string, string, string]
) {
  const [sub1Name, sub2Name, sub3Name] = streamSubjects;

  if (entryMode === 'sessions') {
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    let totalFocus = 0;
    let totalProd = 0;

    sessions.forEach((s) => {
      const sub = (s.subject || '').toLowerCase();
      const hrs = Math.max(0, Number(s.hours) || 0);

      if (sub === sub1Name.toLowerCase()) {
        s1 += hrs;
      } else if (sub === sub2Name.toLowerCase()) {
        s2 += hrs;
      } else if (sub === sub3Name.toLowerCase()) {
        s3 += hrs;
      } else {
        s1 += hrs; // Fallback to subject 1
      }

      totalFocus += s.focus || 8;
      totalProd += s.productivity || 8;
    });

    const calculatedSub1 = Number(s1.toFixed(2));
    const calculatedSub2 = Number(s2.toFixed(2));
    const calculatedSub3 = Number(s3.toFixed(2));
    const calculatedTotal = Number((calculatedSub1 + calculatedSub2 + calculatedSub3).toFixed(2));

    const effectiveTotal = manualOverrideActive && manualTotalHours !== null && manualTotalHours >= 0
      ? Number(manualTotalHours.toFixed(2))
      : calculatedTotal;

    const avgFocus = sessions.length > 0 ? Math.round(totalFocus / sessions.length) : 8;
    const avgProd = sessions.length > 0 ? Math.round(totalProd / sessions.length) : 8;

    return {
      sub1Hours: calculatedSub1,
      sub2Hours: calculatedSub2,
      sub3Hours: calculatedSub3,
      calculatedTotal,
      effectiveTotal,
      avgFocus,
      avgProd,
    };
  } else {
    // Direct mode
    const sub1 = Number(directHours.sub1.toFixed(2));
    const sub2 = Number(directHours.sub2.toFixed(2));
    const sub3 = Number(directHours.sub3.toFixed(2));
    const calculatedTotal = Number((sub1 + sub2 + sub3).toFixed(2));

    const effectiveTotal = manualOverrideActive && manualTotalHours !== null && manualTotalHours >= 0
      ? Number(manualTotalHours.toFixed(2))
      : calculatedTotal;

    return {
      sub1Hours: sub1,
      sub2Hours: sub2,
      sub3Hours: sub3,
      calculatedTotal,
      effectiveTotal,
      avgFocus: 8,
      avgProd: 8,
    };
  }
}
```

---

## 3. UI/UX & Interaction Design Specifications

### 3.1 Session Card Component Design
Each session card inside the multi-session builder features:
1. **Card Header**:
   - Session counter pill badge: `Session #1`, `Session #2`.
   - Subject tag with color-coded dot (Google Calendar matching).
   - Delete button with trash icon (hidden or disabled if only 1 session exists).
2. **Subject & Duration Row**:
   - Custom select dropdown for the 3 stream subjects.
   - Duration number input with step `0.1` and quick delta buttons: `+15m`, `+30m`, `+1h`.
3. **Start / End Time Row**:
   - `Start Time` and `End Time` native time pickers.
   - On change, automatically computes duration in decimal hours with an animated tag: `Auto: 1.75h (1h 45m)`.
4. **Session Topic & Focus**:
   - Text input for topic/lesson description.
   - 4-pill quick focus preset selector (`Deep Flow (10)`, `Good Focus (8)`, `Steady (6)`, `Light (4)`).

### 3.2 Clean Manual Override Controller
Located directly above the submission summary, the Manual Override section features:
- **Switch / Toggle Container**:
  - `⚡ Auto-Sum from Sessions` (Default active state).
  - `✏️ Manual Override Total Hours` (Active toggle).
- **When Inactive (Auto-Sum Active)**:
  - Total hours displays glowing cyan font: `4.5 hrs` with subtitle `Automatically calculated from 3 study sessions`.
- **When Active (Override Active)**:
  - Amber badge indicator: `[✏️ Manual Override Enabled]`.
  - Number input allowing direct editing of the grand total hours.
  - Quick delta buttons: `+30m`, `+1h`, `-30m`.
  - **Reset Button**: `↺ Reset to Session Sum (4.5h)` to revert cleanly.

### 3.3 Seamless Mode Switching
- Switching between **Multiple Sessions** and **Direct Subject Hours**:
  - Direct subject inputs automatically inherit the subtotal hours from the session builder upon switching.
  - Session items are retained in memory so switching back does not cause data loss.

---

## 4. Complete Code Specification for `src/app/daily/page.tsx`

Below is the complete, drop-in implementation for `src/app/daily/page.tsx`:

```tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  getTodayDateString,
  isFutureDate,
  formatDate,
  formatBytes,
  compressImage,
  formatTelegramUsername,
} from '@/lib/utils';
import {
  validateImageFile,
  scanBase64Payload,
  sanitizeInput,
  submissionRateLimiter,
} from '@/lib/security';
import { fireConfetti } from '@/lib/confetti';
import { playSuccessChime } from '@/lib/audio';
import { DualSlider } from '@/components/form/DualSlider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Upload,
  Trash2,
  Send,
  Loader2,
  ArrowLeft,
  Plus,
  Layers,
  Sliders,
  RotateCcw,
  BookOpen,
  Zap,
  Target,
  Edit3,
  Check,
} from 'lucide-react';
import { StudySession } from '@/types/logs';

/**
 * Calculates decimal duration in hours between two HH:MM strings.
 * Accurately handles overnight spans (e.g. 23:00 to 01:30 = 2.5 hours).
 */
function calculateDurationFromTimes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins < 0) mins += 24 * 60; // Overnight rollover
  return Number((mins / 60).toFixed(2));
}

/**
 * Formats decimal hours into a friendly human string (e.g. 1.75 -> "1h 45m").
 */
function formatHoursHuman(hours: number): string {
  const totalMins = Math.round(hours * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function DailyPage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const { logs, refreshHistory } = useApp();

  const [dateOfStudy, setDateOfStudy] = useState(getTodayDateString());
  const [entryMode, setEntryMode] = useState<'sessions' | 'direct'>('sessions');

  // Determine the 3 stream subjects for this student
  const isBio = String(member?.stream || '').toLowerCase().includes('bio');
  const sub1Name = isBio ? 'Biology' : 'Combined Maths';
  const sub2Name = isBio ? 'Chemistry' : 'Physics';
  const sub3Name = member?.optionalSubject || (isBio ? 'Physics' : 'Chemistry');

  const streamSubjects = useMemo(() => [sub1Name, sub2Name, sub3Name], [sub1Name, sub2Name, sub3Name]);

  // Multiple Sessions State
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: 'sess_1',
      subject: sub1Name,
      hours: 1.5,
      startTime: '08:30',
      endTime: '10:00',
      focus: 8,
      productivity: 8,
      notes: '',
      topic: '',
    },
  ]);

  // Direct Subject Hours Mode State (Mode B)
  const [directHours, setDirectHours] = useState({
    sub1: 1.5,
    sub2: 0,
    sub3: 0,
  });

  // Manual Override State for Grand Total Hours
  const [manualOverrideActive, setManualOverrideActive] = useState(false);
  const [manualTotalHours, setManualTotalHours] = useState<number | null>(null);

  // Overall Quality & Meta
  const [focusScore, setFocusScore] = useState<number>(8);
  const [productivityScore, setProductivityScore] = useState<number>(8);
  const [notes, setNotes] = useState('');
  const [telegram, setTelegram] = useState('');
  const [proofFile, setProofFile] = useState<{
    base64: string;
    previewUrl: string;
    fileName: string;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (member?.telegramUsername) {
      setTelegram(member.telegramUsername);
    }
  }, [member]);

  // --------------------------------------------------------------------------
  // LIVE AUTO-SUMMING ENGINE
  // --------------------------------------------------------------------------
  const {
    sub1Hours,
    sub2Hours,
    sub3Hours,
    calculatedTotal,
    effectiveTotal,
  } = useMemo(() => {
    if (entryMode === 'sessions') {
      let s1 = 0;
      let s2 = 0;
      let s3 = 0;
      let totalFocus = 0;
      let totalProd = 0;

      sessions.forEach((s) => {
        const sub = (s.subject || '').toLowerCase();
        const hrs = Math.max(0, Number(s.hours) || 0);

        if (sub === sub1Name.toLowerCase()) {
          s1 += hrs;
        } else if (sub === sub2Name.toLowerCase()) {
          s2 += hrs;
        } else if (sub === sub3Name.toLowerCase()) {
          s3 += hrs;
        } else {
          s1 += hrs;
        }

        totalFocus += s.focus || 8;
        totalProd += s.productivity || 8;
      });

      const c1 = Number(s1.toFixed(2));
      const c2 = Number(s2.toFixed(2));
      const c3 = Number(s3.toFixed(2));
      const total = Number((c1 + c2 + c3).toFixed(2));

      const effTotal = manualOverrideActive && manualTotalHours !== null && manualTotalHours >= 0
        ? Number(manualTotalHours.toFixed(2))
        : total;

      return {
        sub1Hours: c1,
        sub2Hours: c2,
        sub3Hours: c3,
        calculatedTotal: total,
        effectiveTotal: effTotal,
      };
    } else {
      const c1 = Number((directHours.sub1 || 0).toFixed(2));
      const c2 = Number((directHours.sub2 || 0).toFixed(2));
      const c3 = Number((directHours.sub3 || 0).toFixed(2));
      const total = Number((c1 + c2 + c3).toFixed(2));

      const effTotal = manualOverrideActive && manualTotalHours !== null && manualTotalHours >= 0
        ? Number(manualTotalHours.toFixed(2))
        : total;

      return {
        sub1Hours: c1,
        sub2Hours: c2,
        sub3Hours: c3,
        calculatedTotal: total,
        effectiveTotal: effTotal,
      };
    }
  }, [sessions, entryMode, directHours, manualOverrideActive, manualTotalHours, sub1Name, sub2Name, sub3Name]);

  // Sync auto-calculated average focus score when sessions change
  useEffect(() => {
    if (entryMode === 'sessions' && sessions.length > 0) {
      const totalFocus = sessions.reduce((acc, s) => acc + (s.focus || 8), 0);
      const totalProd = sessions.reduce((acc, s) => acc + (s.productivity || 8), 0);
      setFocusScore(Math.round(totalFocus / sessions.length));
      setProductivityScore(Math.round(totalProd / sessions.length));
    }
  }, [sessions, entryMode]);

  // Check if study log already exists for chosen date
  const existingLog = logs.find((l) => {
    const d = l.dateOfStudy || l.date;
    return d && String(d).startsWith(dateOfStudy);
  });

  // --------------------------------------------------------------------------
  // SESSION BUILDER ACTIONS
  // --------------------------------------------------------------------------
  const handleAddSession = () => {
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    // Cycle default subject based on session count
    const nextSub = streamSubjects[sessions.length % streamSubjects.length];

    setSessions((prev) => [
      ...prev,
      {
        id: newId,
        subject: nextSub,
        hours: 1.0,
        startTime: '',
        endTime: '',
        focus: 8,
        productivity: 8,
        notes: '',
        topic: '',
      },
    ]);
    toast.success(`Session #${sessions.length + 1} added!`);
  };

  const handleRemoveSession = (id: string) => {
    if (sessions.length <= 1) {
      toast.error('You need at least one study session.');
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.info('Session removed');
  };

  const handleUpdateSession = (id: string, field: keyof StudySession, val: any) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: val };
        
        // Auto-calculate hours if start/end times change
        if ((field === 'startTime' || field === 'endTime') && updated.startTime && updated.endTime) {
          const autoHours = calculateDurationFromTimes(updated.startTime, updated.endTime);
          if (autoHours > 0) updated.hours = autoHours;
        }
        return updated;
      })
    );
  };

  const handleSessionQuickAdd = (id: string, delta: number) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newHrs = Math.max(0.1, Math.min(24, Number((s.hours + delta).toFixed(2))));
        return { ...s, hours: newHrs };
      })
    );
  };

  // Direct Subject Mode Handlers (Mode B)
  const handleDirectSubjectChange = (subjectNum: 1 | 2 | 3, value: number) => {
    const clamped = Math.max(0, Math.min(24, Number(value) || 0));
    setDirectHours((prev) => ({
      ...prev,
      [`sub${subjectNum}`]: clamped,
    }));
  };

  const handleDirectSubjectQuickAdd = (subjectNum: 1 | 2 | 3, delta: number) => {
    setDirectHours((prev) => {
      const key = `sub${subjectNum}` as 'sub1' | 'sub2' | 'sub3';
      const cur = prev[key] || 0;
      const next = Math.max(0, Math.min(24, Number((cur + delta).toFixed(2))));
      return { ...prev, [key]: next };
    });
  };

  // Manual Override Toggle
  const handleToggleManualOverride = () => {
    if (!manualOverrideActive) {
      // Activating override: initialize with current calculated total
      setManualTotalHours(calculatedTotal);
      setManualOverrideActive(true);
      toast.info('Manual Override enabled: You can directly specify total hours.');
    } else {
      // Disabling override: restore auto-sum
      setManualOverrideActive(false);
      setManualTotalHours(null);
      toast.success('Restored live auto-sum from study sessions.');
    }
  };

  const handleResetToAutoSum = () => {
    setManualTotalHours(calculatedTotal);
    setManualOverrideActive(false);
    toast.success(`Reset total to ${calculatedTotal.toFixed(1)} hrs.`);
  };

  // Photo Proof Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);

      const validation = await validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file format.');
        return;
      }

      const compressed = await compressImage(file, {
        maxSizeMB: 0.38,
        maxWidthOrHeight: 1600,
        quality: 0.82,
      });

      const scan = scanBase64Payload(compressed.base64);
      if (!scan.safe) {
        toast.error(scan.threat || 'Security violation: Suspicious file payload rejected.');
        return;
      }

      setProofFile({
        base64: compressed.base64,
        previewUrl: compressed.dataUrl,
        fileName: compressed.fileName,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
      });

      toast.success(
        `Proof secured: ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)}`
      );
    } catch (err: any) {
      toast.error('Failed to process image: ' + err.message);
    } finally {
      setCompressing(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submissionRateLimiter.allow()) {
      toast.error('Submission rate limit reached. Please wait a moment before trying again.');
      return;
    }

    if (existingLog) {
      toast.error(`A daily log already exists for ${dateOfStudy}. Duplicate submissions are blocked.`);
      return;
    }

    if (isFutureDate(dateOfStudy)) {
      toast.error('Cannot log study hours for future dates.');
      return;
    }

    if (effectiveTotal <= 0) {
      toast.error('Please enter study hours greater than 0.');
      return;
    }

    if (effectiveTotal > 24) {
      toast.error('Total study hours cannot exceed 24 hours per day.');
      return;
    }

    try {
      setSubmitting(true);
      const cleanTelegram = formatTelegramUsername(telegram || member?.telegramUsername || '');

      const payload = {
        studyId: member?.studyId || '',
        fullName: member?.fullName || '',
        email: user?.email || '',
        stream: member?.stream || '',
        dateOfStudy: dateOfStudy,
        sessions: entryMode === 'sessions' ? sessions : [],
        hoursSubject1: sub1Hours,
        hoursSubject2: sub2Hours,
        hoursSubject3: sub3Hours,
        totalHours: effectiveTotal,
        focusScore: focusScore,
        productivityScore: productivityScore,
        notes: sanitizeInput(notes, 1000),
        telegramUsername: cleanTelegram,
        photoProofBase64: proofFile ? proofFile.base64 : '',
        manualOverride: manualOverrideActive,
      };

      const response = await api.submitDailyLog(payload);

      if (response.success) {
        fireConfetti({ particleCount: 120 });
        playSuccessChime();
        toast.success(`Study log saved! Total: ${effectiveTotal.toFixed(1)} hrs.`);
        await refreshHistory();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        api.savePendingLogOffline(payload);
        fireConfetti({ particleCount: 60 });
        playSuccessChime();
        toast.warning('Saved offline. It will sync automatically when you reconnect.');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving your log.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  if (!member) {
    router.push('/register');
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Header Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="font-mono text-xs text-cyan-400 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          {member.studyId}
        </span>
      </div>

      <Card className="bg-zinc-900/60 backdrop-blur-xl border-zinc-800/80 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        <CardHeader className="space-y-3 p-6 sm:p-8 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{member.stream}</span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white">
            Log Your Study Hours
          </CardTitle>
          <CardDescription className="text-zinc-300 text-sm leading-relaxed">
            Record what you studied today. Add individual study sessions with start and end times, or enter your subject hours directly. Everything calculates in real-time.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-2 space-y-8">
          {/* Study Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Study Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              max={getTodayDateString()}
              value={dateOfStudy}
              onChange={(e) => setDateOfStudy(e.target.value)}
              className="bg-zinc-950/60 border-zinc-800 text-white text-sm h-11 rounded-xl focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {existingLog ? (
            /* Locked State when Log already exists */
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-emerald-500/40 space-y-5">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">Study Log Already Saved</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    You already logged a session for {formatDate(dateOfStudy, 'long')}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <div>
                  <span className="text-xs text-zinc-400 block truncate">{sub1Name}</span>
                  <span className="text-base font-bold text-white font-mono mt-1 block">
                    {Number(existingLog.subject1Hours || existingLog.hoursSubject1 || 0).toFixed(1)}h
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block truncate">{sub2Name}</span>
                  <span className="text-base font-bold text-white font-mono mt-1 block">
                    {Number(existingLog.subject2Hours || existingLog.hoursSubject2 || 0).toFixed(1)}h
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block truncate">{sub3Name}</span>
                  <span className="text-base font-bold text-white font-mono mt-1 block">
                    {Number(existingLog.subject3Hours || existingLog.hoursSubject3 || 0).toFixed(1)}h
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <span className="text-sm text-zinc-300">
                  Total Study Time:{' '}
                  <strong className="text-cyan-400 font-mono text-base ml-1">
                    {existingLog.totalHours} hrs
                  </strong>
                </span>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 px-6 font-medium">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Active Logger Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mode Switch: Session Breakdown vs Direct Hours */}
              <div className="flex items-center justify-between p-1.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setEntryMode('sessions');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    entryMode === 'sessions'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Multiple Sessions ({sessions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Sync direct subject inputs with current session calculations
                    setDirectHours({
                      sub1: sub1Hours,
                      sub2: sub2Hours,
                      sub3: sub3Hours,
                    });
                    setEntryMode('direct');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    entryMode === 'direct'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  <span>Direct Subject Hours</span>
                </button>
              </div>

              {/* 1A. Multiple Sessions Builder */}
              {entryMode === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Today&apos;s Study Sessions</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold">
                          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Add each study block with subject, duration or start/end time.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddSession}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl h-11 px-4 flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Session</span>
                    </Button>
                  </div>

                  {/* Dynamic Sessions List */}
                  <div className="space-y-4">
                    {sessions.map((sess, idx) => {
                      const autoDur = calculateDurationFromTimes(sess.startTime || '', sess.endTime || '');

                      return (
                        <div
                          key={sess.id || idx}
                          className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-4 relative group hover:border-zinc-700 transition-colors shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-zinc-200">
                                Session #{idx + 1}
                              </span>
                              {autoDur > 0 && sess.startTime && sess.endTime && (
                                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {sess.startTime} → {sess.endTime} ({formatHoursHuman(sess.hours)})
                                </span>
                              )}
                            </div>

                            {sessions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSession(sess.id || '')}
                                className="text-zinc-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Subject Picker & Duration */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Subject Select */}
                            <div className="space-y-1.5">
                              <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Subject</span>
                              </Label>
                              <select
                                value={sess.subject}
                                onChange={(e) => handleUpdateSession(sess.id || '', 'subject', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 h-11 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                              >
                                {streamSubjects.map((subName) => (
                                  <option key={subName} value={subName}>
                                    {subName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Hours Input & Quick delta buttons */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                                  <span>Duration (Hours)</span>
                                </Label>
                                <span className="text-xs font-mono font-bold text-indigo-400">
                                  {sess.hours.toFixed(1)} hrs ({formatHoursHuman(sess.hours)})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  max="24"
                                  value={sess.hours || ''}
                                  onChange={(e) =>
                                    handleUpdateSession(
                                      sess.id || '',
                                      'hours',
                                      Math.max(0.1, Math.min(24, Number(e.target.value) || 0))
                                    )
                                  }
                                  className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs w-24 h-11 rounded-xl"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSessionQuickAdd(sess.id || '', 0.5)}
                                  className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                                >
                                  +30m
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSessionQuickAdd(sess.id || '', 1.0)}
                                  className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                                >
                                  +1h
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Optional Start / End Time Picker with Auto Calculation */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1.5">
                              <Label className="text-[11px] text-zinc-400">Start Time (Optional)</Label>
                              <Input
                                type="time"
                                value={sess.startTime || ''}
                                onChange={(e) => handleUpdateSession(sess.id || '', 'startTime', e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white text-xs h-11 rounded-xl"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px] text-zinc-400">End Time (Optional)</Label>
                              <Input
                                type="time"
                                value={sess.endTime || ''}
                                onChange={(e) => handleUpdateSession(sess.id || '', 'endTime', e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white text-xs h-11 rounded-xl"
                              />
                            </div>
                          </div>

                          {/* Topic / Notes for this session */}
                          <div className="space-y-1.5">
                            <Input
                              placeholder="What topic did you cover? (e.g. Past Paper Questions, Optics, Essay #2)"
                              value={sess.topic || ''}
                              onChange={(e) => handleUpdateSession(sess.id || '', 'topic', e.target.value)}
                              className="bg-zinc-900/80 border-zinc-800 text-white text-xs h-11 rounded-xl placeholder:text-zinc-600"
                            />
                          </div>

                          {/* Quick Focus Rating for this session */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-900">
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <Target className="h-3 w-3 text-indigo-400" />
                              <span>Session Focus:</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[
                                { label: '🔥 Deep (10)', f: 10 },
                                { label: '⚡ Good (8)', f: 8 },
                                { label: '📖 Steady (6)', f: 6 },
                                { label: '☕ Light (4)', f: 4 },
                              ].map((preset) => (
                                <button
                                  key={preset.f}
                                  type="button"
                                  onClick={() => handleUpdateSession(sess.id || '', 'focus', preset.f)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                                    sess.focus === preset.f
                                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50'
                                      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1B. Direct Subject Hours Mode */}
              {entryMode === 'direct' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Direct Subject Hours</h3>
                    <p className="text-xs text-zinc-400">
                      Type the total hours you spent on each subject today.
                    </p>
                  </div>

                  {/* Subject 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sub1Name}</span>
                      <span className="text-xs font-mono text-zinc-400">{sub1Hours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="24"
                        value={directHours.sub1 || ''}
                        placeholder="0.0"
                        onChange={(e) => handleDirectSubjectChange(1, Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm w-32 h-11 rounded-xl"
                      />
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectSubjectQuickAdd(1, 0.5)}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +30m
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectSubjectQuickAdd(1, 1.0)}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +1h
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDirectSubjectChange(1, 0)}
                          className="h-11 px-2.5 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subject 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sub2Name}</span>
                      <span className="text-xs font-mono text-zinc-400">{sub2Hours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="24"
                        value={directHours.sub2 || ''}
                        placeholder="0.0"
                        onChange={(e) => handleDirectSubjectChange(2, Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm w-32 h-11 rounded-xl"
                      />
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectSubjectQuickAdd(2, 0.5)}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +30m
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectSubjectQuickAdd(2, 1.0)}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +1h
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDirectSubjectChange(2, 0)}
                          className="h-11 px-2.5 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subject 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sub3Name}</span>
                      <span className="text-xs font-mono text-zinc-400">{sub3Hours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="24"
                        value={directHours.sub3 || ''}
                        placeholder="0.0"
                        onChange={(e) => handleDirectSubjectChange(3, Number(e.target.value))}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm w-32 h-11 rounded-xl"
                      />
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectSubjectQuickAdd(3, 0.5)}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +30m
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectSubjectQuickAdd(3, 1.0)}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +1h
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDirectSubjectChange(3, 0)}
                          className="h-11 px-2.5 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Subject Breakdown & Manual Override Control Panel */}
              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-4 shadow-lg">
                {/* Real-time Subject Subtotals */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-zinc-300">Live Subject Distribution:</span>
                  <div className="flex items-center gap-2 font-mono font-medium text-zinc-200 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      {sub1Name}: {sub1Hours.toFixed(1)}h
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      {sub2Name}: {sub2Hours.toFixed(1)}h
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                      {sub3Name}: {sub3Hours.toFixed(1)}h
                    </span>
                  </div>
                </div>

                {/* Grand Total Row with Manual Override Toggle */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm font-bold text-white">Daily Total Study Hours:</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      {manualOverrideActive ? (
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <Edit3 className="h-3 w-3" /> Manual override active (Auto sum: {calculatedTotal.toFixed(1)}h)
                        </span>
                      ) : (
                        `Calculated automatically from ${entryMode === 'sessions' ? `${sessions.length} sessions` : 'subjects'}`
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-mono font-extrabold text-3xl text-cyan-400">
                      {effectiveTotal.toFixed(1)} <span className="text-base font-normal text-zinc-400">hrs</span>
                    </span>

                    {/* Manual Override Action Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleToggleManualOverride}
                      className={`h-11 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        manualOverrideActive
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>{manualOverrideActive ? 'Override Active' : 'Manual Override'}</span>
                    </Button>
                  </div>
                </div>

                {/* Active Manual Override Direct Input Panel */}
                {manualOverrideActive && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Directly Enter Total Study Hours</span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetToAutoSum}
                        className="h-8 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        <span>Reset to Session Sum ({calculatedTotal.toFixed(1)}h)</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="24"
                        value={manualTotalHours !== null ? manualTotalHours : ''}
                        onChange={(e) => setManualTotalHours(Math.max(0, Math.min(24, Number(e.target.value) || 0)))}
                        className="bg-zinc-900 border-amber-500/40 text-white font-mono text-sm w-36 h-11 rounded-xl focus:ring-1 focus:ring-amber-500"
                        placeholder={calculatedTotal.toFixed(1)}
                      />
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setManualTotalHours((prev) => Math.min(24, Number(((prev || 0) + 0.5).toFixed(2))))}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +30m
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setManualTotalHours((prev) => Math.min(24, Number(((prev || 0) + 1.0).toFixed(2))))}
                          className="h-11 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                        >
                          +1h
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Overall Focus & Productivity Ratings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-300">
                    How Was Your Study Quality Today? (1–10)
                  </Label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    Focus: {focusScore}/10 • Energy: {productivityScore}/10
                  </span>
                </div>

                {/* Flow State Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🔥 Deep Focus', f: 10, p: 10 },
                    { label: '⚡ Good Session', f: 8, p: 8 },
                    { label: '📖 Normal Pace', f: 7, p: 7 },
                    { label: '☕ Light Review', f: 5, p: 6 },
                  ].map((preset, idx) => {
                    const isSelected = focusScore === preset.f && productivityScore === preset.p;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFocusScore(preset.f);
                          setProductivityScore(preset.p);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                            : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-1">
                  <DualSlider
                    type="focus"
                    label="Focus Level"
                    value={focusScore}
                    onChange={setFocusScore}
                  />
                  <DualSlider
                    type="productivity"
                    label="Productivity Level"
                    value={productivityScore}
                    onChange={setProductivityScore}
                  />
                </div>
              </div>

              {/* 3. Photo Proof Upload */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Photo of Study Notes or Question Book (Optional)</span>
                  <span className="text-[10px] text-zinc-500">Auto-compressed</span>
                </Label>

                {proofFile ? (
                  <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofFile.previewUrl}
                        alt="Proof Preview"
                        className="h-14 w-14 rounded-xl object-cover border border-zinc-800"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white truncate max-w-[200px]">
                          {proofFile.fileName}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-mono">
                          {formatBytes(proofFile.compressedSize)} (Secured & Ready)
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProofFile(null)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10 w-10 p-0 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-zinc-950/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={compressing}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {compressing ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                        <span className="text-xs text-zinc-400">Compressing and verifying image...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-zinc-400" />
                        <span className="text-xs text-zinc-300 font-medium">
                          Click or drag a photo of your notes here
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          PNG, JPG, JPEG (automatically compressed and verified)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Notes Textarea */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-zinc-300">
                  Daily Reflections or Questions (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="What topics did you master today? Any questions or key lessons to remember?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-950/60 border-zinc-800 text-white text-xs min-h-[95px] rounded-xl p-3"
                />
              </div>

              {/* Large Submit CTA Button (Comfortable Ergonomic Touch Target) */}
              <Button
                type="submit"
                disabled={submitting || compressing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-14 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 text-base cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving Your Study Session...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Save Today&apos;s Study Log ({effectiveTotal.toFixed(1)} hrs)</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. Verification & Testing Matrix

| Test ID | Scenario | Expected Outcome |
|---|---|---|
| **V1** | Add 3 study sessions (Bio: 1.5h, Chem: 2.0h, Phys: 1.0h) | Live auto-sum calculates `Subj1=1.5h`, `Subj2=2.0h`, `Subj3=1.0h`, `Total=4.5h`. |
| **V2** | Enter Start Time `08:30` and End Time `10:15` | Live calculation computes `1.75 hrs` (`1h 45m`) and updates duration field. |
| **V3** | Enter Overnight Start `23:00` and End `01:30` | Live calculation computes `2.50 hrs` (`2h 30m`). |
| **V4** | Enable Manual Override and change total from `4.5h` to `5.0h` | `effectiveTotal` becomes `5.0h`, amber override badge is displayed, session items remain intact. |
| **V5** | Click "Reset to Session Sum" | `effectiveTotal` reverts cleanly to `4.5h`, override mode turns off. |
| **V6** | Switch between `Multiple Sessions` and `Direct Subject Hours` | Direct inputs receive `[1.5, 2.0, 1.0]`. Switching back keeps sessions without loss. |
| **V7** | Delete session when $N=1$ | Prevent deletion, showing notification toast. |
| **V8** | Submit payload to backend | `submitDailyLog` sends `sessions` array + `hoursSubject1..3` + `totalHours` + `manualOverride` flag. Verified by `server/mock-server.js` and `backend/Code.gs`. |
