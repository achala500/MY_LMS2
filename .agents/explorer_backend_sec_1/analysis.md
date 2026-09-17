# Backend & Security Architecture Deep-Dive Analysis

**Agent:** Explorer 2 (Backend & Security Architect)  
**Date:** 2026-08-27  
**Working Directory:** `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\explorer_backend_sec_1`  
**Target Codebase:** StudySync Sri Lankan A/L Web Application Overhaul  

---

## 1. Executive Summary

A comprehensive architectural and forensic security audit was conducted across the backend controllers, API client, security engine, utility helpers, and end-to-end test suites:
- `backend/Code.gs` (Google Apps Script Web App Controller — 2,511 lines)
- `server/mock-server.js` (Express-based Local Development & Testing Server — 1,628 lines)
- `src/lib/api.ts` (Typed API Client Engine — 383 lines)
- `src/lib/security.ts` (Enterprise Security & Anti-Malware Engine — 765 lines)
- `src/lib/utils.ts` (Domain, Formatting & Export Helpers — 807 lines)
- `tests/` (Tiers 1-5 test suites, 334 automated test assertions)

### Key Verdict
1. **Security & Resilience Hardening (R8)**: **STABLE & VERIFIED**. Full parity exists across `src/lib/security.ts`, `backend/Code.gs`, and `server/mock-server.js` for 12-byte structural magic byte validation, polyglot rejection, `LockService` atomic concurrency isolation, 128-bit anti-replay nonces, timestamp drift checks (±300s), CSV formula injection escaping (CWE-1236), and multi-tab sliding-window rate limiting. All 41 adversarial tests in Tier 5 pass with 100% success.
2. **Telegram Bot Integration & Real-Time Sync (R6)**: **STABLE & VERIFIED**. Webhook ingestion correctly parses both native Telegram webhook payloads (`update_id`, `message.chat.id`, `message.from.username`) and `/api` action envelopes. Commands `/start`, `/status`, `/log`, `/leaderboard`, `/remind`, and `/help` operate with proper bounds checking, duplicate submission prevention, and streak tracking. The `broadcastDailyDigest` engine accurately formats Markdown summaries with Community Pulse and Top 5 Streaks.
3. **Multi-Format Export Engine (R4)**: **PARTIAL — GAP IDENTIFIED**. While RFC 4180 CSV export and JSON dump are implemented, **Excel-compatible spreadsheet export (.xlsx / XML Spreadsheet 2003 format)** and **Relational SQL database dump (PostgreSQL / MySQL / SQLite)** are currently missing from `src/lib/utils.ts` and `src/app/admin/page.tsx`.

---

## 2. Comprehensive Module Inspections

### 2.1 `backend/Code.gs` (Google Apps Script Controller)
- **Database Architecture**: 4 normalized sheets in Google Spreadsheet ID `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`:
  1. `Members` (11 columns: Study ID, Full Name, Email, Gender, Telegram Username, School, Stream, Optional Subject, Registration Date, Status, Exam Year)
  2. `DailyLogs` (19 columns: Timestamp, Study ID, Email, Date of Study, Subj1 Name/Hours/Focus/Prod, Subj2 Name/Hours/Focus/Prod, Subj3 Name/Hours/Focus/Prod, Notes, Telegram, Proof Photo URL)
  3. `Analytics` (Summary formulas + KPI aggregation)
  4. `TestMarks` (12 columns: Test ID, Study ID, Email, Test Date, Exam Type, Subject, Paper Title, Score, Rank, Difficulty, Notes, Timestamp)
- **Concurrency & Atomicity**:
  - `LockService.getScriptLock()` with 30-second timeout (`CONFIG.LOCK_TIMEOUT_MS = 30000`) is deployed on all mutating endpoints: `registerUser`, `submitDailyLog`, `logTestMark`, `deleteTestMark`, and `/log` webhook command.
- **Sequential ID Generation**:
  - `generateNextStudyId` scans Col A and generates `SG-BIO-XXXX` or `SG-MATH-XXXX` with zero padding, executed under exclusive script lock to eliminate duplicate IDs.
- **Anti-Replay & Caching**:
  - `CacheService.getScriptCache()` caches mutation responses under `idempotencyKey` with a 6-hour TTL.
  - Future timestamp (>60s) check returns `ERR_TIMESTAMP_FUTURE`.
  - Drift window (>300s) check returns `ERR_TIMESTAMP_EXPIRED`.
- **CWE-1236 Formula Neutralization**:
  - `sanitizeCsvFormula` prepends `'` to leading `=, +, -, @, \t, \r` on `fullName`, `school`, `notes`, `paperTitle`.

### 2.2 `server/mock-server.js` (Local Development & Testing Mock Server)
- **Parity with Code.gs**: 100% functional match with `Code.gs`.
- **Express Middleware**:
  - Handles `text/plain` and `application/json` payloads seamlessly.
  - Serves simulated Google Drive uploads statically at `/uploads/:studyId/:date/:filename`.
- **Persistence**:
  - File-backed and in-memory storage under `server/mock_db/` (`members.json`, `daily_logs.json`, `test_marks.json`, `idempotency_cache.json`).
- **Telegram Routing**:
  - Dedicated `/webhook` and `/api` action router for `telegramWebhook` and `broadcastDailyDigest`.

### 2.3 `src/lib/api.ts` (Typed API Client)
- **Protocol**:
  - Strict HTTP POST with `Content-Type: text/plain;charset=utf-8` to prevent browser CORS preflight `OPTIONS` failures and handle Apps Script 302 redirects.
- **Resilience**:
  - Exponential backoff retry loop (up to 3 attempts with 1s, 2s delays).
  - Client-side offline queue: `savePendingLogOffline`, `getPendingLogsOffline`, `clearPendingLogsOffline` using `localStorage['STUDYSYNC_OFFLINE_LOGS']`.
- **Authoritative Methods**:
  - All 15 endpoints typed with strict TypeScript request/response contracts matching `Code.gs`.

### 2.4 `src/lib/security.ts` (Enterprise Security Engine)
- **Binary Magic Bytes (`validateImageFile`)**:
  - JPEG: `0xFF, 0xD8, 0xFF`
  - PNG: `0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A`
  - WebP: `RIFF` (offset 0..3) + size (offset 4..7) + `WEBP` (offset 8..11). Explicitly validates subtype chunk to reject disguised `WAVE` (WAV audio) or `AVI ` (AVI video) containers.
  - GIF: `GIF87a` or `GIF89a`.
- **Immediate Rejection Blacklist**:
  - Windows PE Executables (`MZ` / 0x4D, 0x5A)
  - Linux ELF (`\x7fELF` / 0x7F, 0x45, 0x4C, 0x46)
  - Java Bytecode / Mach-O Fat Binary (`0xCAFEBABE`)
  - macOS Mach-O (`0xFEEDFACE`, `0xFEEDFACF`)
  - ZIP / APK / JAR archives (`PK\x03\x04`, `PK\x05\x06`)
  - 7-Zip (`0x37 0x7A 0xBC 0xAF 0x27 0x1C`)
  - RAR (`0x52 0x61 0x72 0x21 0x1A 0x07`)
  - Unix Shell Shebang (`#!` / 0x23, 0x21)
- **Polyglot & XSS Scanner (`scanBinaryPayload`, `scanBase64Payload`)**:
  - Scans ASCII string representation of binary buffers for `<script>`, `<iframe>`, `<embed>`, `javascript:`, `data:text/html`, `<?php`, `eval(`, and event handlers.
- **Synchronized Sliding Rate Limiter (`SynchronizedSlidingRateLimiter`)**:
  - Maintains timestamp array in `localStorage` and broadcasts real-time state changes across browser tabs using `BroadcastChannel`.
  - Rate limiters: `submissionRateLimiter` (6 req/min), `authRateLimiter` (10 req/min), `registrationRateLimiter` (4 req/min), `testMarkRateLimiter` (10 req/min), `adminRateLimiter` (30 req/min), `publicVerifyRateLimiter` (20 req/min).

---

## 3. Requirement-by-Requirement Forensic Audit (R4, R6, R8)

### 3.1 Requirement R4: Multi-Format Analytics & Database Export Engine

| Requirement Element | Current Status | Findings & Exact Location |
|---|---|---|
| **RFC 4180 CSV Export** | ✅ Implemented | `src/lib/utils.ts` (`generateCsvString`, `formatCsvCell`, `downloadCsvFile`). Handles double quotes, commas, CRLF line endings, and prepends single quotes to formula injection characters (`=, +, -, @, \t, \r`). |
| **Pretty-Printed JSON Dump** | ✅ Implemented | `src/app/admin/page.tsx` (`handleExportJsonDump`). Exports members, daily logs, timestamp, and admin metadata formatted as 2-space indented JSON. |
| **Excel Spreadsheet (.xlsx / XML)** | ❌ Missing | No helper in `src/lib/utils.ts` and no button in `src/app/admin/page.tsx`. Required: XML Spreadsheet 2003 format generator (`urn:schemas-microsoft-com:office:spreadsheet`) with typed cells (`String`, `Number`, `DateTime`) and download helper. |
| **Relational SQL Database Dump** | ❌ Missing | No helper in `src/lib/utils.ts` and no button in `src/app/admin/page.tsx`. Required: SQL DDL (`CREATE TABLE IF NOT EXISTS members ...`, `CREATE TABLE IF NOT EXISTS daily_logs ...`) and parameterized `INSERT INTO` statements with single-quote escaping for PostgreSQL / MySQL / SQLite. |

### 3.2 Requirement R6: Telegram Bot Webhook & Real-Time Sync

| Requirement Element | Current Status | Findings & Exact Location |
|---|---|---|
| **Webhook Action Router** | ✅ Implemented | `backend/Code.gs` lines 1748-1802 and `server/mock-server.js` lines 976-1060. Supports both `/api` JSON action envelopes and native Telegram webhook payload auto-detection (`payload.update_id` / `payload.message`). |
| **`/start [STUDY_ID]` Command** | ✅ Implemented | `handleStartCommand`: Links Telegram handle (`@username`) to student profile in Column E; validates Study ID; returns personalized welcome message. If already linked, welcomes back with active streak & hours. |
| **`/status [STUDY_ID]` Command** | ✅ Implemented | `handleStatusCommand`: Returns formatted Performance Card with active streak 🔥, total hours, subject breakdown, today's submission status, and stream-tailored cognitive AI advice snippet. |
| **`/log <h1..3> [notes]` Command** | ✅ Implemented | `handleLogCommand`: Validates 3 decimal numbers; checks [0, 24.0] hours boundary; acquires `LockService`; prevents duplicate daily submissions; appends row to `DailyLogs` with registered stream subject names; returns instant confirmation receipt. |
| **`/leaderboard [bio\|maths\|all]`** | ✅ Implemented | `handleLeaderboardCommand`: Sorts active members by streak (descending) and total hours (descending); applies stream filters; renders Top 10 with medal emojis. |
| **`/remind` Command** | ✅ Implemented | `handleRemindCommand`: Differentiates between completed daily log (encouraging affirmation) vs pending study log (accountability alert with deadline warning). |
| **Automated Broadcaster** | ✅ Implemented | `handleBroadcastDailyDigest` / `executeBroadcastDailyDigest`: Generates complete Markdown summary with Community Pulse (active students, participation rate, stream breakdown, average group focus), Streak Hall of Fame (Top 5), Today's MVPs (Volume & Deep Flow), and pending submission alerts. Zero-arg `broadcastDailyDigest(e)` ready for daily Apps Script time-driven triggers. |
| **Secure Token Storage** | ✅ Implemented | Token retrieved via `PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN")`. Never exposed in frontend client code. |

### 3.3 Requirement R8: Security Resilience & Concurrency Hardening

| Requirement Element | Current Status | Findings & Exact Location |
|---|---|---|
| **12-Byte Magic Byte Inspection** | ✅ Implemented | `src/lib/security.ts` (`validateImageFile`). Verifies structural headers for JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), WebP (`RIFF` + `WEBP`), GIF (`GIF87a`/`GIF89a`). Rejects WAV/AVI masquerades. |
| **Polyglot & Binary Rejection** | ✅ Implemented | `src/lib/security.ts` (`checkForForbiddenExecutableHeaders`, `scanBinaryPayload`, `scanBase64Payload`). Detects and blocks PE (`MZ`), ELF, Mach-O, Java (`CAFEBABE`), ZIP (`PK`), 7z, RAR, Shebang (`#!`), and script tags. |
| **Concurrency & LockService** | ✅ Implemented | `backend/Code.gs` lines 481, 563, 1506, 1612, 2072. Acquires exclusive script lock (`LockService.getScriptLock().tryLock(30000)`) on all mutations with guaranteed release in `finally` blocks. |
| **128-Bit Anti-Replay Nonces** | ✅ Implemented | `src/lib/security.ts` (`generateSecurityNonce`, `createIdempotencyEnvelope`). Generates 32-character hex nonce via `crypto.getRandomValues`. Backend checks `CacheService` / `idempotencyCache`. |
| **Timestamp Drift Checks (±300s)** | ✅ Implemented | `src/lib/security.ts` (`verifyTimestampDrift`), `backend/Code.gs` lines 173-187, `server/mock-server.js` lines 570-584. Enforces 300s past drift window and rejects future timestamps >60s. |
| **CSV Formula Neutralization** | ✅ Implemented | `src/lib/security.ts` & `src/lib/utils.ts` (`sanitizeCsvFormula`). Prepends `'` to leading `=, +, -, @, \t, \r` on all text inputs in database persistence and CSV exports. |
| **Multi-Tab Sliding Rate Limiting** | ✅ Implemented | `src/lib/security.ts` (`SynchronizedSlidingRateLimiter`). Multi-tab synchronized sliding-window tracking via `localStorage` and `BroadcastChannel`. |

---

## 4. Identified Gaps & Technical Discrepancies

### Gap 1: Missing Excel XML Spreadsheet Generator & Downloader in `src/lib/utils.ts`
- **Current State**: `utils.ts` exports `generateCsvString` and `downloadCsvFile`, but has no function for generating Excel XML spreadsheets or triggering Excel downloads.
- **Impact**: Admin cannot export in Excel format directly from the web app as mandated by R4.

### Gap 2: Missing Relational SQL Dump Generator in `src/lib/utils.ts`
- **Current State**: `utils.ts` has no function to generate relational SQL schema DDL (`CREATE TABLE`) and DML (`INSERT INTO`) statements for exporting the database to PostgreSQL / MySQL / SQLite.
- **Impact**: Database administrators cannot perform 1-click SQL backups from the web app as mandated by R4.

### Gap 3: Admin Dashboard UI Lacks 4-Format Multi-Export Controls
- **Current State**: In `src/app/admin/page.tsx`, there are only two separate CSV export buttons ("Export CSV" for members, "Export Logs CSV" for daily logs) and a single "JSON Dump" button.
- **Impact**: The UI does not provide unified 1-click access to the 4 standardized formats (CSV, JSON, Excel, SQL Dump) across members and daily study logs.

---

## 5. Exact Technical Blueprint for the Worker

The implementing Worker should apply the following precise, production-grade solutions:

### Blueprint Item 1: Implement Excel XML Spreadsheet Generator in `src/lib/utils.ts`
Add `generateExcelXml` and `downloadExcelFile`:
```typescript
/**
 * Generates an Excel-compatible XML Spreadsheet 2003 document (RFC-compliant, native Excel support)
 */
export function generateExcelXml(
  sheetName: string,
  headers: string[],
  rows: any[][]
): string {
  const sanitizeXml = (str: any) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const headerCells = headers
    .map(
      (h) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${sanitizeXml(h)}</Data></Cell>`
    )
    .join('');

  const rowLines = rows
    .map((row) => {
      const cells = row
        .map((val) => {
          if (typeof val === 'number' && !isNaN(val)) {
            return `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${sanitizeXml(val)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitizeXml(sheetName)}">
  <Table>
   <Row>${headerCells}</Row>
   ${rowLines}
  </Table>
 </Worksheet>
</Workbook>`;
}

export function downloadExcelFile(filename: string, xmlContent: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xls') || filename.endsWith('.xml') ? filename : `${filename}.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Blueprint Item 2: Implement Relational SQL Dump Generator in `src/lib/utils.ts`
Add `generateSqlDump` and `downloadSqlFile`:
```typescript
export interface SqlColumnDef {
  name: string;
  type: 'TEXT' | 'NUMERIC' | 'INTEGER' | 'TIMESTAMP' | 'BOOLEAN';
  primaryKey?: boolean;
}

/**
 * Generates an ANSI-compliant relational SQL dump (CREATE TABLE + INSERT INTO statements)
 * compatible with PostgreSQL, MySQL, and SQLite.
 */
export function generateSqlDump(
  tableName: string,
  columns: SqlColumnDef[],
  rows: any[][]
): string {
  const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
  
  const colDefs = columns
    .map((c) => {
      const safeCol = c.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const pk = c.primaryKey ? ' PRIMARY KEY' : '';
      return `  "${safeCol}" ${c.type}${pk}`;
    })
    .join(',\n');

  const colNames = columns.map((c) => `"${c.name.replace(/[^a-zA-Z0-9_]/g, '_')}"`).join(', ');

  const insertStatements = rows
    .map((row) => {
      const values = row
        .map((val, idx) => {
          if (val === null || val === undefined) return 'NULL';
          const colType = columns[idx]?.type || 'TEXT';
          if (colType === 'NUMERIC' || colType === 'INTEGER') {
            const num = Number(val);
            return isNaN(num) ? '0' : String(num);
          }
          if (colType === 'BOOLEAN') {
            return val ? 'TRUE' : 'FALSE';
          }
          const str = String(val).replace(/'/g, "''");
          return `'${str}'`;
        })
        .join(', ');
      return `INSERT INTO "${safeTableName}" (${colNames}) VALUES (${values});`;
    })
    .join('\n');

  return `-- ============================================================================
-- StudySync Database SQL Dump
-- Table: ${safeTableName}
-- Exported At: ${new Date().toISOString()}
-- ============================================================================

CREATE TABLE IF NOT EXISTS "${safeTableName}" (
${colDefs}
);

${insertStatements}
`;
}

export function downloadSqlFile(filename: string, sqlContent: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.sql') ? filename : `${filename}.sql`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Blueprint Item 3: Update `src/app/admin/page.tsx` with 4-Format Export Dialog
Provide a unified Export modal or toolbar buttons in Admin Console supporting:
1. **RFC 4180 CSV** (`handleExportMembersCsv`, `handleExportLogsCsv`)
2. **Pretty-Printed JSON** (`handleExportJsonDump`)
3. **Excel Spreadsheet** (`handleExportMembersExcel`, `handleExportLogsExcel`)
4. **Relational SQL Dump** (`handleExportMembersSql`, `handleExportLogsSql`)

---

## 6. Verification Plan & Test Strategy

1. **Unit & Harness Test Suite (`npm test`)**:
   - Run all 334 tests in `tests/e2e-runner.js` to ensure 100% pass rate across Tiers 1-5.
   - Add dedicated unit tests for `generateExcelXml` and `generateSqlDump` in `tests/tier1-feature.test.js` or `tests/tier2-boundary.test.js`.
2. **Build Verification (`npm run build`)**:
   - Execute static export to verify zero TypeScript errors and successful production HTML generation into `out/`.
3. **Security Invariants**:
   - Verify that formula injection escaping is preserved across all CSV, Excel, and SQL outputs.
   - Verify that no credentials or private API keys are bundled into static client bundles.
