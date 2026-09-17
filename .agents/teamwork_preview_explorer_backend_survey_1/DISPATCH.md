# DISPATCH

You are teamwork_preview_explorer_backend_survey_1.
Working directory: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_backend_survey_1\
Authoritative Requirements: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md

Your mission:
Survey and design the complete Google Apps Script Backend (Code.gs), Google Sheets Database Schema, Google Drive Storage System, RESTful API Endpoints, Mock/Local Testing Server, and Deployment Configuration.

Specifically:
1. Google Apps Script Architecture (`Code.gs`):
   - `doGet(e)` and `doPost(e)` entry points handling JSON request payloads and CORS / ContentService JSON output.
   - Endpoint routing:
     - `action=checkUser` (check if email registered, return member profile + today's log status)
     - `action=registerUser` (validate fields, generate sequential Study ID `SG-BIO-XXXX`/`SG-MATH-XXXX`, append to Members sheet)
     - `action=submitDailyLog` (check for duplicate submission today, upload photo to Google Drive, append to DailyLogs sheet, trigger analytics update)
     - `action=getStudentHistory` (fetch past study logs for a member)
     - `action=getAdminData` (verify admin email, return all members, all logs, analytics summary, leaderboard)
     - `action=verifyMember` (public verification by Study ID or email)
     - `action=getAnalytics` (aggregate statistics, streaks, subject totals)
2. Google Sheets Database Engine:
   - Automated sheet setup script / initializer that creates exactly 3 sheets if not present: "Members" (10 columns), "DailyLogs" (19 columns), "Analytics" (summary table/metrics).
   - Thread-safe / LockService usage to prevent race conditions during sequential ID generation and daily log submission.
   - Data sanitization, zero duplicate email columns, clean foreign key linking `DailyLogs.Study ID` -> `Members.Study ID`.
3. Google Drive Storage:
   - Root folder management (`StudySync_Uploads`).
   - Hierarchical subfolder creation: `StudentID/YYYY-MM-DD/filename`.
   - Handling base64 encoded photo uploads from client, creating Drive files, setting appropriate sharing permissions, and returning the direct/viewable Drive file URL for the DailyLogs sheet.
4. Local Mock / Development Backend & E2E Test Server:
   - Design a local Node.js / Express mock API server or browser-level mock adapter that replicates 100% of the Apps Script API endpoints, sheets data storage, and drive uploads so the entire web app can be developed, previewed, and tested end-to-end locally without requiring live Google credentials.
   - Design setup documentation and deployment script for live Google Apps Script deployment (clasp / manual web app deployment guide).

Write your comprehensive findings and backend architecture blueprint to `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_backend_survey_1\handoff.md`.
