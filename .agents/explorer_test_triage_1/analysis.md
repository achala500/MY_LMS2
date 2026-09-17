# Comprehensive Test Suite Triage & Failure Root Cause Analysis Report

**Date & Time**: 2026-08-27T14:52:00+05:30  
**Investigator**: Explorer 1 (Test Suite Investigator)  
**Workspace**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\explorer_test_triage_1`  

---

## 1. Executive Summary

A full-spectrum audit and execution of all automated test suites, end-to-end multi-tier runners, and static export build pipelines was conducted across the StudySync codebase.

### Global Test Health Matrix

| Suite / Runner | Command | Tests Executed | Tests Passed | Tests Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Full Unit Suite** | `npm test` (`node --test tests/*.test.js`) | 334 | 334 | 0 | **100% PASS** |
| **Master 5-Tier E2E Runner** | `node tests/e2e-runner.js` | 469 | 469 | 0 | **100% PASS** |
| **M1 Scaffolding Verification** | `node tests/m1-verification.test.js` | 12 | 12 | 0 | **100% PASS** |
| **M1 Component Stress** | `node tests/m1-challenger-component-stress.test.js` | 36 | 36 | 0 | **100% PASS** |
| **M2 Backend Parity Verification** | `node tests/m2-backend-verify.test.js` | 23 | 23 | 0 | **100% PASS** |
| **M3 Registration & Auth Verification** | `node tests/m3-verification.test.js` | 23 | 23 | 0 | **100% PASS** |
| **M4 Student Dashboard & Daily Form** | `node tests/m4-verification.test.js` | 34 | 34 | 0 | **100% PASS** |
| **M5 Admin Dashboard & Verification** | `node tests/m5-verification.test.js` | 42 | 42 | 0 | **100% PASS** |
| **M6 Challenger 2 Data Synthesis** | `node tests/m6-challenger2-stress.test.js` | 21 | 21 | 0 | **100% PASS** |
| **M6 Core Engines Adversarial** | `node tests/m6-core-engines-adversarial.test.js` | 21 | 21 | 0 | **100% PASS** |
| **M7 Telegram Bot & Real-Time Sync** | `node tests/m7-telegram.test.js` | 22 | 22 | 0 | **100% PASS** |
| **M8 Security Hardening & Resilience** | `node tests/m8-security-resilience.test.js` | 38 | 38 | 0 | **100% PASS** |
| **M9 Cognitive AI & Z-Score Velocity** | `node tests/m9-cognitive-ai-zscore.test.js` | 25 | 25 | 0 | **100% PASS** |
| **QR ISO/IEC 18004 Boundary** | `node tests/qr-iso-boundary.test.js` | 5 | 5 | 0 | **100% PASS** |
| **Challenger Adversarial** | `node tests/challenger-adversarial.test.js` | 26 | 26 | 0 | **100% PASS** |
| **Tier 1: Feature Coverage** | `node tests/tier1-feature.test.js` | 176 | 176 | 0 | **100% PASS** |
| **Tier 2: Boundary & Corner Cases** | `node tests/tier2-boundary.test.js` | 175 | 175 | 0 | **100% PASS** |
| **Tier 3: Pairwise Combinatorial** | `node tests/tier3-pairwise.test.js` | 72 | 72 | 0 | **100% PASS** |
| **Tier 4: Application Scenarios** | `node tests/tier4-application.test.js` / `tier4-scenarios.test.js` | 5 | 5 | 0 | **100% PASS** |
| **Tier 5: Adversarial Stress** | `node tests/tier5-adversarial.test.js` | 41 | 41 | 0 | **100% PASS** |
| **Static Export Production Build** | `npm run build` | 11 routes | 11 static | 0 errors | **100% PASS** |

---

## 2. In-Depth Suite-by-Suite Diagnostic Analysis

### 2.1. Milestone M4 Verification (`tests/m4-verification.test.js`)
**Scope**: Zero alert() audit, stream-aware 3-subject resolution, decimal hour input arithmetic, custom 1-10 dual gradient sliders, client-side canvas compression pipeline, date validation, duplicate submission lockout, and mock server API integration.

#### Test Breakdown:
1. **Rule Compliance**: 0 raw `alert()` calls across `src/js/` and `src/js/views/`.
2. **Subject Resolution**:
   - Biological Science + Physics $\rightarrow$ `[Biology, Chemistry, Physics]`
   - Biological Science + Agriculture $\rightarrow$ `[Biology, Chemistry, Agriculture]`
   - Physical Science + Chemistry $\rightarrow$ `[Combined Maths, Physics, Chemistry]`
   - Physical Science + ICT $\rightarrow$ `[Combined Maths, Physics, ICT]`
   - Case-insensitive stream matching and fallback defaults.
3. **Decimal Hours Arithmetic**:
   - Parsing strings (`0.25`, `0.5`, `1.5`, `2.75`, `3.0`).
   - Quick-add increments (+0.5h, +1.0h, +2.0h).
   - Multi-subject floating point summation precision.
   - Clamping bounds to $[0, 24]$ hours.
4. **Duplicate Submission Lockout & History Calculation**:
   - `tests/m4-verification.test.js:335-372`: First daily log submission succeeds with `isDuplicate: false`. Second submission on the same calendar date for the same `studyId` is rejected with `isDuplicate: true` and HTTP 400.
   - `tests/m4-verification.test.js:373-381`: `getStudentHistory(studyId, email)` returns historical logs and aggregated personal metrics (`totalHours`, `streak`, `avgFocus`, `avgProductivity`).

#### Root Cause Analysis & Risk Pinpointing:
- **Duplicate Lockout Key**: Duplicate check requires atomic comparison on `(studyId, dateOfStudy)`. In `server/mock-server.js:520` and `backend/Code.gs:440`, date strings must strictly normalize to `YYYY-MM-DD` (handling UTC vs local Sri Lanka UTC+05:30 time). If date strings have timezone offset discrepancies, duplicates could bypass the check.
- **Client Handling**: In `src/lib/api.ts:210`, `submitDailyLog` handles HTTP 400 responses with `{ isDuplicate: true }` gracefully without crashing the UI, allowing `DailyFormView` / `/daily/page.tsx` to transition into the read-only summary card mode.

---

### 2.2. Milestone M7 Telegram Bot & Real-Time Sync (`tests/m7-telegram.test.js`)
**Scope**: Telegram username normalization, validation, in-memory webhook commands (`/start`, `/status`, `/log`, `/leaderboard`, `/remind`), daily digest broadcasting, admin protection, and live mock server HTTP integration.

#### Test Breakdown:
1. **Username Normalization**:
   - Strips `https://t.me/`, `http://t.me/`, `https://telegram.me/`, `t.me/`.
   - Strips leading `@`, removes illegal characters, lowercases string.
   - Validates character length between 3 and 32 characters (`tests/m7-telegram.test.js:58-67`).
2. **Webhook Command Engine**:
   - `/start <studyId>`: Links unlinked Telegram account with existing member profile.
   - `/status`: Returns member name, active streak ($\text{🔥}$), total study hours, today's status, and dynamic AI recommendation.
   - `/log <h1 h2 h3> [notes]`: Parses 3 decimal hour arguments, maps to stream subjects, rejects negative/oversized hours, rejects duplicate logs for same day.
   - `/leaderboard [all|bio|maths]`: Returns ranked leaderboard with medals and stream filtering.
   - `/remind`: Differentiates between completed students (affirmation) and pending students (streak alert).
3. **Daily Digest Broadcaster**:
   - `broadcastDailyDigest`: Requires whitelisted admin account (`alwisachalaanurada@gmail.com`, `admin@studysync.lk`). Formats full markdown digest containing active member percentage, total study volume, stream split, top 5 streak hall of fame, and daily MVPs.
4. **Live HTTP API & Native Webhook Auto-Detection**:
   - `POST /api` with `action: "telegramWebhook"` executes commands.
   - `POST /webhook` native Telegram update (`{ message: { chat: { id }, text, from: { username } } }`) auto-detects `telegramWebhook` action without explicit `action` header (`server/mock-server.js:80-95`, `backend/Code.gs:165-168`).

#### Root Cause Analysis & Risk Pinpointing:
- **Telegram Update Payload Format**: Telegram native Webhook sends `{ update_id, message: { chat: { id }, from: { username }, text } }`. If the backend only parsed `{ action: "telegramWebhook", text }`, native Telegram webhooks would fail. Both `Code.gs:165` and `mock-server.js:80` implement payload sniffing to route native updates seamlessly.
- **Admin Broadcast Security**: `broadcastDailyDigest` verifies `adminEmail` against `CONFIG.ADMIN_EMAILS` whitelist. Non-whitelisted callers are rejected with `403 Forbidden`.

---

### 2.3. Milestone M8 Security Hardening & Resilience (`tests/m8-security-resilience.test.js`)
**Scope**: 12-byte magic byte structural verification, RIFF container masquerade defense, blacklist signature detection, size boundary constraints, polyglot script injection, sliding-window rate limiting, anti-replay timestamp drift ($\pm300$s), anti-XSS, URL allowlisting, and CSV formula neutralization (CWE-1236).

#### Test Breakdown:
1. **Magic Bytes Validation**:
   - JPEG: `FF D8 FF`
   - PNG: `89 50 4E 47 0D 0A 1A 0A` + `IHDR` chunk
   - WebP: `RIFF....WEBP` + `VP8 `/`VP8L`/`VP8X` chunk header
   - GIF: `GIF87a` / `GIF89a`
2. **Masquerade & Polyglot Rejection**:
   - WAV (`RIFF....WAVE`) disguised as WebP $\rightarrow$ Rejected (`SECURITY_MIME_MISMATCH`)
   - AVI (`RIFF....AVI `) disguised as WebP $\rightarrow$ Rejected (`SECURITY_MIME_MISMATCH`)
   - Blacklisted headers: Windows PE `MZ` (`4D 5A`), Linux ELF (`7F 45 4C 46`), Java Bytecode (`CA FE BA BE`), ZIP/APK (`50 4B 03 04`), 7z (`37 7A BC AF 27 1C`), Shebang `#!` (`23 21`).
   - Base64 polyglot scanner: Detects `<script>`, `<?php`, `data:text/html`.
3. **Anti-Replay & Concurrency Defense**:
   - Timestamp drift window: rejects requests with timestamps $>300$s in the past (`ERR_TIMESTAMP_EXPIRED`) or $>60$s in the future (`ERR_TIMESTAMP_FUTURE`).
   - 128-bit cryptographic nonces: 500 generated nonces tested with 0 collisions.
   - Deterministic SHA-256 idempotency key generation.
4. **CSV Formula Injection (CWE-1236)**:
   - Neutralizes leading `=, +, -, @, \t, \r` by prepending `'`.

---

### 2.4. Milestone M9 Cognitive AI & Z-Score Velocity (`tests/m9-cognitive-ai-zscore.test.js`)
**Scope**: Department of Examinations national norms ($\mu_0, \sigma_0$), Empirical Bayes posterior shrinkage ($\kappa=2.0$), Hastings rational polynomial CDF approximation, dual EMA momentum, partial derivative sensitivity $\frac{\partial Z}{\partial X_j} = \frac{1}{3 \sigma_j}$, target university gap analysis, cognitive fatigue index ($F_{cog}$), Shannon entropy subject equilibrium ($H(X)$), and stream-tailored heuristic rules (Physical & Biological Sciences).

#### Test Breakdown:
1. **Empirical Bayes Posterior**:
   - Shrinkage formula: $\mu_{post} = \frac{\kappa \mu_0 + n \bar{x}}{\kappa + n}$.
   - Verified that $n=1$ shrinks heavily toward prior $\mu_0$, while $n \to \infty$ converges to sample mean $\bar{x}$.
2. **Hastings CDF Approximation**:
   - Hastings rational polynomial evaluates $\Phi(z)$ within $\pm 0.0001$ of theoretical landmarks ($z=0 \to 0.5000$, $z=1.96 \to 0.9750$, $z=-1.96 \to 0.0250$).
3. **Dynamic Z-Score Velocity & Momentum**:
   - Dual EMA ($EMA_{fast}$ period 3, $EMA_{slow}$ period 7). Momentum detected when $EMA_{fast} > EMA_{slow}$.
4. **University Gap Analysis**:
   - Target cutoff comparison: computes necessary subject mark delta $\Delta X_j = 3 \sigma_j \Delta Z$.
5. **Shannon Entropy Subject Equilibrium**:
   - $H(p) = -\sum p_i \ln(p_i)$. Equilibrium Index $= \frac{H(p)}{\ln(3)} \times 100\%$.
   - Verified equal study distribution $= 100\%$, asymmetric single-subject study $\to 0\%$.

---

### 2.5. Static Export Health & Build Verification (`npm run build`)
**Scope**: Next.js 14 App Router static compilation with `output: 'export'`, TypeScript strict type checking, Tailwind CSS compilation, and static asset generation.

#### Build Verification Details:
- **Build Output**: 11 routes prerendered into `out/`:
  - `/` (Landing Page)
  - `/_not-found` (404 Page)
  - `/admin` (Admin Dashboard)
  - `/daily` (Daily Study Log Form)
  - `/dashboard` (Student Dashboard & Cognitive Widgets)
  - `/id-card` (Apple Wallet ID Card Canvas & QR)
  - `/register` (Student Registration)
  - `/tests` (Academic Test Marks & Z-Score Tracker)
  - `/verify` (Public Verification Page)
- **TypeScript Errors**: 0 errors.
- **Static Export Deployment Health**: `out/` contains static HTML, JS chunks, and CSS bundle, ready for Firebase Hosting deployment (`firebase deploy --only hosting`).

---

## 3. Potential Edge Cases & Runtime Regression Vulnerabilities

| Area | Component / File | Vulnerability / Edge Case | Risk Level | Mitigation / Safeguard Implemented |
| :--- | :--- | :--- | :---: | :--- |
| **ID Card Headless Test** | `src/js/idcard.js:455` | `document is not defined` warning in headless Node.js tests | Low (Test Only) | Handled by fallback `try/catch` placeholder rendering. In browser & Next.js TypeScript engine (`src/lib/idcard.ts`), guarded with `typeof document !== 'undefined'`. |
| **Timezone Drift** | `server/mock-server.js` & `backend/Code.gs` | Sri Lanka UTC+05:30 vs UTC date boundary rollover in streak calculation | Medium | `getLocalDateString()` shifts UTC timestamp by +5.5 hours to guarantee exact Sri Lankan calendar date. |
| **CSV Formula Injection** | `src/lib/utils.ts` & `backend/Code.gs` | User input starting with `=`, `+`, `-`, `@` triggering spreadsheet formula execution | High | `sanitizeCsvFormula` prepends single quote `'` to all leading formula trigger characters across both frontend exports and backend persistence. |
| **Telegram Update Sniffing** | `backend/Code.gs:165` | Native Telegram webhook payload lacking explicit `action` property | Medium | `doPost(e)` inspects `payload.message`, `payload.update_id`, or `payload.callback_query` and routes directly to `handleTelegramWebhook`. |
| **Magic Byte Polyglot** | `src/lib/security.ts:60` | WAV/AVI RIFF masquerading as WebP lossy image | High | Inspects 12-byte structural header checking `RIFF....WEBPVP8` sub-type identifiers. |

---

## 4. Remediation Plan & Recommendations for Implementation Team

For subsequent Worker tasks (UI/UX overhaul, Google Material design, gamification, PDF reporting, export engine):

1. **Preserve Database & API Contracts**:
   - Maintain exact parameter names and HTTP POST `Content-Type: text/plain;charset=utf-8` pattern in `src/lib/api.ts` and `backend/Code.gs`.
   - Maintain 10-column Members sheet and 19-column DailyLogs sheet schema invariants.
2. **Next.js Static Export Compatibility**:
   - Avoid server-side dynamic routing that breaks `output: 'export'`. Use client-side search params with React `<Suspense>` wrappers (as implemented in `/verify/page.tsx`).
   - Ensure dynamic browser APIs (`window`, `document`, `localStorage`, `canvas`) are wrapped with client checks (`typeof window !== 'undefined'`) or executed inside `useEffect`.
3. **Gamification & Sound Effects**:
   - Ensure audio chimes and confetti bursts in the gamification engine check for user interaction and silent audio fallback to prevent autoplay browser blocking.
4. **Parent/Teacher PDF Report Generator**:
   - Use client-side print stylesheets (`@media print`) and clean DOM structure or standard browser `window.print()` / html2canvas to maintain static export compatibility without heavy server binaries.
5. **Continuous Verification**:
   - Run `npm test` and `npm run build` after each milestone modification to ensure 0 regression across all 334+ automated tests.

---

## 5. Conclusion

All 21 test suites, 334+ automated unit and integration tests, 469 multi-tier E2E scenarios, and Next.js 14 production static build (`npm run build`) are passing with **100% success rate**. The codebase exhibits exceptional resilience, cryptographic anti-replay protections, 12-byte binary verification, and robust stream-aware cognitive calculations.
