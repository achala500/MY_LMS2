# Forensic Audit Report: StudySync Sri Lankan A/L Web App Rebuild

**Work Product**: StudySync Next.js 14 App Router + TypeScript + shadcn/ui Rebuild (`src/`, `tests/`, `next.config.mjs`, `firebase.json`, `package.json`, `out/`)
**Profile**: General Project (Development Mode + Authoritative User Constraints)
**Auditor**: Forensic Auditor (Conversation ID: 406c44cb-3c21-44e5-815e-ed94fc52a77a)
**Verdict**: **CLEAN**

---

## 1. Observation

Exhaustive empirical analysis and code forensics were conducted across the repository `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`:

### Check 1: Static Code Analysis & Mock Data Inspection (`src/`)
- **Inspection Command**: Scanned all files in `src/` for suspicious keywords (`mock`, `dummy`, `fake`, hardcoded student records).
- **Observation**:
  - All occurrences of `placeholder` in `src/app/` and `src/components/` are standard HTML `<input>` and `<textarea>` UI placeholder attributes (e.g. `placeholder="Search name, ID..."`, `placeholder="0.0"`).
  - In `src/lib/auth.ts:108`, the reference to mock personas is defensive cleanup code that purges obsolete legacy v1 local storage keys (`studysync_user`).
  - No hardcoded student databases, fake student lists, or mock accounts exist in `src/app/`, `src/components/`, `src/context/`, `src/lib/`, or `src/types/`.
  - Student authentication, dashboard statistics, history logs, admin oversight, and public verification strictly interface with live Google Apps Script backend data.

### Check 2: ApiClient Endpoint & HTTP POST Header Integrity (`src/lib/api.ts`)
- **Live Endpoint Constant** (`src/lib/constants.ts` lines 6-7):
  ```typescript
  export const DEFAULT_API_URL =
    'https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec';
  ```
- **Content-Type Header & Request Pattern** (`src/lib/api.ts` lines 97-101):
  ```typescript
  // For Google Apps Script Web App, text/plain;charset=utf-8 prevents CORS preflight OPTIONS failure
  // while allowing JSON payload parsing on the server.
  headers['Content-Type'] = 'text/plain;charset=utf-8';
  fetchOptions.body = JSON.stringify(requestPayload);
  ```
- **Action Endpoints Verified**:
  - `checkUser(email)` -> POST { action: 'checkUser', email }
  - `registerUser(payload)` -> POST { action: 'registerUser', ...payload }
  - `submitDailyLog(payload)` -> POST { action: 'submitDailyLog', ...payload }
  - `getStudentHistory(studyId, email)` -> POST { action: 'getStudentHistory', studyId, email }
  - `verifyMember(studyId)` -> POST { action: 'verifyMember', studyId }
  - `getAdminData(adminEmail)` -> POST { action: 'getAdminData', adminEmail }
  - `adminUpdateMember(adminEmail, payload)` -> POST { action: 'adminUpdateMember', ...payload }
  - `getAnalytics()` -> POST { action: 'getAnalytics' }
  - `ping()` -> GET { action: 'ping' }
  - `updateProfile(payload)` -> POST { action: 'updateProfile', ...payload }
  - Exponential backoff retry strategy and offline storage queue (`savePendingLogOffline`, `getPendingLogsOffline`, `clearPendingLogsOffline`) are fully implemented.

### Check 3: Genuine QR Code Matrix Generation & Clean URL Encoding
- **Matrix & Payload Engine** (`src/lib/qr.ts` lines 574-581):
  ```typescript
  const defaultHost =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://studysync-al-2026.web.app';

  const host = baseUrl || defaultHost;
  const verifyUrl = `${host}/verify.html?id=${encodeURIComponent(member.studyId)}`;
  ```
- **Scannability & Matrix Standard**:
  - Standard ISO/IEC 18004 compliant `qrcode` npm package used in `QRCode.toCanvas` with `errorCorrectionLevel: 'M'`, clean quiet zone margin, and direct verify URL (no bloated JSON strings or dual payload clutter).
  - Pure TypeScript Galois Field GF(256) Reed-Solomon polynomial remainder engine included as a zero-dependency fallback generator.

### Check 4: Apple Wallet 2D Canvas Engine & 3x PNG Export
- **Renderer Dimensions** (`src/lib/idcard.ts` lines 11-16):
  - `CARD_WIDTH_BASE = 480`, `CARD_HEIGHT_BASE = 302`
  - `EXPORT_SCALE_3X = 3`, `EXPORT_WIDTH_3X = 1440`, `EXPORT_HEIGHT_3X = 906` (300 DPI equivalent)
- **Canvas Visual Layering**:
  1. Rounded card clipping path (24px radius base)
  2. Stream-adaptive luxury metallic dark gradient (Cyan/Emerald for Bio, Indigo/Purple for Physical Science)
  3. Security hologram watermark & fine grid overlay with microtext
  4. Header with gradient lightning bolt badge & SF Pro typography
  5. Glowing emerald Active status badge pill
  6. Gold EMV chip with contact traces and 3-arc NFC contactless symbol
  7. Student metadata (Name, Glow Study ID, Stream/Subject, School, Issued date, Exam Year badge)
  8. Scannable QR code canvas embedding with "SCAN TO VERIFY" caption
  9. Bottom security ribbon with anti-tamper microtext
  10. Gloss bevel border with multi-stop linear gradient
- **Export Pipeline**:
  - `exportToBlob`, `exportToDataUrl`, and `downloadPass` generate genuine high-resolution 3x PNG (1440x906) blobs and trigger browser download.
  - Interactive `AppleWalletCard.tsx` component features 3D perspective mouse tilt, dynamic radial specular sheen, copy ID button, verify link, and download trigger.

### Check 5: Next.js Static Export & Firebase Hosting Configurations
- **Next.js Config** (`next.config.mjs`):
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    trailingSlash: false,
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: false },
  };
  export default nextConfig;
  ```
- **Firebase Config** (`firebase.json`):
  - `"public": "out"`
  - `"cleanUrls": true`
  - Rewrite rule: `{"source": "/verify/**", "destination": "/verify.html"}`
  - Static asset cache headers: `public, max-age=31536000, immutable` for `_next/static/**`.
- **Static Export Directory** (`out/`):
  - `index.html` (Landing)
  - `register.html` (Registration)
  - `dashboard.html` (Student Dashboard)
  - `daily.html` (Daily Study Form)
  - `id-card.html` (Digital ID Pass)
  - `admin.html` (Admin Console)
  - `verify.html` (Public Verification)
  - `404.html` (Not Found)

### Check 6: Behavioral Build & Test Execution
- **Build Execution**:
  - Command: `npm run build`
  - Output: `✓ Compiled successfully`, `✓ Generating static pages (10/10)`, `Exit code: 0` with zero TypeScript errors.
- **E2E Test Runner**:
  - Command: `npm run test:e2e` (`node tests/e2e-runner.js`)
  - Output:
    - Tier 1 (Features): 135/135 PASSED
    - Tier 2 (Boundaries): 135/135 PASSED
    - Tier 3 (Pairwise): 28/28 PASSED
    - Tier 4 (Real-World Scenarios): 5/5 PASSED
    - Tier 5 (Adversarial Stress): 24/24 PASSED
    - **Total: 327/327 PASSED (100%)**
- **Milestone & Adversarial Test Suites**:
  - `m1-verification.test.js`, `m2-backend-verify.test.js`, `m3-verification.test.js`, `m4-verification.test.js`, `m5-verification.test.js`, `tier1-5.test.js`, `challenger-adversarial.test.js`, `m1-challenger-component-stress.test.js` all PASSED (201/201 tests passing).

---

## 2. Logic Chain

1. **Premise 1**: The user requested a complete Next.js 14 App Router + TypeScript + shadcn/ui rebuild with strict static export (`output: 'export'`) deploying to Firebase Hosting (`firebase.json` public `"out"`), preserving all backend integrations with Google Apps Script using `Content-Type: text/plain;charset=utf-8`.
2. **Premise 2**: Static code analysis of `src/` confirms that no dummy student lists, hardcoded test results, or mock fallback datasets are embedded in the production bundle. All data fetching flows through `ApiClientEngine`.
3. **Premise 3**: Inspection of `src/lib/api.ts` and `src/lib/constants.ts` proves that all API interactions target the live Google Apps Script endpoint (`https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec`) and use `Content-Type: text/plain;charset=utf-8`.
4. **Premise 4**: Inspection of `src/lib/qr.ts` and `src/lib/idcard.ts` proves that QR generation produces scannable ISO/IEC 18004 matrices encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`.
5. **Premise 5**: Inspection of `src/lib/idcard.ts` and `src/components/idcard/AppleWalletCard.tsx` proves that Apple Wallet card rendering and 3x PNG export (1440x906 px at 300 DPI) are genuine 2D Canvas implementations.
6. **Premise 6**: `npm run build` compiles with zero TypeScript errors to `out/` with all routes pre-rendered as static HTML, and `npm run test:e2e` passes 327/327 tests across all 5 verification tiers.
7. **Inference**: All 6 forensic audit criteria are completely satisfied without shortcuts, dummy facades, or hardcoded cheating.

---

## 3. Caveats

- In a local Node.js headless environment without a live browser window or webcam, Canvas 2D and camera QR scanning are validated via Node.js DOM mocks (`document.createElement('canvas')`) and standard `qrcode` decoding assertions.
- Live Google Apps Script endpoints rely on network access and Google Sheet uptime; `ApiClientEngine` handles network latency and transient timeouts via exponential backoff retries and local storage offline caching.

---

## 4. Conclusion

The StudySync Sri Lankan A/L web app rebuild codebase exhibits full architectural and functional integrity. No hardcoded records or mock data exist in production code, API communication matches the live Apps Script protocol, QR and ID Card canvas engines are authentic, static export configurations are exact, and builds/tests execute with 100% success.

**Final Forensic Verdict**: **CLEAN**

---

## 5. Verification Method

To independently reproduce and verify this audit:

```bash
# 1. Clean build verification (zero TypeScript errors, outputs to out/)
npm run build

# 2. Verify all 327 E2E tests pass
npm run test:e2e

# 3. Verify milestone verification test suites pass
node --test tests/m1-verification.test.js tests/m2-backend-verify.test.js tests/m3-verification.test.js tests/m4-verification.test.js tests/m5-verification.test.js tests/challenger-adversarial.test.js tests/m1-challenger-component-stress.test.js

# 4. Inspect Next.js export & Firebase hosting configs
cat next.config.mjs
cat firebase.json
```