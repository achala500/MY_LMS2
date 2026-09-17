# Technical Investigation Report — Requirement R1: Offline Digital Pass & Route Mirroring

**Target Focus**: `/pass` and `/id-card` route mirroring, `safeStorage` offline caching, credential loading lifecycle, print formatting, and wallet export options.  
**Investigator**: `survey_explorer_pass_1`  
**Date**: 2026-09-17  
**Integrity Mode**: Read-Only Audit & Architectural Synthesis  

---

## 1. Executive Summary

StudySync features a dual presentation architecture for the student examination pass:
1. An **Editorial Skeuomorphic Certificate Pass** rendered directly in `src/app/id-card/page.tsx` (with Guilloche vector engraving, SHA-256 microprint ribbon, active verification badge, 3D interactive perspective tilt, and real-time canvas QR matrix).
2. A **Luxury Metallic Apple Wallet Card** in `src/components/idcard/AppleWalletCard.tsx` (with gold EMV smart chip, NFC contactless waves, 3x 300 DPI high-res canvas renderer, and dynamic specular sheen glare layer).

While the visual design and rendering engines are sophisticated, this audit uncovered **critical bugs, compilation failures, and offline caching architectural holes**:
- **3 Active TypeScript Compilation Errors** in `src/app/id-card/page.tsx` (lines 507, 513, 521), which prevent `npx tsc --noEmit` from exiting with code 0.
- **Null-Pointer Runtime Crash under Offline Conditions**: In `src/app/id-card/page.tsx`, `effectiveMember` was defined for offline fallback, but lines 507, 513, and 521 pass `member` (which evaluates to `null` offline) to `AppleWalletCard`, `downloadAppleWalletPass`, and `openGoogleWalletPass`.
- **Silent Service Worker Cache Invalidation**: `public/sw.js` listens to `fetch` events but **never saves responses into CacheStorage** (`cache.put` is entirely absent). When offline, `caches.match` returns `undefined`, triggering browser connection error screens upon page reload.
- **Storage Key Isolation & Cold-Boot Desync**: Multiple disparate storage keys are used across `AuthContext`, `localDb`, and `DigitalStudentPassPage` (`studysync_offline_pass` vs `studysync_member` vs `studysync_db_members`). If a student logs in or registers while online but doesn't visit `/id-card` before disconnecting, no offline pass exists in `safeStorage`.
- **Navigation Asymmetry**: Desktop and mobile header active pill states check `pathname === link.href`, meaning navigating to `/pass` leaves the "Student Pass" pill unselected. Furthermore, `out/pass.html` is missing from the static export.

---

## 2. Source File Inventory & Route Mapping

| File Path | Role & Component | Size / Lines | Key Responsibilities & Gaps |
|---|---|---|---|
| `src/app/pass/page.tsx` | Route entrypoint for `/pass` | 4 lines | Re-exports `DigitalStudentPassPage` from `@/app/id-card/page`. Missing static export in `out/`. |
| `src/app/id-card/page.tsx` | Digital Pass Page (`DigitalStudentPassPage`) | 540 lines | Full pass view, 3D tilt, QR generator, print trigger, wallet modal. Contains 3 TS errors. |
| `src/components/idcard/AppleWalletCard.tsx` | Canvas Card & 3x Exporter (`AppleWalletCard`) | 173 lines | Canvas 2D card, 3D tilt with specular reflection, 300 DPI PNG exporter. Only rendered in modal. |
| `src/lib/idcard.ts` | Canvas 2D Engine (`IdCardRenderer`, `IdCard`) | 659 lines | Low-level 2D canvas drawing (EMV chip, Guilloche, typography, ISO QR matrix). |
| `src/lib/walletPass.ts` | Pass Exporters (`downloadAppleWalletPass`, `openGoogleWalletPass`) | 187 lines | Generates `.pkpass` and Google Wallet JSON definitions. Uses `/verify?id=` instead of `/verify.html?id=`. |
| `src/lib/storage/safeStorage.ts` | Resilient Local Storage (`SafeStorageWrapper`) | 139 lines | In-memory fallback wrapper protecting against iOS Safari private mode / quota errors. |
| `src/lib/storage/localDb.ts` | Relational Storage Engine (`LocalDatabaseEngine`) | 649 lines | Offline member & log repository; stores `studysync_db_members`. |
| `src/components/layout/Header.tsx` | Global Navigation Header | 546 lines | Only routes to `/id-card`. Active indicator does not highlight on `/pass`. |
| `public/sw.js` | Service Worker | 40 lines | Handles fetch events but never caches network responses. |

---

## 3. Deep-Dive Findings

### 3.1. TypeScript Compilation Errors (`npx tsc --noEmit`)
Running `npx tsc --noEmit` fails immediately with 3 errors in `src/app/id-card/page.tsx`:
```
src/app/id-card/page.tsx(507,32): error TS2322: Type 'MemberData | null' is not assignable to type 'MemberIdCardData'.
  Type 'null' is not assignable to type 'MemberIdCardData'.
src/app/id-card/page.tsx(513,56): error TS2345: Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'.
  Type 'null' is not assignable to type 'WalletMemberPayload'.
src/app/id-card/page.tsx(521,53): error TS2345: Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'.
  Type 'null' is not assignable to type 'WalletMemberPayload'.
```

#### Code Evidence:
Lines 506–527 of `src/app/id-card/page.tsx`:
```tsx
506: <div className="flex justify-center py-2">
507:   <AppleWalletCard member={member} showActions={true} />
508: </div>
509:
510: <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
511:   <button
512:     type="button"
513:     onClick={() => downloadAppleWalletPass(member)}
...
520:   <button
521:     type="button"
522:     onClick={() => openGoogleWalletPass(member)}
```
`member` is typed as `MemberData | null`. When offline, `member` is `null`. Passing `member` violates non-null props and causes runtime crashes (`Cannot read properties of null (reading 'studyId')`).
**Resolution**: Replace `member` with `effectiveMember` (guarded by `if (effectiveMember)`).

---

### 3.2. Offline Caching Lifecycle & Cold-Boot Failure

#### A. AuthContext Destroys Local Session on Network Failure
In `src/context/AuthContext.tsx` lines 67–88:
```tsx
const syncMemberProfile = useCallback(async (authUser: AuthUser): Promise<MemberData | null> => {
  try {
    const res = await ApiClient.checkUser(authUser.email);
    ...
  } catch (err) {
    console.error('[AuthContext] Error syncing member profile:', err);
    setMember(null); // <-- DESTRUCTIVE OVERWRITE!
    return null;
  }
}, []);
```
When a student opens the app offline:
1. `loadAuthSession()` restores `user` from `safeStorage`.
2. `syncMemberProfile(cached)` immediately fires a network request to `ApiClient.checkUser`.
3. Because the network is disconnected, `checkUser` fails and throws.
4. The catch block executes `setMember(null)`.
5. The in-memory member is wiped, causing all downstream components relying on `useAuth().member` to treat the user as unauthenticated or unregistered!

#### B. Pass Page Offline Fallback Incompleteness
In `src/app/id-card/page.tsx` lines 40–51:
```tsx
const [offlinePass, setOfflinePass] = useState<any>(() => {
  return safeStorage.getJson('studysync_offline_pass', null);
});

const effectiveMember = member || offlinePass;
```
If the student signed in or registered, but did NOT visit `/id-card` while online:
- `safeStorage.getJson('studysync_offline_pass', null)` returns `null`.
- `effectiveMember` is `null`.
- The screen renders the locked state: `"Digital Pass Locked. Please sign in and complete candidate registration..."` even though candidate data exists in `localDb.getMembers()` and `localStorage.getItem('studysync_member')`!

#### C. Statistics & Study Volume Collapse Offline
In `src/app/id-card/page.tsx` lines 79–81 and 401–415:
```tsx
const totalHours = useMemo(() => {
  return logs.reduce((acc, l) => acc + (l.totalHours || 0), 0);
}, [logs]);
```
In `src/context/AppContext.tsx` lines 102–106, if `!member`, `logs` is defaulted to `[]`.
Consequently, when offline, `totalHours` calculates to `0h` and `Recorded Blocks` shows `0`, despite the student having logged dozens of hours.
`effectiveMember` already possesses `effectiveMember.totalHoursLogged || effectiveMember.totalHours`, which should be used as fallback.

---

### 3.3. Service Worker Offline Blackout (`public/sw.js`)

In `public/sw.js` lines 24–39:
```javascript
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => null);
    })
  );
});
```
**Fatal Defect**:
- The SW intercepts navigation and static asset requests.
- When online, `fetch(event.request)` is executed and piped to the browser, **but the response is never cloned or stored in `caches`** via `cache.put()`.
- When offline, `fetch(event.request)` fails and falls back to `caches.match(event.request)`.
- Because nothing was ever saved into cache, `caches.match` resolves to `undefined`.
- The browser displays a raw network error screen (`ERR_INTERNET_DISCONNECTED`).

---

### 3.4. Route Symmetry & Navigation Synchronization

1. **Route Mirroring**:
   - `/pass` and `/id-card` are intended to mirror the exact same official student digital pass.
   - `src/app/pass/page.tsx` re-exports `DigitalStudentPassPage` from `@/app/id-card/page`.
   - However, in `firebase.json`, there is no rewrite rule mapping `/pass` or `/pass/**`.
   - In `out/`, `out/id-card.html` exists (28.6 KB), but `out/pass.html` is absent because `npm run build` had not been re-executed after the route was added.
2. **Header Active State Desync**:
   - In `src/components/layout/Header.tsx` line 125:
     `{ href: '/id-card', label: 'Student Pass', icon: CreditCard }`
   - In line 166 (desktop) and line 447 (mobile):
     `const isActive = pathname === link.href;`
   - When a student navigates to `/pass`, `isActive` evaluates to `false` because `'/pass' !== '/id-card'`. The "Student Pass" pill fails to highlight.
   - In `src/app/dashboard/page.tsx` line 782, the link is hardcoded to `/id-card`.

---

### 3.5. Print & Wallet Export Options Analysis

#### A. Print / PDF Formatting (`window.print()`)
- In `src/app/id-card/page.tsx` line 113: `handlePrintPdf` calls `window.print()`.
- The pass card itself has print classes (`print:bg-white print:p-0 print:border-2 print:shadow-none`).
- **Defects**:
  1. Neither `<ConnectedHeader />` nor `<Footer />` in `src/app/layout.tsx` have `print:hidden`.
  2. In `src/app/globals.css`, there are zero `@media print` rules.
  3. When printed, the global navigation header and footer appear on paper, splitting the pass across two pages and cutting off the bottom microprint ribbon.

#### B. Apple Wallet (.pkpass) Export
- `downloadAppleWalletPass` in `src/lib/walletPass.ts`:
  - Assembles Apple Wallet JSON spec (`formatVersion: 1`, `passTypeIdentifier: pass.lk.studysync.student.al2026`).
  - Downloads as `StudySync_Pass_${id}.pkpass` with MIME `application/vnd.apple.pkpass+json`.
  - Discrepancy: Lines 81 and 88 encode `verifyUrl` as:
    `https://studysync-al-2026.web.app/verify?id=...`
    The canonical verification URL required by project specifications is:
    `https://studysync-al-2026.web.app/verify.html?id=...`

#### C. Google Wallet (.json) Export
- `openGoogleWalletPass` in `src/lib/walletPass.ts`:
  - Assembles Google Wallet generic class/object definition.
  - Downloads as `StudySync_GoogleWallet_${id}.json`.
  - Discrepancy: Line 148 encodes barcode value using `/verify?id=` instead of `/verify.html?id=`.

#### D. High-Resolution 3x 300 DPI PNG Card
- Built into `AppleWalletCard.tsx` and `IdCard.downloadPass` (`EXPORT_SCALE_3X = 3`, 1440x906px).
- **UX Defect**:
  - This high-resolution PNG download button is **buried inside the Apple Wallet modal**.
  - The main page action toolbar only provides "Save Offline Pass", "Printable Pass", "Add to Apple Wallet", and "Save to Google Wallet".
  - A student wanting to save the ID card as an image cannot find a direct "Download PNG" button on the pass page without opening the Apple Wallet modal first.

---

## 4. Gap Analysis Matrix

| Capability / Requirement | Current Status | Severity | Impact | Required Remediation |
|---|---|---|---|---|
| **TypeScript Build (`tsc`)** | Fails with 3 type errors | **CRITICAL** | Blocks CI/CD & production export | Fix lines 507, 513, 521 in `id-card/page.tsx` to pass `effectiveMember` |
| **Offline Pass Rendering** | Crashes if `member` is null in modal | **CRITICAL** | White screen runtime crash offline | Pass `effectiveMember` and guard against null in modal & handlers |
| **Service Worker Offline** | `sw.js` never writes to cache | **HIGH** | Browser shows "No Internet" on reload | Implement cache-on-fetch with network fallback in `public/sw.js` |
| **Offline Credential Sync** | Only saved on manual `/id-card` visit | **HIGH** | Pass locked if user goes offline earlier | Automatically cache pass in `safeStorage` on registration and login |
| **Route Mirroring (`/pass`)** | Missing in `out/`, no header highlight | **MEDIUM** | Inconsistent UX & 404 risk | Add header route symmetry check, add firebase rewrite, rebuild static export |
| **300 DPI Print Preview** | Header and Footer print on page | **MEDIUM** | Distorted two-page printout | Add `@media print { header, footer { display: none !important; } }` |
| **Wallet Barcode Spec** | Uses `/verify?id=` instead of `.html` | **LOW** | Potential rewrite dependency | Align verification URLs in `walletPass.ts` to `/verify.html?id=` |
| **3x PNG Download CTA** | Hidden inside modal | **LOW** | Suboptimal discoverability | Promote "Download Card (PNG)" to main action bar |

---

## 5. Actionable Implementation Recommendations

### Step 1: Repair `src/app/id-card/page.tsx`
1. **Fix Type Errors & Null References**:
   - Replace `member` with `effectiveMember` at lines 507, 513, and 521:
     ```tsx
     <AppleWalletCard member={effectiveMember} showActions={true} />
     ...
     onClick={() => effectiveMember && downloadAppleWalletPass(effectiveMember)}
     ...
     onClick={() => effectiveMember && openGoogleWalletPass(effectiveMember)}
     ```
   - In `copyVerificationLink` (line 129), use `effectiveMember?.studyId || 'STUDY-2026'`.
2. **Resilient Multi-Source Offline Fallback**:
   - Initialize `offlinePass` with cascading local checks:
     ```tsx
     const [offlinePass, setOfflinePass] = useState<any>(() => {
       const cached = safeStorage.getJson('studysync_offline_pass', null);
       if (cached) return cached;
       const memberBackup = safeStorage.getJson('studysync_member', null);
       if (memberBackup) return memberBackup;
       return null;
     });
     ```
3. **Hours & Blocks Fallback**:
   - Fallback `totalHours` to `effectiveMember?.totalHoursLogged || effectiveMember?.totalHours || 0` when `logs` array is empty.
4. **Expose Direct 3x PNG Download**:
   - Add a "Download Card Image (3x PNG)" button to the main action bar at line 217 invoking `IdCard.downloadPass(effectiveMember, EXPORT_SCALE_3X)`.

### Step 2: Harmonize Route Mirroring & Navigation
1. **Shared Component Extraction or Symmetry**:
   - Ensure `src/app/pass/page.tsx` directly renders `DigitalStudentPassPage`.
   - Update `Header.tsx` active calculation:
     ```tsx
     const isActive = pathname === link.href || 
       (link.href === '/id-card' && pathname === '/pass') || 
       (link.href === '/pass' && pathname === '/id-card');
     ```
   - In `Header.tsx` dropdown, support navigation to both routes.
2. **Firebase Rewrite**:
   - In `firebase.json`, add:
     ```json
     {
       "source": "/pass/**",
       "destination": "/id-card.html"
     }
     ```

### Step 3: Hardening `public/sw.js` for Offline Persistence
Update `public/sw.js` to cache successful responses:
```javascript
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and external third-party origins
  if (event.request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('gstatic') && !url.hostname.includes('fonts.')) return;

  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/id-card.html') || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => null);
    })
  );
});
```

### Step 4: Add Print Styles to `globals.css`
Add `@media print` rules to eliminate header and footer clutter during printing:
```css
@media print {
  header, footer, nav, aside, .print-hidden, [data-print-hidden="true"] {
    display: none !important;
  }
  body, main {
    background: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  @page {
    size: auto;
    margin: 10mm;
  }
}
```

### Step 5: Update `walletPass.ts`
- Fix verification URLs to include `.html`:
  `https://studysync-al-2026.web.app/verify.html?id=${encodeURIComponent(member.studyId || '')}`
- Add fallback default properties to avoid undefined references when optional fields are omitted.

---

## 6. Verification Method

1. **Static Analysis**:
   ```bash
   npx tsc --noEmit
   ```
   *Pass Criteria*: Status code 0 (zero errors in `src/app/id-card/page.tsx` or elsewhere).
2. **Automated Test Suites**:
   ```bash
   npm test
   ```
   *Pass Criteria*: 100% passing across all tiers.
3. **Static Export Build**:
   ```bash
   npm run build
   ```
   *Pass Criteria*: Build outputs `out/id-card.html` and `out/pass.html` with zero SSR errors.
4. **Offline Simulation Test**:
   - In browser DevTools -> Application -> Service Workers -> check "Offline".
   - Open `/pass` and reload the page. Verify pass card renders immediately with cached student credentials.
   - Click "Printable Pass", "Save Offline Pass", "Add to Apple Wallet", and "Download 3x PNG" to confirm zero runtime exceptions.
