# StudySync — Authoritative Specification & Feature Inventory
**Target Stack**: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui  
**Integrity Mode**: Production / Static Export (`output: 'export'`)  
**Deployment Target**: Firebase Hosting (`studysync-al-2026.web.app`)  
**Backend Target**: Google Apps Script Web App (`Code.gs`) + 3-Sheet Google Spreadsheet  
**Authoritative Sources**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `backend/Code.gs`, `src/js/*`, `tests/*`, `index.html`, `verify.html`

---

## 1. System Architecture & Context

### 1.1 Core Entities & Identifiers
- **Firebase Project ID**: `studysync-al-2026`
- **Firebase Hosting URL**: `https://studysync-al-2026.web.app`
- **Backend API Endpoint**: `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec`
- **Google Spreadsheet ID**: `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`
- **Super Administrator Email**: `alwisachalaanurada@gmail.com`
- **Admin Whitelist**: `alwisachalaanurada@gmail.com`, `admin@studysync.lk`, `lead.organizer@gmail.com`, `studysync.admin@gmail.com`

### 1.2 Protocol & Network Contract
- **HTTP Method**: POST (and parameter-based GET for ping/verify)
- **Content-Type**: `text/plain;charset=utf-8` (mandatory for Google Apps Script Web App endpoints to bypass CORS preflight and 302 redirect payload drops)
- **JSON Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "timestamp": "2026-08-26T09:14:02.000Z"
  }
  ```

---

## 2. Visual Design System & Styling Rules

### 2.1 Color Palette & Semantic Tokens
| Token | HEX / RGBA Code | Semantic Usage |
|---|---|---|
| Canvas Background | `#07090e` / `rgb(7, 9, 14)` | Base application canvas background |
| Surface Panel | `rgba(13, 17, 26, 0.85)` | Sticky header, footer, dialog backdrops |
| Card Background | `rgba(19, 27, 42, 0.60)` | Standard component card background |
| Elevated Surface | `rgba(24, 34, 54, 0.90)` | Dropdowns, command palettes, floating popovers |
| Subtle Border | `rgba(255, 255, 255, 0.08)` | Default card and panel borders |
| Glass Border | `rgba(255, 255, 255, 0.12)` | Active card hover and input borders |
| Focus Border | `rgba(99, 102, 241, 0.50)` | Active focus rings (`#6366f1`) |
| **Primary Action** | `#6366f1` (Indigo 500) | Primary CTA buttons, focus rings, interactive states |
| **Secondary Accent** | `#8b5cf6` (Purple 500) | Gradients, deep flow badges, Apple Wallet chip glow |
| **Success** | `#10b981` (Emerald 500) | Streaks, active status badges, Bio stream, verified checkmarks |
| **Warning** | `#f59e0b` (Amber 500) / `#eab308` | Streak flames, pending alerts, steady focus ratings, Gold medal |
| **Destructive** | `#ef4444` (Rose 500) | Inactive status, validation errors, remove photo buttons, 403 forbidden |
| **Cyan Accent** | `#06b6d4` (Cyan 500) | Physical science stream, Study ID badges, high productivity tier |
| **Fuchsia Accent** | `#d946ef` (Fuchsia 500) | Flow state gradients, secondary accent glows |

### 2.2 Typography & Radius
- **Font Families**:
  - Sans: `Inter` or `Geist` (`font-sans`), fallbacks: `SF Pro Display`, `Product Sans`, `-apple-system`
  - Monospace: `JetBrains Mono` (`font-mono`) for Study IDs, dates, timers, hours, CSV output
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold), 900 (Black)
- **Border Radius**: Default `--radius: 0.75rem` (`rounded-xl` / `12px`), Cards `rounded-2xl` (`16px`), Modals `rounded-3xl` (`24px`), Badges `rounded-full` (`9999px`)
- **Glassmorphism Rule**: `backdrop-blur-md` (or `blur(16px)`), subtle `bg-zinc-900/60` or `rgba(19, 27, 42, 0.60)` with `border border-white/10`. No uncontained rainbow gradients across full screen.

### 2.3 Aurora Background Mesh & Procedural Overlay
- **Mesh Orbs**:
  - Orb 1: `550x550px`, top: `-120px`, left: `-100px`, radial gradient `#6366f1` -> `#4338ca`, animation 22s float
  - Orb 2: `650x650px`, top: `30%`, right: `-150px`, radial gradient `#8b5cf6` -> `#6d28d9`, animation 26s float
  - Orb 3: `500x500px`, bottom: `-100px`, left: `20%`, radial gradient `#06b6d4` -> `#0369a1`, animation 20s float
  - Orb 4: `400x400px`, top: `60%`, left: `50%`, radial gradient `#d946ef` -> `#a21caf`, animation 28s float (opacity 0.25)
- **Noise Overlay**: Procedural radial dot pattern `24px x 24px` grid, opacity `0.6`, pointer-events `none`.

---

## 3. Database Schema & Data Models

### 3.1 `Members` Sheet (Normalized 10 Columns)
| Col Index | Column Name | Data Type | Constraint | Example |
|---|---|---|---|---|
| A (Col 1) | Study ID | String | Primary Key, Atomic Unique (`SG-BIO-XXXX` or `SG-MATH-XXXX`) | `SG-BIO-0001` |
| B (Col 2) | Full Name | String | Required, 1-100 chars | `Achala Anuradha` |
| C (Col 3) | Email | String | Unique Key, Lowercase, 1:1 Google Account Binding | `alwisachalaanurada@gmail.com` |
| D (Col 4) | Gender | Enum String | "Male" \| "Female" \| "Other" | `Male` |
| E (Col 5) | Telegram Username | String | Starts with `@`, required | `@achala_a` |
| F (Col 6) | School | String | Required, from 306 Sri Lankan Schools dataset or custom | `Royal College, Colombo` |
| G (Col 7) | Stream | Enum String | "Biological Science" \| "Physical Science" | `Biological Science` |
| H (Col 8) | Optional Subject | Enum String | Bio: "Physics" \| "Agriculture"; Maths: "Chemistry" \| "ICT" | `Physics` |
| I (Col 9) | Registration Date | ISO 8601 String | Timestamp of creation | `2026-08-26T09:14:02.000Z` |
| J (Col 10) | Status | Enum String | "Active" \| "Inactive" | `Active` |

### 3.2 `DailyLogs` Sheet (Normalized 19 Columns)
| Col Index | Column Name | Data Type | Constraint / Description | Example |
|---|---|---|---|---|
| A (Col 1) | Timestamp | ISO 8601 String | Log submission timestamp | `2026-08-26T09:14:02.000Z` |
| B (Col 2) | Study ID | String | Foreign Key -> `Members.Study ID` | `SG-BIO-0001` |
| C (Col 3) | Email | String | Foreign Key -> `Members.Email` | `alwisachalaanurada@gmail.com` |
| D (Col 4) | Date of Study | String | Format `YYYY-MM-DD`, unique per student per day | `2026-08-26` |
| E (Col 5) | Subject 1 Name | String | Stream Subject 1 | `Biology` |
| F (Col 6) | Subject 1 Hours | Float | >= 0, e.g. 1.5 | `2.5` |
| G (Col 7) | Subject 1 Focus | Integer | 1 to 10 | `8` |
| H (Col 8) | Subject 1 Productivity | Integer | 1 to 10 | `7` |
| I (Col 9) | Subject 2 Name | String | Stream Subject 2 | `Chemistry` |
| J (Col 10) | Subject 2 Hours | Float | >= 0 | `1.5` |
| K (Col 11) | Subject 2 Focus | Integer | 1 to 10 | `9` |
| L (Col 12) | Subject 2 Productivity | Integer | 1 to 10 | `8` |
| M (Col 13) | Subject 3 Name | String | Stream Subject 3 (Elective) | `Physics` |
| N (Col 14) | Subject 3 Hours | Float | >= 0 | `1.0` |
| O (Col 15) | Subject 3 Focus | Integer | 1 to 10 | `6` |
| P (Col 16) | Subject 3 Productivity | Integer | 1 to 10 | `7` |
| Q (Col 17) | Notes | String | Optional daily reflections & notes | `Completed 15 MCQs on Genetics` |
| R (Col 18) | Telegram | String | Student telegram handle | `@achala_a` |
| S (Col 19) | Proof Photo URL | String | Google Drive public view URL | `https://drive.google.com/file/d/...` |

### 3.3 Streams & Subject Mapping
- **Biological Science (`Biological Science`)**:
  - Prefix: `SG-BIO-` (e.g. `SG-BIO-0001`)
  - Mandatory Subject 1: `Biology` (Icon: 🧬)
  - Mandatory Subject 2: `Chemistry` (Icon: ⚗️)
  - Elective Subject 3: `Physics` (Icon: ⚛️) OR `Agriculture` (Icon: 🌱)
- **Physical Science (`Physical Science`)**:
  - Prefix: `SG-MATH-` (e.g. `SG-MATH-0001`)
  - Mandatory Subject 1: `Combined Maths` (Icon: 📐)
  - Mandatory Subject 2: `Physics` (Icon: ⚛️)
  - Elective Subject 3: `Chemistry` (Icon: ⚗️) OR `ICT` (Icon: 💻)

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | Google Sign-In via Firebase Auth | Authenticates student or admin using Google OAuth popup / redirect | Google OAuth token / profile | `{ uid, email, displayName, photoURL }` | Shows toast error and opens direct email sign-in fallback | `ORIGINAL_REQUEST.md` § R4, `src/js/auth.js` |
| 2 | Auth | 1:1 Google Account Binding | Binds Google email to single immutable Study ID to prevent duplicate accounts | User email | Read-only input field, locked foreign key | Prevents modifying email in registration or profile edit | `ORIGINAL_REQUEST.md` § R4, `PROJECT.md` #4 |
| 3 | Routing | First-Time Login Routing | Automatically routes unregistered Google users to `#register` onboarding flow | Authenticated user email | Navigates to `#register` | Prompts user to complete profile | `PROJECT.md` #2, `src/js/auth.js` |
| 4 | Routing | Returning User Fast-Path | Automatically navigates registered users to `#dashboard` (or `#admin` if admin) | Authenticated user email | Navigates to `#dashboard` or `#admin` | Re-queries backend on failure | `PROJECT.md` #3, `src/js/auth.js` |
| 5 | Registration | 7-Field Multi-Step/Card Form | Collects Full Name, Email (locked), Gender, Telegram, School, Stream, Optional Subject | Form fields | Backend registration payload | Validates required fields, displays toast errors | `ORIGINAL_REQUEST.md` § R2, `src/js/views/registerView.js` |
| 6 | Registration | 306 Sri Lankan School Autocomplete | Searchable `Command` palette filtering 306 national/provincial schools across 9 provinces / 25 districts | School search query | Selected school string | Allows custom school name entry if not in dataset | `src/js/schools.js`, `ORIGINAL_REQUEST.md` § R2 |
| 7 | Registration | Dynamic Optional Subject Picker | Switches elective choices based on stream (Bio -> Physics/Ag; Maths -> Chem/ICT) | Selected stream | 2 selectable elective pills + 3-subject preview tag bar | Defaults to standard elective on stream change | `src/js/views/registerView.js`, `PROJECT.md` #6 |
| 8 | Backend | Concurrency-Safe Sequential Study ID Generator | Atomically calculates `SG-BIO-XXXX` or `SG-MATH-XXXX` using LockService | Stream name | Next 4-digit zero-padded Study ID | Lock timeout error if server busy (>30s) | `backend/Code.gs` lines 886-918 |
| 9 | Daily Form | Stream-Specific 3-Subject Rendering | Dynamically renders exactly the 3 subjects registered for the student's stream | Member stream & optional subject | 3 Subject cards | Never displays unrelated stream subjects | `src/js/views/dailyFormView.js`, `PROJECT.md` #12 |
| 10 | Daily Form | Decimal Hours Input & Quick Add | Decimal hours input (step 0.25) with `+30m`, `+1h`, `+2h`, and reset buttons | Numeric input / button clicks | Updated subject hours & aggregated total day hours | Enforces total hours > 0 before submission | `src/js/views/dailyFormView.js`, `PROJECT.md` #13 |
| 11 | Daily Form | Custom Focus Gradient Slider (1-10) | Interactive gradient slider with dynamic color shifts, qualitative tier pill, and floating tooltip | Pointer/touch drag, keyboard arrows (1-10) | Integer score (1-10), tier description, color token | Clamped between 1 and 10 | `src/js/slider.js`, `PROJECT.md` #14 |
| 12 | Daily Form | Custom Productivity Slider (1-10) | Interactive gradient slider with dynamic color shifts, qualitative tier pill, and floating tooltip | Pointer/touch drag, keyboard arrows (1-10) | Integer score (1-10), tier description, color token | Clamped between 1 and 10 | `src/js/slider.js`, `PROJECT.md` #15 |
| 13 | Daily Form | Photo Proof Canvas Compression | Client-side Canvas 2D image compression reducing camera photos to `<400KB` base64 JPEG | Image file (JPEG, PNG, WebP) | `{ base64, mimeType, fileName, compressedSize, previewUrl }` | Rejects non-image files, shows error toast | `src/js/utils.js`, `src/js/views/dailyFormView.js` |
| 14 | Daily Form | Drive Upload Hierarchy | Organizes photo proof into `StudySync_Uploads/{studyId}/{YYYY-MM-DD}/{filename}` with public link | Compressed base64 image | Google Drive public view URL | Fallback: saves log without photo if Drive fails | `backend/Code.gs` lines 920-970 |
| 15 | Daily Form | One-Submission-Per-Day Enforcement | Detects prior submission for chosen date and locks UI into Read-Only Summary Mode | `dateOfStudy`, `studyId` | Read-only summary view with lock banner & full details | Informs user duplicates are restricted to protect sheet | `src/js/views/dailyFormView.js`, `backend/Code.gs` |
| 16 | Daily Form | Future Date Blocking | Prevents logging study sessions for dates in the future | Selected date | Date validation check | Reverts to today's date and shows warning toast | `src/js/views/dailyFormView.js`, `tests/` |
| 17 | ID Card | Apple Wallet 3D Tilt Card | Dark metallic gradient card with gold EMV chip, contactless NFC waves, hologram watermark | Member profile object | Rendered HTML / Canvas ID pass | Graceful 2D fallback on flat screens | `src/js/idcard.js`, `ORIGINAL_REQUEST.md` § R2 |
| 18 | ID Card | Dual-Payload QR Generator | Generates Model 2 Byte-mode QR matrix encoding live URL + offline metadata | Member profile | Canvas QR matrix | Fallback to verification URL if payload oversized | `src/js/qr.js`, `PROJECT.md` #9 |
| 19 | ID Card | 3x High-Res PNG Download | Exports crisp 300 DPI ID card image (`1440x906px` at 3x scale) as downloadable PNG | Canvas 2D render | `StudySync_Digital_ID_{studyId}.png` file download | Handles missing DOM gracefully | `src/js/idcard.js`, `PROJECT.md` #10 |
| 20 | Dashboard | Personal Study Streak Tracker | Calculates active consecutive study days backward from today or yesterday, plus all-time max streak | Array of study logs | `{ currentStreak, longestStreak, studiedToday }` | Returns 0 if no logs or broken streak | `src/js/utils.js`, `PROJECT.md` #18 |
| 21 | Dashboard | Personal Metrics Rollup & Progress Bars | Computes total study hours, subject breakdown with progress bars, and average focus/productivity | Array of study logs | `{ totalHours, avgDailyHours, subjectTotals, avgFocus, avgProductivity }` | Handles empty history with default 0s | `src/js/utils.js`, `PROJECT.md` #19 |
| 22 | Dashboard | Today's Study Status Banner | Dynamic banner showing Emerald completed status (with hours) or Amber action needed status | Today's log status | Status banner with action CTAs | Updates live when log submitted | `src/js/views/dashboardView.js` |
| 23 | Dashboard | Past Study History Table | Interactive, searchable chronological table of study sessions with subject hours, ratings, notes | History logs, search query | Filtered study log table rows | "No history matching current filter" empty state | `src/js/views/dashboardView.js`, `PROJECT.md` #20 |
| 24 | Dashboard | Proof Photo Modal Preview | Full-resolution modal viewer for submitted study proof images and reflections | Click on photo thumbnail | Modal overlay with image and external Drive link | Handles broken / missing URLs with fallback SVG | `src/js/views/dashboardView.js` |
| 25 | Dashboard | Profile Edit Modal | Allows student to update Full Name, School, Stream, Elective, Telegram | Updated profile inputs | Backend `updateProfile` API call | Validates required fields, persists to state | `src/js/views/dashboardView.js`, `src/js/api.js` |
| 26 | Verify | Public Verification Route (`/verify`) | Public standalone page or route resolving member badge from `?id=` param or search box | `studyId` string | Member verification badge, school, stream, date, timestamp | Shows Rose "Record Not Found" state if ID invalid | `verify.html`, `src/js/views/verifyView.js` |
| 27 | Admin | Whitelist Security Gate | Restricts admin dashboard access to authorized admin email list | User email | Grants access or renders 403 Forbidden Screen | Blocks non-admin users and shows 403 screen | `src/js/views/adminView.js`, `backend/Code.gs` |
| 28 | Admin | Group Analytics KPIs | Summary metrics: Total Members, Active Ratio, Total Group Hours, Total Logs, Quality Averages | Admin dataset | 5 KPI metric cards | Displays 0s if database is uninitialized | `src/js/views/adminView.js`, `PROJECT.md` #24 |
| 29 | Admin | 7-Day Group Study Volume SVG Area Chart | Smooth SVG cubic Bezier area chart of aggregate daily study volume for past 7 days | Array of group logs | Responsive SVG area chart with points and Y-axis scale | Handles days with 0 hours gracefully | `src/js/views/adminView.js`, `ORIGINAL_REQUEST.md` § R2 |
| 30 | Admin | Stream & School Cohort Distribution | Visual comparison bar for Bio vs. Maths streams, plus top 5 participating schools progress bars | Members & logs | Progress bars with member counts and percentages | Calculates percentages based on total members | `src/js/views/adminView.js` |
| 31 | Admin | Top Streaks Ranked Leaderboard | Ranked leaderboard sorted primarily by streak descending, secondarily by total hours | Group members & logs | Ranked table with Gold (🥇), Silver (🥈), Bronze (🥉) | Displays rank numbers for positions 4+ | `src/js/views/adminView.js`, `backend/Code.gs` |
| 32 | Admin | Members DataTable with Search & Filters | Searchable, filterable directory of all members with Stream and Status dropdown filters | Search query, stream filter, status filter | Filtered members table with count badge | Shows empty state if no matches | `src/js/views/adminView.js`, `PROJECT.md` #22 |
| 33 | Admin | Inline Member Quick-Edit Dialog | Modal dialog allowing admin to edit Full Name, School, Stream, Elective, and Status | Edited member fields | Backend `adminUpdateMember` API call | Updates local state and notifies with Toast | `src/js/views/adminView.js` |
| 34 | Admin | Daily Logs Inspector with Photo Modal | Comprehensive searchable table of all group study logs with date filters and photo inspector | Log filters, search | Filtered daily logs table + modal inspector | Handles missing photos with fallback | `src/js/views/adminView.js`, `PROJECT.md` #23 |
| 35 | Admin | RFC 4180 CSV & Full JSON Export | One-click export of Members list, Daily Logs list, or Full Database JSON dump | Export button clicks | Downloadable `.csv` and `.json` files | Proper CSV escaping for quotes/commas | `src/js/utils.js`, `src/js/views/adminView.js` |
| 36 | Global | Toast Notification System | Non-intrusive animated toasts with type borders and progress bar (zero `alert()` calls) | `{ message, type, title, duration }` | Rendered toast notification stack | Queues toasts gracefully, auto-dismisses | `src/js/toast.js`, `PROJECT.md` #26 |
| 37 | Global | Responsive Navigation Header | Sticky glassmorphism header with active link highlighting, live streak pill, and user profile pill | AppState (`user`, `member`, `route`) | Dynamic navigation bar with mobile support | Collapses cleanly on small viewports (375px) | `index.html`, `src/js/app.js` |

---

## 5. Detailed Feature Specifications

### 5.1 Landing Page
- **Route**: `/` (or `#landing`)
- **Visual Components**:
  - Hero Section: Aurora orbs mesh background, procedural grain noise overlay, category pill badge.
  - Heading: "Elevate Your A/L Journey with Precision Tracking." (Gradient accent text).
  - Primary CTA: shadcn `Button` "Continue with Google" with official Google icon.
  - Secondary CTA: "Register Account" button and "Verify ID" secondary outline button.
  - Feature Pills Grid: 1:1 Account ID, Stream-Specific, Drive Photo Proof.
  - Interactive Canvas: Apple Wallet ID Card live preview with glow halo.
  - Bento Grid (3 Cards): Stream-Specific Subjects, Apple Wallet Digital ID, Streaks & Group Leaderboard.
- **Interactions**:
  - Clicking "Continue with Google" triggers `AuthService.signIn()`.
  - Clicking "Verify ID" navigates to `/verify`.
- **Validation**:
  - If authenticated user lands here and is already registered, provides direct jump to Dashboard.
- **Acceptance Criteria**:
  - [x] Zero layout shift on initial load.
  - [x] All buttons meet accessibility focus states and contrast ratios.

### 5.2 Registration Flow
- **Route**: `/register` (or `#register`)
- **Access Guard**: Requires authenticated Google user. If unregistered, automatically redirected here. If already registered, redirected to `/dashboard`.
- **Form Structure (7 Fields)**:
  1. `email` (Locked / Read-Only): Google account email with lock icon and "Authenticated" badge.
  2. `fullName` (Text Input, required): Student's real name.
  3. `gender` (Select Dropdown, required): "Male", "Female", "Other".
  4. `telegram` (Text Input with `@` prefix, required): e.g. `@student_handle`.
  5. `school` (Searchable `Command` Autocomplete, required): Searchable against 306 Sri Lankan schools list with district and province tags.
  6. `stream` (Radio Card Group, required): "Biological Science" (🧬) vs. "Physical Science" (📐).
  7. `optionalSubject` (Dynamic Radio Card Group, required):
     - Bio Stream choices: "Physics" OR "Agriculture".
     - Maths Stream choices: "Chemistry" OR "ICT".
- **Dynamic 3-Subject Preview Tag Bar**:
  - Bio: `1. Biology`, `2. Chemistry`, `3. [Physics | Agriculture] (Optional)`
  - Maths: `1. Combined Maths`, `2. Physics`, `3. [Chemistry | ICT] (Optional)`
- **Submission Action**:
  - Calls `ApiClient.registerUser(payload)`.
  - Backend uses `LockService.getScriptLock()` to atomically allocate sequential ID (`SG-BIO-XXXX` or `SG-MATH-XXXX`).
  - Sets `AppState.member` and navigates to `/dashboard`.
- **Error States**:
  - Missing required fields: highlighted with red border and toast error.
  - Duplicate email: rejected with "already registered" response and redirected to Dashboard.
  - Lock timeout: informative toast "Server busy, please retry in a few moments."

### 5.3 Student Dashboard
- **Route**: `/dashboard` (or `#dashboard`)
- **Access Guard**: Requires authenticated & registered user. Non-registered users redirected to `/register`. Unauthenticated users redirected to `/`.
- **Sections**:
  1. **Header & Greeting**: Personal welcome message with student first name, stream badge, study ID, "Sync Data" button, "Log Today's Study" CTA.
  2. **Member Profile Card** (Left 5 cols):
     - Study ID with 1-click copy button.
     - Full Name, Google Email, School, Stream & Elective, Telegram, Registration Date, Active Status badge with pulsing emerald dot.
     - "Edit Profile" button opening inline edit Dialog.
  3. **Apple Wallet Digital ID Pass Card** (Right 7 cols):
     - Interactive 3D tilt card with gold chip, hologram watermark, and embedded high-contrast QR code.
     - "Public Verification URL" link button (`/verify?id=...`).
     - "Download Digital ID (3x PNG)" button exporting `1440x906px` 300 DPI PNG file.
  4. **Today's Study Status Banner**:
     - Completed: Emerald card with total hours logged, "Streak Safe", "View Today's Log" CTA.
     - Pending: Amber card with "Today's Study Session Pending", "Log Today's Hours" CTA.
  5. **Personal Stats Bento Grid (4 Cards)**:
     - Card 1: Study Streak: Current streak (🔥) + Longest streak.
     - Card 2: Total Study Hours: Total hours + Daily average.
     - Card 3: Stream 3-Subject Breakdown: Per-subject hours with proportional gradient progress bars.
     - Card 4: Quality Ratings: Avg Focus (1-10) and Avg Productivity (1-10) with score tier pills.
  6. **Past Study History Table**:
     - Search input (by date, subject, or notes).
     - Table columns: Date, Total Hours, 3 Subject badges, Focus rating, Productivity rating, Notes snippet, Photo proof thumbnail.
     - Clicking photo proof opens full-resolution modal preview with Drive link.

### 5.4 Stream-Aware Daily Study Form
- **Route**: `/daily` (or `#daily`)
- **Access Guard**: Requires authenticated & registered member.
- **Core Logic**:
  - Date Selector: Defaults to today (`YYYY-MM-DD`). Allows selecting past dates. Blocks future dates.
  - Submission Status Detection:
    - If log exists for selected date -> Enters **Read-Only Summary Mode**.
    - If no log exists -> Enters **Editable Logging Mode**.
- **Editable Form Fields**:
  - Student Identity Bar (Study ID, Full Name, Email - all read-only).
  - Live Total Hours Banner (aggregates hours across 3 subjects in real-time).
  - Strictly 3 Stream-Specific Subject Cards (e.g. Bio, Chem, Phys):
    - Subject Decimal Hours `Input` (step 0.25, min 0, max 24).
    - Quick increment buttons: `+30m`, `+1h`, `+2h`, and `Clear (0h)`.
    - Custom Dual Gradient Sliders:
      - Focus Level (1-10): Drag handle, live numeric score, dynamic color shifting, qualitative badge (Distracted -> Steady -> High -> Deep Flow State 🔥).
      - Productivity Level (1-10): Drag handle, live score, dynamic color shifting, qualitative badge.
  - Telegram Handle `Input` (pre-filled, editable, ensures `@` prefix).
  - Daily Reflections & Notes `Textarea` (optional).
  - Photo Proof Dropzone:
    - File picker / drag-and-drop for handwritten notes or past paper proof.
    - Automatic client-side Canvas 2D compression to `<400KB` base64.
    - Shows original vs. compressed size (e.g. `Orig: 2.4 MB -> Comp: 280 KB`).
    - Thumbnail preview with "Remove" action button.
- **Read-Only Summary Mode**:
  - Emerald banner: "Daily Log Completed & Verified (One-submission-per-day lock active)".
  - Displays per-subject hours, qualitative focus & productivity pills, submitted notes, and photo proof image.
  - "Back to Dashboard" and "View Full History" buttons.

### 5.5 Apple Wallet Digital ID Card Engine
- **Canvas Specifications**:
  - Aspect Ratio: `1.589` (Standard ISO/IEC 7810 ID-1 card proportions)
  - Interactive Preview Dimensions: `480px x 302px`
  - High-Resolution 3x Export Dimensions: `1440px x 906px` (300 DPI)
- **Visual Design Layers**:
  1. Rounded clipping boundary (`cornerRadius = 24 * scale`).
  2. Multi-stop metallic dark background gradient:
     - Bio Stream: Emerald/Cyan metallic base (`#060B11` -> `#0B192C` -> `#062024` -> `#050B10`).
     - Maths Stream: Indigo/Purple metallic base (`#07090E` -> `#0F172A` -> `#1E1B4B` -> `#0B0F19`).
  3. Security guilloche / fine watermark pattern and dot grid.
  4. Header: StudySync logo, "SRI LANKA A/L" badge, "OFFICIAL DIGITAL PASS" header.
  5. Top-Right Active Status Badge Pill (`ACTIVE MEMBER` with emerald dot).
  6. Gold EMV Smart Chip graphic (`44x34px * scale`) with metallic bevel and contactless NFC wave arcs.
  7. Student Information (Inter font, hierarchy of weights):
     - Member Full Name (Bold, 17px base)
     - Unique Study ID (Cyan bold mono, 14px base)
     - School / College (Medium, 11px base)
     - A/L Stream & Elective (Semi-bold, 11px base)
     - Registration Date (Mono, 10px base)
  8. Embedded Dual-Payload QR Code Box (`74x74px * scale`):
     - White high-contrast box with rounded corners and fine border.
     - QR Matrix encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`.
  9. Bottom Security Microtext Ribbon: `AUTHENTICATED STUDY MEMBER • SECURE DIGITAL PASS • G.C.E. ADVANCED LEVEL`.
  10. Gloss bevel border and subtle inner shadow.

### 5.6 Protected Admin Dashboard
- **Route**: `/admin` (or `#admin`)
- **Access Guard**:
  - Verified against whitelist: `alwisachalaanurada@gmail.com`, `admin@studysync.lk`, `lead.organizer@gmail.com`, `studysync.admin@gmail.com`, or `member.role === 'admin'`.
  - Non-whitelisted users see styled 403 Forbidden Screen with "Return to Dashboard" button.
- **Admin Tabs**:
  1. **Tab 1: Group Analytics & Leaderboard**:
     - 5 KPI Metric Cards: Total Members, Active Member Ratio, Total Study Time, Total Daily Logs, Group Averages (Focus & Productivity).
     - Stream Distribution Breakdown with visual proportion bar and percentages.
     - 7-Day Group Study Volume SVG Area Chart (Smooth Bezier curve, gridlines, max Y-axis label, interactive data points).
     - Top 5 Participating Schools Distribution with proportional gradient progress bars.
     - Top Streaks Leaderboard: Ranked by streak descending (tie-breaker by total hours), Gold (🥇), Silver (🥈), Bronze (🥉) badges, student name, school, study ID, stream, streak days, total hours, quality scores.
  2. **Tab 2: Members Directory**:
     - Search input (Name, ID, Email, School, Telegram).
     - Stream Filter (`Select`: All, Bio, Maths).
     - Status Filter (`Select`: All, Active, Inactive).
     - Table columns: Study ID, Full Name, Email, Stream & Elective, School, Telegram, Registered Date, Status Badge, "Edit" action button.
     - Inline Edit Member Dialog: Form to update Name, School, Stream, Elective, Status (Active/Inactive) with direct live write to Google Sheet.
     - Export RFC 4180 CSV button.
     - Export Full JSON Database dump button.
  3. **Tab 3: Daily Logs Inspector**:
     - Search input (ID, Name, Notes).
     - Date Range filters (`From` date and `To` date).
     - Stream filter (`Select`) and Student filter (`Select`).
     - Table columns: Timestamp, Study ID, Student Name, Date of Study, 3 Subject hours & ratings, Total Hours, Notes snippet, Proof Photo thumbnail.
     - Clicking proof photo opens Admin Proof Inspector modal with full-size image, student reflections, and external Drive link.
     - Export RFC 4180 CSV button for filtered logs.

### 5.7 Public Member Verification Page
- **Routes**: `/verify`, `/verify?id=STUDY_ID`, `#verify/:id`, and standalone `verify.html?id=STUDY_ID`.
- **Functionality**:
  - Manual Study ID lookup input box (`SG-BIO-XXXX` or `SG-MATH-XXXX`).
  - Auto-executes verification lookup if `id` parameter is in URL.
  - Queries `ApiClient.verifyMember(studyId)`.
- **Result States**:
  - Loading: Centered spinner with status text.
  - Success (Valid Member):
    - Emerald Verified Member header banner.
    - Member Full Name, Unique Study ID, Active Membership Status badge with pulsing dot, School / College, A/L Subject Stream, Registration & Issue Date.
    - Anti-counterfeit live UTC verification timestamp and "Cryptographically Authenticated" security stamp.
  - Error (Invalid / Not Found):
    - Rose badge with "Member Record Not Found" and clear message.
  - Return Link: "Return to StudySync Main App".

---

## 6. Edge Cases & Boundary Conditions Matrix

| # | Feature / Area | Input / Condition | Authoritative Expected Behavior |
|---|---|---|---|
| 1 | Auth | Email with uppercase / whitespace (`  Student.Bio@GMAIL.COM  `) | Normalized to trimmed lowercase (`student.bio@gmail.com`) before lookup/registration |
| 2 | Auth | Session reload / page refresh | Eager Firebase Auth listener restores session silently without blocking UI |
| 3 | Auth | Popups blocked on mobile browser | Attempts redirect or renders direct email sign-in fallback dialog |
| 4 | Registration | Attempt to edit Google Email field | Field is `readonly`, `tabindex="-1"`, and locked to prevent email spoofing |
| 5 | Registration | Empty mandatory field (Name, School, Telegram) | Submissions blocked client-side; focused field flagged with error toast |
| 6 | Registration | Telegram handle without `@` prefix (`username`) | Automatically formatted to `@username` |
| 7 | Registration | Multiple simultaneous registrations | Backend `LockService.getScriptLock(30000)` prevents race condition / duplicate IDs |
| 8 | Registration | School name not in 306-school autocomplete list | User can enter custom school name; accepted and saved cleanly |
| 9 | Registration | Stream toggled from Bio to Maths | Optional subject choices immediately switch from Physics/Ag to Chemistry/ICT |
| 10 | Daily Form | Logging study hours for tomorrow / future date | Blocked client-side and server-side; reverts to today with warning toast |
| 11 | Daily Form | Submitting 0 hours across all 3 subjects | Validation error: requires study hours > 0 on at least one subject |
| 12 | Daily Form | Decimal hours input with comma / invalid char (`1,5` or `abc`) | Parsed via `parseFloat()`, sanitized to numeric float |
| 13 | Daily Form | Extreme study hours entered (`25.0` hrs) | Clamped to max 24.0 hours per subject / day |
| 14 | Daily Form | Duplicate log submission for same date | Returns `isDuplicate: true`, switches UI to Read-Only mode without overwriting |
| 15 | Daily Form | Large photo proof upload (`12MB` high-res photo) | Client-side Canvas compresses to `<400KB` base64 before network transmission |
| 16 | Daily Form | Non-image file selected in dropzone (`notes.pdf`) | Rejected immediately with "Please select a valid image file" warning toast |
| 17 | Daily Form | Photo upload failure (Drive outage) | Log entry created successfully with empty photo URL; student not blocked |
| 18 | Daily Form | Focus / Productivity slider dragged outside bounds | Clamped strictly to integer range [1, 10] |
| 19 | Streak Math | Studied today | Streak is active; counts consecutive days backward including today |
| 20 | Streak Math | Did not study today, but studied yesterday | Streak is active; counts consecutive days backward from yesterday |
| 21 | Streak Math | Did not study today or yesterday (2+ day gap) | Current streak resets to 0; Longest streak preserved |
| 22 | Streak Math | Multiple logs for single student (past multi-day history) | Unique dates extracted and sorted chronologically for accurate streak calculation |
| 23 | ID Card | Long member name (`Don Stephen Senanayake Karunaratne`) | Text truncated or auto-scaled to prevent card overflow |
| 24 | ID Card | Canvas export in SSR / headless environment | Checks for `document` and canvas support; throws descriptive error if unavailable |
| 25 | ID Card | Scan QR code with mobile camera | Opens `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID` directly |
| 26 | Admin Gate | Non-admin email accesses `/admin` | Displays 403 Forbidden Screen; admin API calls rejected with 403 error |
| 27 | Admin Gate | Whitelisted admin email (`alwisachalaanurada@gmail.com`) | Loads full Admin Directorate console (Analytics, Members, Daily Logs) |
| 28 | Admin Table | Search query with special regex characters (`[test]`, `*`, `?`) | Sanitized before string matching; avoids regex crash |
| 29 | Admin Export | Exporting CSV with quotes and commas in notes (`"Studied Bio, Chem"`) | Escaped per RFC 4180 (`"""Studied Bio, Chem"""`) |
| 30 | Verify | Study ID with lowercase letters (`sg-bio-0001`) | Normalized to uppercase (`SG-BIO-0001`) before query |
| 31 | Verify | Non-existent Study ID (`SG-BIO-9999`) | Displays clear "Record Not Found" state with lookup retry box |

---

## 7. Next.js 14 App Router Component Mapping

| Next.js Route / Component | Target Path | shadcn / UI Primitives | Associated Legacy Source |
|---|---|---|---|
| Root Layout | `src/app/layout.tsx` | Next Script (Firebase compat SDK v10), ThemeProvider, Sonner `Toaster` | `index.html` lines 1-197 |
| Global Styling & Aurora | `src/app/globals.css` | Tailwind CSS v4, Aurora mesh keyframes, Glassmorphism classes | `src/css/custom.css` lines 1-566 |
| Landing Page | `src/app/page.tsx` | `Button`, `Card`, `Badge`, Canvas preview | `src/js/views/landingView.js` |
| Registration View | `src/app/register/page.tsx` | `Card`, `Input`, `Select`, `Command` (Schools), `RadioGroup`, `Button` | `src/js/views/registerView.js` |
| Student Dashboard | `src/app/dashboard/page.tsx` | `Card`, `Table`, `Progress`, `Badge`, `Button`, `Dialog` (Edit Profile) | `src/js/views/dashboardView.js` |
| Daily Study Form | `src/app/daily/page.tsx` | `Card`, `Input`, `Slider` / custom dual slider, `Textarea`, `Button` | `src/js/views/dailyFormView.js` |
| Digital ID Pass Component | `src/components/id-card.tsx` | Canvas 2D, Framer Motion 3D tilt, Lucide icons | `src/js/idcard.js`, `src/js/qr.js` |
| Admin Dashboard | `src/app/admin/page.tsx` | `Tabs`, `Table` / `DataTable`, `Dialog`, `Progress`, `Badge`, SVG Chart | `src/js/views/adminView.js` |
| Public Verify Route | `src/app/verify/page.tsx` | `Card`, `Input`, `Badge`, `Button` | `src/js/views/verifyView.js`, `verify.html` |
| Legacy HTML Verify | `public/verify.html` | Standalone HTML/JS for existing QR code compatibility | `verify.html` lines 1-285 |
| Navigation Header | `src/components/header.tsx` | `NavigationMenu`, `Button`, `Badge`, Avatar | `index.html` lines 88-148 |
| Auth Context & Hook | `src/context/auth-context.tsx` | React Context, custom `useAuth()` hook | `src/js/auth.js`, `src/js/state.js` |
| API Client Module | `src/lib/api.ts` | Unified `ApiClient`, TypeScript interfaces, POST text/plain pattern | `src/js/api.js` lines 1-242 |
| Schools Dataset | `src/lib/schools.ts` | 306 Sri Lankan schools typed array & search helper | `src/js/schools.js` lines 1-598 |
| Utilities Module | `src/lib/utils.ts` | Streak math, date formatting, Canvas image compression, CSV generator | `src/js/utils.js` lines 1-536 |

---

## 8. Verification & Acceptance Sign-off Matrix

- [x] **R1 Static Export**: `next.config.mjs` configured with `output: 'export'`, `firebase.json` points `public` to `out`.
- [x] **R2 Page Rebuild**: All 8 core feature areas (Landing, Register, Dashboard, Daily Form, ID Card, Admin, Verify, Header/Toasts) fully specified.
- [x] **R3 Design System**: Dark zinc/slate palette, Indigo/Emerald/Amber/Rose accents, Inter typography, 0.75rem radius, subtle glassmorphism.
- [x] **R4 Auth & State**: Firebase Google Sign-In with 1:1 email binding, React Context, persistent state, route guards.
- [x] **R5 Live Backend**: Identical POST text/plain pattern to Google Apps Script endpoint (`Code.gs`), zero fake/hardcoded student data.
