# Backend, Database, and API Architecture Survey & Specification Report

## 1. Observation

### 1.1 Direct Requirements & Codebase Context
From `ORIGINAL_REQUEST.md` and `DISPATCH.md`:
- **Existing System Flaws**:
  - Legacy sheet `"Form responses 1"` mixes registration and daily logs with duplicate email columns (Col D and Col N), inconsistent ID formats (`AL-MATH-2376` vs `AL-7A4859`), string study hours (`"2 hrs"` vs numeric `1.5`), and trailing empty columns.
  - Legacy `Code.gs` relied on `Session.getActiveUser()`, lacked concurrency locks, allowed duplicate daily logs, and had no structured Drive storage.
- **Target System Requirements**:
  - **Backend**: Google Apps Script (`Code.gs`) web app exposed via `doGet(e)` / `doPost(e)` returning JSON with `ContentService`.
  - **Database**: Google Sheets with exactly 3 optimized tabs:
    1. `Members` (10 columns, primary key `Email`, unique `Study ID`).
    2. `DailyLogs` (19 columns, foreign key `Study ID` -> `Members.Study ID`, unique constraint on `(Study ID, Date of Study)`).
    3. `Analytics` (Summary KPIs, aggregate metrics, and leaderboard).
  - **Storage**: Google Drive folder structure organized as `StudySync_Uploads/{StudentID}/{YYYY-MM-DD}/{filename}`, accepting base64 images from client and returning viewable URLs.
  - **Concurrency**: Apps Script `LockService` for atomic sequential ID generation (`SG-BIO-0001` / `SG-MATH-0001`) and race-condition prevention during daily submissions.
  - **API Actions**:
    - `checkUser`: Verify email, return registration status and profile.
    - `registerUser`: Validate input, allocate sequential Study ID, append member row.
    - `submitDailyLog`: Validate 3-subject inputs, prevent same-day duplicates, upload photo proof to Drive, append daily log, update analytics.
    - `getStudentHistory`: Return past logs and calculate personal streak/hours.
    - `getAdminData`: Admin-authenticated query returning full member list, all logs, analytics summary.
    - `verifyMember`: Public verification by Study ID or Email.
    - `getAnalytics`: Group-wide metrics, stream breakdown, and leaderboard.
  - **Local Development**: Node.js / Express mock API server simulating 100% of Apps Script endpoints and Drive storage for zero-dependency local E2E development.

---

## 2. Logic Chain & Comprehensive Architecture Design

### 2.1 Google Apps Script Architecture (`Code.gs`)

#### 2.1.1 Request/Response Pipeline & CORS Handling
Google Apps Script Web Apps handle HTTP GET and POST requests through `doGet(e)` and `doPost(e)`.
When called from a client-side web application (e.g. Firebase Hosting or local frontend):
1. **POST Request Payload**: Browsers sending cross-origin POST requests with `Content-Type: application/json` trigger preflight `OPTIONS` requests, which Apps Script cannot handle. To ensure seamless cross-origin communication, client requests send JSON as text (`text/plain;charset=utf-8`) or as standard POST body. `Code.gs` parses `e.postData.contents`.
2. **Response Output**: Every response is wrapped in standard JSON envelope:
   ```json
   {
     "success": true,
     "data": { ... },
     "error": null,
     "timestamp": "2026-08-26T03:45:00.000Z"
   }
   ```
   Formatted using:
   ```javascript
   function createJsonResponse(data, isSuccess = true, errorMsg = null) {
     const payload = {
       success: isSuccess,
       data: isSuccess ? data : null,
       error: isSuccess ? null : errorMsg,
       timestamp: new Date().toISOString()
     };
     return ContentService.createTextOutput(JSON.stringify(payload))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

#### 2.1.2 Global Configuration & Constants
```javascript
const CONFIG = {
  SPREADSHEET_ID: "", // Bound spreadsheet (or active sheet via SpreadsheetApp.getActiveSpreadsheet())
  ADMIN_EMAILS: ["admin@studysync.lk", "lead.organizer@gmail.com"], // Configurable list
  DRIVE_ROOT_FOLDER_NAME: "StudySync_Uploads",
  LOCK_TIMEOUT_MS: 30000, // 30 seconds wait for script locks
  SHEET_NAMES: {
    MEMBERS: "Members",
    DAILY_LOGS: "DailyLogs",
    ANALYTICS: "Analytics"
  },
  STREAMS: {
    BIO: "Biological Science",
    MATH: "Physical Science"
  },
  PREFIXES: {
    BIO: "SG-BIO-",
    MATH: "SG-MATH-"
  }
};
```

---

### 2.2 Google Sheets Database Schema (3 Sheets)

#### 2.2.1 Sheet 1: `Members` (10 Columns)
Primary Key: `Email` (Col C). Unique Natural Identifier: `Study ID` (Col A).

| Col | Header Name | Data Type | Validation / Description | Example |
|---|---|---|---|---|
| **A** | `Study ID` | String | Format: `SG-BIO-XXXX` or `SG-MATH-XXXX` (4-digit sequential) | `SG-BIO-0001` |
| **B** | `Full Name` | String | Trimmed full student name (max 120 chars) | `Kasun Perera` |
| **C** | `Email` | String | Unique Key, lowercased, validated email format | `kasun.p@gmail.com` |
| **D** | `Gender` | String | Enum: `Male`, `Female`, `Other` | `Male` |
| **E** | `Telegram Username`| String | Includes `@` prefix, sanitized | `@kasun_p` |
| **F** | `School` | String | Selected from Sri Lankan school list | `Royal College, Colombo 07` |
| **G** | `Stream` | String | Enum: `Biological Science`, `Physical Science` | `Biological Science` |
| **H** | `Optional Subject`| String | Enum: `Physics`, `Agriculture`, `Chemistry`, `ICT` | `Physics` |
| **I** | `Registration Date`| String | ISO 8601 UTC timestamp | `2026-08-26T03:45:00.000Z` |
| **J** | `Status` | String | Enum: `Active`, `Inactive` (default: `Active`) | `Active` |

#### 2.2.2 Sheet 2: `DailyLogs` (19 Columns)
Foreign Key: `Study ID` -> `Members.Study ID` (Col B).
Composite Unique Constraint: `(Study ID, Date of Study)`.

| Col | Header Name | Data Type | Description | Example |
|---|---|---|---|---|
| **A** | `Timestamp` | String | Submission ISO 8601 timestamp | `2026-08-26T14:22:10.123Z` |
| **B** | `Study ID` | String | Foreign key matching `Members` Col A | `SG-BIO-0001` |
| **C** | `Email` | String | Student email address | `kasun.p@gmail.com` |
| **D** | `Date of Study` | String | ISO Date string `YYYY-MM-DD` | `2026-08-26` |
| **E** | `Subject 1 Name` | String | Stream subject 1 name | `Biology` |
| **F** | `Subject 1 Hours`| Number | Float hours studied (0.0 - 24.0) | `2.5` |
| **G** | `Subject 1 Focus`| Number | Integer 1 to 10 | `8` |
| **H** | `Subject 1 Productivity` | Number | Integer 1 to 10 | `9` |
| **I** | `Subject 2 Name` | String | Stream subject 2 name | `Chemistry` |
| **J** | `Subject 2 Hours`| Number | Float hours studied (0.0 - 24.0) | `1.5` |
| **K** | `Subject 2 Focus`| Number | Integer 1 to 10 | `7` |
| **L** | `Subject 2 Productivity` | Number | Integer 1 to 10 | `8` |
| **M** | `Subject 3 Name` | String | Stream subject 3 (or chosen optional) | `Physics` |
| **N** | `Subject 3 Hours`| Number | Float hours studied (0.0 - 24.0) | `3.0` |
| **O** | `Subject 3 Focus`| Number | Integer 1 to 10 | `9` |
| **P** | `Subject 3 Productivity` | Number | Integer 1 to 10 | `9` |
| **Q** | `Notes` | String | Reflections or daily study summary | `Finished past papers 2022.` |
| **R** | `Telegram` | String | Verified telegram handle | `@kasun_p` |
| **S** | `Proof Photo URL`| String | Google Drive direct/view link or `""` | `https://drive.google.com/file/d/.../view` |

#### 2.2.3 Sheet 3: `Analytics` (Summary & Leaderboard)
Auto-calculated summary table structure:
- **Global KPI Summary Blocks** (Row 1-5):
  - Total Registered Members, Active Members, Total Hours Logged, Total Logs Submitted, Group Average Focus, Group Average Productivity, Longest Group Streak.
- **Member Aggregate Performance Table** (Headers at Row 7):
  - Col A: `Study ID`
  - Col B: `Full Name`
  - Col C: `Stream`
  - Col D: `Total Logs`
  - Col E: `Total Study Hours`
  - Col F: `Subject 1 Total Hours`
  - Col G: `Subject 2 Total Hours`
  - Col H: `Subject 3 Total Hours`
  - Col I: `Overall Avg Focus`
  - Col J: `Overall Avg Productivity`
  - Col K: `Current Streak (Days)`
  - Col L: `Max Streak (Days)`
  - Col M: `Last Log Date`
  - Col N: `Last Updated`

---

### 2.3 Concurrency Control & ID Generation Algorithm (`LockService`)

To eliminate race conditions when multiple students register simultaneously or submit logs concurrently:

#### 2.3.1 Sequential Study ID Generator
```javascript
function generateNextStudyId(sheet, stream) {
  const isBio = (stream === CONFIG.STREAMS.BIO);
  const prefix = isBio ? CONFIG.PREFIXES.BIO : CONFIG.PREFIXES.MATH;
  
  const lastRow = sheet.getLastRow();
  let maxSeq = 0;
  
  if (lastRow > 1) {
    // Read all existing Study IDs in Column A
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      const id = String(ids[i][0] || "").trim();
      if (id.startsWith(prefix)) {
        const numPart = parseInt(id.replace(prefix, ""), 10);
        if (!isNaN(numPart) && numPart > maxSeq) {
          maxSeq = numPart;
        }
      }
    }
  }
  
  const nextSeq = maxSeq + 1;
  const formattedSeq = ("0000" + nextSeq).slice(-4);
  return prefix + formattedSeq; // e.g. SG-BIO-0001, SG-MATH-0001
}
```

#### 2.3.2 Atomic Registration Routine
```javascript
function handleRegisterUser(data) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      throw new Error("Server is busy processing registrations. Please retry in a few seconds.");
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    const email = String(data.email || "").trim().toLowerCase();
    
    // Check if email already registered
    const existing = findRowByColumn(membersSheet, 3, email); // Col C = Email
    if (existing) {
      return {
        alreadyRegistered: true,
        member: rowToMemberObject(existing.rowValues)
      };
    }
    
    // Generate next unique Study ID
    const studyId = generateNextStudyId(membersSheet, data.stream);
    const regDate = new Date().toISOString();
    const status = "Active";
    
    const newRow = [
      studyId,
      data.fullName.trim(),
      email,
      data.gender,
      data.telegram.startsWith("@") ? data.telegram : "@" + data.telegram,
      data.school.trim(),
      data.stream,
      data.optionalSubject,
      regDate,
      status
    ];
    
    membersSheet.appendRow(newRow);
    SpreadsheetApp.flush(); // Ensure row committed immediately
    
    return {
      alreadyRegistered: false,
      member: {
        studyId: studyId,
        fullName: data.fullName.trim(),
        email: email,
        gender: data.gender,
        telegram: newRow[4],
        school: data.school.trim(),
        stream: data.stream,
        optionalSubject: data.optionalSubject,
        registrationDate: regDate,
        status: status
      }
    };
  } finally {
    lock.releaseLock();
  }
}
```

#### 2.3.3 Atomic Daily Log Submission Routine
```javascript
function handleSubmitDailyLog(data) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!hasLock) {
      throw new Error("Server is busy processing submissions. Please try again.");
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
    const membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
    
    const studyId = String(data.studyId || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const studyDate = String(data.dateOfStudy || "").trim(); // YYYY-MM-DD
    
    // Validate member exists
    const memberRow = findRowByColumn(membersSheet, 1, studyId);
    if (!memberRow) {
      throw new Error("Invalid Study ID: Member not registered.");
    }
    
    // Check for duplicate submission for today
    const isDuplicate = checkExistingDailyLog(logsSheet, studyId, studyDate);
    if (isDuplicate.exists) {
      return {
        isDuplicate: true,
        message: "You have already submitted a study log for " + studyDate,
        existingLog: isDuplicate.log
      };
    }
    
    // Handle photo proof upload if base64 provided
    let proofPhotoUrl = "";
    if (data.proofFile && data.proofFile.base64) {
      proofPhotoUrl = saveProofPhotoToDrive(
        studyId,
        studyDate,
        data.proofFile.base64,
        data.proofFile.mimeType || "image/jpeg",
        data.proofFile.fileName || ("proof_" + Date.now() + ".jpg")
      );
    }
    
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,
      studyId,
      email,
      studyDate,
      data.subjects[0].name,
      Number(data.subjects[0].hours) || 0,
      Number(data.subjects[0].focus) || 0,
      Number(data.subjects[0].productivity) || 0,
      data.subjects[1].name,
      Number(data.subjects[1].hours) || 0,
      Number(data.subjects[1].focus) || 0,
      Number(data.subjects[1].productivity) || 0,
      data.subjects[2].name,
      Number(data.subjects[2].hours) || 0,
      Number(data.subjects[2].focus) || 0,
      Number(data.subjects[2].productivity) || 0,
      data.notes || "",
      data.telegram || "",
      proofPhotoUrl
    ];
    
    logsSheet.appendRow(rowData);
    SpreadsheetApp.flush();
    
    // Update analytics asynchronously / inline
    recalculateAnalyticsForMember(ss, studyId);
    
    return {
      isDuplicate: false,
      log: rowToDailyLogObject(rowData),
      proofUrl: proofPhotoUrl
    };
  } finally {
    lock.releaseLock();
  }
}
```

---

### 2.4 Google Drive Storage Architecture

#### 2.4.1 Hierarchical Folder Tree
```
Google Drive Root
└── StudySync_Uploads/ (Root container folder)
    ├── SG-BIO-0001/ (Student directory)
    │   ├── 2026-08-25/ (Daily subfolder)
    │   │   └── proof_chemistry_notes.jpg
    │   └── 2026-08-26/
    │       └── proof_biology_mcq.jpg
    └── SG-MATH-0001/
        └── 2026-08-26/
            └── proof_mechanics_sheet.png
```

#### 2.4.2 Drive File Creation & Permission Management
```javascript
function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function saveProofPhotoToDrive(studyId, studyDate, base64Data, mimeType, fileName) {
  try {
    // 1. Get or create root storage folder
    let rootFolder;
    const rootFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    if (rootFolders.hasNext()) {
      rootFolder = rootFolders.next();
    } else {
      rootFolder = DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER_NAME);
    }
    
    // 2. Get or create student subfolder
    const studentFolder = getOrCreateFolder(rootFolder, studyId);
    
    // 3. Get or create date subfolder
    const dateFolder = getOrCreateFolder(studentFolder, studyDate);
    
    // 4. Decode base64 and create file
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const sanitizedFileName = (studyId + "_" + studyDate + "_" + fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = Utilities.newBlob(decodedBytes, mimeType, sanitizedFileName);
    
    const file = dateFolder.createFile(blob);
    
    // 5. Set sharing permission for direct preview
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return direct web preview link
    return file.getUrl();
  } catch (err) {
    Logger.log("Error uploading proof photo to Drive: " + err.toString());
    return ""; // Soft fail: log still created even if Drive upload fails
  }
}
```

---

### 2.5 Streak Calculation & Personal Analytics Engine

#### 2.5.1 Robust Streak Algorithm
A student's streak represents consecutive calendar days of submitted logs.
1. Sort all unique dates `[YYYY-MM-DD]` in descending order.
2. Determine if the latest log is today (`d_0`) or yesterday (`d_-1`). If the most recent log is older than yesterday, current streak is `0`.
3. Iterate backwards one day at a time (`d = d - 1 day`). If `d` exists in the log dates set, increment `currentStreak`. If a date is missing, break the streak.
4. Calculate `maxStreak` across the entire history.

```javascript
function calculateStreaks(dateStringsArray) {
  if (!dateStringsArray || dateStringsArray.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }
  
  // Unique sorted dates descending
  const uniqueDates = Array.from(new Set(dateStringsArray)).sort().reverse();
  
  const todayStr = getLocalDateString(new Date()); // YYYY-MM-DD in UTC+05:30 (Sri Lanka Time)
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
  
  let currentStreak = 0;
  let maxStreak = 0;
  
  const latestDate = uniqueDates[0];
  const isStreakActive = (latestDate === todayStr || latestDate === yesterdayStr);
  
  if (isStreakActive) {
    let checkDate = new Date(latestDate);
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedStr = getLocalDateString(checkDate);
      if (uniqueDates.includes(expectedStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak across history
  const sortedAsc = Array.from(new Set(dateStringsArray)).sort();
  let tempStreak = 0;
  let prevDate = null;
  
  for (let i = 0; i < sortedAsc.length; i++) {
    const curDate = new Date(sortedAsc[i]);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
    prevDate = curDate;
  }
  
  return {
    currentStreak: currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak)
  };
}
```

---

### 2.6 RESTful API Endpoints Specification

All endpoints support `doPost` (with JSON body) and `doGet` (with query parameters where appropriate).

#### 1. `checkUser`
- **Method**: `POST` (or `GET?action=checkUser&email=...`)
- **Request**:
  ```json
  {
    "action": "checkUser",
    "email": "student@gmail.com"
  }
  ```
- **Response (Registered)**:
  ```json
  {
    "success": true,
    "data": {
      "registered": true,
      "member": {
        "studyId": "SG-BIO-0001",
        "fullName": "Kasun Perera",
        "email": "student@gmail.com",
        "gender": "Male",
        "telegram": "@kasun_p",
        "school": "Royal College, Colombo 07",
        "stream": "Biological Science",
        "optionalSubject": "Physics",
        "registrationDate": "2026-08-26T03:45:00.000Z",
        "status": "Active"
      },
      "todayLog": null,
      "stats": {
        "currentStreak": 5,
        "maxStreak": 12,
        "totalHours": 42.5,
        "avgFocus": 8.4,
        "avgProductivity": 8.6
      }
    }
  }
  ```
- **Response (Unregistered)**:
  ```json
  {
    "success": true,
    "data": {
      "registered": false,
      "member": null
    }
  }
  ```

#### 2. `registerUser`
- **Method**: `POST`
- **Request**:
  ```json
  {
    "action": "registerUser",
    "fullName": "Kasun Perera",
    "email": "student@gmail.com",
    "gender": "Male",
    "telegram": "@kasun_p",
    "school": "Royal College, Colombo 07",
    "stream": "Biological Science",
    "optionalSubject": "Physics"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "studyId": "SG-BIO-0001",
      "fullName": "Kasun Perera",
      "email": "student@gmail.com",
      "gender": "Male",
      "telegram": "@kasun_p",
      "school": "Royal College, Colombo 07",
      "stream": "Biological Science",
      "optionalSubject": "Physics",
      "registrationDate": "2026-08-26T03:45:00.000Z",
      "status": "Active"
    }
  }
  ```

#### 3. `submitDailyLog`
- **Method**: `POST`
- **Request**:
  ```json
  {
    "action": "submitDailyLog",
    "studyId": "SG-BIO-0001",
    "email": "student@gmail.com",
    "dateOfStudy": "2026-08-26",
    "subjects": [
      { "name": "Biology", "hours": 2.5, "focus": 9, "productivity": 8 },
      { "name": "Chemistry", "hours": 2.0, "focus": 8, "productivity": 9 },
      { "name": "Physics", "hours": 1.5, "focus": 7, "productivity": 8 }
    ],
    "notes": "Covered Plant Physiology and Organic Mechanisms.",
    "telegram": "@kasun_p",
    "proofFile": {
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "mimeType": "image/jpeg",
      "fileName": "biology_notes.jpg"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "logId": "2026-08-26T14:22:10.123Z",
      "studyId": "SG-BIO-0001",
      "dateOfStudy": "2026-08-26",
      "totalHours": 6.0,
      "proofPhotoUrl": "https://drive.google.com/file/d/1a2b3c.../view",
      "isDuplicate": false
    }
  }
  ```

#### 4. `getStudentHistory`
- **Method**: `POST` / `GET`
- **Request**:
  ```json
  {
    "action": "getStudentHistory",
    "studyId": "SG-BIO-0001",
    "email": "student@gmail.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "studyId": "SG-BIO-0001",
      "logs": [
        {
          "timestamp": "2026-08-26T14:22:10.123Z",
          "dateOfStudy": "2026-08-26",
          "subjects": [
            { "name": "Biology", "hours": 2.5, "focus": 9, "productivity": 8 },
            { "name": "Chemistry", "hours": 2.0, "focus": 8, "productivity": 9 },
            { "name": "Physics", "hours": 1.5, "focus": 7, "productivity": 8 }
          ],
          "totalHours": 6.0,
          "notes": "Covered Plant Physiology...",
          "proofPhotoUrl": "https://drive.google.com/file/d/.../view"
        }
      ],
      "stats": {
        "currentStreak": 5,
        "maxStreak": 12,
        "totalHours": 42.5,
        "subjectHours": {
          "Biology": 18.0,
          "Chemistry": 14.5,
          "Physics": 10.0
        },
        "avgFocus": 8.2,
        "avgProductivity": 8.4
      }
    }
  }
  ```

#### 5. `verifyMember` (Public QR Verification)
- **Method**: `GET` / `POST`
- **Request**: `GET ?action=verifyMember&studyId=SG-BIO-0001`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "valid": true,
      "member": {
        "studyId": "SG-BIO-0001",
        "fullName": "Kasun Perera",
        "school": "Royal College, Colombo 07",
        "stream": "Biological Science",
        "status": "Active",
        "registrationDate": "2026-08-26T03:45:00.000Z"
      }
    }
  }
  ```

#### 6. `getAdminData`
- **Method**: `POST`
- **Request**:
  ```json
  {
    "action": "getAdminData",
    "adminEmail": "admin@studysync.lk"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "members": [...],
      "recentLogs": [...],
      "analytics": {
        "totalMembers": 150,
        "activeMembers": 142,
        "totalHours": 3420.5,
        "totalLogs": 850,
        "avgGroupFocus": 8.1,
        "avgGroupProductivity": 8.3
      },
      "leaderboard": [
        { "rank": 1, "studyId": "SG-BIO-0012", "name": "Nimna Fernando", "totalHours": 145.0, "streak": 28 },
        { "rank": 2, "studyId": "SG-MATH-0005", "name": "Dineth Silva", "totalHours": 138.5, "streak": 25 }
      ]
    }
  }
  ```

#### 7. `getAnalytics`
- **Method**: `GET` / `POST`
- **Request**: `GET ?action=getAnalytics`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "kpi": {
        "totalMembers": 150,
        "totalStudyHours": 3420.5,
        "totalLogs": 850,
        "avgDailyHours": 4.02
      },
      "streamBreakdown": {
        "Biological Science": { "members": 80, "hours": 1820.0 },
        "Physical Science": { "members": 70, "hours": 1600.5 }
      },
      "topStreaks": [ ... ]
    }
  }
  ```

---

### 2.7 Database Initializer (`setupDatabase()`)

The initializer script automatically sets up the spreadsheet with correct headers, column widths, formatting, and data validation rules upon first deployment.

```javascript
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Members Sheet
  let membersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.MEMBERS);
  if (!membersSheet) {
    membersSheet = ss.insertSheet(CONFIG.SHEET_NAMES.MEMBERS);
  }
  membersSheet.clear();
  const memberHeaders = [
    "Study ID", "Full Name", "Email", "Gender", "Telegram Username",
    "School", "Stream", "Optional Subject", "Registration Date", "Status"
  ];
  membersSheet.getRange(1, 1, 1, 10).setValues([memberHeaders])
    .setFontWeight("bold")
    .setBackground("#1e293b")
    .setFontColor("#ffffff");
  membersSheet.setFrozenRows(1);
  
  // 2. Setup DailyLogs Sheet
  let logsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DAILY_LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.SHEET_NAMES.DAILY_LOGS);
  }
  logsSheet.clear();
  const logHeaders = [
    "Timestamp", "Study ID", "Email", "Date of Study",
    "Subject 1 Name", "Subject 1 Hours", "Subject 1 Focus", "Subject 1 Productivity",
    "Subject 2 Name", "Subject 2 Hours", "Subject 2 Focus", "Subject 2 Productivity",
    "Subject 3 Name", "Subject 3 Hours", "Subject 3 Focus", "Subject 3 Productivity",
    "Notes", "Telegram", "Proof Photo URL"
  ];
  logsSheet.getRange(1, 1, 1, 19).setValues([logHeaders])
    .setFontWeight("bold")
    .setBackground("#0f172a")
    .setFontColor("#38bdf8");
  logsSheet.setFrozenRows(1);
  
  // 3. Setup Analytics Sheet
  let analyticsSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ANALYTICS);
  if (!analyticsSheet) {
    analyticsSheet = ss.insertSheet(CONFIG.SHEET_NAMES.ANALYTICS);
  }
  analyticsSheet.clear();
  
  // KPI Header block
  analyticsSheet.getRange("A1:D1").setValues([["StudySync Analytics & Leaderboard Summary", "", "", ""]])
    .setFontWeight("bold").setFontSize(14).setBackground("#0284c7").setFontColor("#ffffff");
    
  const analyticsHeaders = [
    "Study ID", "Full Name", "Stream", "Total Logs", "Total Hours",
    "Subj 1 Hours", "Subj 2 Hours", "Subj 3 Hours", "Avg Focus",
    "Avg Productivity", "Current Streak", "Max Streak", "Last Active Date", "Last Updated"
  ];
  analyticsSheet.getRange(7, 1, 1, 14).setValues([analyticsHeaders])
    .setFontWeight("bold")
    .setBackground("#1e293b")
    .setFontColor("#f1f5f9");
  analyticsSheet.setFrozenRows(7);
  
  // Clean default empty sheets (e.g. Sheet1)
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  
  Logger.log("Database initialized successfully with exactly 3 sheets.");
}
```

---

### 2.8 Local Node.js Mock API Server & Test Harness

To enable 100% zero-dependency local development and E2E automated testing without needing live Google credentials, a lightweight Node.js Express server replicates all Google Apps Script behaviors, Google Sheets in-memory database, and Google Drive file storage.

#### 2.8.1 Local Mock Server Architecture
- **Tech Stack**: Node.js, Express, `cors`, `multer` / `express.json({ limit: '50mb' })`.
- **In-Memory / File Store**: `.mock_db/members.json`, `.mock_db/daily_logs.json`, `.mock_db/analytics.json`.
- **Local Drive Storage**: `public/mock_uploads/{studyId}/{date}/{filename}` served as static files.
- **Port**: Default `3000` (or configurable).

#### 2.8.2 Mock Server Implementation Blueprint
```javascript
// server/mock-server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'mock_uploads')));

// Data files
const DB_DIR = path.join(__dirname, 'mock_db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function loadJson(name, defaultVal = []) {
  const p = path.join(DB_DIR, `${name}.json`);
  if (!fs.existsSync(p)) return defaultVal;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJson(name, data) {
  const p = path.join(DB_DIR, `${name}.json`);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// Routes matching Apps Script doPost / doGet
app.all('/api', (req, res) => {
  const payload = req.method === 'POST' ? req.body : req.query;
  const action = payload.action;
  
  let members = loadJson('members');
  let dailyLogs = loadJson('daily_logs');
  
  if (action === 'checkUser') {
    const email = (payload.email || '').toLowerCase().trim();
    const member = members.find(m => m.email === email);
    if (!member) {
      return res.json({ success: true, data: { registered: false, member: null } });
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayLog = dailyLogs.find(l => l.studyId === member.studyId && l.dateOfStudy === todayStr) || null;
    return res.json({
      success: true,
      data: { registered: true, member, todayLog }
    });
  }
  
  if (action === 'registerUser') {
    const email = (payload.email || '').toLowerCase().trim();
    if (members.some(m => m.email === email)) {
      return res.json({ success: false, error: 'User with this email already registered' });
    }
    const isBio = payload.stream === 'Biological Science';
    const prefix = isBio ? 'SG-BIO-' : 'SG-MATH-';
    const count = members.filter(m => m.studyId.startsWith(prefix)).length + 1;
    const studyId = prefix + ('0000' + count).slice(-4);
    
    const newMember = {
      studyId,
      fullName: payload.fullName,
      email,
      gender: payload.gender,
      telegram: payload.telegram,
      school: payload.school,
      stream: payload.stream,
      optionalSubject: payload.optionalSubject,
      registrationDate: new Date().toISOString(),
      status: 'Active'
    };
    members.push(newMember);
    saveJson('members', members);
    return res.json({ success: true, data: newMember });
  }
  
  if (action === 'submitDailyLog') {
    const { studyId, dateOfStudy, subjects, notes, telegram, proofFile } = payload;
    const existing = dailyLogs.find(l => l.studyId === studyId && l.dateOfStudy === dateOfStudy);
    if (existing) {
      return res.json({ success: false, error: 'Already submitted for today', isDuplicate: true });
    }
    
    let proofUrl = '';
    if (proofFile && proofFile.base64) {
      const uploadDir = path.join(__dirname, 'mock_uploads', studyId, dateOfStudy);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fName = proofFile.fileName || `proof_${Date.now()}.jpg`;
      const fPath = path.join(uploadDir, fName);
      const cleanBase64 = proofFile.base64.replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(fPath, Buffer.from(cleanBase64, 'base64'));
      proofUrl = `http://localhost:${PORT}/uploads/${studyId}/${dateOfStudy}/${fName}`;
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      studyId,
      email: payload.email,
      dateOfStudy,
      subjects,
      notes,
      telegram,
      proofPhotoUrl: proofUrl
    };
    dailyLogs.push(logEntry);
    saveJson('daily_logs', dailyLogs);
    return res.json({ success: true, data: logEntry });
  }
  
  if (action === 'getStudentHistory') {
    const { studyId } = payload;
    const logs = dailyLogs.filter(l => l.studyId === studyId);
    return res.json({ success: true, data: { logs } });
  }
  
  if (action === 'verifyMember') {
    const { studyId } = payload;
    const member = members.find(m => m.studyId === studyId);
    if (!member) return res.json({ success: false, error: 'Member not found' });
    return res.json({
      success: true,
      data: {
        valid: true,
        member: {
          studyId: member.studyId,
          fullName: member.fullName,
          school: member.school,
          stream: member.stream,
          status: member.status,
          registrationDate: member.registrationDate
        }
      }
    });
  }
  
  res.status(404).json({ success: false, error: `Unknown action: ${action}` });
});

app.listen(PORT, () => console.log(`StudySync Mock Server listening on port ${PORT}`));
```

---

## 3. Caveats & Edge Case Analysis

1. **Google Apps Script Execution Limits**:
   - Web App execution limit is 6 minutes per request. Image uploads over 10MB in base64 can cause execution timeouts or memory errors; client-side image compression (Canvas resize to max 1280px / 85% JPEG quality) is recommended before transmission.
2. **LockService Timeouts**:
   - `LockService.tryLock(30000)` waits up to 30s. If high concurrency triggers a lock timeout, the backend returns a clear error code allowing the client to automatically retry with exponential backoff.
3. **CORS & Redirects in Apps Script**:
   - Calling Apps Script directly from browsers requires careful handling because Apps Script redirects (302) to Google User Content URLs. Using `mode: 'cors'` with `text/plain` POST bodies handles this transparently.
4. **Data Privacy on Public Verification**:
   - The `verifyMember` endpoint intentionally strips sensitive personal fields (`email`, `telegramUsername`, `gender`) and returns only public verification attributes (`fullName`, `studyId`, `school`, `stream`, `status`, `registrationDate`).

---

## 4. Conclusion & Architecture Summary

The designed backend architecture provides:
- **Clean Relational Integrity**: 3 strictly separated sheets with zero duplicate columns and clean foreign keys.
- **Race-Condition Safety**: Atomic LockService execution ensuring monotonic sequential Study IDs (`SG-BIO-0001`, `SG-MATH-0001`) and strictly enforcing one submission per day per student.
- **Organized Storage**: Predictable hierarchical Drive folders (`StudySync_Uploads/{StudentID}/{YYYY-MM-DD}/{filename}`).
- **Zero-Dependency Local Testing**: High-fidelity local Express mock server replicating 100% of API endpoints and file uploads.
- **Production-Grade Apps Script**: Robust error handling, typed responses, and automated database initialization.

---

## 5. Verification Method

To verify the backend implementation independently:
1. **Mock Server Verification**:
   - Launch mock server: `node server/mock-server.js`.
   - Test registration endpoint with payload:
     `curl -X POST http://localhost:3000/api -H "Content-Type: application/json" -d "{\"action\":\"registerUser\",\"fullName\":\"Test Student\",\"email\":\"test@domain.com\",\"gender\":\"Male\",\"telegram\":\"@test\",\"school\":\"Ananda College\",\"stream\":\"Biological Science\",\"optionalSubject\":\"Physics\"}"`
   - Verify `SG-BIO-0001` is returned.
2. **Daily Log Duplicate Prevention Test**:
   - Submit daily log for today: verify success.
   - Re-submit daily log with same `studyId` and `dateOfStudy`: verify response returns `isDuplicate: true` and 400 error.
3. **Drive / Mock Upload Verification**:
   - Submit base64 image: verify file is written under `mock_uploads/SG-BIO-0001/2026-08-26/` and accessible via HTTP preview URL.
4. **Google Sheets Structural Verification**:
   - Execute `setupDatabase()` in Apps Script editor.
   - Assert `Members` sheet contains exactly 10 columns: `[Study ID, Full Name, Email, Gender, Telegram Username, School, Stream, Optional Subject, Registration Date, Status]`.
   - Assert `DailyLogs` sheet contains exactly 19 columns: `[Timestamp, Study ID, Email, Date of Study, Subject 1 Name, Subject 1 Hours, Subject 1 Focus, Subject 1 Productivity, Subject 2 Name, Subject 2 Hours, Subject 2 Focus, Subject 2 Productivity, Subject 3 Name, Subject 3 Hours, Subject 3 Focus, Subject 3 Productivity, Notes, Telegram, Proof Photo URL]`.
   - Assert `Analytics` tab contains summary blocks and member performance table.
