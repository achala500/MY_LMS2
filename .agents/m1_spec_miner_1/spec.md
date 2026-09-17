# Multi-Session Data Schema & Backend Contract Specification

**Milestone**: M1 - Multi-Session Support & Backend Schema Parity  
**Author**: `m1_spec_miner_1` (Specification Miner)  
**Date**: 2026-08-27  
**Workspace**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`  

---

## 1. Executive Summary & Scope

StudySync supports multi-session study logging (`/daily`) alongside single-day summary logs on the Google Apps Script / Google Sheets backend and local mock server (`server/mock-server.js`).

This document provides the authoritative specification and contract definitions mined across:
1. TypeScript domain types (`src/types/logs.ts`, `src/types/api.ts`, `src/types/calendar.ts`)
2. API Client Engine (`src/lib/api.ts`)
3. React Global Context (`src/context/AppContext.tsx`)
4. Daily Study Logger (`src/app/daily/page.tsx`)
5. Student Dashboard & History Table (`src/app/dashboard/page.tsx`)
6. Local Development & E2E Mock Server (`server/mock-server.js`)
7. Google Apps Script Production Backend (`backend/Code.gs`)
8. 19-Column Google Sheet Layout (`DailyLogs`)

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Schema | `StudySession` Interface | Data shape for individual study sessions within a day | `id`, `subject`, `hours`, `startTime`, `endTime`, `focus`, `productivity`, `notes`, `topic`, `color` | Typed object | TypeScript compile error on invalid types | `src/types/logs.ts:8-19`, `PROJECT.md:52-63` |
| 2 | Schema | `SubmitDailyLogPayload` | Request payload sent to `submitDailyLog` action | `studyId`, `email`, `dateOfStudy`, `sessions`, `hoursSubject1..3`, `totalHours`, `focusScore`, `productivityScore`, `notes`, `telegram`, `proofFile` | JSON envelope `ApiResponse<SubmitDailyLogResponseData>` | 400 Bad Request on missing `studyId`/`dateOfStudy`, future dates, or duplicate submission | `src/types/api.ts:91-118`, `PROJECT.md:65-78` |
| 3 | Schema | `DailyLogEntry` | Complete day entry representing a daily study log | 19 sheet columns + optional `sessions` array + computed stats | Normalized log object | Fallback defaults for missing legacy fields | `src/types/logs.ts:33-69` |
| 4 | Frontend | Dynamic Session Builder | Interactive UI on `/daily` allowing students to add (+ Add Session), edit, and remove sessions | User clicks and inputs on session cards | Array of `StudySession` in state | Minimum 1 session enforced (cannot delete last session) | `src/app/daily/page.tsx:67-79,182-221` |
| 5 | Frontend | Start/End Time Auto-Calculator | Automatically computes duration in decimal hours from 24h start/end times | `startTime: "08:30"`, `endTime: "10:00"` | `hours: 1.50` (decimal float) | Returns 0 on invalid/empty times; wraps midnight correctly | `src/app/daily/page.tsx:172-180` |
| 6 | Frontend | Live Auto-Sum & Manual Override Toggle | Real-time auto-summing of subject hours & total hours with toggle to manually override | `entryMode: 'sessions' \| 'manual'`, manual `totalHours` input | Live calculated sums in state, user override preserved | Total hours must be > 0 and <= 24; validation blocks submit otherwise | `src/app/daily/page.tsx:81-86,108-147` |
| 7 | Frontend | Offline Log Staging | LocalStorage queue storing pending logs when offline or network fails | `SubmitDailyLogPayload` | Saved to `STUDYSYNC_OFFLINE_LOGS` | Recovers on reconnect; toast notification | `src/lib/api.ts:176-210`, `src/app/daily/page.tsx:350-357` |
| 8 | Backend & Mock | Session Normalization & Sanitization | Clamping scores (1-10), sanitizing strings (CWE-1236 CSV injection protection), and generating session IDs | `rawSessions` array | `cleanSessions` array with valid types | Clamps focus/prod to [1, 10], prepends `'` to formulas (`=`, `+`, `-`, `@`) | `server/mock-server.js:724-735`, `backend/Code.gs:135-142,619-637` |
| 9 | Backend & Mock | Stream-Subject Grouping | Maps arbitrary session subjects into the student's 3 registered stream subjects | `cleanSessions`, `member.stream`, `member.optionalSubject` | Aggregated `sub1Hours`, `sub2Hours`, `sub3Hours` | Fallback matching to optional subject or sub1 | `server/mock-server.js:738-771`, `backend/Code.gs:608-638` |
| 10 | Backend & Mock | Duplicate Daily Submission Lock | Enforces exactly one daily study log submission per student per date | `studyId`, `dateOfStudy` | Returns `{ isDuplicate: true, existingLog }` | 400 Bad Request / duplicate error envelope | `server/mock-server.js:713-721`, `backend/Code.gs:597-604` |
| 11 | Backend & Mock | Google Drive / Local Mock Photo Upload | Decodes base64 image and saves to structured hierarchy `{StudyID}/{Date}/` | `base64`, `mimeType`, `fileName` | Public/View URL string | Returns empty string on upload failure | `server/mock-server.js:468-488`, `backend/Code.gs:1006-1028` |
| 12 | Backend & Mock | Concurrency & Atomic Locking | Prevents race conditions during submission | `LockService.getScriptLock()` / In-memory DB lock | Sequential write guarantee | 30-second timeout with friendly retry error | `backend/Code.gs:563-568`, `server/mock-server.js:564-604` |
| 13 | Backend & Mock | History Retrieval & Rollup Analytics | Retrieves full log history and calculates streaks, total hours, and per-subject breakdown | `studyId` or `email` | `{ studyId, logs, stats }` | 404 if member not found; empty list if no logs | `server/mock-server.js:850-879`, `backend/Code.gs:709-761` |
| 14 | Dashboard | History Table & Session Badges | Renders study history rows with subject breakdowns and session tags | `logs` array in `AppContext` | Interactive table rows with colored badges | Displays "—" for empty notes or proofs | `src/app/dashboard/page.tsx:621-706` |
| 15 | Dashboard | Expandable Session Detail Drawer | Inspect individual session timestamps, focus scores, topics, and notes | Row click / Session detail trigger | Detailed drawer/modal view | Graceful fallback if session list synthesized | `PROJECT.md:25,42`, `ORIGINAL_REQUEST.md:400-402` |

---

## 3. Edge Cases & Observed Behaviors

| # | Feature | Input Condition | Observed / Required Behavior |
|---|---------|-----------------|-----------------------------|
| 1 | Session Duration | Start "23:00", End "01:00" (Midnight wrap) | `(1*60 + 0) - (23*60 + 0) = -1320 mins`. Added `24*60 = 1440` -> `120 mins = 2.00` hours. Automatically handled. |
| 2 | Session Duration | Empty start time or empty end time | Returns `0` hours; user can manually enter numeric decimal hours without time restriction. |
| 3 | Subject Aggregation | 2 sessions for "Biology" (1.5h and 2.0h) in one day | Aggregated in `sub1Hours` as `3.50h`. In `mock-server.js`, both individual session objects are stored in `log.sessions`. |
| 4 | Subject Aggregation | Session with custom casing (e.g. "biology", "CHEMISTRY") | Case-insensitive matching via `.toLowerCase()` matches correctly to "Biology" and "Chemistry". |
| 5 | Subject Aggregation | Session subject not in standard 3 subjects (e.g. "Agriculture", "ICT") | Matched against `member.optionalSubject`. If no match, falls back to `sub1` or is recorded in `sessions` array. |
| 6 | Manual Override | Sessions sum = 4.0h, User toggles Manual Override and enters Total = 5.5h | `totalHours` payload is sent as `5.5`. Backend respects `payload.totalHours` and stores `5.5h`. |
| 7 | Zero Total Hours | Sessions array with all 0 hours / manual total = 0 | Client validation prevents submission with "Please enter study hours greater than 0". |
| 8 | Excessive Hours | Total hours = 25.0h | Client validation blocks submission with "Total study hours cannot exceed 24 hours per day". |
| 9 | Future Date | `dateOfStudy` is tomorrow's date | Client validation rejects submission with "Cannot log study hours for future dates." |
| 10 | Duplicate Log | Submitting log for date where log already exists | Backend returns `{ isDuplicate: true, existingLog }`, client displays error preventing overwrite. |
| 11 | CSV Formula Injection | Notes or topic starts with `=`, `+`, `-`, `@`, `\t` | Sanitizer prepends `'` (e.g. `=cmd|' /C calc'!A0` -> `'=cmd|' /C calc'!A0`) preventing spreadsheet execution. |
| 12 | Legacy Row Parsing | Google Sheets `DailyLogs` row without `sessions` column | Reconstructs 3-subject breakdown `subjects: [ {name, hours, focus, prod}, ... ]`. Frontend synthesizes sessions for each non-zero subject. |

---

## 4. Complete Data Schema Contracts

### 4.1 TypeScript Interfaces (`src/types/logs.ts`)

```typescript
/**
 * Individual subject study session entry (within a single day)
 */
export interface StudySession {
  id?: string;            // e.g. "sess_1724750000000_0"
  subject: string;        // e.g. "Biology", "Chemistry", "Combined Maths", "Physics", "ICT"
  hours: number;          // Decimal hours (e.g. 1.5, 2.25)
  startTime?: string;     // 24-hour format "HH:MM" (e.g. "08:30")
  endTime?: string;       // 24-hour format "HH:MM" (e.g. "10:00")
  focus?: number;         // Rating 1 - 10 (default: 8)
  productivity?: number;  // Rating 1 - 10 (default: 8)
  notes?: string;         // Session-specific remarks
  topic?: string;         // Specific topic covered (e.g. "Cell Division")
  color?: string;         // Hex color code (e.g. "#10b981")
}

/**
 * 3-Subject summary item for Google Sheets / legacy parity
 */
export interface SubjectLog {
  name: string;           // Subject name
  hours: number;          // Total hours for this subject in the day
  focus: number;          // Average focus (1 - 10)
  productivity: number;   // Average productivity (1 - 10)
}

/**
 * Complete Daily Log Entry corresponding to the 19-column Google Sheet 'DailyLogs'
 */
export interface DailyLogEntry {
  logId?: string;
  timestamp?: string;        // Col A: ISO 8601 submission timestamp
  studyId: string;          // Col B: Member Study ID (e.g. "SG-BIO-0001")
  email?: string;            // Col C: Student email
  dateOfStudy?: string;      // Col D: Study date in YYYY-MM-DD format
  date?: string;
  Date?: string;
  sessions?: StudySession[]; // Multiple individual study sessions logged for this day
  subjects?: [SubjectLog, SubjectLog, SubjectLog] | SubjectLog[]; // Exactly 3 stream subjects
  subject1?: string;
  subject2?: string;
  subject3?: string;
  subject1Hours?: number;
  subject2Hours?: number;
  subject3Hours?: number;
  hoursSubject1?: number;
  hoursSubject2?: number;
  hoursSubject3?: number;
  totalHours: number;       // Total hours studied for the day
  focusScore?: number;
  focusLevel?: number;
  productivityScore?: number;
  productivityLevel?: number;
  notes?: string;           // Col Q: Study notes / remarks
  telegram?: string;        // Col R: Telegram username (@username)
  telegramUsername?: string;
  proofPhotoUrl?: string;   // Col S: Drive URL or mock URL for proof photo
  proofUrl?: string;
  proofImage?: string;
  avgFocus?: number;
  avgProductivity?: number;
  [key: string]: any;
}
```

### 4.2 API Action: `submitDailyLog` (`src/types/api.ts`)

**Request Payload (`SubmitDailyLogPayload`)**:
```typescript
export interface SubmitDailyLogPayload {
  action?: 'submitDailyLog';
  studyId: string;                            // Required: e.g. "SG-BIO-0001"
  email: string;                              // Required: student email
  fullName?: string;                          // Optional: student name
  stream?: string;                            // Optional: "Biological Science" | "Physical Science"
  dateOfStudy: string;                        // Required: "YYYY-MM-DD"
  sessions?: StudySession[];                  // Optional: array of dynamic sessions
  subjects?: Array<{
    name: string;
    hours: number;
    focus: number;
    productivity: number;
  }>;
  hoursSubject1?: number;                     // Optional: explicit subject 1 hours
  hoursSubject2?: number;                     // Optional: explicit subject 2 hours
  hoursSubject3?: number;                     // Optional: explicit subject 3 hours
  totalHours?: number;                        // Optional: explicit total hours (override)
  focusScore?: number;                        // Optional: 1-10 overall focus
  productivityScore?: number;                 // Optional: 1-10 overall productivity
  notes?: string;                             // Optional: general notes
  telegram?: string;                          // Optional: telegram handle
  telegramUsername?: string;
  proofFile?: {
    base64: string;
    mimeType?: string;
    fileName?: string;
  };
  photoProofBase64?: string;
  proofPhotoUrl?: string;
  manualOverride?: boolean;                   // Optional: flag indicating manual override
}
```

**Response Data (`SubmitDailyLogResponseData`)**:
```typescript
export interface SubmitDailyLogResponseData {
  isDuplicate: boolean;
  message?: string;
  logId?: string;
  studyId?: string;
  dateOfStudy?: string;
  totalHours?: number;
  proofPhotoUrl?: string;
  log?: DailyLogEntry;
  existingLog?: DailyLogEntry;
  rawRow?: any;
}
```

### 4.3 API Action: `getStudentHistory` (`src/types/api.ts`)

**Request Payload**:
```typescript
export interface StudentHistoryPayload {
  action?: 'getStudentHistory';
  studyId?: string;
  email?: string;
}
```

**Response Data (`StudentHistoryResponseData`)**:
```typescript
export interface StudentHistoryResponseData {
  studyId: string;
  logs: DailyLogEntry[];
  history?: DailyLogEntry[];
  stats: StudentStats;
}
```

---

## 5. Cross-Layer Data Parity & Storage Mapping

| Column / Field | Google Sheets `DailyLogs` (19 Cols) | Mock Server (`daily_logs.json`) | Frontend Type (`DailyLogEntry`) | Auto-Calculation from Sessions |
|:---|:---|:---|:---|:---|
| **Col 1 (A)** | `Timestamp` (ISO 8601) | `timestamp` | `timestamp` | Generated on submission |
| **Col 2 (B)** | `Study ID` (e.g. `SG-BIO-0001`) | `studyId` | `studyId` | From authenticated `member.studyId` |
| **Col 3 (C)** | `Email` | `email` | `email` | From authenticated `user.email` |
| **Col 4 (D)** | `Date of Study` (`YYYY-MM-DD`) | `dateOfStudy` | `dateOfStudy` | Selected date (`getTodayDateString()`) |
| **Col 5 (E)** | `Subject 1 Name` | `subjects[0].name` | `subjects[0].name` / `subject1` | Bio: "Biology", Math: "Combined Maths" |
| **Col 6 (F)** | `Subject 1 Hours` | `subjects[0].hours` | `subjects[0].hours` / `subject1Hours` | Sum of `sessions.filter(s => s.subject === Sub1).hours` |
| **Col 7 (G)** | `Subject 1 Focus` | `subjects[0].focus` | `subjects[0].focus` | Mean focus of Sub1 sessions or `focusScore` |
| **Col 8 (H)** | `Subject 1 Productivity` | `subjects[0].productivity` | `subjects[0].productivity` | Mean prod of Sub1 sessions or `productivityScore` |
| **Col 9 (I)** | `Subject 2 Name` | `subjects[1].name` | `subjects[1].name` / `subject2` | Bio: "Chemistry", Math: "Physics" |
| **Col 10 (J)**| `Subject 2 Hours` | `subjects[1].hours` | `subjects[1].hours` / `subject2Hours` | Sum of `sessions.filter(s => s.subject === Sub2).hours` |
| **Col 11 (K)**| `Subject 2 Focus` | `subjects[1].focus` | `subjects[1].focus` | Mean focus of Sub2 sessions or `focusScore` |
| **Col 12 (L)**| `Subject 2 Productivity` | `subjects[1].productivity` | `subjects[1].productivity` | Mean prod of Sub2 sessions or `productivityScore` |
| **Col 13 (M)**| `Subject 3 Name` | `subjects[2].name` | `subjects[2].name` / `subject3` | Student's optional subject (Physics/Chemistry/ICT/Agri) |
| **Col 14 (N)**| `Subject 3 Hours` | `subjects[2].hours` | `subjects[2].hours` / `subject3Hours` | Sum of `sessions.filter(s => s.subject === Sub3).hours` |
| **Col 15 (O)**| `Subject 3 Focus` | `subjects[2].focus` | `subjects[2].focus` | Mean focus of Sub3 sessions or `focusScore` |
| **Col 16 (P)**| `Subject 3 Productivity` | `subjects[2].productivity` | `subjects[2].productivity` | Mean prod of Sub3 sessions or `productivityScore` |
| **Col 17 (Q)**| `Notes` | `notes` | `notes` | Daily summary notes (or joined session notes) |
| **Col 18 (R)**| `Telegram Username` | `telegram` | `telegram` | `@username` |
| **Col 19 (S)**| `Proof Photo URL` | `proofPhotoUrl` | `proofPhotoUrl` | Google Drive / mock upload URL |
| **In-Memory** | N/A (synthesized on read) | `sessions: cleanSessions` | `sessions: StudySession[]` | Full detailed session objects list |

---

## 6. Backward Compatibility Protocol

### 6.1 Writing to Backend
1. When submitting multiple sessions via `/daily`:
   - Sessions are grouped by subject and auto-summed into `hoursSubject1`, `hoursSubject2`, and `hoursSubject3`.
   - The aggregate subject hours are written to columns F, J, and N of the `DailyLogs` Google Sheet.
   - Total hours is written as the sum (or manual override value).
   - This ensures **100% backward compatibility** with existing Google Sheets formulas (`SUM(DailyLogs!F2:F)`, etc.) and analytics sheets.

### 6.2 Reading from Backend (Legacy Row Synthesis)
1. When reading a historical log from `DailyLogs` (which does not contain individual session timestamp records):
   - If `log.sessions` is not present or empty, the frontend reconstructs synthetic sessions from `log.subjects`:
     ```typescript
     const sessions: StudySession[] = (log.subjects || [])
       .filter((sub) => (sub.hours || 0) > 0)
       .map((sub, idx) => ({
         id: `sess_synth_${log.dateOfStudy}_${idx}`,
         subject: sub.name,
         hours: sub.hours,
         focus: sub.focus || log.focusScore || 8,
         productivity: sub.productivity || log.productivityScore || 8,
         notes: idx === 0 ? (log.notes || '') : '',
       }));
     ```
2. This guarantees that history drawers, calendar overlays, and session badges work seamlessly for both new multi-session entries and legacy single-day summary records.

---

## 7. Verification Summary

1. **TypeScript Compiles Cleanly**: `src/types/logs.ts` and `src/types/api.ts` strictly define all session, payload, and response interfaces.
2. **Mock Server (`server/mock-server.js`)**:
   - `submitDailyLog` parses `payload.sessions`, computes subject totals, supports manual override, sanitizes strings, and stores `cleanSessions`.
   - `getStudentHistory` returns logs with `sessions` intact alongside personal stats and streaks.
3. **Google Apps Script (`backend/Code.gs`)**:
   - `handleSubmitDailyLog` aggregates `payload.sessions` into the 19-column `DailyLogs` sheet structure, supporting manual overrides and atomic locking.
   - `handleGetStudentHistory` parses 19 columns into structured `subjects` objects and computes complete personal statistics.
4. **Frontend Logger (`src/app/daily/page.tsx`)**:
   - Dynamic session builder, start/end time auto-calculation, real-time subject and total hours calculation, active manual override toggle, photo proof security validation, and offline caching.
5. **Dashboard (`src/app/dashboard/page.tsx`)**:
   - Robust parsing of `log.subjects`, `log.sessions`, and fallback columns for streak, stats, trend charts, equilibrium balance score, and history rendering.
