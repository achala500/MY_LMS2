# Milestone M8: Security Hardening, Binary Validation & Concurrency Resilience Handoff Report

## 1. Observation
1. **`src/lib/security.ts`**:
   - Implemented 12-byte structural header verification for JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A` + `IHDR` chunk verification at bytes 12..15), WebP (`RIFF` at 0..3 + `WEBP` at 8..11 + `VP8 ` / `VP8L` / `VP8X` chunks at 12..15 to reject `WAVE` and `AVI ` masquerades with `SECURITY_MIME_MISMATCH`), and GIF (`GIF87a` / `GIF89a`).
   - Implemented immediate blacklist rejection for Windows PE executables (`MZ`), Linux ELF (`\x7fELF`), Mach-O / Java bytecode (`0xCAFEBABE`, `0xFEEDFACE`), ZIP/APK/JAR (`PK`), 7-Zip (`0x377ABCAF271C`), RAR (`Rar!\x1A\x07`), and Shebang scripts (`#!`).
   - Enforced file size boundaries (minimum 100 bytes via `SECURITY_FILE_TOO_SMALL`, maximum 10MB via `SECURITY_FILE_TOO_LARGE`).
   - Implemented deep polyglot & Base64 scanner (`scanBinaryPayload`, `scanBase64Payload`) rejecting embedded `<script>`, `<iframe>`, `javascript:`, `onerror=`, and PHP tags.
   - Implemented `SynchronizedSlidingRateLimiter` using `localStorage` and `BroadcastChannel` with fallback to in-memory window tokens, exporting pre-configured instances: `submissionRateLimiter` (6/min), `authRateLimiter` (10/min), `registrationRateLimiter` (4/min), `testMarkRateLimiter` (10/min), `adminRateLimiter` (30/min), `publicVerifyRateLimiter` (20/min).
   - Implemented cryptographic Idempotency Envelope generator (`generateSecurityNonce` 128-bit random hex, `generateIdempotencyKey`, `createIdempotencyEnvelope`) and timestamp drift window validation (`verifyTimestampDrift` rejecting drifted >300s via `ERR_TIMESTAMP_EXPIRED` and future >60s via `ERR_TIMESTAMP_FUTURE`).
   - Implemented context-aware anti-XSS (`escapeHtml`, `sanitizeInput`), URL allowlisting (`sanitizeUrl`), and CSV formula injection escaping (`sanitizeCsvFormula` prepending `'` to leading `=`, `+`, `-`, `@`, `\t`, `\r`).
2. **`src/lib/utils.ts`**:
   - Re-exported `sanitizeCsvFormula` and `sanitizeUrl` from `@/lib/security`.
   - Updated `formatCsvCell` and `generateCsvString` to apply `sanitizeCsvFormula`, ensuring spreadsheet exports are protected against formula injection (CWE-1236).
3. **`src/app/daily/page.tsx`**:
   - Integrated `validateImageFile` 12-byte structural header check and `scanBase64Payload` malware detector into `handlePhotoUpload` prior to Canvas compression, providing user feedback on malicious payloads and rate limit checks.
4. **`backend/Code.gs` & `server/mock-server.js`**:
   - Integrated `LockService.getScriptLock()` (with `try...finally { lock.releaseLock(); }`) into `handleLogTestMark` and `handleDeleteTestMark` to prevent concurrent race conditions.
   - Added timestamp drift validation (±300s window) and atomic idempotency response caching to `doPost` / `handleApiAction`.
   - Added `sanitizeCsvFormula` to neutralize formula injection payloads in member registration, profile updates, test mark titles, and study notes.
5. **Test & Build Verification**:
   - `tests/m8-security-resilience.test.js`: 38/38 unit and adversarial test cases passing.
   - `node tests/e2e-runner.js`: 327/327 master opaque-box E2E test cases passing (Tiers 1-5).
   - `npm run build`: Next.js 14 static export generated all 11 static pages in `out/` with 0 TypeScript/compilation errors.

---

## 2. Logic Chain
1. **Binary Security**: By checking 12-byte structural signatures (specifically byte offsets 8..11 for `WEBP` inside `RIFF` containers), audio WAV and video AVI containers masquerading as images are blocked before any processing.
2. **Malware Defense**: By pairing binary blacklist checking (PE, ELF, Mach-O, Java, ZIP, Shebang) with Base64 polyglot scanning, both raw executable binaries and script-injected Base64 strings are rejected before entering storage or Canvas manipulation.
3. **Multi-Tab Concurrency**: By implementing sliding-window rate limiting with `BroadcastChannel` and `localStorage`, token usage is shared in real time across browser tabs, preventing parallel tab brute-force or spam submissions.
4. **Data Integrity & CWE-1236 Protection**: Prepending `'` to any value starting with `=`, `+`, `-`, `@`, `\t`, `\r` prevents CSV and Google Sheets spreadsheet engines from executing dynamic formula commands or DDE payloads on export or view.
5. **Concurrency Locks**: Wrapping `handleLogTestMark` and `handleDeleteTestMark` with `LockService.getScriptLock().tryLock(30000)` ensures atomic test mark creations and deletions in Google Apps Script and mock server.

---

## 3. Caveats
- `BroadcastChannel` is supported in all modern browsers; for non-browser or older environments, the rate limiter falls back gracefully to `localStorage` and synchronized in-memory arrays.
- In Google Apps Script, `CacheService.getScriptCache()` has a maximum key TTL of 21,600 seconds (6 hours), which is optimal for idempotency deduplication envelopes.

---

## 4. Conclusion
Milestone M8 (Security Hardening, Binary Validation & Concurrency Resilience) is fully implemented with 100% test pass rate across all unit, pairwise, adversarial, and master E2E test suites, and clean Next.js production compilation.

---

## 5. Verification Method
To independently verify the implementation:

1. **Run M8 Security Test Suite**:
   ```bash
   node --test tests/m8-security-resilience.test.js
   ```
   *Expected:* 38 passed, 0 failed.

2. **Run Master E2E Runner (Tiers 1-5)**:
   ```bash
   node tests/e2e-runner.js
   ```
   *Expected:* 327 passed, 0 failed.

3. **Run Production Build**:
   ```bash
   npm run build
   ```
   *Expected:* All 11 static routes generated cleanly with 0 errors.
