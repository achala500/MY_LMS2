# Comprehensive Specification & Architecture Mining Report: StudySync

**Document ID**: `SPEC-STUDYSYNC-2026-V1`  
**Agent**: `teamwork_preview_spec_miner_survey_1`  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_spec_miner_survey_1\`  
**Date**: 2026-08-26  
**Status**: COMPLETE / VERIFIED  

---

## 1. Observation

### 1.1 Source Materials Inspected
1. **Primary Authoritative Spec**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md` (Lines 1–232).
2. **Dispatch Directives**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_spec_miner_survey_1\DISPATCH.md` (Lines 1–22).
3. **Workspace State**: Clean environment under `c:\Users\alwis\Documents\antigravity\dazzling-bardeen` with agent metadata structure in `.agents/`.

### 1.2 Identified System Goals & Constraints
- **Application Identity**: `"StudySync"` — A full-stack web application designed for Sri Lankan G.C.E. Advanced Level (A/L) study groups to track daily study hours, focus, productivity, and proofs.
- **Tech Stack**:
  - **Frontend**: Firebase Hosting (SPA HTML5/ES6+/Tailwind CSS, Inter font, Canvas 2D/HTML2Canvas, QR generator, Toast notification system).
  - **Authentication**: Firebase Authentication (Google Sign-In popup/redirect provider).
  - **Backend API**: Google Apps Script Web App (`doGet()` / `doPost()` returning structured JSON).
  - **Database**: Google Sheets with exactly 3 optimized tabs (`Members`, `DailyLogs`, `Analytics`).
  - **Media Storage**: Google Drive API / DriveApp structured by `StudySync_Proofs/<StudentID>/<YYYY-MM-DD>/<filename>`.
- **Legacy Flaws to Prevent (Anti-Patterns)**:
  - Legacy `Form responses 1` sheet had duplicate email columns (Col D & Col N) leading to primary key collisions.
  - Registration data and daily log submissions were interleaved in one unnormalized table.
  - Inconsistent Study IDs (`AL-MATH-2376` vs `AL-7A4859` vs random UUIDs).
  - Free-text time entries (`"2 hrs"` vs numeric `1.5`).
  - Missing student profiles (School, Gender, Stream, Optional Subject).
  - Lack of an automated Analytics summary sheet and streak tracking.
  - 6 trailing empty columns from legacy Google Forms formatting.
  - Legacy backend used `Session.getActiveUser()` which fails on public/non-workspace Google accounts.
  - Legacy UI had no stream awareness (all 4 subjects shown to all students), single global daily sliders rather than per-subject sliders, static screenshot ID cards lacking dynamic QR verification, zero student dashboard/history, and ugly browser `alert()` popups.

---

## 2. Logic Chain

### Step 1: Mapping Functional Requirements R1 through R7

```
[Google Sign-In] ────────► [Email Check in Members Sheet]
                               │
            ┌──────────────────┴──────────────────┐
            ▼ (Not Found)                         ▼ (Found)
   [R1: Registration Form]              [R4: Student Dashboard]
   - Full Name                          - Profile Card (Read-only)
   - Email (Read-only)                  - R2: Apple Wallet Digital ID Card
   - Gender (M/F/Other)                 - Study History Table
   - Telegram (@username)               - Personal Metrics (Streak, Total Hours)
   - School (200+ Autocomplete)         - R3: Daily Study Form (or Read-only Mode)
   - Stream (Bio / Maths)                         │
   - Optional Subject (Conditional)               ▼
            │                           [R3: Stream-Aware Daily Log]
            ▼                           - 3 Stream Subjects (Hours, Focus 1-10, Prod 1-10)
   [R2: Prefix ID Gen]                  - Notes & Reflection
   - SG-BIO-NNNN / SG-MATH-NNNN         - Telegram Username
            │                           - Google Drive Proof Photo Upload
            ▼                                     │
   [R6: Sheets Database] ◄────────────────────────┴─► [R5: Admin Dashboard]
   - Members (10 cols)                                 - Whitelisted Access
   - DailyLogs (19 cols)                               - Members & Logs Tables
   - Analytics (Formulas & Rollups)                    - Group Analytics & Leaderboard
```

### Step 2: Database Schema Normalization & Constraint Rules

#### Sheet 1: `Members` (Exactly 10 Columns)
*Primary Key*: `Email` (Column C)  
*Alternate Unique Key*: `Study ID` (Column A)

| Col Index | Header Name | Data Type | Format / Allowed Values | Description & Validation Rules |
|:---:|:---|:---|:---|:---|
| **A** (1) | `Study ID` | String | `^SG-(BIO\|MATH)-\d{4}$` | Prefix-based unique identifier generated sequentially (e.g. `SG-BIO-0001`, `SG-MATH-0001`). Indexed for foreign key lookups. |
| **B** (2) | `Full Name` | String | UTF-8 Text | Member's full legal/preferred name (trimmed, 2-100 characters). |
| **C** (3) | `Email` | String | Valid Email Address | Unique Primary Key obtained directly from Firebase Auth Google Sign-In. Immutable. |
| **D** (4) | `Gender` | Enum String | `Male` \| `Female` \| `Other` | Member's identified gender. |
| **E** (5) | `Telegram Username` | String | `^@[A-Za-z0-9_]{5,32}$` | Telegram handle prefixed with `@` for study group communication. |
| **F** (6) | `School` | String | UTF-8 Text | Selected Sri Lankan national/provincial school from autocomplete dataset. |
| **G** (7) | `Stream` | Enum String | `Biological Science` \| `Physical Science` | Academic A/L stream determining subject configuration. |
| **H** (8) | `Optional Subject` | Enum String | Bio: `Physics` \| `Agriculture`<br>Maths: `Chemistry` \| `ICT` | Conditional 3rd elective subject based on stream choice. |
| **I** (9) | `Registration Date` | Date String | `YYYY-MM-DD` | Date of registration (UTC / Sri Lanka Standard Time UTC+5:30). |
| **J** (10) | `Status` | Enum String | `Active` \| `Inactive` | Membership status. Defaults to `Active`. |

#### Sheet 2: `DailyLogs` (Exactly 19 Columns)
*Foreign Key*: `Study ID` (Column B) -> `Members.Study ID`  
*Foreign Key*: `Email` (Column C) -> `Members.Email`  
*Composite Unique Constraint*: `(Study ID, Date of Study)` — strictly 1 log per student per calendar date.

| Col Index | Header Name | Data Type | Constraints / Format | Description |
|:---:|:---|:---|:---|:---|
| **A** (1) | `Timestamp` | ISO String | `YYYY-MM-DDTHH:mm:ss.sssZ` | Server-side ISO timestamp when log was recorded. |
| **B** (2) | `Study ID` | String | `SG-BIO-XXXX` / `SG-MATH-XXXX` | Foreign key referencing Member. |
| **C** (3) | `Email` | String | Valid Email Address | Foreign key referencing Member Google email. |
| **D** (4) | `Date of Study` | Date String | `YYYY-MM-DD` | Target study date selected on daily form. |
| **E** (5) | `Subject 1 Name` | String | `Biology` or `Combined Maths` | Fixed primary stream subject name. |
| **F** (6) | `Subject 1 Hours` | Decimal Number | `0.00` to `24.00` (Step `0.25` or `0.5`) | Hours spent on Subject 1. |
| **G** (7) | `Subject 1 Focus` | Integer | `1` to `10` | Focus level on Subject 1 (custom slider). |
| **H** (8) | `Subject 1 Productivity` | Integer | `1` to `10` | Productivity level on Subject 1 (custom slider). |
| **I** (9) | `Subject 2 Name` | String | `Chemistry` or `Physics` | Fixed secondary stream subject name. |
| **J** (10) | `Subject 2 Hours` | Decimal Number | `0.00` to `24.00` | Hours spent on Subject 2. |
| **K** (11) | `Subject 2 Focus` | Integer | `1` to `10` | Focus level on Subject 2 (custom slider). |
| **L** (12) | `Subject 2 Productivity` | Integer | `1` to `10` | Productivity level on Subject 2 (custom slider). |
| **M** (13) | `Subject 3 Name` | String | `Physics` \| `Agriculture` \| `Chemistry` \| `ICT` | Selected optional 3rd subject name. |
| **N** (14) | `Subject 3 Hours` | Decimal Number | `0.00` to `24.00` | Hours spent on Subject 3. |
| **O** (15) | `Subject 3 Focus` | Integer | `1` to `10` | Focus level on Subject 3 (custom slider). |
| **P** (16) | `Subject 3 Productivity` | Integer | `1` to `10` | Productivity level on Subject 3 (custom slider). |
| **Q** (17) | `Notes` | Text String | 0 - 2000 chars | Optional daily reflections, lessons, or topics covered. |
| **R** (18) | `Telegram` | String | `^@[A-Za-z0-9_]{5,32}$` | Telegram handle associated with this submission. |
| **S** (19) | `Proof Photo URL` | URL String | Google Drive File URL | Public/Admin view link to uploaded photo proof in Google Drive. |

#### Sheet 3: `Analytics` (Calculated Metrics & Summary Architecture)
The `Analytics` sheet houses automated formula calculations and dynamic summaries:
1. **Per-Member Aggregations**:
   - `Study ID`: Referenced from `Members!A2:A`
   - `Member Name`: `=VLOOKUP(A2, Members!A:B, 2, FALSE)`
   - `Total Days Logged`: `=COUNTIF(DailyLogs!B:B, A2)`
   - `Total Hours Studied`: `=SUMIF(DailyLogs!B:B, A2, DailyLogs!F:F) + SUMIF(DailyLogs!B:B, A2, DailyLogs!J:J) + SUMIF(DailyLogs!B:B, A2, DailyLogs!N:N)`
   - `Average Daily Hours`: `=IFERROR(TotalHours / TotalDays, 0)`
   - `Average Focus Level`: `=IFERROR(AVERAGE(FILTER({DailyLogs!G:G; DailyLogs!K:K; DailyLogs!O:O}, {DailyLogs!B:B; DailyLogs!B:B; DailyLogs!B:B} = A2)), 0)`
   - `Average Productivity Level`: `=IFERROR(AVERAGE(FILTER({DailyLogs!H:H; DailyLogs!L:L; DailyLogs!P:P}, {DailyLogs!B:B; DailyLogs!B:B; DailyLogs!B:B} = A2)), 0)`
   - `Last Active Date`: `=IFERROR(MAXIFS(DailyLogs!D:D, DailyLogs!B:B, A2), "Never")`
2. **Global Group Metrics**:
   - `Total Registered Members`: `=COUNTA(Members!A2:A)`
   - `Active Members (Last 7 Days)`: Calculated via script or formula.
   - `Total Group Study Hours`: `=SUM(DailyLogs!F2:F) + SUM(DailyLogs!J2:J) + SUM(DailyLogs!N2:N)`
   - `Total Daily Submissions`: `=COUNTA(DailyLogs!A2:A)`
   - `Biological Science Ratio`: `=COUNTIF(Members!G:G, "Biological Science")`
   - `Physical Science Ratio`: `=COUNTIF(Members!G:G, "Physical Science")`
   - `Subject Breakdown Hours`: Total hours logged per subject across group.

---

### Step 3: Stream Subject Mapping Matrix

| A/L Stream | Fixed Subject 1 | Fixed Subject 2 | Optional Subject Choices (Choose 1) | Total Form Subjects Shown |
|:---|:---|:---|:---|:---:|
| **Biological Science** | Biology | Chemistry | **Physics** OR **Agriculture** | Exactly 3 |
| **Physical Science** | Combined Mathematics | Physics | **Chemistry** OR **ICT** | Exactly 3 |

*Validation Rule*: Form dynamically queries the member's profile and displays *only* these 3 subjects. Subject inputs for non-enrolled subjects are completely omitted from the DOM.

---

### Step 4: Study ID Generation Algorithm & Prefix Rules

1. **Prefix Structure**:
   - For `Biological Science`: Prefix = `SG-BIO-`
   - For `Physical Science`: Prefix = `SG-MATH-`
2. **Sequence Number**:
   - 4-digit zero-padded integer starting at `0001` (e.g. `0001`, `0002`, ..., `9999`).
   - Format: `${PREFIX}${String(nextSequence).padStart(4, '0')}` -> `SG-BIO-0001`.
3. **Concurrency & Thread Safety**:
   - In Google Apps Script backend, ID generation must use `LockService.getScriptLock()` with a timeout (e.g. 15,000ms) before querying `Members` sheet, determining max sequence for the stream, appending the new row, and releasing the lock. This eliminates race conditions.

---

### Step 5: Apple Wallet-Style Digital ID Card & Public Verification Specifications

#### Card Visual & Dimension Specifications
- **Aspect Ratio**: Standard ISO/IEC 7810 ID-1 card ratio ($85.60 \times 53.98\text{ mm}$, aspect ratio $\approx 1.586:1$, recommended canvas size $1050 \times 660\text{ px}$ for 1x, $3150 \times 1980\text{ px}$ for 3x export).
- **Aesthetic**: Apple Wallet dark mode card.
  - Background: Deep obsidian/midnight gradient with vibrant ambient radial glow:
    - *Bio Stream*: Emerald-to-Teal-to-Cyan glow (`linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #022c22 100%)` with neon emerald accents).
    - *Maths Stream*: Indigo-to-Purple-to-Blue glow (`linear-gradient(135deg, #312e81 0%, #0f172a 60%, #1e1b4b 100%)` with neon violet accents).
  - Glassmorphism: Frosted glass header bar, subtle 1px white border (`rgba(255,255,255,0.12)`), smooth 24px border radius.
  - Branding: `"StudySync A/L Study Group"` header + micro chip / hologram icon.
  - Member Info: Large student name (Inter Bold), Monospace Study ID (`SG-BIO-0001`), School Name, Stream & Optional Subject badge, Registration Date.
  - Status Tag: Glowing active badge (`● ACTIVE MEMBER`).

#### QR Code Payload & Architecture
- **Dual Capability**: The QR code encodes both embedded JSON payload and a live HTTP/HTTPS public verification URL:
  - **Live URL**: `https://<hosting-domain>/verify.html?id=SG-BIO-0001` (or parameter route `?verify=SG-BIO-0001`).
  - **Embedded JSON Payload**:
    ```json
    {
      "app": "StudySync",
      "id": "SG-BIO-0001",
      "name": "Kasun Perera",
      "stream": "Biological Science",
      "school": "Royal College, Colombo",
      "status": "Active",
      "verifyUrl": "https://<hosting-domain>/verify.html?id=SG-BIO-0001"
    }
    ```
- **Public Verification Endpoint (`verify.html` / `doGet?action=verify`)**:
  - Accessible to anyone scanning the QR code without requiring Google Sign-In authentication.
  - Resolves `id` via backend API (`doGet({ action: 'verify', id: 'SG-BIO-0001' })`).
  - Renders a clean Apple-style verification badge card:
    - Status: `VERIFIED ACTIVE MEMBER` (Green glow checkmark) or `INVALID / UNREGISTERED ID` (Red alert).
    - Student Full Name.
    - Unique Study ID.
    - School & Stream.
    - Member Since date.
- **Export / Download Feature**:
  - High-resolution rendering using HTML5 Canvas / HTML2Canvas at **3x scale** ($3150 \times 1980\text{ px}$) to ensure crisp printing and digital wallet storage.
  - Automatic download filename: `StudySync_ID_${StudyID}.png`.

---

### Step 6: Daily Study Form & Google Drive Folder Hierarchy

#### Form Interactions & Constraints
- **One Submission Per Day Rule**:
  - Daily form checks if student has already submitted for the selected date (`YYYY-MM-DD`).
  - If existing log found: Form transitions to **Read-Only Mode** displaying previous inputs, disabled sliders, photo thumbnail, and an informative status banner.
- **Per-Subject Inputs (3 Subjects)**:
  - Numeric hours input with decimal support (`1.5` hrs = 1h 30m).
  - Custom Creative Focus Slider (`1` to `10`): Dynamic track color change (Red -> Yellow -> Green/Cyan) with real-time numeric indicator and qualitative state text ("Distracted", "Focused", "Deep Flow").
  - Custom Creative Productivity Slider (`1` to `10`): Dynamic gradient fill with qualitative state text ("Slow", "Effective", "Maximum Output").
- **Proof Photo Upload**:
  - Client validates file type (`image/jpeg`, `image/png`, `image/webp`) and size ($\le 5\text{MB}$).
  - Encoded to Base64 and sent to Apps Script `doPost()`.
  - Apps Script creates / retrieves nested Drive folders:
    ```
    Google Drive Root: "StudySync_Storage"
    └── Folder: "<StudyID>" (e.g. "SG-BIO-0001")
        └── Folder: "<YYYY-MM-DD>" (e.g. "2026-08-26")
            └── File: "proof_<timestamp>.<ext>"
    ```
  - File permissions set to restricted (owner/admin viewable or web-viewable link).
  - Permanent URL saved in `DailyLogs` Sheet Column S.

---

### Step 7: Sri Lankan Schools Dataset Specification

A curated dataset of 250+ prominent Sri Lankan schools covering all 9 provinces and 25 districts, structured for fast fuzzy/substring autocomplete search:
- **Western Province**: Royal College Colombo, Ananda College, Nalanda College, D.S. Senanayake College, Visakha Vidyalaya, Devi Balika Vidyalaya, Sirimavo Bandaranaike Vidyalaya, St. Joseph's College Colombo, St. Peter's College Colombo, Holy Family Convent Bambalapitiya, Musaeus College, Ladies' College, Bishop's College, Wesley College, Thurstan College, Mahanama College, Isipathana College, Asoka Vidyalaya, Anula Vidyalaya Nugegoda, Dharmapala Vidyalaya Pannipitiya, President's College Maharagama, Bandaranayake College Gampaha, Rathnavali Balika Vidyalaya Gampaha, Holy Cross College Gampaha, Taxila Central College Horana, Sri Sumangala College Panadura, Kalutara Vidyalaya, Holy Family Convent Kalutara, St. John's College Panadura, etc.
- **Central Province**: Trinity College Kandy, Dharmaraja College Kandy, Kingswood College Kandy, St. Anthony's College Kandy, Girls' High School Kandy, Mahamaya Girls' College Kandy, Pushpadana Girls' College Kandy, St. Sylvester's College Kandy, Vidyartha College Kandy, Sri Rahula College Katugastota, St. Thomas' College Matale, Christ Church College Matale, Gamini Dissanayake National School Nuwara Eliya, etc.
- **Southern Province**: Richmond College Galle, Mahinda College Galle, St. Aloysius' College Galle, Southlands College Galle, Sanghamitta Balika Vidyalaya Galle, Rahula College Matara, Sujatha Vidyalaya Matara, St. Servatius' College Matara, St. Thomas' College Matara, Tangalle Boys' School, D.A. Rajapaksa National School Beliatta, etc.
- **North Western Province**: Maliyadeva College Kurunegala, Maliyadeva Balika Vidyalaya, St. Anne's College Kurunegala, Holy Family Convent Kurunegala, Sir John Kothalawala College, Kuliyapitiya Central College, Joseph Vaz College Wennappuwa, Dhammissara National School Nattandiya, etc.
- **Northern Province**: Jaffna Hindu College, Jaffna Central College, St. John's College Jaffna, Vembadi Girls' High School, Hartley College Point Pedro, St. Patrick's College Jaffna, Chavakachcheri Hindu College, Vavuniya Tamil Maha Vidyalayam, etc.
- **Eastern Province**: St. Michael's College Batticaloa, Vincent Girls' High School, Shivananda National School, D.S. Senanayake National College Ampara, Zahira College Kalmunai, R.K.M. Sri Koneswara Hindu College Trincomalee, St. Joseph's College Trincomalee, etc.
- **Sabaragamuwa Province**: Sivali Central College Ratnapura, Ferguson High School Ratnapura, St. Aloysius National College Ratnapura, Ananda Maithreya National School, Kegalu Vidyalaya, St. Joseph's Balika Maha Vidyalaya Kegalle, Dudley Senanayake Central College Tholangamuwa, etc.
- **North Central Province**: Anuradhapura Central College, Swarna Pali Balika Vidyalaya, Walisinghe Harischandra Maha Vidyalaya, Royal Central College Polonnaruwa, Topawewa Maha Vidyalaya, etc.
- **Uva Province**: Bandarawela Central College, Dharmadutha College Badulla, Vihara Maha Devi Balika Vidyalaya Badulla, St. Thomas' College Bandarawela, Visakha Girls' High School Badulla, Royal College Monaragala, etc.
- **Fallback Option**: `"Other School / Private Candidate"`.

---

### Step 8: Admin Security & Whitelist Architecture

- **Configurable Whitelist**:
  ```javascript
  const ADMIN_EMAILS = [
    'admin@studysync.lk',
    'lead.admin@gmail.com'
  ];
  ```
- **Client & Server Double Verification**:
  - *Client*: After Firebase Auth login, verify `ADMIN_EMAILS.includes(currentUser.email)`. If true, display Admin Navigation tab; if false, hide or block admin routes.
  - *Server*: Apps Script API checks `payload.adminEmail` or verified email against `ADMIN_EMAILS` before returning `getAllMembers()`, `getAllLogs()`, or `updateMemberStatus()`. Returns `403 Forbidden` if unauthorized.
- **Admin Capabilities**:
  1. Members Directory: Filter by stream, school, status; search by name/ID; toggle Active/Inactive.
  2. All Daily Logs: Real-time search by date, student ID, stream; view proof images directly in modal.
  3. Analytics Hub: Group study trends, top performers, active member ratios, study streak leaderboard.

---

### Step 9: UI/UX & Non-Functional Engineering Requirements

1. **Apple-Inspired Dark Aesthetic**:
   - Dark mode base palette (`#0B0F17`, `#111827`, `#1E293B`).
   - Tailwind CSS utility classes with backdrop blur (`backdrop-blur-md`, `bg-slate-900/60`).
   - Glassmorphic border highlights (`border border-white/10`).
   - Smooth animated background aurora gradient with soft CSS keyframes.
2. **Custom Interactive Sliders (Not Default HTML)**:
   - Styled range input with dynamic background gradient fill calculated via CSS variables `style="background: linear-gradient(to right, #6366f1 0%, #a855f7 ${val * 10}%, #1e293b ${val * 10}%, #1e293b 100%)"`.
   - Glowing thumb with scaling hover effect and dynamic real-time value badges.
3. **Toast Notifications (Zero `alert()` Rule)**:
   - Dedicated notification manager rendering animated toast notifications (Success, Error, Warning, Info).
   - Strict rule: Search codebase for `alert(` must return zero occurrences.
4. **Mobile-First Responsiveness**:
   - Fluid responsive layout adapting gracefully from iPhone SE ($375\text{px}$) to widescreen $4\text{K}$ monitors.
   - Touch-friendly tap targets ($\ge 44\text{px} \times 44\text{px}$).

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| **1** | Auth & Identity | Google Sign-In via Firebase Auth | Authenticates user via Google OAuth popup/redirect, extracts verified email, display name, and photo. | Google OAuth user interaction | Firebase User credential (`email`, `displayName`, `uid`) | Displays error toast if popup is blocked or cancelled | ORIGINAL_REQUEST.md § R1 |
| **2** | Auth & Identity | First-Time Login Routing | Checks if Google email exists in `Members` sheet. If not found, directs user to one-time registration form. | `email` string | View state: `SHOW_REGISTRATION` | Network error toast if Apps Script API unreachable | ORIGINAL_REQUEST.md § R1 |
| **3** | Auth & Identity | Returning User Fast-Path | If email exists in `Members`, bypasses registration and loads Student Dashboard with profile pre-filled. | `email` string | View state: `SHOW_DASHBOARD`, profile object | Network error toast with retry button | ORIGINAL_REQUEST.md § R1 |
| **4** | Registration | Read-Only Google Email Binding | Displays authenticated Google email as locked, read-only field in registration form to enforce 1:1 account mapping. | Firebase `user.email` | Disabled HTML input element | N/A (cannot be edited by user) | ORIGINAL_REQUEST.md § R1 |
| **5** | Registration | Sri Lankan School Autocomplete | Searchable dropdown with 200+ Sri Lankan schools, filtering dynamically on typing. | Keyword substring string | Filtered school list suggestions | Fallback to "Other School" if custom | ORIGINAL_REQUEST.md § R1 |
| **6** | Registration | Dynamic Optional Subject Selector | Dynamically switches optional subject dropdown based on stream (Bio -> Physics/Ag; Maths -> Chem/ICT). | Selected Stream (`Biological Science` \| `Physical Science`) | Populated optional subject dropdown | Clears invalid selection if stream changes | ORIGINAL_REQUEST.md § R1 |
| **7** | ID Generation | Sequential Prefix Study ID Gen | Atomically increments and formats sequential 4-digit ID per stream (`SG-BIO-NNNN`, `SG-MATH-NNNN`). | Stream name, lock service | String ID (e.g. `SG-BIO-0001`) | Script lock timeout error if concurrent lock fails | ORIGINAL_REQUEST.md § R2 |
| **8** | Digital ID Card | Apple Wallet Style Card Renderer | Renders luxury dark gradient ID card with glassmorphism, glowing badges, student info, and embedded QR code. | Member profile data object | HTML5 Canvas / SVG rendered card | Fallback placeholder if profile field missing | ORIGINAL_REQUEST.md § R2 |
| **9** | Digital ID Card | Dual-Payload QR Generator | Generates QR code encoding both member JSON metadata and live public verification URL. | Member object + Domain URL | 2D QR Code Matrix canvas/image | Fallback error indicator if QR string invalid | ORIGINAL_REQUEST.md § R2 |
| **10** | Digital ID Card | 3x High-Res PNG Download | Converts rendered ID card canvas to high-resolution PNG (3150x1980 px) and triggers file download. | User click download button | Downloadable `.png` image file | Error toast if canvas export fails | ORIGINAL_REQUEST.md § R2 |
| **11** | Public Verification | Public Member Verification Endpoint | Public web page (`verify.html` / `?verify=ID`) verifying active membership without requiring authentication. | `id` parameter from URL query | Verification status badge & member card | Displays "Invalid / Unverified ID" if not found | ORIGINAL_REQUEST.md § R2 |
| **12** | Daily Study Form | Stream-Specific 3-Subject Rendering | Renders daily study form showing strictly the 3 subjects registered for the student. | Student `Stream` & `Optional Subject` | 3 dynamic subject input cards in DOM | Omits non-registered subjects entirely | ORIGINAL_REQUEST.md § R3 |
| **13** | Daily Study Form | Decimal Hours/Minutes Input | Accepts numeric hours spent per subject with decimal support (e.g. 1.5 hrs). | Numeric decimal (0.00 - 24.00) | Validated float value in hours | Rejects negative or >24 values with toast | ORIGINAL_REQUEST.md § R3 |
| **14** | Daily Study Form | Custom Focus Sliders (1-10) | Interactive slider for each of the 3 subjects with dynamic gradient track and real-time state badge. | Slider range input 1-10 | Integer focus score (1-10) | Defaults to 5 if unadjusted | ORIGINAL_REQUEST.md § R3 |
| **15** | Daily Study Form | Custom Productivity Sliders (1-10) | Interactive slider for each of the 3 subjects with dynamic gradient track and real-time state badge. | Slider range input 1-10 | Integer productivity score (1-10) | Defaults to 5 if unadjusted | ORIGINAL_REQUEST.md § R3 |
| **16** | Daily Study Form | Photo Proof Drive Upload | Accepts image file, converts to Base64, uploads to Google Drive under `StudentID/YYYY-MM-DD/filename`. | File object (`image/*`) | Google Drive file URL string | Rejects non-image or files >5MB | ORIGINAL_REQUEST.md § R3 |
| **17** | Daily Study Form | One-Submission-Per-Day Enforcement | Checks if student already submitted on selected study date. If so, locks form in read-only mode. | `(Study ID, Date of Study)` | View state: `READ_ONLY_MODE` or `ACTIVE_FORM` | Prevents duplicate POST with 409 error | ORIGINAL_REQUEST.md § R3 |
| **18** | Student Dashboard | Personal Study Streak Tracker | Calculates consecutive days studied leading up to today/yesterday. | Array of student's past daily logs | Integer streak count (e.g. 12 days) | Returns 0 if no recent logs found | ORIGINAL_REQUEST.md § R4 |
| **19** | Student Dashboard | Personal Study Metrics Rollup | Computes total study hours (overall & per-subject) and average focus / productivity scores. | Array of student's past daily logs | Aggregated statistics object | Displays 0.0 for new students | ORIGINAL_REQUEST.md § R4 |
| **20** | Student Dashboard | Past Study History Table | Renderable, scrollable list of all previous daily submissions with hours, scores, reflections, and proof link. | Student daily logs from backend | Interactive history table/cards | Displays empty state illustration if 0 logs | ORIGINAL_REQUEST.md § R4 |
| **21** | Admin Dashboard | Whitelist-Protected Access Gate | Protects admin view and API endpoints against hardcoded list of authorized admin Google emails. | `user.email` from Firebase Auth | Access granted to Admin View | Shows 403 Forbidden glassmorphism screen | ORIGINAL_REQUEST.md § R5 |
| **22** | Admin Dashboard | All Members Directory & Filter | Comprehensive table of all registered students with filters by Stream, School, Status, and search bar. | Search query, filter criteria | Filtered members list table | Shows "No matching members found" | ORIGINAL_REQUEST.md § R5 |
| **23** | Admin Dashboard | Global Daily Study Logs Viewer | Searchable, paginated/scrollable log viewer for all submissions with proof photo modal preview. | Search query, date range filter | Global daily study logs table | Shows empty state if no logs match | ORIGINAL_REQUEST.md § R5 |
| **24** | Admin Dashboard | Group Analytics & Leaderboard | Displays group total hours, active member ratio, subject distribution, and top streak leaders. | All members & daily logs data | Analytics charts and leaderboard cards | Handles zero logs gracefully | ORIGINAL_REQUEST.md § R5 |
| **25** | Database Storage | Optimized 3-Sheet Database | Replaces broken legacy sheet with 3 normalized sheets: `Members` (10 cols), `DailyLogs` (19 cols), `Analytics`. | API POST payloads | Synchronized Google Spreadsheet rows | Backend lock & schema validation errors | ORIGINAL_REQUEST.md § R6 |
| **26** | UI & UX | Toast Notification Engine | Non-intrusive floating toast notifications for success, error, warning, info feedback. Replaces `alert()`. | Message string, toast type, duration | Animated toast banner DOM element | Auto-dismisses after timeout | ORIGINAL_REQUEST.md § R7 |
| **27** | UI & UX | Animated Aurora Dark Mode Theme | Apple-inspired dark mode UI with Tailwind CSS, backdrop blur glassmorphism, and ambient gradient glow. | CSS theme styling | Visual aesthetic across all views | Graceful fallback on older browsers | ORIGINAL_REQUEST.md § R7 |

---

## 4. Edge Cases & Resilience Strategy

| # | Feature / Subsystem | Input / Scenario | Observed / Specified System Behavior |
|---|---------------------|------------------|---------------------------------------|
| **E1** | Authentication & Reg | User attempts to register multiple times with same Google Account. | Backend checks `Members` sheet for `email`. Finds existing row, rejects duplicate registration, and returns existing profile. Frontend loads Dashboard directly. |
| **E2** | Registration | User manually alters or hacks disabled Email field on client. | Backend extracts authenticated Google email directly from Firebase Auth token or payload; ignores client override, guaranteeing data integrity. |
| **E3** | Daily Study Form | User attempts to submit a second daily study log for the same calendar date. | Backend checks composite key `(Study ID, Date of Study)` in `DailyLogs`. Returns status `ALREADY_SUBMITTED`. Frontend renders existing entry in read-only mode with info banner. |
| **E4** | Daily Study Form | User enters negative study hours, non-numeric values, or $>24.0$ hours for a subject. | Client-side validation blocks submission and displays error toast. Server-side validation parses float and validates $0.0 \le \text{hours} \le 24.0$. |
| **E5** | Daily Study Form | User uploads unsupported file format (e.g. `.exe`, `.pdf`, `.zip`) or file $>5\text{MB}$. | Client-side file inspection rejects file immediately with error toast ("Please upload an image file under 5MB"). Server validates MIME type before Drive save. |
| **E6** | Daily Study Form | User leaves Notes field empty (optional field). | System accepts empty string and saves `""` to Column Q of `DailyLogs` without error. |
| **E7** | ID Generation | Simultaneous concurrent registration requests for the same stream (Race condition). | Apps Script backend uses `LockService.getScriptLock()` with a 15-second timeout, ensuring atomic calculation of `max_sequence + 1` and sequential ID allocation. |
| **E8** | Digital ID Card | Student school name is extremely long (e.g. 50+ characters). | Digital ID Card canvas applies text truncation / auto-shrinking font size to prevent overlapping the card borders or QR code. |
| **E9** | Public Verification | External visitor scans QR code with invalid, tampered, or deleted Study ID. | Verification endpoint queries backend for ID. Backend returns `notFound: true`. Verification page displays red warning card: "Invalid or Unregistered Study ID". |
| **E10** | Admin Dashboard | Non-admin student attempts to load Admin route or call Admin API actions. | Client checks email against `ADMIN_EMAILS` whitelist and hides Admin tab. Server verifies email whitelist on all admin endpoints and returns `403 Forbidden` if unauthorized. |
| **E11** | Student Dashboard | Student has gaps in study days (e.g. studied Day 1, Day 2, missed Day 3, studied Day 4). | Streak calculation algorithm evaluates consecutive days strictly backward from current date / yesterday. Accurately calculates current streak as 1 day instead of cumulative count. |
| **E12** | Database / Sheets | Google Sheets API rate limit or transient network disconnection during submit. | Frontend shows reassuring error toast ("Network hiccup. Your inputs have been preserved. Click to retry.") without clearing form state. |
| **E13** | Timezones | User submits study log across midnight boundary or in different local timezone. | Frontend standardizes date picker to local date format `YYYY-MM-DD` and includes ISO UTC submission timestamp in Column A. |
| **E14** | School Autocomplete | Student types custom school not in the predefined 200+ list. | Autocomplete allows free-text entry or provides an `"Other School (Specify)"` option, storing the custom school string cleanly in Column F. |

---

## 5. Caveats

1. **Google Apps Script Execution Quotas**: Apps Script has daily quotas (e.g. 6 min max single execution time, 20,000 URL fetch calls/day, Drive storage limits). All payloads should be compressed and responses kept lightweight (JSON).
2. **Drive Folder Permissions**: To allow students/admin to view proof photos without requiring Google Workspace organizational login, uploaded files in `StudySync_Proofs` can have their sharing permission set to `Anyone with link can view` via `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)` or restricted to Admin view depending on privacy requirements.
3. **Firebase Auth Domain Whitelisting**: Firebase Auth Google Sign-In requires the hosting domain (Firebase Hosting URL and local development domains like `localhost:5000`) to be added under **Firebase Console > Authentication > Settings > Authorized Domains**.

---

## 6. Conclusion

The functional and non-functional specifications for **StudySync** are now fully extracted, validated, and normalized against `ORIGINAL_REQUEST.md`. 

Key architectural anchors established:
- **Clean 3-Sheet Normalization**: `Members` (10 cols), `DailyLogs` (19 cols), `Analytics` (Summary formulas), eliminating duplicate email columns and mixed data.
- **Stream-Aware Subject Logic**: Bio Stream (Biology, Chemistry, Physics/Ag) and Maths Stream (Combined Maths, Physics, Chem/ICT) strictly respected across registration, daily forms, and sheets.
- **Sequential Prefix ID System**: `SG-BIO-0001` and `SG-MATH-0001` generated with lock-guaranteed atomicity.
- **Dual-Payload Apple Wallet ID & Public Verification**: High-resolution 3x PNG card with interactive QR code linking to a standalone, unauthenticated verification page.
- **Zero-Alert Apple Dark UI**: Glassmorphism, smooth animations, dynamic 1-10 custom gradient sliders, and non-blocking toast notifications.

---

## 7. Verification Method

To independently verify this specification report against requirements:

1. **Schema Column Count & Name Verification**:
   - Inspect Section 2 of this report and compare against `ORIGINAL_REQUEST.md` lines 101–145.
   - Verify `Members` has exactly 10 columns (A to J) with no duplicate emails.
   - Verify `DailyLogs` has exactly 19 columns (A to S) with named subject fields.
2. **Feature Coverage Verification**:
   - Check Features Discovered table (Features 1 through 27) against Requirements R1 to R7 and Acceptance Criteria (lines 159–212).
   - Check Edge Cases table (E1 to E14) against failure modes.
3. **Layout & Compliance**:
   - Verify that this report is written inside `.agents/teamwork_preview_spec_miner_survey_1/handoff.md` and contains zero source code implementation files in `.agents/`.
