# StudySync — Google Apps Script Backend & Database Setup Guide

This directory contains the production-grade **Google Apps Script backend** (`Code.gs`) and manifest (`appsscript.json`) for the **StudySync** Sri Lankan A/L Daily Study & Member Management Web Application.

---

## 1. Architecture Overview

- **Engine**: Google Apps Script (V8 runtime) deployed as a Web App (`doGet` / `doPost`).
- **Database**: 3-Sheet Normalized Google Spreadsheet (`Members`, `DailyLogs`, `Analytics`).
- **Storage**: Google Drive hierarchical folder structure (`StudySync_Uploads/{StudentID}/{YYYY-MM-DD}/{filename}`).
- **Concurrency**: Apps Script `LockService` for atomic sequential Study ID generation (`SG-BIO-0001` / `SG-MATH-0001`) and race-condition prevention during daily submissions.
- **Authentication & Security**: Google Sign-In with 1:1 email mapping and protected admin whitelist.

---

## 2. Google Sheets Database Schema (3 Sheets)

### Sheet 1: `Members` (Exactly 10 Columns)
Primary unique key is **Email** (Column C). Unique public natural key is **Study ID** (Column A).

| Column | Header | Data Type | Description / Constraints |
|---|---|---|---|
| **A** | `Study ID` | String | Sequential ID (`SG-BIO-0001` / `SG-MATH-0001`) |
| **B** | `Full Name` | String | Student's full legal name |
| **C** | `Email` | String | Unique Key (lowercased Google email) |
| **D** | `Gender` | String | `Male` / `Female` / `Other` |
| **E** | `Telegram Username` | String | Telegram handle (`@username`) |
| **F** | `School` | String | Sri Lankan School Name |
| **G** | `Stream` | String | `Biological Science` or `Physical Science` |
| **H** | `Optional Subject` | String | Bio: `Physics`/`Agriculture`; Maths: `Chemistry`/`ICT` |
| **I** | `Registration Date` | String | ISO 8601 UTC timestamp |
| **J** | `Status` | String | `Active` or `Inactive` (default: `Active`) |

### Sheet 2: `DailyLogs` (Exactly 19 Columns)
Foreign Key: `Study ID` $\to$ `Members.Study ID`. Composite unique constraint: `(Study ID, Date of Study)`.

| Column | Header | Data Type | Description |
|---|---|---|---|
| **A** | `Timestamp` | String | Submission timestamp (ISO 8601) |
| **B** | `Study ID` | String | Foreign Key matching `Members` Col A |
| **C** | `Email` | String | Student email address |
| **D** | `Date of Study` | String | Date of study in `YYYY-MM-DD` |
| **E** | `Subject 1 Name` | String | First stream subject name |
| **F** | `Subject 1 Hours` | Number | Numeric hours studied (e.g. `2.5`) |
| **G** | `Subject 1 Focus` | Number | Integer slider score `1` - `10` |
| **H** | `Subject 1 Productivity`| Number | Integer slider score `1` - `10` |
| **I** | `Subject 2 Name` | String | Second stream subject name |
| **J** | `Subject 2 Hours` | Number | Numeric hours studied |
| **K** | `Subject 2 Focus` | Number | Integer slider score `1` - `10` |
| **L** | `Subject 2 Productivity`| Number | Integer slider score `1` - `10` |
| **M** | `Subject 3 Name` | String | Third stream/optional subject name |
| **N** | `Subject 3 Hours` | Number | Numeric hours studied |
| **O** | `Subject 3 Focus` | Number | Integer slider score `1` - `10` |
| **P** | `Subject 3 Productivity`| Number | Integer slider score `1` - `10` |
| **Q** | `Notes` | String | Study reflections or covered chapters |
| **R** | `Telegram` | String | Telegram username |
| **S** | `Proof Photo URL` | String | Google Drive direct preview URL |

### Sheet 3: `Analytics`
Auto-calculated KPI cards (Total Members, Active Members, Total Study Hours, Total Daily Logs, Avg Focus/Productivity) and member performance leaderboard.

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Create a Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it **`StudySync Database`**.

### Step 2: Open Apps Script Editor
1. In the Google Sheet, click **Extensions** $\to$ **Apps Script**.
2. Rename the project to **`StudySync Backend`**.

### Step 3: Copy Files
1. Replace the default `Code.gs` content with the code from `backend/Code.gs`.
2. In Project Settings (gear icon), check **Show "appsscript.json" manifest file in editor**.
3. Open `appsscript.json` and paste the contents from `backend/appsscript.json`.

### Step 4: Configure Admin Whitelist & Folder
In `Code.gs`, verify or update `CONFIG.ADMIN_EMAILS` with authorized admin Google emails:
```javascript
const CONFIG = {
  ADMIN_EMAILS: [
    "admin@studysync.lk",
    "your.email@gmail.com"
  ],
  DRIVE_ROOT_FOLDER_NAME: "StudySync_Uploads",
  // ...
};
```

### Step 5: Initialize the Database
1. In the Apps Script toolbar, select the function **`setupDatabase`** from the function dropdown.
2. Click **Run**.
3. Grant the required permissions when prompted (Spreadsheets, Drive, External Requests).
4. Verify your spreadsheet now has the 3 structured sheets (`Members`, `DailyLogs`, `Analytics`).

### Step 6: Deploy as Web App
1. Click **Deploy** $\to$ **New deployment**.
2. Select type: **Web app** (gear icon $\to$ Web app).
3. Fill in settings:
   - **Description**: `StudySync Production v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial: Allows the frontend web client to communicate without Google Auth token hurdles)*
4. Click **Deploy**.
5. Copy the **Web App URL** (e.g. `https://script.google.com/macros/s/AKfycbx.../exec`).

### Step 7: Connect Frontend
Paste the Web App URL into your frontend configuration (`src/js/api.js`):
```javascript
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
```

---

## 4. API Reference

All requests return a standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-08-26T03:45:00.000Z"
}
```

### 1. `checkUser`
Check if an email is already registered and retrieve user profile, today's submission status, and personal streak stats.
- **Request (POST / GET)**:
  ```json
  { "action": "checkUser", "email": "student@gmail.com" }
  ```
- **Response**:
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

### 2. `registerUser`
Registers a new member with atomic `LockService` sequential ID generation (`SG-BIO-0001` or `SG-MATH-0001`).
- **Request (POST)**:
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
      "alreadyRegistered": false,
      "studyId": "SG-BIO-0001",
      "fullName": "Kasun Perera",
      "email": "student@gmail.com",
      "stream": "Biological Science",
      "status": "Active"
    }
  }
  ```

### 3. `submitDailyLog`
Submits a daily 3-subject study log with photo proof upload and same-day duplicate lock.
- **Request (POST)**:
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
    "notes": "Completed Plant Physiology past papers",
    "telegram": "@kasun_p",
    "proofFile": {
      "base64": "data:image/jpeg;base64,/9j/4AAQ...",
      "mimeType": "image/jpeg",
      "fileName": "proof_aug26.jpg"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "isDuplicate": false,
      "logId": "2026-08-26T14:22:10.123Z",
      "studyId": "SG-BIO-0001",
      "dateOfStudy": "2026-08-26",
      "totalHours": 6.0,
      "proofPhotoUrl": "https://drive.google.com/file/d/.../view"
    }
  }
  ```

### 4. `getStudentHistory`
Fetches a student's full log history, streak metrics, and subject hour distribution.
- **Request (POST / GET)**:
  ```json
  { "action": "getStudentHistory", "studyId": "SG-BIO-0001" }
  ```

### 5. `verifyMember`
Public verification endpoint for scanned QR codes.
- **Request (GET / POST)**: `GET ?action=verifyMember&studyId=SG-BIO-0001`
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

### 6. `getAdminData`
Protected query for admin dashboard (email whitelist protected).
- **Request (POST)**:
  ```json
  { "action": "getAdminData", "adminEmail": "admin@studysync.lk" }
  ```

### 7. `getAnalytics`
Group KPI summary, stream hours breakdown, and top streak leaderboard.
- **Request (GET / POST)**:
  ```json
  { "action": "getAnalytics" }
  ```

---

## 5. Concurrency & Security Architecture

1. **LockService Protection**:
   `LockService.getScriptLock()` prevents race conditions during high-volume concurrent registrations and log submissions, ensuring Study ID sequence continuity and zero double submissions.
2. **Data Privacy**:
   The `verifyMember` public endpoint excludes sensitive fields (email address, telegram handle) and only renders public verification attributes.
3. **Google Drive File Organization**:
   Uploaded images are stored under `StudySync_Uploads/{StudentID}/{YYYY-MM-DD}/{filename}`, maintaining a neat, compartmentalized storage tree.
