# Deep Survey Report: Dynamic Weekly Planner & Zero-Defect Build Verification (R3 & R4)

**Agent ID:** `survey_explorer_planner_build_1`  
**Date:** 2026-09-17  
**Scope:** Requirements R3 (Dynamic Weekly Planner, Syllabi Balance Sync, Rest/Recovery Gauges, Sprint Milestones, safeStorage migration) & R4 (TypeScript compilation, npm test suites, npm run build verification).  
**Target Repository:** `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`

---

## 1. Executive Summary & Status Dashboard

| Quality Gate | Current Status | Findings Summary |
| :--- | :--- | :--- |
| **`npx tsc --noEmit`** | ❌ **FAIL** (Exit 1) | **3 TypeScript errors** in `src/app/id-card/page.tsx` (lines 507, 513, 521) due to passing nullable `member` instead of non-null `effectiveMember`. All other files across `src/` are 100% clean. |
| **`npm test`** | ✅ **PASS** (Exit 0) | **602 / 602 tests passed** (102 suites, 0 failures, 31.7s execution) across all 5 tiers (Unit, Integration, Boundary, E2E Scenarios, Adversarial Security). |
| **`npm run build`** | ❌ **FAIL** (Exit 1) | Blocked at Next.js type check step by the exact 3 type errors in `src/app/id-card/page.tsx:507`. Once patched, clean static HTML export to `out/` will succeed. |
| **Dynamic Calendar (`/calendar`)** | ⚠️ **PARTIAL** | Core schedule UI exists in `src/app/calendar/page.tsx`, but subject balance calculation uses hardcoded subjects, sleep gauge uses a naive formula, exam countdown hardcodes `'2026'`, and study logs are queried globally rather than student-scoped. |
| **`localStorage` Migration** | ⚠️ **PARTIAL** | `safeStorage` has been created (`src/lib/storage/safeStorage.ts`) and partially integrated, but **25+ direct `localStorage` and `sessionStorage` calls** remain in `calendar`, `daily`, `tests`, `subjects`, `AuthContext`, `api.ts`, `calendar.ts`, `security.ts`, `biometrics.ts`, and `passwords.ts`. |

---

## 2. Requirement 3 Investigation: Dynamic Weekly Planner & Syllabi Balance Sync

### 2.1 Calendar & Planner Component Architecture
The application currently houses two calendar implementations:
1. **Active Route Page:** `src/app/calendar/page.tsx` (1,364 lines)
   - Renders the primary user-facing weekly schedule view (`Weekly Rhythm & Focus Flow`).
   - Supports Day Switcher (`MON` - `SUN`), Interactive Block CRUD, status toggling (`planned` -> `in_progress` -> `completed`), custom weekly target goal slider, and 2-way `.ics` RFC 5545 export.
   - Right-hand sidebar features: Subject Balance distribution card, Sleep & Rest Gauge, Sprint Milestones card, and Authenticated Candidate Profile.
2. **Auxiliary / Legacy Component:** `src/components/calendar/GoogleStudyCalendar.tsx` (1,006 lines)
   - A full Google Calendar-style Month / Week / Day view with drag-and-drop rescheduling, subject color pickers, and Jitsi study room generation.
   - **Critical Finding:** `GoogleStudyCalendar.tsx` is currently **unmounted / orphaned** (not imported or rendered by `src/app/calendar/page.tsx`). The active route solely renders the editorial `StudyBlock` weekly layout.

---

### 2.2 Connection to `localDb.ts` & Log Aggregation

#### Current Implementation in `src/app/calendar/page.tsx`:
```typescript
// Lines 477-521: Subject stats & sleep gauge memo
const { subjectStats, avgSleepEstimate } = useMemo(() => {
  const streamIsBio = isBio;
  const subj1 = streamIsBio ? 'Biology' : 'Combined Maths';
  const subj2 = 'Physics';
  const subj3 = 'Chemistry';

  const stats: Record<string, { logged: number; total: number; color: string }> = {
    [subj1]: { logged: 0, total: streamIsBio ? 14.0 : 16.0, color: '#c85a32' },
    [subj2]: { logged: 0, total: 12.0, color: '#456644' },
    [subj3]: { logged: 0, total: 11.0, color: '#854f00' },
  };

  // 1. Ingest actual study session logs
  const realLogs = localDb.getLogs();
  for (const log of realLogs) {
    const h1 = Number(log.hoursSubject1 || (log as any).subject1Hours || 0);
    const h2 = Number(log.hoursSubject2 || (log as any).subject2Hours || 0);
    const h3 = Number(log.hoursSubject3 || (log as any).subject3Hours || 0);
    stats[subj1].logged += h1;
    stats[subj2].logged += h2;
    stats[subj3].logged += h3;
  }
  ...
```

#### Identified Deficiencies & Architectural Gaps:
1. **Global Log Ingestion Leak (Privacy & Accuracy):**
   - Calling `localDb.getLogs()` fetches daily logs for **every student in the database** (e.g. Kasun, Achala, Anuradha).
   - If Kasun logs in, his weekly distribution aggregates study hours from all other students!
   - **Remediation:** Must query student-scoped logs via `localDb.getStudentLogs(member?.studyId || '', member?.email || '')`. Fallback to `localDb.getLogs()` only if unauthenticated.
2. **Session-Level Study Data Ignored:**
   - Multi-session logging stores individual sessions in `log.sessions` (e.g., `{ subject: "Biology", hours: 2.0 }`) or `log.subjects`.
   - The current code only inspects legacy flat fields `hoursSubject1`, `hoursSubject2`, `hoursSubject3`. If a student logs sessions using the dynamic multi-session logger (`/daily`), their hours are omitted or misaligned.
   - **Remediation:** Inspect `log.sessions` and `log.subjects` first, dynamically matching against the student's 3 stream subjects.
3. **Static Allocation Targets:**
   - Targets are hardcoded: `total: streamIsBio ? 14.0 : 16.0`, `12.0`, `11.0` (sum = 37-39h), completely ignoring the user's custom `weeklyGoalHours` (which can be customized between 20h and 55h).
   - **Remediation:** Scale target hours dynamically based on `weeklyGoalHours` (e.g., 40% primary, 32% secondary, 28% tertiary).

---

### 2.3 Rest & Recovery Gauge Analysis

#### Current Implementation in `src/app/calendar/page.tsx`:
```typescript
// Lines 513-516:
const totalStudy = stats[subj1].logged + stats[subj2].logged + stats[subj3].logged;
const dailyStudyAvg = totalStudy > 0 ? totalStudy / 7 : 4.5;
const calculatedSleep = Math.max(5.5, Math.min(8.5, 24 - dailyStudyAvg - 10));
```
And in JSX (lines 1064-1073):
```tsx
<div className="font-sans text-sm font-semibold text-[#1d1b19]">Sleep &amp; Rest Gauge</div>
<div className="font-sans text-xs text-[#2d2420]">Average {avgSleepEstimate} hrs sleep this week</div>
<span className="px-2.5 py-1 rounded-full bg-[#EAF2EA] text-[#2D5A2E] font-sans text-[11px] font-mono tracking-wider font-medium border border-[#2D5A2E]/20">
  {avgSleepEstimate >= 7.0 ? 'Well Rested' : avgSleepEstimate >= 6.0 ? 'Moderate Rest' : 'Prioritize Sleep'}
</span>
```

#### Gap Analysis & Recommended Upgrade:
- The current sleep calculation is an arbitrary linear clamp (`24 - dailyStudyAvg - 10`).
- **Existing Asset Available in Codebase:** `src/lib/analytics/dataEngineering.ts` already contains a comprehensive, scientifically validated function: `computeCognitiveFatigue(logs: DailyLogEntry[], streakDays: number): CognitiveFatigueMetrics`.
  - It calculates:
    - Multi-factor fatigue index (incorporating 7-day focus ratings, productivity ratings, study volume relative to 42h burnout threshold, and streak pressure).
    - Four discrete cognitive tiers: `'optimal'` (Flow State), `'moderate'` (Mild Strain), `'high'` (Fatigue Alert), `'burnout'` (Acute Burnout Risk).
    - Restorative Protocols (e.g., *"Reduce study volume by 50% for 24 hours. Ensure 8 hours restorative sleep and zero screens 1h before bedtime"*).
- **Remediation:** Wire `computeCognitiveFatigue` directly into the Calendar Sleep & Rest Gauge:
  - Display actual fatigue tier badge (`Optimal Flow State`, `Well Rested`, `Fatigue Warning`, `Acute Burnout Risk`).
  - Provide restorative break recommendations and dynamic sleep estimates derived from real focus and study volume history.

---

### 2.4 Exam Sprint Milestones Analysis

#### Current Implementation in `src/app/calendar/page.tsx`:
- Line 388: `const countdown = getExamCountdown('2026');`
- Lines 1062, 1074:
  `Math.max(12, Math.floor(countdown.daysRemaining * 0.35))` (District Mock Paper)
- Lines 1081, 1093:
  `countdown.daysRemaining` (G.C.E. Advanced Level National Sprint)

#### Gap Analysis:
1. **Hardcoded Target Year:** Always passes `'2026'` to `getExamCountdown('2026')`. If a registered student has selected exam year 2027, 2028, or 2029, their countdown displays incorrect 2026 examination dates!
   - **Remediation:** Use `member?.examYear || member?.targetYear || '2026'`.
2. **Milestone Breadth:**
   - In addition to the final A/L Exam and District Mock Paper, the planner should expose the current **Weekly Goal Cycle** milestone (e.g. `loggedHours` vs `weeklyGoalHours`, remaining hours to reach milestone, and days left until Sunday night rollover).

---

## 3. Codebase-Wide Direct `localStorage` / `sessionStorage` Audit

The project has established a dedicated, resilient storage engine in `src/lib/storage/safeStorage.ts` with in-memory fallback for private browsing, quota errors, and iframe sandboxes. However, direct references to `window.localStorage` and `sessionStorage` persist across the repository.

### 3.1 Direct `localStorage` Calls Requiring Migration to `safeStorage`

| File Path | Line Number(s) | Current Usage | Action Required |
| :--- | :--- | :--- | :--- |
| `src/app/calendar/page.tsx` | Line 585 | `localStorage.setItem('studysync_weekly_goal_hours', ...)` | Replace with `safeStorage.setItem` |
| `src/app/daily/page.tsx` | Lines 467, 474 | `localStorage.setItem('studysync_daily_draft', ...)`<br>`localStorage.getItem('studysync_daily_draft')` | Replace with `safeStorage.setItem` / `safeStorage.getItem` |
| `src/app/subjects/page.tsx` | Lines 36, 47 | `localStorage.getItem('studysync_subtopics_mastery')`<br>`localStorage.setItem('studysync_subtopics_mastery', ...)` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/app/tests/page.tsx` | Lines 65, 71, 106 | `localStorage.setItem(cacheKey, ...)`<br>`localStorage.getItem(cacheKey)` | Replace with `safeStorage.setItem` / `safeStorage.getItem` |
| `src/context/AuthContext.tsx` | Lines 247, 311 | `localStorage.setItem('studysync_member', ...)` | Replace with `safeStorage.setItem` |
| `src/components/character/ScholarAvatarStudioModal.tsx` | Lines 31, 61 | `localStorage.getItem('studysync_scholar_avatar')`<br>`localStorage.setItem('studysync_scholar_avatar', ...)` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/components/calendar/GoogleStudyCalendar.tsx` | Lines 54, 150, 159, 171, 322 | `localStorage.getItem('studysync_subject_colors')`<br>`localStorage.getItem('studysync_calendar_events')` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/lib/api.ts` | Lines 45, 273, 285, 298, 844, 848 | `window.localStorage.getItem('STUDYSYNC_API_URL')`<br>`window.localStorage.setItem('STUDYSYNC_OFFLINE_LOGS', ...)`<br>`window.localStorage.removeItem(...)`<br>`localStorage.getItem('studysync_custom_admins')` | Replace with `safeStorage.getItem`, `setItem`, `removeItem` |
| `src/lib/calendar.ts` | Lines 263, 275, 276 | `window.localStorage.getItem('STUDYSYNC_EXAM_DATES')`<br>`window.localStorage.setItem('STUDYSYNC_EXAM_DATES', ...)` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/lib/security.ts` | Lines 705, 724 | `window.localStorage.getItem(this.storageKey)`<br>`window.localStorage.setItem(...)` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/lib/security/biometrics.ts` | Lines 63, 80 | `localStorage.getItem(STORAGE_SECURITY_KEY)`<br>`localStorage.setItem(STORAGE_SECURITY_KEY, ...)` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/lib/security/passwords.ts` | Lines 177, 181, 230, 234, 269 | `localStorage.getItem('studysync_custom_admins')`<br>`localStorage.setItem('studysync_custom_admins', ...)` | Replace with `safeStorage.getItem` / `safeStorage.setItem` |
| `src/app/layout.tsx` | Line 56 | `localStorage.removeItem('theme')` (inlined theme-reset script) | Guard with `try-catch` or wrap safely |

### 3.2 Direct `sessionStorage` Calls Requiring Migration to `safeSessionStorage`

| File Path | Line Number(s) | Current Usage | Action Required |
| :--- | :--- | :--- | :--- |
| `src/lib/security/biometrics.ts` | Lines 217, 222, 227 | `sessionStorage.getItem(SESSION_LOCK_KEY)`<br>`sessionStorage.setItem(...)`<br>`sessionStorage.removeItem(...)` | Replace with `safeSessionStorage.getItem/setItem/removeItem` |
| `src/app/admin/page.tsx` | Lines 227, 1053 | `sessionStorage.getItem('studysync_admin_vault_unlocked')`<br>`sessionStorage.setItem(...)` | Replace with `safeSessionStorage.getItem/setItem` |
| `src/lib/api.ts` | Lines 138, 163, 164, 169, 225, 423, 424, 429 | `window.sessionStorage.getItem(cacheKey)`<br>`window.sessionStorage.setItem(...)` | Replace with `safeSessionStorage` methods |

---

## 4. Requirement 4 Investigation: Zero-Defect Build & Test Suite Verification

### 4.1 TypeScript Compiler Static Analysis (`npx tsc --noEmit`)

Execution command: `npx tsc --noEmit`  
**Result:** FAILED with Exit Code 1.  
**Exact compiler output:**
```
src/app/id-card/page.tsx(507,32): error TS2322: Type 'MemberData | null' is not assignable to type 'MemberIdCardData'.
  Type 'null' is not assignable to type 'MemberIdCardData'.
src/app/id-card/page.tsx(513,56): error TS2345: Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'.
  Type 'null' is not assignable to type 'WalletMemberPayload'.
src/app/id-card/page.tsx(521,53): error TS2345: Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'.
  Type 'null' is not assignable to type 'WalletMemberPayload'.
```

#### Detailed Root Cause Analysis:
In `src/app/id-card/page.tsx`:
- The component defines:
  ```typescript
  const { user, member, loading } = useAuth();
  ```
  Where `member` is typed as `MemberData | null`.
- To support offline access, the component computes:
  ```typescript
  const effectiveMember = member || offlinePass;
  ```
- However, in lines 506–526 (inside the Apple Wallet pass modal):
  ```tsx
  507: <AppleWalletCard member={member} showActions={true} />
  ...
  513: onClick={() => downloadAppleWalletPass(member)}
  ...
  521: onClick={() => openGoogleWalletPass(member)}
  ```
- Because `member` can be `null`, TypeScript rejects the assignment to `MemberIdCardData` and `WalletMemberPayload`.
- Note: `src/app/pass/page.tsx` simply does `import DigitalStudentPassPage from '@/app/id-card/page'; export default DigitalStudentPassPage;`. Thus, resolving the error in `src/app/id-card/page.tsx` immediately guarantees `src/app/pass/page.tsx` compiles cleanly as well.

#### Immediate Solution:
In `src/app/id-card/page.tsx`:
```tsx
// Before:
<AppleWalletCard member={member} showActions={true} />
...
onClick={() => downloadAppleWalletPass(member)}
...
onClick={() => openGoogleWalletPass(member)}

// After:
{effectiveMember && (
  <AppleWalletCard member={effectiveMember} showActions={true} />
)}
...
onClick={() => effectiveMember && downloadAppleWalletPass(effectiveMember)}
...
onClick={() => effectiveMember && openGoogleWalletPass(effectiveMember)}
```
With this fix applied, `npx tsc --noEmit` will produce **0 errors** across the entire codebase.

---

### 4.2 Automated Test Runner Audit (`npm test`)

Execution command: `npm test`  
**Result:** **100% PASSED** (Exit Code 0).  
**Metrics:**
- Total Tests: **602**
- Total Suites: **102**
- Passed: **602**
- Failed: **0**
- Duration: **31.7s**

#### Coverage Breakdown across Test Tiers:
- **Tier 1 (Foundation & Math Logic):** 164 passed. Tests hash algorithms, Hastings polynomial approximations, Empirical Bayes shrinkage, and streak calculations.
- **Tier 2 (Component Contracts & Mock Server):** 182 passed. Tests API payloads, idempotency keys, duplicate submissions, and session serialization.
- **Tier 3 (Pairwise Boundary Conditions):** 72 passed. Tests leap years, date rollover, 0h to 24h boundaries, floating point precision, and Unicode/Sinhala/Tamil inputs.
- **Tier 4 (Real-World Application Scenarios):** 143 passed. Tests complete student lifecycles (registration -> log -> AI advisor -> Z-score -> PDF export).
- **Tier 5 (Adversarial Security & Stress Tests):** 41 passed. Tests 12-byte binary magic byte inspection, polyglot rejection, cryptographic replay defense, LockService concurrency, CSV injection (CWE-1236) neutralization, and sliding-window rate limiters.

---

### 4.3 Production Export Build Audit (`npm run build`)

Execution command: `npm run build`  
**Result:** FAILED with Exit Code 1.  
**Failure log:**
```
  ▲ Next.js 14.2.24
   Creating an optimized production build ...
 ✓ Compiled successfully
   Skipping linting
   Checking validity of types ...
Failed to compile.

./src/app/id-card/page.tsx:507:32
Type error: Type 'MemberData | null' is not assignable to type 'MemberIdCardData'.
  Type 'null' is not assignable to type 'MemberIdCardData'.

  505 |
  506 |             <div className="flex justify-center py-2">
> 507 |               <AppleWalletCard member={member} showActions={true} />
      |                                ^
  508 |             </div>
```

#### Verification:
Next.js statically compiles all JSX and assets successfully (`✓ Compiled successfully`), but halts at the TypeScript validation step because `next.config.mjs` strictly enforces `typescript: { ignoreBuildErrors: false }`.  
Once the `member` type assertion in `src/app/id-card/page.tsx` is fixed, `npm run build` will cleanly generate static export assets into `out/`.

---

## 5. Gap Analysis Matrix

| Requirement | Gap Identified | Severity | Recommended Fix |
| :--- | :--- | :--- | :--- |
| **R3: Student-Scoped Logs** | `CalendarPage` calls `localDb.getLogs()` which aggregates logs across all students in the database. | High | Use `localDb.getStudentLogs(member?.studyId \|\| '', member?.email \|\| '')`. |
| **R3: Multi-Session Parsing** | Only checks legacy flat fields `hoursSubject1..3`, ignoring `log.sessions` and `log.subjects`. | High | Extract hours from `log.sessions` and `log.subjects` matching stream subjects. |
| **R3: Recovery & Burnout Gauge** | Naive sleep formula (`24 - studyAvg - 10`) instead of the existing multi-factor fatigue model. | Medium | Connect `computeCognitiveFatigue(logs, streakDays)` from `src/lib/analytics/dataEngineering.ts`. |
| **R3: Exam Sprint Countdown** | Hardcodes `'2026'` in `getExamCountdown('2026')`. | Medium | Connect to `member?.examYear \|\| member?.targetYear \|\| '2026'`. |
| **R3: Weekly Target Customization** | Line 585 in `src/app/calendar/page.tsx` calls raw `localStorage.setItem`. | Medium | Migrate to `safeStorage.setItem('studysync_weekly_goal_hours', String(newGoal))`. |
| **R3: Safe Storage Scope** | 25+ direct `localStorage`/`sessionStorage` calls remain across `daily`, `tests`, `subjects`, `api.ts`, etc. | Medium | Migrate each occurrence to `safeStorage` and `safeSessionStorage`. |
| **R4: TypeScript Errors** | 3 type errors in `src/app/id-card/page.tsx` (lines 507, 513, 521). | Critical | Guard and pass `effectiveMember` instead of nullable `member`. |
| **R4: Build Output** | `npm run build` fails due to the 3 type errors above. | Critical | Fix type errors to achieve zero-defect static compilation. |

---

## 6. Concrete Implementation Recommendations (For Milestone Workers)

### Recommendation 1: Fix `src/app/id-card/page.tsx` to unblock `tsc` and `npm run build`
Replace lines 506–527 in `src/app/id-card/page.tsx`:
```tsx
<div className="flex justify-center py-2">
  {effectiveMember && (
    <AppleWalletCard member={effectiveMember} showActions={true} />
  )}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
  <button
    type="button"
    onClick={() => effectiveMember && downloadAppleWalletPass(effectiveMember)}
    className="py-2.5 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-xs"
  >
    <Wallet className="w-4 h-4" />
    <span>Get .pkpass Bundle</span>
  </button>
  <button
    type="button"
    onClick={() => effectiveMember && openGoogleWalletPass(effectiveMember)}
    className="py-2.5 px-4 rounded-xl bg-[#f8f2ef] border border-[#dec0b7] text-[#1d1b19] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#ede7e3] transition-colors shadow-xs"
  >
    <Smartphone className="w-4 h-4 text-[#4285F4]" />
    <span>Google Wallet Pass</span>
  </button>
</div>
```

### Recommendation 2: Refine Dynamic Subject & Recovery Logic in `src/app/calendar/page.tsx`
1. Update exam countdown initialization (line 388):
```typescript
const examYear = member?.examYear || member?.targetYear || '2026';
const countdown = useMemo(() => getExamCountdown(examYear), [examYear]);
```
2. Refactor subject distribution memo (lines 477–525) to ingest student-scoped logs with multi-session support:
```typescript
import { computeCognitiveFatigue } from '@/lib/analytics/dataEngineering';

const { subjectStats, fatigueMetrics, avgSleepEstimate } = useMemo(() => {
  const streamIsBio = isBio;
  const subj1 = streamIsBio ? 'Biology' : 'Combined Maths';
  const subj2 = 'Physics';
  const subj3 = 'Chemistry';

  // Scale target hours based on weeklyGoalHours
  const target1 = Math.round(weeklyGoalHours * 0.38 * 10) / 10;
  const target2 = Math.round(weeklyGoalHours * 0.32 * 10) / 10;
  const target3 = Math.round(weeklyGoalHours * 0.30 * 10) / 10;

  const stats: Record<string, { logged: number; total: number; color: string }> = {
    [subj1]: { logged: 0, total: target1, color: '#c85a32' },
    [subj2]: { logged: 0, total: target2, color: '#456644' },
    [subj3]: { logged: 0, total: target3, color: '#854f00' },
  };

  // Ingest student-scoped logs
  const studentLogs = member?.studyId || member?.email
    ? localDb.getStudentLogs(member?.studyId || '', member?.email || '')
    : localDb.getLogs();

  for (const log of studentLogs) {
    if (log.sessions && Array.isArray(log.sessions) && log.sessions.length > 0) {
      for (const s of log.sessions) {
        const sName = (s.subject || '').toLowerCase();
        const hrs = Number(s.hours || 0);
        if (sName.includes('math') || sName.includes('bio')) stats[subj1].logged += hrs;
        else if (sName.includes('phys')) stats[subj2].logged += hrs;
        else if (sName.includes('chem')) stats[subj3].logged += hrs;
      }
    } else if (log.subjects && Array.isArray(log.subjects) && log.subjects.length > 0) {
      for (const sub of log.subjects) {
        const sName = (sub.name || '').toLowerCase();
        const hrs = Number(sub.hours || 0);
        if (sName.includes('math') || sName.includes('bio')) stats[subj1].logged += hrs;
        else if (sName.includes('phys')) stats[subj2].logged += hrs;
        else if (sName.includes('chem')) stats[subj3].logged += hrs;
      }
    } else {
      stats[subj1].logged += Number(log.hoursSubject1 || (log as any).subject1Hours || 0);
      stats[subj2].logged += Number(log.hoursSubject2 || (log as any).subject2Hours || 0);
      stats[subj3].logged += Number(log.hoursSubject3 || (log as any).subject3Hours || 0);
    }
  }

  // Include completed calendar blocks
  for (const b of blocks) {
    if (b.status === 'completed') {
      const bName = b.subject.toLowerCase();
      if (bName.includes('math') || bName.includes('bio')) stats[subj1].logged += b.durationHours * 0.5;
      else if (bName.includes('phys')) stats[subj2].logged += b.durationHours * 0.5;
      else if (bName.includes('chem')) stats[subj3].logged += b.durationHours * 0.5;
    }
  }

  const fatigue = computeCognitiveFatigue(studentLogs, streakDays);
  const calculatedSleep = Math.max(5.5, Math.min(8.5, 9.0 - (fatigue.fatigueIndex * 0.35)));

  return {
    subjectStats: stats,
    fatigueMetrics: fatigue,
    avgSleepEstimate: +calculatedSleep.toFixed(1),
  };
}, [blocks, isBio, member, weeklyGoalHours, streakDays]);
```
3. Update line 585 in `src/app/calendar/page.tsx`:
```typescript
safeStorage.setItem('studysync_weekly_goal_hours', String(newGoal));
```

### Recommendation 3: Systematic `safeStorage` Migration across `src/`
Import `safeStorage` from `@/lib/storage/safeStorage` and replace remaining raw `localStorage` calls in:
- `src/app/daily/page.tsx`: `studysync_daily_draft`
- `src/app/subjects/page.tsx`: `studysync_subtopics_mastery`
- `src/app/tests/page.tsx`: `studysync_testmarks_*`
- `src/context/AuthContext.tsx`: `studysync_member`
- `src/components/character/ScholarAvatarStudioModal.tsx`: `studysync_scholar_avatar`
- `src/lib/calendar.ts`: `STUDYSYNC_EXAM_DATES`, `studysync_exam_dates`
- `src/lib/api.ts`: `STUDYSYNC_API_URL`, `STUDYSYNC_OFFLINE_LOGS`, `studysync_custom_admins`
- `src/lib/security.ts`: Sliding-window rate limiter timestamps
- `src/lib/security/biometrics.ts` & `passwords.ts`: Security config & custom admins

---

## 7. Verification Strategy
To verify the remediation:
1. `npx tsc --noEmit` must exit with status 0.
2. `npm test` must execute with 100% pass rate (602/602 passing).
3. `npm run build` must complete static page generation without errors, producing the `out/` directory for deployment.
4. Navigation to `/calendar` must reflect actual registered student stream subjects, dynamic goal quotas, and authentic fatigue recovery metrics.
