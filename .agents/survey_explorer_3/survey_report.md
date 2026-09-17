# StudySync Architecture Survey Report: Backend API, Mock Server, Data Schemas, Firebase Configuration & Test Suites

**Author:** survey_explorer_3  
**Date:** 2026-08-27  
**Scope:** Backend API (`Code.gs` & `mock-server.js`), Data Schemas, Firebase Deployment, Test Infrastructure (Tiers 1–5), and Gap Analysis against the 2026-08-27T11:15:52Z Requirements.

---

## 1. Executive Summary

StudySync is a Sri Lankan G.C.E. Advanced Level (A/L) academic accountability and examination intelligence platform built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**, configured for **static export (`output: 'export'`)** and deployment to **Firebase Hosting**.

The system utilizes a dual-backend architecture:
1. **Production Backend:** Google Apps Script Web App (`backend/Code.gs`) bound to a 4-sheet normalized Google Spreadsheet database and Google Drive file hierarchy (`StudySync_Uploads/{studyId}/{dateOfStudy}/`).
2. **Development / E2E Testing Backend:** Node.js Express server (`server/mock-server.js`) maintaining 100% schema, action, and behavioral parity with `Code.gs`, backed by JSON files in `server/mock_db/` and local file uploads in `server/mock_uploads/`.

All frontend-backend communications strictly adhere to HTTP `POST` requests with `Content-Type: text/plain;charset=utf-8` containing action payloads. This avoids browser CORS preflight `OPTIONS` failures on Google Apps Script and handles Google 302 redirect flows seamlessly.

### Current Baseline Health
- **Unit & Integration Tests (`npm test`):** 385 tests passing across 22 test files (0 failures, 0 skipped).
- **End-to-End Test Suite (`npm run test:e2e`):** 469 tests passing across Tiers 1–5 (0 failures).
- **Static Production Build (`npm run build`):** 11/11 static pages generated cleanly into `out/` with zero TypeScript or static export errors.

---

## 2. Backend Architecture & API Action Inventory

The backend exposes a single unified dispatcher supporting 18 distinct actions via `doPost(e)` (and parameter-based `doGet(e)` for read-only queries):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Unified API Client                                 │
│          (POST text/plain;charset=utf-8 -> { action: "...", ... })          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│ Production: Google Apps Script│             │ Local / CI: Express Mock Svr  │
│ (`backend/Code.gs`)           │             │ (`server/mock-server.js`)     │
│ - LockService Concurrency     │             │ - In-Memory / File DB         │
│ - Google Sheets (4 sheets)    │             │ - Local Uploads Directory     │
│ - Google Drive Uploads        │             │ - Deterministic Test State    │
└───────────────────────────────┘             └───────────────────────────────┘
```

### Complete Action Registry

| # | Action Name | HTTP Method | Target Consumers | Description & Behavioral Invariants |
|---|-------------|-------------|------------------|--------------------------------------|
| 1 | `ping` / `health` | GET / POST | Health checks, CI | Returns `{ status: "healthy", service: "...", timestamp: "..." }`. |
| 2 | `checkUser` | POST / GET | AuthContext, App init | Queries student profile by email. Returns `{ registered, member, todayLog, stats }`. |
| 3 | `registerUser` | POST | Registration flow | Atomic sequential Study ID generation (`SG-BIO-XXXX` or `SG-MATH-XXXX`). Enforces 1:1 email uniqueness. |
| 4 | `submitDailyLog` | POST | `/daily` logging | Records daily study log with 3 stream subjects, multi-session breakdown, focus/productivity ratings, notes, and base64 photo proof. Enforces 1 submission per student per date. |
| 5 | `getStudentHistory` | POST / GET | `/dashboard`, Reports | Retrieves chronological daily logs and aggregated stats (`totalHours`, `currentStreak`, `maxStreak`, `avgFocus`, `avgProductivity`, `subjectHours`). |
| 6 | `verifyMember` | POST / GET | `/verify`, QR scanner | Public sanitized verification resolving member profile from `studyId`. |
| 7 | `updateProfile` | POST | Student settings modal | Updates personal info (`fullName`, `gender`, `telegram`, `school`, `stream`, `optionalSubject`, `examYear`). |
| 8 | `adminUpdateMember` | POST | Admin dashboard | Whitelisted administrator updates member details and status (`Active` / `Inactive`). |
| 9 | `adminDeleteMember` | POST | Admin dashboard | Whitelisted administrator removes member record. |
| 10 | `adminDeleteLog` | POST | Admin dashboard | Whitelisted administrator removes an erroneous log. |
| 11 | `adminAddMember` | POST | Admin dashboard | Administrative user creation proxying to `registerUser`. |
| 12 | `getAdminData` | POST / GET | Admin dashboard | Returns full member directory, recent logs, group analytics, and national leaderboard (admin email whitelist enforced). |
| 13 | `getAnalytics` | POST / GET | Dashboard KPIs | Returns group summary KPIs, stream distributions (Bio vs Maths), and top streak rankings. |
| 14 | `telegramWebhook` | POST | Telegram Bot API | Bidirectional bot command ingestion (`/start`, `/status`, `/log`, `/leaderboard`, `/remind`, `/help`). Supports native Telegram updates and simulated API payloads. |
| 15 | `broadcastDailyDigest` | POST | Scheduled 21:30 cron | Compiles community study statistics, participation rates, MVP students, and streak rankings into Markdown format and broadcasts to Telegram channel. |
| 16 | `logTestMark` | POST | `/tests` portal | Records examination / model paper scores with paper title, score, rank, difficulty, and notes. |
| 17 | `getTestMarks` | POST / GET | `/tests`, AI advisor | Retrieves all examination test marks for a student. |
| 18 | `deleteTestMark` | POST | `/tests` portal | Deletes a test mark record by `testId`. |

### Database Schemas (Google Sheets & Mock DB)

1. **`Members` Sheet (11 Columns):**
   - `Col A`: Study ID (`SG-BIO-0001` / `SG-MATH-0001`)
   - `Col B`: Full Name
   - `Col C`: Email (Primary Unique Key)
   - `Col D`: Gender (`Male`, `Female`, `Other`)
   - `Col E`: Telegram Username (`@handle`)
   - `Col F`: School (from 260+ standard school catalog)
   - `Col G`: Stream (`Biological Science` or `Physical Science`)
   - `Col H`: Optional Subject (`Physics`, `Agriculture`, `Chemistry`, `ICT`)
   - `Col I`: Registration Date (ISO 8601)
   - `Col J`: Status (`Active`, `Inactive`)
   - `Col K`: Exam Year (`2026`, `2027`, `2028`, `2029`)

2. **`DailyLogs` Sheet (19 Columns):**
   - `Col A`: Submission Timestamp (ISO 8601)
   - `Col B`: Study ID (Foreign Key -> Members)
   - `Col C`: Email
   - `Col D`: Date of Study (`YYYY-MM-DD`)
   - `Col E–H`: Subject 1 (Name, Hours, Focus 1–10, Productivity 1–10)
   - `Col I–L`: Subject 2 (Name, Hours, Focus 1–10, Productivity 1–10)
   - `Col M–P`: Subject 3 (Name, Hours, Focus 1–10, Productivity 1–10)
   - `Col Q`: Notes
   - `Col R`: Telegram Username
   - `Col S`: Proof Photo URL (Google Drive / Mock upload)

3. **`Analytics` Sheet:**
   - Group header KPI formulas (`COUNTA`, `SUM`, `AVERAGE`) and student leaderboard matrix.

4. **`TestMarks` Sheet (12 Columns):**
   - `Test ID`, `Study ID`, `Email`, `Test Date`, `Exam Type`, `Subject`, `Paper Title`, `Score`, `Rank`, `Difficulty`, `Notes`, `Timestamp`.

---

## 3. Data Structures, Multi-Session Handling & Compatibility

### `submitDailyLog` Multi-Session Architecture

The daily study logger supports both aggregated subject inputs and dynamic multiple study sessions:

```typescript
export interface StudySession {
  id?: string;
  subject: string;          // e.g. "Biology", "Chemistry", "Combined Maths", "Physics"
  hours: number;            // Numeric decimal hours (e.g. 1.5)
  startTime?: string;       // e.g. "08:30"
  endTime?: string;         // e.g. "10:00"
  focus?: number;           // 1-10
  productivity?: number;    // 1-10
  notes?: string;           // Session notes / topic
  topic?: string;           // Studied topic
  color?: string;           // Calendar block color
}

export interface SubmitDailyLogPayload {
  action?: 'submitDailyLog';
  studyId: string;
  email: string;
  dateOfStudy: string;      // YYYY-MM-DD
  sessions?: StudySession[];// Array of dynamic study sessions
  subjects?: Array<{
    name: string;
    hours: number;
    focus: number;
    productivity: number;
  }>;
  hoursSubject1?: number;
  hoursSubject2?: number;
  hoursSubject3?: number;
  totalHours?: number;      // Manual override or auto-calculated sum
  focusScore?: number;
  productivityScore?: number;
  notes?: string;
  telegram?: string;
  proofFile?: {
    base64: string;
    mimeType?: string;
    fileName?: string;
  };
}
```

### Auto-Summing & Manual Override Logic

Both `backend/Code.gs` and `server/mock-server.js` execute the following evaluation pipeline:
1. **Subject Resolution:** Identify student's stream and 3 registered subjects:
   - Biological Science: `Sub 1: Biology`, `Sub 2: Chemistry`, `Sub 3: Optional (Physics/Agri)`
   - Physical Science: `Sub 1: Combined Maths`, `Sub 2: Physics`, `Sub 3: Optional (Chemistry/ICT)`
2. **Session Aggregation:** When `sessions` array is present and explicit subject hours (`hoursSubject1..3`) are omitted:
   - Sums session hours matching each registered subject:
     $$\text{sub1Hours} = \sum_{\text{sess} \in \text{Sub1}} \text{sess.hours}, \quad \text{sub2Hours} = \sum_{\text{sess} \in \text{Sub2}} \text{sess.hours}, \quad \text{sub3Hours} = \sum_{\text{sess} \in \text{Sub3}} \text{sess.hours}$$
3. **Calculated Total:**
   $$\text{calculatedTotal} = \text{round}_2(\text{sub1Hours} + \text{sub2Hours} + \text{sub3Hours})$$
4. **Manual Override Support:** If `payload.totalHours` is explicitly provided, the manual override value is stored as `totalHours`; otherwise `calculatedTotal` is used:
   $$\text{totalHours} = \begin{cases} \max(0, \text{payload.totalHours}) & \text{if } \text{payload.totalHours is defined} \\ \text{calculatedTotal} & \text{otherwise} \end{cases}$$
5. **Backward Compatibility:** Single total inputs, 3 separate subject inputs, and dynamic multi-session payloads are all processed without breaking changes or data loss.

---

## 4. Firebase Hosting & Zero-Cache Configuration

The `firebase.json` deployment configuration is configured to guarantee immediate, fresh static asset serving on every deploy:

```json
{
  "hosting": {
    "public": "out",
    "cleanUrls": true,
    "trailingSlash": false,
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "backend/**",
      "server/**",
      "tests/**",
      ".agents/**"
    ],
    "rewrites": [
      {
        "source": "/verify/**",
        "destination": "/verify.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate, max-age=0"
          },
          {
            "key": "Pragma",
            "value": "no-cache"
          },
          {
            "key": "Expires",
            "value": "0"
          }
        ]
      }
    ]
  }
}
```

### Static Export Configuration (`next.config.mjs`)
- `output: 'export'`: Produces pure static HTML, JS, and CSS files in `out/`.
- `images.unoptimized: true`: Disables server-side Node.js image optimization required for static hosting.
- `reactStrictMode: true`: Enforces React best practices and lifecycle verification.

---

## 5. Existing Test Suites & Current Verification Results

The test suite spans 24 files utilizing the native Node.js test runner (`node --test`) and a custom E2E runner (`tests/e2e-runner.js`):

```
tests/
├── test-harness.js                             # Domain engine, mock DB, validations
├── e2e-runner.js                               # Master Tier 1-5 test execution runner
├── tier1-feature.test.js                       # Tier 1: 176 Feature Verification Tests
├── tier2-boundary.test.js                      # Tier 2: 175 Boundary Condition Tests
├── tier3-pairwise.test.js                      # Tier 3: 72 Pairwise Combinatorial Tests
├── tier4-application.test.js                   # Tier 4: 5 Application Scenarios (S1-S5)
├── tier4-scenarios.test.js                     # Additional scenario assertions
├── tier5-adversarial.test.js                   # Tier 5: 41 Adversarial & Security Tests
├── m1-verification.test.js                     # Milestone 1 UI/UX & Component tests
├── m1-challenger-component-stress.test.js      # Milestone 1 stress tests
├── m2-backend-verify.test.js                   # Milestone 2 Backend HTTP & Code.gs parity
├── m3-verification.test.js                     # Milestone 3 verification tests
├── m4-verification.test.js                     # Milestone 4 submission & duplicate locking
├── m5-verification.test.js                     # Milestone 5 validation tests
├── m6-core-engines-adversarial.test.js         # Milestone 6 Core engine resilience
├── m6-challenger2-stress.test.js               # Milestone 6 Challenger stress tests
├── m7-telegram.test.js                         # Milestone 7 Telegram bot webhook suite
├── m8-security-resilience.test.js              # Milestone 8 Magic bytes, nonces, rate limits
├── m9-cognitive-ai-zscore.test.js              # Milestone 9 Z-score velocity & Bayes tests
├── challenger-adversarial.test.js              # Challenger edge cases
├── challenger-frontend-gamification-stress.test.js # Gamification stress tests
├── challenger2-empirical-stress.test.js        # Empirical stress tests
├── gamification-export-remediation.test.js     # Data export & gamification tests
└── qr-iso-boundary.test.js                     # ISO/IEC 18004 QR matrix compliance
```

### Test Suite Execution Summary

```
======================================================================
  TEST SUITE EXECUTION SUMMARY                                         
======================================================================
  Command                     Total Tests   Passed   Failed   Status  
──────────────────────────────────────────────────────────────────────
  npm test (node --test)              385      385        0   PASS    
  npm run test:e2e (Tiers 1-5)        469      469        0   PASS    
    • Tier 1 (Feature Verification)   176      176        0   PASS    
    • Tier 2 (Boundary Conditions)    175      175        0   PASS    
    • Tier 3 (Pairwise Combinations)   72       72        0   PASS    
    • Tier 4 (Application Scenarios)    5        5        0   PASS    
    • Tier 5 (Adversarial Security)    41       41        0   PASS    
──────────────────────────────────────────────────────────────────────
  npm run build (Next.js Export)       11       11        0   PASS    
======================================================================
```

---

## 6. Gap Analysis Against New Requirements (2026-08-27T11:15:52Z)

A detailed comparison between existing implementations and the latest user specifications reveals the following specific functional and test coverage gaps:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          FEATURE GAP MATRIX                                            │
├──────────────────────────────────────┬──────────────────────┬────────────────────┬─────────────────────┤
│ Requirement Area                     │ Existing Status      │ Missing Components │ Test Coverage Gaps  │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R1. Big Buttons & Human Language     │ Partial in forms     │ Large 44-48px touch│ Need button height  │
│                                      │                      │ targets, p-8/p-10  │ & zero-overflow     │
│                                      │                      │ spacious layout    │ assertions          │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. Study Calendar Suite             │ Not implemented      │ Month/Week/Day view│ Need unit & e2e     │
│                                      │                      │ Subject colors     │ tests for calendar  │
│                                      │                      │ Past study overlay │ view navigation     │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. Drag-and-Drop Rescheduling       │ Not implemented      │ Block drag & drop  │ Need rescheduling   │
│                                      │                      │ Live recalculation │ mutation tests      │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. Virtual Study Room Links         │ Not implemented      │ 1-click Meet, Zoom │ Need room generator │
│                                      │                      │ & Jitsi room links │ test cases          │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. Two-Way Google Calendar Sync     │ Not implemented      │ RFC 5545 .ics      │ Need VCALENDAR RFC  │
│                                      │                      │ generator & import │ 5545 validation test│
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. AI Study Schedule Generator      │ AI Advisor exists in │ 1-click weekly     │ Need timetable      │
│                                      │ analytics            │ timetable generator│ balancing test cases│
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. Exam Countdown & Lockscreen      │ Basic date helpers   │ 2026-2029 countdown│ Need countdown date │
│                                      │ in utils             │ Live clock canvas  │ math & canvas tests │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R2. Homework & Assignment Tracker    │ Not implemented      │ Model paper tasks  │ Need assignment     │
│                                      │                      │ Due date indicators│ lifecycle tests     │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R3. Dynamic Multi-Session Logger     │ Implemented on /daily│ Auto-time calc     │ Add edge cases: zero│
│                                      │ & in mock-server     │ quick-add buttons  │ hrs, +/- buttons    │
├──────────────────────────────────────┼──────────────────────┼────────────────────┼─────────────────────┤
│ R4. Expandable History Table         │ Standard table rows  │ Compact badges     │ Test row expansion  │
│                                      │                      │ Details drawer     │ and badge rendering │
└──────────────────────────────────────┴──────────────────────┴────────────────────┴─────────────────────┘
```

### Detailed Breakdown of Required Additions

1. **Google Calendar Study Suite (`src/components/calendar/`):**
   - Interactive Month, Week, and Day navigation views.
   - Official Google Calendar color palette with customizable subject color scheme.
   - Overlay of historical study logs as colored time blocks corresponding to subjects (Biology, Combined Maths, Physics, Chemistry, etc.).
   - Drag-and-drop rescheduling of study blocks with automatic time/duration updates.

2. **Google Calendar Sync & RFC 5545 `.ics` Export / Import (`src/lib/calendar/`):**
   - RFC 5545 compliant `.ics` serializer generating valid `BEGIN:VCALENDAR`, `BEGIN:VEVENT`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`, and `UID` fields.
   - Direct "Add to Google Calendar" web link generator (`https://calendar.google.com/calendar/render?action=TEMPLATE&...`).
   - `.ics` feed/file parser to overlay tuition classes and school timetables onto the StudySync calendar.

3. **A/L Exam Countdown Engine & Mobile Lockscreen Widget Generator (`src/components/countdown/`):**
   - High-precision countdown calculator targeting 2026, 2027, 2028, and 2029 A/L examination milestone dates.
   - Canvas-based 3x high-resolution mobile wallpaper generator (9:16 aspect ratio, 1080x1920 / 1170x2532) with student name, Study ID, remaining days/hours, and target stream badges for instant lockscreen download.

4. **Smart AI Study Schedule Generator (`src/lib/ai/`):**
   - 1-click weekly schedule generator that computes an optimal, balanced distribution of study sessions across the student's 3 stream subjects and target exam year.

5. **Homework & Assignment Tracker (`src/components/homework/`):**
   - Tracker for school and tuition assignments, model paper due dates, and completion checkboxes linked to calendar due date markers.

6. **Virtual Study Room Links:**
   - 1-click generation of Google Meet (`https://meet.google.com/new`), Zoom, or Jitsi Meet room links attached to planned study blocks.

7. **History Table Session Badges & Details Drawer (`src/app/dashboard/`):**
   - Compact colored session badges (e.g. `[Bio: 2.0h]`, `[Phys: 1.5h]`) directly inside history table rows.
   - Expandable row or slide-out detail drawer to inspect the complete session breakdown, exact timestamps, focus ratings, and individual session notes.

8. **Test Suite Expansion:**
   - Add new unit and integration test suites validating:
     - RFC 5545 VCALENDAR output compliance
     - Countdown day/hour mathematical accuracy for 2026-2029
     - AI study timetable generator allocations
     - Calendar drag-and-drop state transitions
     - Multi-session edge cases and history drawer expansions

---

## 7. Recommended Implementation Sequence

To ensure zero regressions and maintain the 100% test pass rate throughout:
1. **Core Engines First (`src/lib/calendar/` & `src/lib/countdown/`):**
   - Implement RFC 5545 `.ics` generator and parser.
   - Implement Exam countdown and milestone calculation engine.
   - Implement AI weekly timetable generator algorithm.
2. **Interactive UI Components (`src/components/calendar/`, `src/components/countdown/`):**
   - Build Google Calendar Month/Week/Day view with drag-and-drop support.
   - Build lockscreen wallpaper canvas renderer and download trigger.
   - Build virtual study room button and homework tracker modal.
3. **Dashboard & History Enhancements (`src/app/dashboard/`):**
   - Upgrade history table with session badges and expandable details drawer.
   - Embed Calendar tab/view and countdown widget.
4. **Ergonomic Polish & Spacious Layouts:**
   - Ensure all buttons have minimum 44–48px touch targets.
   - Use warm, friendly everyday English across all cards and tooltips.
   - Prevent text clipping with responsive wrapping.
5. **Test Suite Expansion:**
   - Add comprehensive tests in `tests/` and verify `npm test`, `npm run test:e2e`, and `npm run build` all pass cleanly.
