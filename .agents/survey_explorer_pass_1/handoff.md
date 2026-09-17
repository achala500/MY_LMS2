# Handoff Report — survey_explorer_pass_1

## 1. Observation
1. **TypeScript Static Analysis Failure**:
   Running `npx tsc --noEmit` fails with status code 1 and outputs exactly 3 errors in `src/app/id-card/page.tsx`:
   - `src/app/id-card/page.tsx(507,32)`: `Type 'MemberData | null' is not assignable to type 'MemberIdCardData'. Type 'null' is not assignable to type 'MemberIdCardData'.`
   - `src/app/id-card/page.tsx(513,56)`: `Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'. Type 'null' is not assignable to type 'WalletMemberPayload'.`
   - `src/app/id-card/page.tsx(521,53)`: `Argument of type 'MemberData | null' is not assignable to parameter of type 'WalletMemberPayload'. Type 'null' is not assignable to type 'WalletMemberPayload'.`
2. **Automated Test Suite Status**:
   Running `npm test` completes successfully with 602 tests passed, 0 failed, 102 suites passed across all tiers in 22.9s.
3. **Route Mirroring & Static Export**:
   - `src/app/pass/page.tsx` exists (4 lines) and exports `DigitalStudentPassPage` from `@/app/id-card/page`.
   - `out/id-card.html` exists in `out/`, but `out/pass.html` is completely absent.
   - `firebase.json` has rewrites for `/verify/**` but zero rewrite rules for `/pass`.
   - `src/components/layout/Header.tsx` links only to `/id-card` (line 125). Navigation pill active checks (line 166 desktop, line 447 mobile) check `pathname === link.href`, so visiting `/pass` renders the "Student Pass" pill inactive.
4. **Offline Caching Mechanics & Data Isolation**:
   - `src/app/id-card/page.tsx` attempts offline recovery via `safeStorage.getJson('studysync_offline_pass', null)`.
   - `src/context/AuthContext.tsx` saves member data to raw `localStorage.setItem('studysync_member', ...)` instead of `safeStorage`.
   - In `AuthContext.tsx` lines 84-87, if `ApiClient.checkUser` fails (due to offline network state), `setMember(null)` is executed, wiping in-memory credentials on offline boot.
   - `safeStorage.getJson('studysync_offline_pass', null)` is ONLY populated if a student visits `/id-card` while online. If a user registers or logs in and goes offline without visiting `/id-card`, the pass is permanently locked.
5. **Service Worker Offline Blackout**:
   - In `public/sw.js` lines 24-39, the fetch handler attempts network first with cache fallback, but **never writes fetched responses to cache** (`cache.put` is omitted). When offline, `caches.match` returns `undefined`, triggering the browser's "No Internet" screen upon reload.
6. **Print & Wallet Export Formats**:
   - `handlePrintPdf` calls `window.print()`. Header and Footer in `src/app/layout.tsx` do not have `print:hidden`. No `@media print` rules exist in `globals.css`.
   - `downloadAppleWalletPass` and `openGoogleWalletPass` in `src/lib/walletPass.ts` use `/verify?id=` instead of the canonical `/verify.html?id=`.
   - `AppleWalletCard.tsx` provides 3x 300 DPI PNG download, but it is buried inside the Apple Wallet modal rather than being accessible on the primary pass toolbar.

## 2. Logic Chain
1. *From Observation 1*: The 3 TypeScript errors prevent `npx tsc --noEmit` and `npm run build` from succeeding. They occur because lines 507, 513, and 521 pass `member` (which is `MemberData | null`) to components and functions expecting non-null data. Passing `effectiveMember` (which resolves `member || offlinePass`) and adding null guards resolves the compile errors and prevents runtime null-pointer crashes.
2. *From Observation 3*: Because `Header.tsx` only matches `pathname === link.href`, `/pass` does not light up the active navigation indicator. Adding route symmetry `pathname === '/pass' || pathname === '/id-card'` restores UX consistency. Adding `/pass/**` rewrite in `firebase.json` ensures static hosting serves the pass without 404s.
3. *From Observation 4 & 5*: The current offline architecture fails when refreshing offline or cold-starting offline because `sw.js` doesn't populate its cache and `AuthContext` wipes `member` on network catch. Hardening `sw.js` with network-first write-to-cache and storing `studysync_offline_pass` upon registration/login ensures instant offline pass availability.
4. *From Observation 6*: Printing currently prints the global website header and footer. Adding print media queries to `globals.css` ensures the 300 DPI pass prints cleanly on standard A4/Letter paper.

## 3. Caveats
- No code in `src/` or `public/` was modified during this survey (strictly adherence to read-only exploration constraint).
- Service worker behavior in Chrome incognito or mobile Safari webview requires careful cache version management to prevent stale static chunks.
- Apple Wallet `.pkpass` files downloaded via client-side JavaScript are raw JSON specs; full native iOS installation requires an Apple Developer certificate signature on a backend server, but client generation serves as standard offline pass specification.

## 4. Conclusion
Requirement R1 (Offline Digital Pass & Route Mirroring) has clear file boundaries and straightforward remediation steps:
1. Fix lines 507, 513, and 521 in `src/app/id-card/page.tsx` to use `effectiveMember`, unblocking `tsc --noEmit`.
2. Synchronize navigation in `src/components/layout/Header.tsx` and static routing in `firebase.json` for `/pass` and `/id-card`.
3. Add cache writes to `public/sw.js` and cascade offline member recovery in `src/app/id-card/page.tsx`.
4. Inject `@media print` rules in `globals.css` and surface the 3x PNG download button directly on the pass toolbar.

## 5. Verification Method
1. Run `npx tsc --noEmit` -> verify exit code 0.
2. Run `npm test` -> verify 100% pass (602+ tests).
3. Run `npm run build` -> verify clean generation of `out/id-card.html` and `out/pass.html`.
4. Open `/pass` in Chrome DevTools offline mode -> verify immediate render of student pass from `safeStorage`.
