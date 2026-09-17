# StudySync — Comprehensive Phase 0 Codebase Survey & Architectural Specification

**Document Version:** 1.0.0  
**Target Architecture:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
**Target Deployment:** Static Export (`output: 'export'`, `out/` directory) to Firebase Hosting (`studysync-al-2026`)  
**Backend:** Google Apps Script Web App (`Code.gs`) + Google Sheets (`1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`) + Google Drive  

---

## 1. Executive Summary & Existing Codebase Overview

StudySync is a specialized daily study accountability and member management web application designed for Sri Lankan G.C.E. Advanced Level (A/L) examination students across Biological Science and Physical Science (Combined Mathematics) streams.

The current system operates as a zero-dependency vanilla ES6+ client-side Single Page Application (SPA) with custom Canvas 2D rendering engines, reactive state pub/sub, Firebase Authentication (Google Sign-In), and a Google Apps Script REST backend acting on a normalized 3-sheet Google Spreadsheet and Google Drive storage.

### 1.1 Source Code Inventory

| File Path | Type / Language | Lines | Size | Purpose & Core Responsibility |
|---|---|---|---|---|
| `src/js/api.js` | ES6 Module (JS) | 242 | 7.9 KB | Unified `ApiClient` engine handling Apps Script & Mock Server communication for all 7+ authoritative endpoints. |
| `src/js/auth.js` | ES6 Module (JS) | 318 | 11.3 KB | `AuthService` wrapping Firebase Auth (Google Sign-In popup/redirect), session state restore, 1:1 Google account binding, and fallback direct sign-in modal. |
| `src/js/state.js` | ES6 Module (JS) | 173 | 4.9 KB | `AppState` reactive pub/sub store with LocalStorage caching (`studysync_app_state_v2`). |
| `src/js/app.js` | ES6 Module (JS) | 319 | 11.6 KB | Application bootstrap, client-side hash router (`#landing`, `#register`, `#dashboard`, `#daily`, `#history`, `#admin`, `#verify/:id`), header synchronization, and streak pill updates. |
| `src/js/qr.js` | ES6 Module (JS) | 754 | 22.3 KB | Pure JavaScript QR Code generator (Model 2, Byte Mode, EC Level M), $GF(256)$ Reed-Solomon math, bit buffer, canvas renderer, and dual payload generator/parser. |
| `src/js/idcard.js` | ES6 Module (JS) | 519 | 17.8 KB | `IdCard` Canvas 2D rendering engine: Apple Wallet-style dark metallic pass ($480 \times 302$ px base, $1440 \times 906$ px at 3x 300 DPI PNG export), gold EMV chip, scannable QR box, microtext ribbon. |
| `src/js/slider.js` | ES6 Module (JS) | 360 | 12.6 KB | `CustomSlider` 1–10 Focus & Productivity dual slider component with pointer capture, qualitative tier coloring, haptic feedback, and keyboard navigation. |
| `src/js/schools.js` | ES6 Module (JS) | 598 | 54.0 KB | 306 Sri Lankan National/Popular schools dataset across all 9 Provinces and 25 Districts, fuzzy autocomplete engine, and custom school fallback. |
| `src/js/toast.js` | ES6 Module (JS) | 231 | 7.9 KB | `Toast` notification engine (Success, Error, Warning, Info) with progress bar timers, hover pause, and `window.alert` override (Zero alert dialogs). |
| `src/js/utils.js` | ES6 Module (JS) | 536 | 16.0 KB | Date parsing, streak math algorithm, personal/group stats aggregation, Canvas 2D image downscaler/compressor (<400KB), input sanitizers, and RFC 4180 CSV export. |
| `src/js/views/landingView.js` | ES6 Module (JS) | 265 | 15.0 KB | Landing view with hero section, Google Sign-In CTA, sample Apple Wallet pass live canvas preview, and feature bento grid. |
| `src/js/views/registerView.js` | ES6 Module (JS) | 435 | 19.9 KB | Registration onboarding view with locked Google email, school autocomplete dropdown, stream radio cards, dynamic optional subject picker, and 3-subject preview tag bar. |
| `src/js/views/dashboardView.js` | ES6 Module (JS) | 1,166 | 55.6 KB | Student personal dashboard: Profile card, live ID card canvas preview + 3x PNG download, today's status banner, 4-card personal stats bento, searchable history table, proof photo modal, and profile edit modal. |
| `src/js/views/dailyFormView.js` | ES6 Module (JS) | 1,048 | 48.9 KB | Daily study logger: Dynamic 3-subject stream form, decimal hours with +30m/+1h/+2h/clear buttons, 1-10 dual sliders, drag & drop compressed photo proof, live total hours, and one-per-day read-only summary lock. |
| `src/js/views/adminView.js` | ES6 Module (JS) | 1,855 | 82.3 KB | Super Admin console with whitelist gate (`ADMIN_EMAILS`), 403 Forbidden screen, 3 tabs: Group Analytics & Leaderboard (5 KPI cards, stream breakdown, SVG area chart, school progress bars), Members Directory (search, filters, JSON dump, CSV export, quick edit modal), and Daily Logs Inspector (date range filters, student filter, photo proof modal, CSV export). |
| `src/js/views/verifyView.js` | ES6 Module (JS) | 279 | 12.7 KB | SPA public verification view for scanned QR codes and ID lookup. |
| `src/css/custom.css` | CSS | 566 | 15.3 KB | Apple dark theme styling: 4 aurora orbs floating animation, procedural noise grain, glassmorphism panels, custom slider track/thumb, toast stack animations, wallet card 3D tilt. |
| `index.html` | HTML5 Shell | 197 | 9.7 KB | SPA container, Google fonts, Tailwind CDN config, Firebase compat v10 SDK loader, Lucide icons loader, header nav, root mount element, toast container, modal container. |
| `verify.html` | HTML5 Standalone | 285 | 13.9 KB | Standalone public verification portal reading `?id=...`, `?verify=...`, or `#verify/...` URL params. |
| `backend/Code.gs` | Google Apps Script | 1,401 | 46.2 KB | Authoritative backend Web App (`doGet`/`doPost`), `LockService` concurrency controls, 3-sheet database initializer (`Members` 10 cols, `DailyLogs` 19 cols, `Analytics`), and Google Drive photo hierarchy manager. |
| `backend/appsscript.json`| JSON | 25 | 0.8 KB | Apps Script manifest defining V8 runtime, time zone (`Asia/Colombo`), and Google Drive/Spreadsheets OAuth scopes. |
| `backend/README.md` | Markdown | 285 | 10.2 KB | Complete deployment guide and API contract reference for the Google Apps Script backend. |
| `server/mock-server.js` | Node.js Express | 832 | 28.1 KB | 100% parity local dev/testing mock backend server with file-backed storage (`server/mock_db/`), uploads simulator (`server/mock_uploads/`), and text/plain parser. |
| `firebase.json` | JSON | 54 | 1.0 KB | Firebase Hosting configuration with rewrites (`/verify/**` $\to$ `/verify.html`, `**` $\to$ `/index.html`) and cache-control headers. |
| `package.json` | JSON | 31 | 0.7 KB | Project metadata, scripts (`start`, `dev`, `test`, `test:e2e`, `serve`), Express and CORS dependencies. |

---

## 2. Backend & API Interaction Contracts

### 2.1 Apps Script Endpoint & Critical Network Protocol

- **Live Production URL:**  
  `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec`
- **Spreadsheet ID:** `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`
- **Drive Uploads Root Folder:** `StudySync_Uploads`
- **Admin Email Whitelist:** `alwisachalaanurada@gmail.com`, `admin@studysync.lk`, `lead.organizer@gmail.com`, `studysync.admin@gmail.com`

#### ⚠️ Critical Network Constraint:
All `POST` requests to the Google Apps Script Web App **MUST** send:
```http
Content-Type: text/plain;charset=utf-8
```
Google Apps Script triggers CORS preflight options issues and 302 redirects when `application/json` is sent from browser clients without Google OAuth tokens. Sending `text/plain;charset=utf-8` allows the `doPost(e)` function to parse `e.postData.contents` directly as a JSON string without triggering CORS preflight rejections. The Next.js client implementation **must preserve this pattern**.

### 2.2 Standard JSON Response Envelope
Every endpoint returns responses conforming to this TypeScript interface:
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string; // ISO 8601 UTC
}
```

### 2.3 Comprehensive Endpoint Specifications

#### 1. `checkUser`
Checks if an email is registered; returns profile, today's submission status, and personal rollup stats.
- **Method:** `POST` (or `GET`)
- **Payload:**
  ```json
  {
    "action": "checkUser",
    "email": "kasun.p@gmail.com"
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface CheckUserData {
    registered: boolean;
    member: MemberProfile | null;
    todayLog: DailyLog | null;
    stats: PersonalStats | null;
  }
  ```

#### 2. `registerUser`
Registers a new student account using Apps Script `LockService` for atomic sequential Study ID generation (`SG-BIO-0001` or `SG-MATH-0001`).
- **Method:** `POST`
- **Payload:**
  ```typescript
  interface RegisterPayload {
    action: "registerUser";
    fullName: string;
    email: string; // Lowercase, trimmed
    gender: "Male" | "Female" | "Other";
    telegram: string; // Formatted with @ prefix
    school: string; // Selected from schools dataset or custom
    stream: "Biological Science" | "Physical Science";
    optionalSubject: "Physics" | "Agriculture" | "Chemistry" | "ICT";
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface RegisterResponseData extends MemberProfile {
    alreadyRegistered: boolean;
  }
  ```

#### 3. `submitDailyLog`
Submits a daily study session with decimal hours, 1–10 focus and productivity scores for 3 stream-specific subjects, optional reflections, and optional base64 photo proof. Enforces one submission per student per date.
- **Method:** `POST`
- **Payload:**
  ```typescript
  interface SubmitDailyLogPayload {
    action: "submitDailyLog";
    studyId: string; // e.g. "SG-BIO-0001"
    email: string;
    dateOfStudy: string; // "YYYY-MM-DD"
    subjects: Array<{
      name: string;
      hours: number; // Decimal (e.g. 2.5)
      focus: number; // 1 to 10
      productivity: number; // 1 to 10
    }>;
    notes?: string;
    telegram?: string;
    proofFile?: {
      base64: string; // Raw base64 or DataURL string
      mimeType: string; // "image/jpeg"
      fileName: string; // "proof_2026-08-26.jpg"
    } | null;
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface SubmitDailyLogResponseData {
    isDuplicate: boolean;
    logId: string; // ISO timestamp
    studyId: string;
    dateOfStudy: string;
    totalHours: number;
    proofPhotoUrl: string; // Google Drive web view link or local URL
    log: DailyLog;
  }
  ```

#### 4. `getStudentHistory`
Retrieves all historical daily study logs for a specific student ID along with personal aggregated metrics and streak information.
- **Method:** `POST` (or `GET`)
- **Payload:**
  ```json
  {
    "action": "getStudentHistory",
    "studyId": "SG-BIO-0001",
    "email": "kasun.p@gmail.com"
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface StudentHistoryData {
    studyId: string;
    logs: DailyLog[];
    stats: PersonalStats;
  }
  ```

#### 5. `verifyMember`
Public verification endpoint for scanned QR codes and manual ID verification (returns sanitized public profile, omitting private contact details).
- **Method:** `GET` or `POST`
- **Query / Payload:** `?action=verifyMember&studyId=SG-BIO-0001` or `{ action: "verifyMember", studyId: "SG-BIO-0001" }`
- **Response Format (`data`):**
  ```typescript
  interface VerifyMemberData {
    valid: boolean;
    member?: {
      studyId: string;
      fullName: string;
      school: string;
      stream: string;
      optionalSubject: string;
      registrationDate: string;
      status: "Active" | "Inactive";
    };
    message?: string;
  }
  ```

#### 6. `updateProfile`
Updates member profile fields from the Student Dashboard modal and synchronizes the change to the `Members` Google Sheet.
- **Method:** `POST`
- **Payload:**
  ```typescript
  interface UpdateProfilePayload {
    action: "updateProfile";
    email: string;
    studyId: string;
    fullName?: string;
    gender?: string;
    telegram?: string;
    school?: string;
    stream?: string;
    optionalSubject?: string;
    status?: "Active" | "Inactive";
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface UpdateProfileResponseData {
    updated: boolean;
    member: MemberProfile;
  }
  ```

#### 7. `adminUpdateMember`
Admin-only endpoint allowing administrators to update any student's record (name, school, stream, elective, status) in Google Sheets.
- **Method:** `POST`
- **Payload:**
  ```typescript
  interface AdminUpdateMemberPayload {
    action: "adminUpdateMember";
    adminEmail: string;
    studyId: string;
    fullName?: string;
    school?: string;
    stream?: string;
    optionalSubject?: string;
    status?: "Active" | "Inactive";
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface AdminUpdateMemberResponseData {
    updated: boolean;
    member: MemberProfile;
  }
  ```

#### 8. `getAdminData`
Protected query returning the full group dataset: all registered members, recent study logs, computed group telemetry, and ranked streak leaderboard.
- **Method:** `POST`
- **Payload:**
  ```json
  {
    "action": "getAdminData",
    "adminEmail": "alwisachalaanurada@gmail.com"
  }
  ```
- **Response Format (`data`):**
  ```typescript
  interface AdminData {
    members: MemberProfile[];
    recentLogs: DailyLog[];
    analytics: GroupAnalytics;
    leaderboard: LeaderboardItem[];
  }
  ```

#### 9. `getAnalytics`
Public/Student dashboard overview returning high-level KPIs, stream breakdown, and top 10 streak leaders.
- **Method:** `GET` or `POST`
- **Payload:** `{ "action": "getAnalytics" }`
- **Response Format (`data`):**
  ```typescript
  interface AnalyticsData {
    kpi: {
      totalMembers: number;
      activeMembers: number;
      totalStudyHours: number;
      totalLogs: number;
      avgDailyHours: number;
      avgGroupFocus: number;
      avgGroupProductivity: number;
    };
    streamBreakdown: Record<string, { members: number; totalHours: number; totalLogs: number }>;
    topStreaks: LeaderboardItem[];
  }
  ```

---

## 3. Google Sheets Database Schema Specification

The Google Sheets backend (`Code.gs`) defines a normalized 3-sheet database structure initialized by `setupDatabase()`.

### 3.1 Sheet 1: `Members` (10 Columns)
- **Primary Unique Key:** Column C (`Email`, lowercased)
- **Public Reference Key:** Column A (`Study ID`)

| Column # | Column Letter | Header Name | Data Type | Example Value |
|---|---|---|---|---|
| 1 | `A` | `Study ID` | String | `SG-BIO-0001` or `SG-MATH-0001` |
| 2 | `B` | `Full Name` | String | `Achala Anuradha` |
| 3 | `C` | `Email` | String | `alwisachalaanurada@gmail.com` |
| 4 | `D` | `Gender` | String | `Male` / `Female` / `Other` |
| 5 | `E` | `Telegram Username` | String | `@achala_a` |
| 6 | `F` | `School` | String | `Royal College, Colombo` |
| 7 | `G` | `Stream` | String | `Biological Science` / `Physical Science` |
| 8 | `H` | `Optional Subject` | String | `Physics` / `Agriculture` / `Chemistry` / `ICT` |
| 9 | `I` | `Registration Date` | ISO Timestamp | `2026-08-26T08:30:00.000Z` |
| 10 | `J` | `Status` | String | `Active` / `Inactive` |

### 3.2 Sheet 2: `DailyLogs` (19 Columns)
- **Foreign Key:** Column B (`Study ID`) $\to$ `Members.Study ID`
- **Composite Unique Constraint:** `(Study ID, Date of Study)`

| Column # | Column Letter | Header Name | Data Type | Notes / Constraints |
|---|---|---|---|---|
| 1 | `A` | `Timestamp` | ISO String | Submission timestamp |
| 2 | `B` | `Study ID` | String | Matches `Members` Col A |
| 3 | `C` | `Email` | String | Student Google email |
| 4 | `D` | `Date of Study` | String (`YYYY-MM-DD`) | Study date |
| 5 | `E` | `Subject 1 Name` | String | Stream Subject 1 (e.g. `Biology` or `Combined Maths`) |
| 6 | `F` | `Subject 1 Hours` | Float (Decimal) | e.g. `2.5` |
| 7 | `G` | `Subject 1 Focus` | Integer (1–10) | Slider rating |
| 8 | `H` | `Subject 1 Productivity` | Integer (1–10) | Slider rating |
| 9 | `I` | `Subject 2 Name` | String | Stream Subject 2 (e.g. `Chemistry` or `Physics`) |
| 10 | `J` | `Subject 2 Hours` | Float (Decimal) | e.g. `2.0` |
| 11 | `K` | `Subject 2 Focus` | Integer (1–10) | Slider rating |
| 12 | `L` | `Subject 2 Productivity` | Integer (1–10) | Slider rating |
| 13 | `M` | `Subject 3 Name` | String | Stream Subject 3 (Elective) |
| 14 | `N` | `Subject 3 Hours` | Float (Decimal) | e.g. `1.5` |
| 15 | `O` | `Subject 3 Focus` | Integer (1–10) | Slider rating |
| 16 | `P` | `Subject 3 Productivity` | Integer (1–10) | Slider rating |
| 17 | `Q` | `Notes` | String | Student reflections / topics covered |
| 18 | `R` | `Telegram` | String | Telegram username |
| 19 | `S` | `Proof Photo URL` | String (URL) | Google Drive view URL or local mock URL |

### 3.3 Sheet 3: `Analytics`
- **KPI Formula Row (Row 4):**
  - Total Members: `=COUNTA(Members!A2:A)`
  - Total Hours: `=SUM(DailyLogs!F2:F) + SUM(DailyLogs!J2:J) + SUM(DailyLogs!N2:N)`
  - Total Daily Logs: `=COUNTA(DailyLogs!A2:A)`
  - Avg Focus/Prod: `=IFERROR(AVERAGE(DailyLogs!G2:G, DailyLogs!K2:K, DailyLogs!O2:O), 0)`
- **Member Rollup Leaderboard Header (Row 7, 14 Columns):**
  `Study ID`, `Full Name`, `Stream`, `Total Logs`, `Total Hours`, `Subj 1 Hours`, `Subj 2 Hours`, `Subj 3 Hours`, `Avg Focus`, `Avg Productivity`, `Current Streak (Days)`, `Max Streak (Days)`, `Last Active Date`, `Last Updated`.

---

## 4. State Management, Auth & Flow Specifications

### 4.1 State Model (`AppState`)
The frontend state model manages the active session, student profile, logs, and UI states:

```typescript
export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface MemberProfile {
  studyId: string;
  fullName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  telegram: string;
  school: string;
  stream: 'Biological Science' | 'Physical Science';
  optionalSubject: 'Physics' | 'Agriculture' | 'Chemistry' | 'ICT';
  registrationDate: string;
  status: 'Active' | 'Inactive';
  role?: 'admin' | 'student';
}

export interface SubjectEntry {
  name: string;
  hours: number;
  focus: number;
  productivity: number;
}

export interface DailyLog {
  timestamp: string;
  studyId: string;
  email: string;
  dateOfStudy: string;
  subjects: SubjectEntry[];
  totalHours: number;
  notes: string;
  telegram: string;
  proofPhotoUrl: string;
}

export interface PersonalStats {
  currentStreak: number;
  maxStreak?: number;
  longestStreak?: number;
  totalHours: number;
  totalSubmissions?: number;
  totalLogs?: number;
  avgDailyHours?: number;
  avgFocus: number;
  avgProductivity: number;
  subjectTotals?: Record<string, number>;
  subjectHours?: Record<string, number>;
  streak?: {
    currentStreak: number;
    longestStreak: number;
    studiedToday: boolean;
    lastStudyDate: string | null;
  };
}

export interface LeaderboardItem {
  rank: number;
  studyId: string;
  name: string;
  school: string;
  stream: string;
  totalHours: number;
  totalLogs: number;
  streak: number;
  maxStreak: number;
  avgFocus: number;
  avgProductivity: number;
}

export interface GroupAnalytics {
  totalMembers: number;
  activeMembers: number;
  totalHours: number;
  totalLogs: number;
  avgDailyHours: number;
  avgGroupFocus: number;
  avgGroupProductivity: number;
  streamBreakdown: Record<string, { members: number; totalHours: number; totalLogs: number }>;
}
```

### 4.2 Auth State Flow & Page Transitions

```
                    ┌─────────────────────────┐
                    │ User clicks "Sign In" /  │
                    │ "Continue with Google"  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Firebase Google Auth     │
                    │ Popup (select_account)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ ApiClient.checkUser()   │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
       [Not Registered]                     [Registered]
                 │                               │
                 ▼                               ▼
       ┌──────────────────┐             ┌──────────────────┐
       │ Route: #register │             │ Is Admin Email?  │
       │ (Locked Email)   │             └────────┬─────────┘
       └─────────┬────────┘                      │
                 │                     ┌─────────┴─────────┐
                 ▼                     │                   │
       ┌──────────────────┐         [Admin]            [Student]
       │ Register & alloc │            │                   │
       │ Sequential ID    │            ▼                   ▼
       └─────────┬────────┘    ┌──────────────┐   ┌────────────────┐
                 │             │ Show Admin   │   │ Route:         │
                 └────────────►│ Nav Tab      │   │ #dashboard     │
                               └──────────────┘   └────────────────┘
```

1. **Silent Session Restore:** `firebase.auth().onAuthStateChanged` triggers on page load. If user session is detected, `_handleSuccessfulLogin` executes silently to restore `member`, `todayLog`, and `history` without blocking UI.
2. **First-Time Google Sign-In:** If `checkUser(email)` returns `registered: false`, the app routes immediately to `#register`, locking the email field to the authenticated Google account to guarantee a strict 1:1 mapping.
3. **Returning User Fast-Path:** If registered, the user is navigated directly to `#dashboard`.
4. **Admin Route Gate:** Users navigating to `/admin` or `#admin` are verified against `ADMIN_EMAILS`. Unauthorized users are presented with the styled 403 Forbidden screen.

---

## 5. Mathematical & Algorithmic Specifications

### 5.1 Stream & Subject Combinations
Sri Lankan G.C.E. A/L requires 3 major subjects:

| Stream | Mandatory Subject 1 | Mandatory Subject 2 | Elective (Pick 1 of 2) | ID Prefix |
|---|---|---|---|---|
| **Biological Science** | `Biology` | `Chemistry` | `Physics` OR `Agriculture` | `SG-BIO-` |
| **Physical Science** | `Combined Maths` | `Physics` | `Chemistry` OR `ICT` | `SG-MATH-` |

- **ID Allocation Rule:** IDs follow format `SG-{STREAM}-{0001..9999}` (e.g. `SG-BIO-0001`, `SG-MATH-0042`).
- **Subject Display Rule:** The Daily Study Form strictly displays only the 3 registered stream subjects.

### 5.2 Streak Calculation Math (`calculateStreak`)
- **Input:** Array of daily study logs.
- **Algorithm:**
  1. Extract all unique date strings (`YYYY-MM-DD`) and sort descending.
  2. Let `today = YYYY-MM-DD` (in local UTC+05:30 time) and `yesterday = YYYY-MM-DD` minus 1 calendar day.
  3. The streak is **active** if `uniqueDates[0] === today` OR `uniqueDates[0] === yesterday`.
  4. If active, count consecutive calendar days backwards from the starting active date.
  5. Longest streak: Traverse chronological ascending dates, incrementing running streak when `daysBetween(prev, curr) === 1`, resetting to 1 when difference $> 1$.
  6. Return `{ currentStreak, longestStreak, studiedToday, lastStudyDate }`.

### 5.3 Focus & Productivity 1–10 Score Tiers (`getScoreTier`)
Used across dual sliders, badges, and history tables:

| Score Range | Status Name | Tone | Emoji | Primary Hex | Gradient CSS | Badge Background |
|---|---|---|---|---|---|---|
| **1 – 3** | Distracted / Low | `danger` | ⚡ | `#ef4444` | `linear-gradient(90deg, #ef4444 0%, #f97316 100%)` | `rgba(239, 68, 68, 0.15)` |
| **4 – 6** | Moderate / Steady | `warning` | ✨ | `#eab308` | `linear-gradient(90deg, #eab308 0%, #10b981 100%)` | `rgba(234, 179, 8, 0.15)` |
| **7 – 8** | High / Productive | `success` | 🎯 | `#10b981` | `linear-gradient(90deg, #10b981 0%, #06b6d4 100%)` | `rgba(16, 185, 129, 0.15)` |
| **9 – 10** | Deep Flow State 🔥 | `purple` | 🔥 | `#06b6d4` | `linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #d946ef 100%)` | `rgba(139, 92, 246, 0.18)` |

### 5.4 QR Code Generator Math (`qr.js`)
A pure TypeScript/JavaScript implementation of ISO/IEC 18004 QR Code Model 2 (8-bit Byte Mode):
1. **Galois Field $GF(256)$:** Initialized with generator polynomial $x^8 + x^4 + x^3 + x^2 + 1$ ($0x11d$) using precalculated log/antilog exponent tables.
2. **Reed-Solomon Error Correction:** Generator polynomial dynamically constructed for Version 1–14 block structures with error correction level `M` (15% recovery) or `L` (7% recovery).
3. **Mask Evaluation:** Masks 0–7 evaluated for penalties N1 (consecutive identical runs $\ge 5$), N2 ($2 \times 2$ blocks), and format information encoded with BCH $(15, 5)$ code masked with $0x5412$.
4. **Payload Encoding:** Encodes live public verification URL `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`.

### 5.5 Apple Wallet ID Card Canvas 2D Rendering Engine (`idcard.js`)
- **Base Dimensions:** Width = `480px`, Height = `302px` (Aspect Ratio: $\approx 1.5894$).
- **High-Res Export Dimensions:** Width = `1440px`, Height = `906px` ($3\times$ scale / 300 DPI PNG).
- **Canvas Rendering Pipeline:**
  1. **Clipping Path:** Rounded rectangle path with corner radius $24 \times scale$.
  2. **Metallic Gradient Background:**
     - Biological Science: Emerald/cyan linear gradient (`#060B11` $\to$ `#0B192C` $\to$ `#062024` $\to$ `#0B192C` $\to$ `#050B10`) with radial green specular highlight ($22\%$ opacity).
     - Physical Science: Indigo/purple linear gradient (`#07090E` $\to$ `#0F172A` $\to$ `#1E1B4B` $\to$ `#111827` $\to$ `#07090E`) with radial purple specular highlight ($25\%$ opacity).
  3. **Security Grid & Watermark:** Diagonal safety lines at step $20 \times scale$ (`rgba(255,255,255,0.03)`), center microtext watermark `STUDYSYNC OFFICIAL SECURE VERIFICATION ID`.
  4. **Brand Header:** Lightning bolt glyph in rounded gradient box ($28 \times 28 \times scale$), typography `StudySync` (font weight 700, $15 \times scale\text{ px}$) and `SRI LANKA G.C.E. A/L PASS` ($8.5 \times scale\text{ px}$).
  5. **Status Pill (Top-Right):** $88 \times 22 \times scale\text{ px}$ pill with glowing green circular dot and `ACTIVE` text.
  6. **Gold EMV Smart Chip:** $38 \times 28 \times scale\text{ px}$ metallic gold gradient box (`#FDE68A` $\to$ `#F59E0B` $\to$ `#D97706` $\to$ `#92400E`), internal contact trace lines, and 3 concentric contactless NFC arcs.
  7. **Member Information:** Full name ($18 \times scale\text{ px}$, auto-truncated with ellipsis if $> 55\%$ width), Study ID in monospace ($14 \times scale\text{ px}$, cyan glow), Stream & elective label ($10.5 \times scale\text{ px}$), School name ($10 \times scale\text{ px}$), and `ISSUED: DD MMM YYYY` ($8.5 \times scale\text{ px}$).
  8. **Embedded QR Code:** $104 \times 104 \times scale\text{ px}$ solid white card with 4-module quiet zone, high-contrast black modules, and `SCAN TO VERIFY` label below.
  9. **Bottom Security Ribbon:** $24 \times scale\text{ px}$ dark bar with microtext `OFFICIAL SRI LANKA G.C.E. ADVANCED LEVEL VERIFIED IDENTITY • REPRODUCTION PROHIBITED`.
  10. **Outer Border:** Dual gradient bevel stroke (`rgba(255,255,255,0.35)` to `rgba(99,102,241,0.25)`).

### 5.6 School Autocomplete Dataset (`schools.js`)
- **Dataset Size:** 306 Sri Lankan national, provincial, and private/semi-government colleges across 9 provinces and 25 districts.
- **Entry Structure:**
  ```typescript
  interface SchoolItem {
    id: string; // "CMB-001"
    name: string; // "Royal College, Colombo"
    district: string; // "Colombo"
    province: string; // "Western"
    gender: 'Boys' | 'Girls' | 'Mixed';
    type: 'National' | 'Provincial' | 'Private/Semi-Gov';
  }
  ```
- **Relevance Scoring:** Name starts with query (100) > Name includes query (80) > District starts with query (60) > District includes query (40) > Province includes query (20).
- **Custom Entry Fallback:** If student's school is not in the list, custom user entry is supported (`Use custom: "..."`).

### 5.7 Client-Side Image Compression Pipeline (`compressImage`)
- **Max Dimension:** 1600px width/height bounding box (proportional downscaling).
- **Output Format:** JPEG at 0.75 quality (< 400KB target size).
- **Encoding:** Canvas `toDataURL('image/jpeg', 0.75)` and `toBlob()`.

### 5.8 RFC 4180 CSV Exporter (`generateCsvString`)
- Escapes cells containing commas, double quotes, or newlines with double-quote wrapping (`"` $\to$ `""`).
- Row terminator: `\r\n`.

---

## 6. Target Next.js 14 App Router Architecture & Component Mapping

### 6.1 Route Mapping Table

| Existing Hash Route / File | Next.js 14 App Router Path | Target Component Structure |
|---|---|---|
| `#landing` / `landingView.js` | `app/page.tsx` | Hero section, animated aurora background, Google Sign-In button, live ID card preview canvas, bento feature grid. |
| `#register` / `registerView.js` | `app/register/page.tsx` | Multi-step shadcn `Card` registration form, locked Google email, `Command` school palette, Stream radio cards, Elective selector. |
| `#dashboard` / `dashboardView.js` | `app/dashboard/page.tsx` | Student dashboard: Profile card, Apple Wallet 3D tilt ID card, today's status banner, 4-card stats bento, history `Table`, proof photo `Dialog`, profile edit `Dialog`. |
| `#daily` / `dailyFormView.js` | `app/daily/page.tsx` | Daily study form: Date picker, 3 stream subject cards with `Input` hours, +30m/+1h/+2h buttons, custom Focus & Productivity sliders, proof photo uploader with client compression, duplicate lock view. |
| `#history` / `dashboardView.js` | `app/history/page.tsx` | Dedicated full history page: Searchable, filterable `DataTable` with subject breakdown badges and proof photo modal. |
| `#admin` / `adminView.js` | `app/admin/page.tsx` | Protected Admin console: Whitelist guard, 403 screen, `Tabs` (Analytics, Members, Logs), SVG 7-day study volume area chart, `DataTable` with search/filters/CSV/JSON export, member edit `Dialog`. |
| `verify.html` & `#verify/:id` / `verifyView.js` | `app/verify/page.tsx` | Public verification page: ID lookup input, verified member badge, anti-counterfeit timestamp. (Also ensure `public/verify.html` or static `/verify` routing is maintained). |

### 6.2 shadcn/ui Component Primitive Mapping

| UI Element | shadcn/ui Primitive | Implementation Strategy |
|---|---|---|
| Primary Buttons & CTAs | `Button` (default, secondary, outline, destructive) | Indigo accent (`#6366f1`), hover micro-scaling. |
| Form Containers & Stat Boxes | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `bg-zinc-900/60 backdrop-blur-md border border-zinc-800`. |
| School Autocomplete | `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` | Powered by 306 Sri Lankan schools dataset + custom entry option. |
| Gender & Stream Selectors | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `RadioGroup`, `RadioGroupItem` | Stream selection cards with custom emoji badges. |
| Study Hours & Inputs | `Input`, `Textarea` | Monospace font for numeric hours and Study IDs. |
| History & Admin Tables | `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell` | Clean dark theme table with sticky headers and search filters. |
| Proof Photo & Edit Modals | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger` | Glassmorphism modal backdrop. |
| Admin Navigation | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Seamless tab switching between Analytics, Members, and Logs. |
| Status & Quality Badges | `Badge` | Emerald (Active/Streaks), Amber (Warnings/Admin), Cyan (Study IDs), Rose (Inactive/Errors). |
| School & Stream Progress Bars | `Progress` | Emerald/Cyan gradient fill. |
| Global Notifications | `Toaster` (Sonner) | Replacing custom `toast.js` with rich sonner toast engine. |

### 6.3 Visual Theme & Tailwind Tokens (Dark Zinc Aesthetic)
- **Base Background:** `#09090b` (zinc-950) / `#07090E` (midnight canvas)
- **Cards & Surfaces:** `bg-zinc-900/60 backdrop-blur-md border border-zinc-800`
- **Primary CTA Accent:** Indigo `#6366f1` / `#4f46e5`
- **Streak & Warning Accent:** Amber `#f59e0b` / `#d97706`
- **Success & Verified Accent:** Emerald `#10b981` / `#059669`
- **Study ID & Info Accent:** Cyan `#06b6d4` / `#0284c7`
- **Destructive Accent:** Rose `#ef4444` / `#dc2626`
- **Typography:** `Inter` or `Geist Sans`, `JetBrains Mono` for IDs/numeric metrics.
- **Border Radius:** `0.75rem` (`--radius: 0.75rem`)

---

## 7. Edge Cases, Validation Rules & Backward Compatibility

1. **Apps Script Network Protocol:** Must strictly use `fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })` when targeting `script.google.com`.
2. **Duplicate Daily Submission Guard:** A student can only submit one daily log per date (`YYYY-MM-DD`). The backend checks `(Study ID, Date of Study)` composite key and returns `isDuplicate: true`. The frontend must switch to the read-only summary view if already submitted.
3. **Zero Study Hours Validation:** The daily form must reject submissions where all 3 subjects have `0.0` hours.
4. **Future Date Blocking:** Date picker must set `max={todayDateString}` and reject future dates.
5. **Study ID Formatting:** Must validate regex `/^SG-(BIO|MATH)-\d{4}$/`.
6. **Telegram Handle Sanitation:** Must ensure `@` prefix is automatically formatted before saving.
7. **Email Key Binding:** Email field in registration form must be locked/read-only to enforce 1:1 mapping with the authenticated Google account.
8. **Static Export Compatibility:** The Next.js app will be exported as static files (`output: 'export'`), meaning no Node.js runtime server APIs (`getServerSideProps`, Server Actions). All API interactions and auth state management must run purely client-side.
9. **URL Parameter Compatibility for Verification:** The `/verify` route and `verify.html` must support both `?id=SG-BIO-0001`, `?verify=SG-BIO-0001`, and `#verify/SG-BIO-0001`.
10. **Zero Alert Dialogs:** Under no circumstances should browser `alert()` or `confirm()` be called; all feedback must utilize the toast notification engine and dialog modals.

---

## 8. Verification & Test Plan

To independently verify the rebuilt application:
1. **TypeScript Build:** `npm run build` must compile with 0 TypeScript errors and produce the static `out/` export folder.
2. **Local Preview / Mock Server:** Start the mock server `node server/mock-server.js` and verify all 7 actions (`checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`, `verifyMember`, `getAdminData`, `getAnalytics`).
3. **Automated Test Suite:** Run `npm test` and `npm run test:e2e` to verify full feature coverage, boundary conditions, and adversarial edge cases.
4. **Live Deployment:** Deploy to Firebase Hosting via `firebase deploy --only hosting` and verify live Google Auth popup and Google Sheets backend synchronization at `https://studysync-al-2026.web.app`.
