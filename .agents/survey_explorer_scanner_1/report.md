# Technical Investigation & Gap Analysis Report: Requirement R2 — Camera QR Code Scanner & Admittance Verification

**Agent**: `survey_explorer_scanner_1`  
**Date**: 2026-09-17  
**Scope**: Requirement R2 (`/verify`, `/admin`, `jsqr`, live video feed, photo upload fallback, one-tap verification, `safeStorage` archival to Reviewed Archive)  
**Status**: Investigation Complete — Ready for Synthesis & Worker Execution  

---

## Executive Summary

This report delivers a comprehensive technical audit of **Requirement R2: Camera QR Code Scanner & Admittance Verification** for the StudySync Sri Lankan A/L Academic Portal. The investigation inspected:
1. `package.json` and TypeScript definitions for `jsqr`.
2. `src/components/admin/AdminQrScannerModal.tsx` (the core camera scanning and photo upload decoding engine).
3. `src/app/verify/page.tsx` (public candidate verification registry).
4. `src/app/admin/page.tsx` (administrative admittance desk, one-tap verification, and homework submission review archive).
5. `src/lib/storage/safeStorage.ts` and `src/lib/storage/localDb.ts` (storage persistence and offline resilience).
6. Test suites in `tests/` (`602/602` tests passing).

**Core Findings**:
- **`jsqr` Dependency**: `jsqr@^1.4.0` is correctly declared in `dependencies` and has native TypeScript declarations (`dist/index.d.ts`), supplemented by `src/types/jsqr.d.ts`. No compiler errors exist for `jsqr`.
- **Scanner Implementation**: `AdminQrScannerModal.tsx` provides both live camera WebRTC streaming (`getUserMedia`) with animated monoline aiming reticles and a drag-and-drop / file-input photo upload fallback.
- **Key Architectural Gap 1 (`/verify` Scanner Disconnect)**: On `/verify`, scanning a QR code opens `AdminQrScannerModal`, but `handleQrDetected` displays an internal candidate approval card and does NOT fire `onStudentVerified` or pass the scanned ID back to `/verify` until the admin "Approve & Verify" button is clicked. If a student is already verified, that button is hidden, trapping the user in the modal without completing verification on `/verify`.
- **Key Architectural Gap 2 (Photo Upload Memory & Performance Risk)**: In `AdminQrScannerModal.tsx`, photo uploads draw native full-resolution images directly to canvas without downscaling. High-res smartphone photos (12MP–48MP) generate 49MB+ pixel buffers that freeze the main thread in `jsQR` for 3–6s or crash mobile browser tabs.
- **Key Architectural Gap 3 (Admin One-Tap Verification Local Persistence)**: In `src/app/admin/page.tsx`, `handleVerifyStudent`, `handleBatchApprovePending`, and `handleBulkSetStatus` update local React state and call `api.adminVerifyMember`, but omit updating `localDb.setMemberStatus()`. If the admin is offline or reloads before API completion, initial hydration from `localDb` reverts status to unverified.
- **Reviewed Archive Workflow**: The submission review workflow in `src/app/admin/page.tsx` correctly partitions logs between Queue and "Reviewed Archive", persisting approved log IDs in `safeStorage` under `'studysync_reviewed_logs'`. However, `auditQueueFilter` defaults to `'all'` rather than `'pending'`, and `logKey` generation omits checking `log.logId`.

---

## 1. Dependency & Typing Audit (`package.json`, `jsqr`)

### 1.1 Observations
- `package.json` line 48:
  ```json
  "dependencies": {
    ...
    "jsqr": "^1.4.0",
    ...
  }
  ```
- `package.json` lines 59–70 (`devDependencies`):
  `@types/jsqr` is not present in `devDependencies`.
- `src/types/jsqr.d.ts` lines 1–20:
  ```ts
  declare module 'jsqr' {
    interface QRCode {
      binaryData: number[];
      data: string;
      location: {
        topRightCorner: { x: number; y: number };
        topLeftCorner: { x: number; y: number };
        bottomRightCorner: { x: number; y: number };
        bottomLeftCorner: { x: number; y: number };
      };
    }

    export default function jsQR(
      data: Uint8ClampedArray,
      width: number,
      height: number,
      options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' }
    ): QRCode | null;
  }
  ```
- `node_modules/jsqr/package.json` line 7 points to `"types": "./dist/index.d.ts"`.
- Static analysis verification (`npx tsc --noEmit`) revealed **zero errors** relating to `jsqr`.

### 1.2 Assessment
`jsqr` is properly installed, linked in `node_modules`, and fully typed for TypeScript compilation.

---

## 2. Scanner Component Architecture (`AdminQrScannerModal.tsx`)

**File**: `src/components/admin/AdminQrScannerModal.tsx` (545 lines)

### 2.1 WebRTC Live Camera Streaming Loop
- **Permissions & Stream Acquisition** (lines 148–176):
  ```ts
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });
  ```
  Requests back-facing camera (`environment`) at 720p/1080p ideal resolution.
- **Video Element & Playback**:
  ```ts
  videoRef.current.srcObject = stream;
  videoRef.current.setAttribute('playsinline', 'true');
  await videoRef.current.play();
  requestAnimationFrame(tickScan);
  ```
- **Frame Decoding Loop (`tickScan`)** (lines 190–220):
  - Checks `video.readyState !== video.HAVE_ENOUGH_DATA`.
  - Captures current frame onto an offscreen canvas:
    ```ts
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (code && code.data) {
      handleQrDetected(code.data);
      return;
    }
    animFrameRef.current = requestAnimationFrame(tickScan);
    ```

### 2.2 Photo Upload Fallback
- **Dropzone & File Input** (lines 408–430):
  Renders dashed dropzone allowing click or drag-and-drop of photo files. Hidden file input with `accept="image/*"`.
- **Decoding Mechanism** (lines 222–252):
  Loads file via `FileReader.readAsDataURL` -> `new Image()` -> offscreen canvas -> `ctx.drawImage` -> `ctx.getImageData` -> `jsQR` with `inversionAttempts: 'attemptBoth'`.
  Displays `toast.error('No QR code detected in this photo. Please try a clearer snapshot.')` if detection returns null.

### 2.3 QR Payload Extraction (`extractStudyId`)
- Lines 59–88:
  - Step 1: URL query param parsing (`url.searchParams.get('id')`), matching both `https://studysync-al-2026.web.app/verify.html?id=SG-MATH-2601` and canonical `/verify?id=SG-MATH-2601`.
  - Step 2: JSON payload parsing (`parsed.studyId || parsed.id`).
  - Step 3: Raw string regex matching `/[A-Z0-9_-]{4,20}/i`.

### 2.4 Gaps and Deficiencies in `AdminQrScannerModal.tsx`

| Gap ID | Location | Issue Description | Impact |
|--------|----------|-------------------|--------|
| **GAP-S1** | Lines 31–41, 90–145, 308–309 | **No immediate scan callback (`onScan`)**. `handleQrDetected` shows the candidate modal card but does NOT invoke `onStudentVerified`. `onStudentVerified` is only called inside `handleApproveStudent` when clicking "Approve & Verify Student". | When called from `/verify`, scanning a QR code will not automatically populate or verify the candidate on `/verify`. If candidate is already verified, the button is hidden, permanently stalling the flow. |
| **GAP-S2** | Lines 228–244 | **Full-resolution canvas allocation in photo upload**. Smartphone photos (4032x3024) draw at native resolution, generating ~49MB `ImageData` buffers passed to `jsQR`. | 3–6s main thread UI freeze on desktop; high probability of memory crash on iOS Safari mobile. QR detection rate is actually lower on massive unscaled images. |
| **GAP-S3** | Lines 223–253 | **File input value not reset**. `fileInputRef.current.value` is never cleared after file processing. | Retrying the same image file after an error or re-centering fails to trigger `onChange`. |
| **GAP-S4** | Lines 190–220 | **Unthrottled 60 FPS scanning loop**. Canvas extraction and `jsQR` execute on every `requestAnimationFrame` at 1280x720 (~3.7MB per frame). | Severe CPU utilization and battery drain on mobile devices. Can cause frame stutter. |
| **GAP-S5** | Lines 153–175 | **Missing secure context / API existence guard**. Directly calls `navigator.mediaDevices.getUserMedia`. | On non-HTTPS (e.g. local IP testing) or sandboxed WebViews, `navigator.mediaDevices` is `undefined`, causing `TypeError: Cannot read properties of undefined`. |
| **GAP-S6** | Lines 178–188 | **Video srcObject not cleared on stop**. `stopCamera()` stops tracks but omits `videoRef.current.srcObject = null`. | On iOS Safari, hardware camera indicator may remain active. |
| **GAP-S7** | Lines 350–354 | **Video element unmounted race condition**. Switching from upload to camera mode synchronously calls `setMode('camera')` and `startCamera()`, when `<video>` is not yet rendered. | `videoRef.current` can be null during `startCamera()`. |

---

## 3. Public Verification Registry Audit (`src/app/verify/page.tsx`)

**File**: `src/app/verify/page.tsx` (380 lines)

### 3.1 Observations
- **Route & Access**: Public route `/verify` resolving candidate metadata from URL query parameter `?id=STUDY_ID`.
- **API Resolution**: Lines 76–105 call `api.verifyMember(cleanId)`.
- **Privacy Masking**: Lines 141–147 mask candidate names (e.g. `A***a A***s`) for non-admin viewers to prevent automated scraping of student PII. Full names and examination center unmask if signed in as admin or via passkey unlock (`2026`, `admin`, `studysync`).
- **Scanner Trigger**: Lines 188–197 provide the "Scan Pass" button with `<QrCode />` icon:
  ```tsx
  <Button
    type="button"
    onClick={() => setScannerOpen(true)}
    className="bg-[#19202e] hover:bg-slate-800 text-white border-2 border-[#19202e] shadow-[2px_2px_0px_#19202e] font-bold rounded-2xl px-4 text-xs h-11 cursor-pointer active:translate-y-0.5 transition-all flex items-center gap-1.5"
    title="Scan student QR pass with camera or upload photo"
  >
    <QrCode className="h-4 w-4 text-[#fcd34d]" />
    <span className="hidden sm:inline">Scan Pass</span>
  </Button>
  ```
- **Modal Binding**: Lines 354–362:
  ```tsx
  <AdminQrScannerModal
    open={scannerOpen}
    onOpenChange={setScannerOpen}
    onStudentVerified={(scannedId) => {
      setInputStudyId(scannedId);
      performVerification(scannedId);
      setScannerOpen(false);
    }}
  />
  ```

### 3.2 Gap Analysis
- Because `AdminQrScannerModal` only triggers `onStudentVerified` when the admin clicks "Approve & Verify Student", a regular user or student scanning their pass on `/verify`:
  1. Cannot verify if the candidate is already marked 'Verified'.
  2. Is presented with an administrative admittance action ("Approve & Verify Student") instead of a direct public verification result.
- **Recommendation**: Update `AdminQrScannerModal` with an `onScan?: (studyId: string) => void` callback (or support an `onScanSuccess` prop). When `onScan` is provided (as on `/verify`), detecting a QR code automatically calls `onScan(targetId)`, closes the modal, and executes `performVerification(targetId)`.

---

## 4. Admin Dashboard Admittance & Review Workflow (`src/app/admin/page.tsx`)

**File**: `src/app/admin/page.tsx` (3778 lines)

### 4.1 One-Tap Candidate Verification
- **Admittance Desk Scanner**:
  - Line 1184: Top bar "Scan Pass QR" button.
  - Line 1923: Verification Inbox "Scan Student Pass QR" button.
  - Both open `AdminQrScannerModal`.
  - Lines 3765–3773:
    ```tsx
    <AdminQrScannerModal
      open={qrScannerOpen}
      onOpenChange={setQrScannerOpen}
      onStudentVerified={(scannedId, updatedMember) => {
        setMembersList((prev) =>
          prev.map((m) => (m.studyId.toUpperCase() === scannedId.toUpperCase() ? updatedMember : m))
        );
      }}
    />
    ```
- **Table One-Tap Approval**:
  - Lines 2154–2163: Direct 1-tap "Approve" button on table row:
    `onClick={() => handleVerifyStudent(m.studyId, 'Verified')}`.
  - Lines 1930–1947: "1-Click Approve All Pending (N)" button:
    `onClick={handleBatchApprovePending}`.
- **Deficiency Identified**:
  In `handleVerifyStudent` (lines 650–665) and `handleBatchApprovePending` (lines 819–840):
  ```ts
  setMembersList(prev => prev.map(m => m.studyId === studyId ? { ...m, status, adminVerified: status === 'Verified' } : m));
  const res = await api.adminVerifyMember(effectiveAdminEmail, studyId, status);
  ```
  Neither function calls `localDb.setMemberStatus(studyId, status)` or `localDb.saveMember()`.
  If the network drops or the page reloads before the remote API completes, the initial hydration in `useEffect` (lines 280–288) loads stale member records from `localDb.getMembers()`, wiping out the uncommitted status.
  **Fix**: Invoke `localDb.setMemberStatus(studyId, status)` inside `handleVerifyStudent`, `handleBatchApprovePending`, and `handleBulkSetStatus`.

### 4.2 Submission Review & "Reviewed Archive" Workflow
- **State Definition** (lines 116–120):
  ```ts
  const [reviewedLogIds, setReviewedLogIds] = useState<Set<string>>(() => {
    const saved = safeStorage.getJson<string[]>('studysync_reviewed_logs', []);
    return new Set(saved);
  });
  const [auditQueueFilter, setAuditQueueFilter] = useState<'pending' | 'reviewed' | 'all'>('all');
  ```
- **Filtering Logic** (lines 795–817):
  ```ts
  const filteredAuditLogs = useMemo(() => {
    return logsList.filter((log) => {
      const logKey = log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
      const isRev = reviewedLogIds.has(logKey);
      if (auditQueueFilter === 'pending') return !isRev;
      if (auditQueueFilter === 'reviewed') return isRev;
      return true;
    });
  }, [logsList, reviewedLogIds, auditQueueFilter]);
  ```
- **Approval & Archival Trigger** (lines 1568–1589):
  Clicking "Approve & Archive Hours":
  1. Sends confirmation notice to student inbox: `localDb.sendMessageToStudentInbox(student.studyId, ...)`.
  2. Updates reviewed set:
     ```ts
     const nextSet = new Set(reviewedLogIds);
     nextSet.add(logKey);
     setReviewedLogIds(nextSet);
     safeStorage.setJson('studysync_reviewed_logs', Array.from(nextSet));
     toast.success(`Hours confirmed & archived for ${student.fullName}!`);
     ```
  3. Moves log immediately to the "Reviewed Archive" view (or removes from Queue if in `pending` view).
- **Gaps Identified**:
  1. `auditQueueFilter` defaults to `'all'` (line 120). Setting default to `'pending'` ensures the supervisor immediately sees the pending backlog, with reviewed items cleanly moving to the archive tab.
  2. `logKey` references `log.id`, but `DailyLogEntry` in `src/types/logs.ts` uses `logId`. Should use `log.logId || log.id || `${log.studyId}-${extractLogDate(log) || log.date}``.
  3. No "Unarchive" action is provided in the Reviewed Archive view if an item was approved by accident.

---

## 5. Storage Layer Audit (`safeStorage.ts`)

**File**: `src/lib/storage/safeStorage.ts` (139 lines)

### 5.1 Architecture
`SafeStorageWrapper` wraps `window.localStorage` with:
1. Dynamic probe test (`__studysync_probe_*`) on initialization to detect Safari Private Browsing, Brave Shields, or quota restrictions.
2. In-memory `Map<string, string>` fallback if `localStorage` throws or is blocked.
3. Transparent type-safe JSON helpers:
   - `getJson<T>(key: string, defaultValue: T): T`
   - `setJson<T>(key: string, value: T): void`
   - `getItem(key: string): string | null`
   - `setItem(key: string, value: string): void`
   - `removeItem(key: string): void`

### 5.2 Storage Keys Used in Requirement R2
| Key Name | Owner File | Purpose | Storage Format |
|----------|------------|---------|----------------|
| `studysync_reviewed_logs` | `src/app/admin/page.tsx` | Reviewed & archived homework submission IDs | JSON `string[]` |
| `studysync_db_members` | `src/lib/storage/localDb.ts` | Local database member registry & verification flags | JSON `MemberData[]` |
| `studysync_db_logs` | `src/lib/storage/localDb.ts` | Daily study logs repository | JSON `DailyLogEntry[]` |
| `studysync_offline_pass` | `src/app/id-card/page.tsx`, `src/app/pass/page.tsx` | Cached student digital pass credential | JSON `MemberData` |

### 5.3 Assessment
`safeStorage` provides all required capabilities and error protections. The integration points in `src/app/admin/page.tsx` and `src/lib/storage/localDb.ts` correctly utilize `getJson` and `setJson`.

---

## 6. Comprehensive Recommendations & Code Snippets

### Recommendation 1: Enhance `AdminQrScannerModal` with Immediate `onScan` and Dual Public/Admin Mode
In `src/components/admin/AdminQrScannerModal.tsx`:
Add an optional `onScan?: (studyId: string) => void` and `modeProp?: 'admin' | 'public'` to props:
```tsx
interface AdminQrScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentVerified?: (studyId: string, member: MemberData) => void;
  onScan?: (studyId: string) => void;
  publicMode?: boolean;
}
```
In `handleQrDetected`:
```tsx
const handleQrDetected = useCallback(async (rawData: string) => {
  const targetId = extractStudyId(rawData);
  if (!targetId) {
    toast.error('Invalid QR Code. No candidate Study ID found.');
    return;
  }

  stopCamera();
  setScannedId(targetId);

  // If onScan is provided (e.g. on /verify), immediately invoke and close
  if (onScan) {
    onScan(targetId);
    onOpenChange(false);
    return;
  }
  ...
}, [onScan, onOpenChange]);
```
This guarantees that scanning on `/verify` immediately populates and verifies the candidate in 1 step.

### Recommendation 2: Downscale High-Resolution Images in Photo Upload
In `handleFileUpload`:
```tsx
const img = new Image();
img.onload = () => {
  const maxDim = 1000;
  let w = img.width;
  let h = img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  // Reset file input value to allow re-selection
  if (fileInputRef.current) fileInputRef.current.value = '';

  if (code && code.data) {
    handleQrDetected(code.data);
  } else {
    toast.error('No QR code detected in this photo. Please try a clearer snapshot.');
  }
};
```

### Recommendation 3: Throttle Live Video Scanning Loop
In `tickScan()`:
```tsx
const lastScanRef = useRef<number>(0);

const tickScan = (time: number) => {
  if (!videoRef.current || videoRef.current.readyState < 2) {
    animFrameRef.current = requestAnimationFrame(tickScan);
    return;
  }

  // Throttle jsQR to every 100ms
  if (time - lastScanRef.current > 100) {
    lastScanRef.current = time;
    const video = videoRef.current;
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      // Scale down to max 640px for real-time decoding efficiency
      const scale = Math.min(1, 640 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        handleQrDetected(code.data);
        return;
      }
    }
  }

  animFrameRef.current = requestAnimationFrame(tickScan);
};
```

### Recommendation 4: Complete Camera Cleanup & Secure Context Detection
```tsx
const startCamera = async () => {
  setCameraError(null);
  setScanning(true);

  if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
    setCameraError('Camera access requires HTTPS or a supported browser.');
    setMode('upload');
    setScanning(false);
    return;
  }
  ...
};

const stopCamera = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  if (animFrameRef.current) {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
  }
  setScanning(false);
};
```

### Recommendation 5: Persist Member Status in `localDb` on Admin Verification
In `src/app/admin/page.tsx`:
```tsx
const handleVerifyStudent = async (studyId: string, status: 'Verified' | 'Active' | 'Suspended' | 'Pending') => {
  if (!effectiveAdminEmail) return;

  // 1. Optimistic React state update
  setMembersList(prev => prev.map(m => m.studyId === studyId ? { ...m, status, adminVerified: status === 'Verified' } : m));
  
  // 2. Persist to localDb (backed by safeStorage) immediately
  localDb.setMemberStatus(studyId, status);
  
  toast.success(`${studyId} status updated to ${status}.`);

  // 3. Sync to Google Sheets backend
  try {
    const res = await api.adminVerifyMember(effectiveAdminEmail, studyId, status);
    if (!res.success) {
      await loadAdminData();
    }
  } catch (err: any) {
    console.warn('Background sync status:', err);
  }
};
```
Apply the same `localDb.setMemberStatus()` update inside `handleBatchApprovePending` and `handleBulkSetStatus`.

### Recommendation 6: Resilient `logKey` in Reviewed Archive
In `src/app/admin/page.tsx`:
Replace all instances of:
```tsx
const logKey = log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
```
with:
```tsx
const logKey = log.logId || log.id || `${log.studyId}-${extractLogDate(log) || log.date}`;
```
And set `auditQueueFilter` initial state to `'pending'` so that the administrative queue cleanly showcases actionable pending submissions by default.

---

## 7. Verification Checklist for Implementer (Worker)

When Milestone 2 is executed, the implementer must verify:
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] Camera scanner operates cleanly without console errors or unhandled `TypeError` on camera permission denial.
- [ ] Scanning QR code on `/verify` immediately populates the candidate record and triggers verification without requiring admin approval inside the modal.
- [ ] Photo upload fallback accepts large camera images (12MP+) and decodes without browser freezing.
- [ ] Re-uploading the same file works without requiring page reload.
- [ ] Admin 1-tap verification updates both React state and `localDb.setMemberStatus()`, preserving status across page refreshes.
- [ ] Approving homework logs moves them from "Queue" to "Reviewed Archive", persisting keys in `safeStorage.getJson('studysync_reviewed_logs')`.
- [ ] `npm test` passes 100% across all 602+ tests.
