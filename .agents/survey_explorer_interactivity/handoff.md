# Comprehensive Interactivity Audit & Architectural Handoff Report

**Agent**: `survey_explorer_interactivity`  
**Milestone**: Interactivity, Modal, Form, Tab Audit & R5 Architecture  
**Authoritative Reference**: `.agents/ORIGINAL_REQUEST.md` (Section `## 2026-09-12T14:34:51Z`)  
**Timestamp**: 2026-09-12T20:15:00Z  

---

## 1. Observation

### 1.1 Page-by-Page Exhaustive Interactivity Inventory

#### Page 1: Admin Dashboard (`/admin` — `src/app/admin/page.tsx`, 3139 lines; `FormBuilderModal.tsx`, 505 lines)
*   **Header Action Bar**:
    *   *Add Student Button* (`line 1860`): Triggers `setIsAddMemberModalOpen(true)`. Opens student registration modal with manual Study ID, full name, email, stream, school, and exam year fields.
    *   *Broadcast Daily Digest Button* (`line 1872`): Triggers `handleBroadcastDigest()`. Calls `api.broadcastDailyDigest()`, generates Sri Lankan community study telemetry, copies Markdown digest to clipboard, and displays preview modal.
    *   *Live Forms & Surveys Button* (`line 1888`): Triggers `setIsFormBuilderModalOpen(true)`. Opens `FormBuilderModal` allowing administrators to create academic surveys, set target streams, and auto-dispatch forms into student inboxes.
    *   *Live Sync Button* (`line 1902`): Triggers `fetchData(true)`. Flushes `sessionStorage` cache via `api.clearCache()` and performs fresh network query against Google Apps Script backend.
    *   *Export Data Dropdown* (`lines 1915–1955`): Triggers `handleExport(format)` supporting 4 export pipelines: CSV (with formula injection sanitization), JSON, Excel `.xlsx`, and SQL `INSERT` statements.
    *   *Live Google Sheet Link* (`line 1968`): Executes `window.open(GOOGLE_SHEET_URL, '_blank')`.
*   **Tab Navigation (`activeTab` state)**:
    *   *Tab 1: Analytics & KPIs (`analytics`)*:
        *   Renders 4 KPI telemetry cards (Total Registered, Total Hours Logged, Today's Submissions, Active Study Streaks).
        *   7-Day Volume Chart (`lines 245–270`): Aggregates daily study hours over the previous 7 days using `String(logDate).startsWith(dateStr)`.
        *   School Distribution Table: Renders top schools ranked by student enrollment and logged study hours.
        *   Leaderboard Preview: Renders top 10 national study streaks.
    *   *Tab 2: Verification Inbox (`verification`)*:
        *   Status filter dropdown (`all`, `Pending`, `Verified`, `Suspended`).
        *   Batch Approve Button (`line 2185`): Iterates selected student checkboxes and executes `api.adminVerifyMember()` sequentially with Sonner toast feedback.
        *   Row-level Verify Button: Updates individual student status to `Verified` and commits to column 10 of Google Sheet.
        *   Row-level Suspend Button: Triggers `api.adminBanMember()`, locking student daily submission privileges.
    *   *Tab 3: Members Directory (`members`)*:
        *   Live search input filtering by Name, Study ID, or School.
        *   Stream and Status filter dropdowns.
        *   Bulk Inactive / Active triggers.
        *   Row-level Edit Button: Opens `EditMemberModal` with full student metadata.
        *   Row-level Password Generation & Reset Button (`line 2410`): Generates cryptographically secure 12-character passwords and computes client-side SHA-256 hash using `src/lib/security/passwords.ts`.
        *   Row-level Delete Button: Opens `DeleteMemberModal` and triggers optimistic local deletion plus background remote sync.
    *   *Tab 4: Daily Logs Inspector (`logs`)*:
        *   Search filter by Study ID or student email.
        *   Proof Photo Viewer Button: Opens `PhotoProofModal` displaying Drive/local proof images.
        *   Edit Hours Button: Opens `EditLogModal` allowing granular correction of Subject 1, 2, 3 hours, total hours, and teacher notes.
        *   Delete Log Button: Opens `DeleteLogModal` and executes `api.adminDeleteLog()`.
    *   *Tab 5: Powers & Live Rooms (`powers`)*:
        *   Live Study Room Generator (`lines 2800–2890`): Generates Google Meet or Zoom room with 1-click WhatsApp and Telegram invite link formatting.
        *   Admin RBAC Manager: Whitelists new administrator email addresses via `api.adminAddAdmin()`.
        *   A/L Exam Countdown Target Sync (`lines 2950–3020`): Datetime inputs for years 2026, 2027, 2028, 2029 syncing countdown dates to `PropertiesService` on Google Apps Script.

#### Page 2: Student Dashboard (`/dashboard` — `src/app/dashboard/page.tsx`, 1039 lines)
*   **Top Profile Bar**:
    *   *Edit Profile Button* (`line 440`): Opens `EditProfileModal` syncing updates to Google Sheets Members tab via `api.updateProfile()`.
    *   *Academic Report Modal Button* (`line 455`): Opens `AcademicReportModal` generating printable A4 summary and CSV transcript.
    *   *Digital ID Card Navigation* (`line 470`): Navigates directly to `/id-card`.
    *   *Copy Study ID Button* (`line 482`): Copies student ID to clipboard with tactile Sonner feedback.
    *   *Exam Countdown Banner* (`line 495`): Real-time countdown widget calculating days, hours, minutes, and seconds remaining until exam morning.
*   **Gamification Shelf (`line 520`)**:
    *   Collapsible shelf toggling `GamificationShelf` component with badges (Consistency King, Century Club, Early Bird), streak progress, and milestone trackers.
*   **Core Telemetry Cards**:
    *   Current Streak card with flame indicator, Total Hours Logged card, Average Focus Quality card (1–10), Today's Study Status pill (`Logged` vs `Pending`).
*   **Interactive Visualizations**:
    *   `StudyTrendChart`: 14-day stacked area / bar visualization displaying subject-by-subject volume.
    *   `SubjectBalanceCard`: Radial chart contrasting actual logged study hours against recommended Sri Lankan A/L subject proportions.
*   **Study History Table**:
    *   Subject filter dropdown, expandable table rows displaying individual session intervals, `SessionBadges`, drawer trigger for `SessionDetailDrawer`, and image proof trigger for `PhotoProofModal`.

#### Page 3: Daily Study Logger (`/daily` — `src/app/daily/page.tsx`, 1227 lines)
*   **Mode Switcher** (`line 385`):
    *   Toggle buttons between `sessions` mode (granular time blocks) and `direct` mode (direct subject hours entry).
*   **Dynamic Session Builder (`sessions` mode)**:
    *   *Add Session Button* (`line 420`): Adds session block with unique ID.
    *   *Subject Dropdown*: Populated dynamically based on student stream and chosen electives.
    *   *Quick Delta Pills* (`line 465`): `+15m`, `+30m`, `+1h` buttons incrementing session duration.
    *   *Time Calculation*: Auto-calculates start/end times based on entered duration.
    *   *Delete Session Button*: Removes session and automatically recalculates total day hours.
*   **Direct Mode Inputs**:
    *   3 subject numeric inputs with step controls for Subject 1, Subject 2, and Subject 3.
*   **Calculation Engine & Manual Override**:
    *   Auto-summing calculation engine computes exact total hours.
    *   Manual override toggle switch allows direct entry of total hours if sessions include unlisted study activities.
*   **Qualitative Telemetry**:
    *   `DualSlider` component with qualitative step labels for Focus Level (1–10) and Productivity Level (1–10).
*   **Photo Proof Upload Zone (`lines 680–740`)**:
    *   Drag-and-drop zone and file picker with client-side Canvas compression (max dimension 1200px, 0.8 JPEG quality).
    *   Validates file type (`image/*`) and payload size (< 5MB).
    *   Renders preview thumbnail with remove button.
*   **Submission Engine (`lines 790–850`)**:
    *   Enforces duplicate protection (one log per calendar date).
    *   Dispatches payload to `api.submitDailyLog()`.
    *   Falls back to `api.savePendingLogOffline()` and local queue if network is disconnected.

#### Page 4: Interactive Study Calendar (`/calendar` — `src/app/calendar/page.tsx`, 1006 lines; `GoogleStudyCalendar.tsx`)
*   **View Navigation**:
    *   Tab switcher between `Month`, `Week`, and `Day` views.
    *   "Today" jump button and previous/next interval arrows.
*   **Interactive Drag-and-Drop**:
    *   HTML5 / pointer drag-and-drop handles allowing students to reschedule study blocks across calendar slots.
*   **AI Schedule Generator**:
    *   "Generate AI Schedule" modal button distributing 35 weekly study hours across 3 subjects based on weak subject weightings.
*   **Add Study Block Modal**:
    *   Inputs for Subject, Topic, Start Time, End Time, and automatic virtual study room link generation (Jitsi Meet / Google Meet).
*   **Exam Countdown Wallpaper Generator**:
    *   Renders custom 300 DPI wallpaper on HTML5 Canvas with student's name, exam year, and countdown days, offering instant PNG download.
*   **RFC 5545 `.ics` Export & Import**:
    *   1-click download of `.ics` calendar file compatible with Google Calendar, Apple Calendar, and Outlook.

#### Page 5: Test Marks & AI Advisor (`/tests` — `src/app/tests/page.tsx`, 307 lines; `TestAnalyticsTrends.tsx`, `StudyAdvisorCard.tsx`, `CognitiveAdvisorCard.tsx`)
*   **Empirical Bayes Z-Score Headline**:
    *   Displays normalized Z-score trajectory, EMA momentum, and study efficiency ROI.
*   **Add Test Mark Button & Modal**:
    *   Form fields: Exam Type (Model Paper, Term Test, Provincial Paper), Subject, Paper Title, Score (0–100), Rank, Difficulty Rating (1–5), and Notes.
    *   Calls `api.logTestMark()`.
*   **Test Marks Table**:
    *   Sortable columns and row-level delete button calling `api.deleteTestMark()`.
*   **AI Advisor Cards**:
    *   `StudyAdvisorCard`: Algorithmic study recommendations based on recent subject time balance.
    *   `CognitiveAdvisorCard`: Cognitive load warnings and subject fatigue diagnostics.

#### Page 6: Digital ID Card (`/id-card` — `src/app/id-card/page.tsx`, `AppleWalletCard.tsx`, `idcard.ts`, `qr.ts`)
*   **Interactive 3D Tilt**:
    *   Card responds to mouse move and mobile touch coordinates with specular reflection highlight.
*   **Verification Gate**:
    *   Checks student status; unapproved or pending students see a warning shield with export buttons disabled.
*   **Client-Side QR Code Engine (`qr.ts`)**:
    *   Renders ISO/IEC 18004 QR code matrix encoding direct URL to `https://studysync-al-2026.web.app/verify?id={STUDY_ID}`.
*   **300 DPI Export**:
    *   Canvas export producing 1440x906 PNG with high-contrast text and Sri Lankan state emblem watermark.

#### Page 7: Registration (`/register` — `src/app/register/page.tsx`, 617 lines)
*   **Auth Selector**:
    *   Tabs for Google OAuth, Study ID/Password, and WebAuthn Biometrics.
*   **School Selector**:
    *   Typeahead search querying 306 Sri Lankan schools from `src/lib/schools.ts`, with custom school manual entry toggle.
*   **Stream & Elective Dropdowns**:
    *   Switching between Biological Science and Physical Science dynamically updates optional subject choices.
*   **Exam Year & Contact Fields**:
    *   Year selector pills (2026–2029), Gender dropdown, Telegram handle input.
*   **Submission**:
    *   Dispatches to `api.registerUser()`, updates `AuthContext`, and routes to `/dashboard`.

#### Page 8: Public Verification (`/verify` — `src/app/verify/page.tsx`, 333 lines)
*   **URL Query Parameter Handling**:
    *   Automatically parses `?id=` parameter on mount.
*   **Manual Search Input**:
    *   Search input supporting manual Study ID verification.
*   **Status Presentation**:
    *   Renders Verified (green), Pending (amber), or Suspended (red) badges with student school, stream, and exam year.
*   **Anti-Counterfeit Telemetry**:
    *   Displays query UTC timestamp and verification authenticity hash.

#### Page 9: Home Landing (`/` — `src/app/page.tsx`, 387 lines)
*   **Sign-In Controls**:
    *   Google Sign-In button, direct email modal trigger, and password authentication modal trigger.
*   **Biometric AppLock Modal**:
    *   Fingerprint / Face authentication modal leveraging WebAuthn credentials.
*   **Live Community Pulse**:
    *   Real-time stats counter with exam year filter.
*   **Stream Feature Cards**:
    *   Exploratory feature cards with "Get Started" links navigating to `/register`.

---

### 1.2 Backend & API Integration Parity Inspection

*   **API Client Engine (`src/lib/api.ts`, 941 lines)**:
    *   Contains 25 dedicated endpoint methods.
    *   Uses strict HTTP POST `Content-Type: text/plain;charset=utf-8` to bypass Google Apps Script CORS preflight restrictions while supporting 302 redirect responses.
    *   Session cache with SWR strategy: 45-second fresh cache, 5-minute background refresh.
    *   Offline queue using `localStorage` (`STUDYSYNC_OFFLINE_LOGS`) for daily logs created without internet connectivity.
    *   Full fallback integration with `localDb` (`src/lib/storage/localDb.ts`).
*   **Mock Server (`server/mock-server.js`, 1935 lines)**:
    *   Implements exact 1:1 action matching with `Code.gs`.
    *   Provides file-backed JSON database in `server/mock_db/` (`members.json`, `daily_logs.json`, `test_marks.json`, `forms.json`, `form_responses.json`, `inboxes.json`).
    *   Simulates Google Drive file hierarchy in `server/mock_uploads/{studyId}/{dateOfStudy}/` served via express static route `/uploads`.
    *   Enforces ±300s timestamp drift validation and idempotency caching.
*   **Google Apps Script Controller (`backend/Code.gs`, 3139 lines)**:
    *   Employs `LockService.getScriptLock()` with 30-second timeout on all mutation endpoints.
    *   Hierarchical Google Drive storage in `StudySync_Uploads/{studyId}/{dateOfStudy}/`.
    *   Formula injection sanitization via `sanitizeCsvFormula` preventing spreadsheet command execution (CWE-1236).
*   **Authentication Context (`src/context/AuthContext.tsx`, 357 lines)**:
    *   Coordinates Firebase Auth session restoration, Google popup sign-in, direct email sign-in, and password authentication.
    *   Synchronizes profile automatically via `api.checkUser()`.

---

### 1.3 Requirement R5 Stitch MCP Assets Inspection

*   **Stitch Project**: `5007748334507611824`
*   **Screen Inspected**: `0a05c09e082045c397a1a74b4a264d44` ("Subject Hub & Subtopics Architecture")
*   **UI Elements Discovered**:
    *   *Design Tokens*: Plus Jakarta Sans (headlines and badges) combined with Newsreader (editorial serif typography for academic derivations and proofs).
    *   *Syllabus Matrix*: Detailed unit tracking showing chapter weightages, mastery state badges (Not Started, In Progress, Mastered), and subtopic breakdowns.
    *   *Derivation Proof Viewer*: Step-by-step mathematical proof rendering modal.
    *   *Resource Attachment Links*: Direct PDF download and preview triggers linked to specific curriculum units.
    *   *Focus Block Triggers*: Direct buttons enabling a student to launch a 45-minute timed study session on a selected subtopic.

---

## 2. Logic Chain

1.  **Date Aggregation Vulnerability in Admin 7-Day Volume Chart**:
    *   *Observation*: In `src/app/admin/page.tsx:258`, log grouping uses `String(logDate).startsWith(dateStr)`.
    *   *Analysis*: Date values in `daily_logs.json` and Google Sheets can be formatted as `YYYY-MM-DD`, ISO timestamps (`2026-09-12T14:30:00Z`), or localized strings (`12/9/2026`). String prefix matching fails whenever the formatting deviates, resulting in misleading zero-hour bars on the admin analytics chart.
    *   *Deduction*: Normalizing `logDate` into a standard ISO date substring (`YYYY-MM-DD`) guarantees consistent volume aggregation across all deployment environments.
2.  **AI Advisor Direct Action Triggers (Requirement R3/R5)**:
    *   *Observation*: `CognitiveAdvisorCard.tsx` and `StudyAdvisorCard.tsx` render recommendations as static text paragraphs.
    *   *Analysis*: Authoritative requirement R3/R5 mandates: "AI assistance framed as direct actions ('Ask about this topic', 'Turn this into notes') without floating chatbot orbs."
    *   *Deduction*: Adding action trigger buttons (such as "Schedule Deep Work in Calendar" and "Log Time for Weak Subject") transforms passive diagnostic text into actionable workflows.
3.  **Registration Form Multi-Step Flow (Requirement R2)**:
    *   *Observation*: `src/app/register/page.tsx` renders all fields in a single vertical scroll page.
    *   *Analysis*: Requirement R2 specifies a multi-step registration wizard. Single-page mobile registration forms suffer from higher drop-off rates when students select from 306 schools and multiple subject electives.
    *   *Deduction*: Segmenting the form into three progressive steps (Step 1: Auth & Account, Step 2: Stream & Electives, Step 3: School & Contact) provides a cleaner mobile experience.
4.  **Requirement R5: Academic Resource Vault**:
    *   *Observation*: The application currently stores session photo proofs in Drive/local folders, but lacks a dedicated past paper and revision note repository.
    *   *Analysis*: Sri Lankan students require access to 2015–2024 past papers, marking schemes, and revision notes. Network access in student hostels and rural areas is frequently intermittent.
    *   *Deduction*: A hybrid persistence model combining an IndexedDB client store (caching PDF blobs and metadata locally) with Google Drive / mock server cloud endpoints provides instant offline viewing and online synchronization.
5.  **Requirement R5: Dynamic Subject Builder**:
    *   *Observation*: Stitch screen `0a05c09e082045c397a1a74b4a264d44` models a three-level subject and subtopic architecture with derivation proofs.
    *   *Analysis*: The current platform supports predefined stream subjects (Biology, Combined Maths, Chemistry, Physics) but lacks student customization for custom tracks, unit weightages, or subtopic mastery tracking.
    *   *Deduction*: Implementing a nested modal flow (Level 1: Subject Configuration, Level 2: Subtopic & Unit Builder, Level 3: Derivation Proof & Action Modal) satisfies the Stitch design specification.

---

## 3. Caveats

1.  **Read-Only Boundary**: As an exploration subagent, no source files were altered during this audit. All proposals are presented as blueprints and diff patches.
2.  **Live Google Apps Script Network Environment**: In air-gapped or local development without internet access, requests to the live Google Apps Script endpoint fall back to `localDb` or the Express mock server (`server/mock-server.js`).
3.  **PDF Viewing Compatibility**: While modern mobile and desktop browsers natively render PDF files inside `<object>` or `<iframe>` tags, embedding large multi-megabyte past papers offline requires IndexedDB blob storage to avoid memory exhaustion on budget mobile devices.

---

## 4. Conclusion & Architectural Recommendations

### 4.1 Architecture for Requirement R5: Academic Resource Vault

#### Data Schema (`src/types/vault.ts`)
```typescript
export interface VaultResource {
  id: string;                         // e.g. "RES-BIO-2023-PP1"
  title: string;                      // e.g. "2023 G.C.E. A/L Biology Past Paper I & II"
  stream: 'Biological Science' | 'Physical Science' | 'General';
  subject: 'Biology' | 'Physics' | 'Chemistry' | 'Combined Maths' | 'ICT' | 'Agriculture';
  category: 'Past Paper' | 'Marking Scheme' | 'Model Paper' | 'Revision Notes' | 'Syllabus';
  year?: string;                      // e.g. "2023"
  fileUrl: string;                    // Cloud URL (Drive or mock server)
  fileSize: string;                   // e.g. "3.8 MB"
  mimeType: string;                   // "application/pdf"
  isDownloaded: boolean;              // Cached in IndexedDB
  tags: string[];                     // ["genetics", "essay", "marking-scheme"]
  uploadedAt: string;
}
```

#### Hybrid Storage Architecture (`src/lib/storage/vaultDb.ts`)
*   **Database Name**: `studysync_resource_vault` (Version 1).
*   **Object Store 1**: `resources_metadata` (KeyPath: `id`). Indexes on `subject`, `category`, `stream`, `year`, `isDownloaded`.
*   **Object Store 2**: `resource_blobs` (KeyPath: `id`). Holds raw binary `Blob` or `ArrayBuffer` data for offline in-browser preview.
*   **Sync Logic**: On component mount, the vault loads metadata from IndexedDB (< 5ms). In the background, it queries the backend `getAcademicResources` endpoint to check for new uploads. When a student clicks "Download for Offline Access", the file is fetched, saved to `resource_blobs`, and flagged as `isDownloaded: true`.

#### UI Component Hierarchy
1.  `AcademicResourceVaultModal.tsx`: Main repository browser with stream filter, subject selector, category tabs, and search bar.
2.  `ResourceCard.tsx`: Displays past paper card with metadata, offline badge, and actions (View PDF, Download Offline, Share Link).
3.  `ResourcePdfViewerModal.tsx`: Clean in-browser PDF reader with zoom, page navigation, fullscreen mode, and direct action triggers.

---

### 4.2 Architecture for Requirement R5: Dynamic Subject Builder

#### Nested Modal Dialog Flow (Based on Stitch Screen `0a05c09e082045c397a1a74b4a264d44`)
1.  **Level 1: Subject Customizer Modal (`SubjectCustomizerModal.tsx`)**:
    *   Lists student's active subjects.
    *   Form fields: Custom Subject Name, Short Code (e.g. `MATH-PURE`), Weekly Target Hours (e.g. `14.0h`), Theme Color, Target Exam Year.
    *   Action: "Manage Units & Subtopics" navigates to Level 2.
2.  **Level 2: Subtopic & Unit Builder Modal (`SubtopicBuilderModal.tsx`)**:
    *   Renders curriculum unit accordion (e.g. "Unit 01: Real Numbers", "Unit 02: Functions & Graphs", "Unit 05: Integration").
    *   Subtopic items feature:
        *   Weightage badge (e.g. `15% Exam Weight`).
        *   Mastery state selector: `Not Started` | `In Progress` | `Mastered`.
        *   Action button: "View Derivation Proof" opens Level 3.
3.  **Level 3: Derivation Proof & Action Modal (`DerivationProofModal.tsx`)**:
    *   Editorial serif typography (Newsreader font) displaying mathematical steps, assumptions, and physical diagrams.
    *   Direct Action Triggers:
        *   *Schedule Deep Work*: Prepopulates `/calendar` with the subtopic title and launches the calendar modal.
        *   *Log Study Session*: Prepopulates `/daily` with the subject and subtopic.
        *   *Open Related Past Papers*: Opens the Academic Resource Vault filtered to this chapter.

---

### 4.3 Concrete Code Recommendations & Patches

#### Patch 1: Date Normalization in Admin 7-Day Chart (`src/app/admin/page.tsx:258`)
**Before:**
```typescript
const dayLogs = recentLogs.filter((l) => {
  const logDate = l.dateOfStudy || l.date;
  return logDate && String(logDate).startsWith(dateStr);
});
```
**Proposed Fix:**
```typescript
const dayLogs = recentLogs.filter((l) => {
  const rawDate = l.dateOfStudy || l.date;
  if (!rawDate) return false;
  // Normalize ISO timestamp or date string to YYYY-MM-DD
  const normalizedDate = new Date(rawDate).toISOString().slice(0, 10);
  return normalizedDate === dateStr;
});
```

#### Patch 2: Action Triggers in Cognitive Advisor (`src/components/ai/CognitiveAdvisorCard.tsx`)
**Proposed Enhancement:**
Add interactive direct action buttons to each AI recommendation card:
```tsx
<div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
  <button
    onClick={() => router.push(`/calendar?action=schedule&subject=${encodeURIComponent(rec.subject)}`)}
    className="px-2.5 py-1 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
  >
    Schedule Deep Work
  </button>
  <button
    onClick={() => router.push(`/daily?subject=${encodeURIComponent(rec.subject)}`)}
    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
  >
    Log Study Time
  </button>
</div>
```

---

## 5. Verification Method

To independently verify the interactivity findings and proposed architectural components:

1.  **Admin Date Aggregation Verification**:
    *   Start the mock development server:
        ```bash
        node server/mock-server.js
        ```
    *   Inspect `server/mock_db/daily_logs.json` and verify date formats.
    *   Open `/admin` in the browser, select the `Analytics` tab, and verify that the 7-Day Study Volume chart calculates non-zero bar heights for all dates with recorded logs.
2.  **Interactivity Audit Spot-Checks**:
    *   Navigate to `/daily` and toggle between `sessions` and `direct` modes. Verify that the session duration delta pills (`+15m`, `+30m`, `+1h`) update the total hours automatically.
    *   Navigate to `/calendar` and click "Generate AI Schedule". Verify that 35 hours are balanced across 3 subjects.
    *   Navigate to `/tests` and click "Add Test Mark". Enter a sample test mark and verify that the Z-Score trajectory recalculates.
    *   Navigate to `/id-card` and verify that mouse movement induces a 3D tilt and that the QR code renders without network requests.
3.  **Local Database Resilience Verification**:
    *   In the browser developer tools, toggle "Offline" mode in the Network panel.
    *   Submit a study log on `/daily`. Confirm that Sonner displays an offline queue confirmation and that the entry is recorded in `localStorage.getItem('STUDYSYNC_OFFLINE_LOGS')`.
4.  **Requirement R5 Component Verification**:
    *   Verify that `vaultDb.ts` creates the `studysync_resource_vault` IndexedDB database with object stores `resources_metadata` and `resource_blobs`.
    *   Test offline PDF loading by saving a mock blob and viewing it in `ResourcePdfViewerModal`.
