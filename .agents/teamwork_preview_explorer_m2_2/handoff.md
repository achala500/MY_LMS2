# Handoff Report: Milestone 2 — Firebase Auth & Global State Exploration

## 1. Observation
- Legacy authentication and state logic existed in `src/js/auth.js` and `src/js/state.js`, using a custom `AppState` event emitter and direct calls to `window.firebase.auth()`.
- Root layout `src/app/layout.tsx` (lines 46-70) loads Firebase v10 compat SDK scripts (`firebase-app-compat.js` and `firebase-auth-compat.js`) via `strategy="beforeInteractive"` and initializes Firebase configuration on `window.firebase` in `afterInteractive`.
- `Header.tsx` (lines 35-59) accepts `user`, `member`, `streak`, `isAdmin`, `onSignIn`, `onSignOut` and references `ADMIN_EMAIL = 'alwisachalaanurada@gmail.com'`.
- Authoritative admin whitelist defined in `tests/test-harness.js` (lines 285-289) and legacy `auth.js` includes `alwisachalaanurada@gmail.com`, `admin@studysync.lk`, `alwis@gmail.com`, `lead.admin@studysync.lk`, as well as any member record where `member.role === 'admin'`.
- Backend Apps Script Web App endpoint `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec` receives all requests as POST with `Content-Type: text/plain;charset=utf-8` via `ApiClient.checkUser(email)`.

## 2. Logic Chain
- Next.js 14 client-side hydration requires zero layout shifts and instant session rendering. By persisting `AuthUser` in `localStorage` under `studysync_auth_session_v2`, `AuthProvider` can restore the session immediately on mount while asynchronously verifying tokens via `window.firebase.auth().onAuthStateChanged`.
- Google Sign-In popups can be blocked on mobile browsers or strict popup blockers (`auth/popup-blocked`). Implementing a graceful fallback that catches popup failures and opens `EmailSignInDialog` ensures 100% login resilience across all platforms.
- Once authenticated, calling `ApiClient.checkUser(user.email)` determines if the user is a registered member (`SG-BIO-xxxx` or `SG-MATH-xxxx`). If registered, user profile, today's submission status, and study history are loaded and the user is routed to `/dashboard`. If unregistered, the user is navigated to `/register` with their Google email locked as read-only.
- Admin status check `isAdminUser(email, role)` evaluates whether the authenticated user matches the primary super admin (`alwisachalaanurada@gmail.com`), the admin whitelist, or has `role: 'admin'`. This controls conditional rendering of the Admin navigation link in `Header` and protects `/admin`.
- `AppProvider` wraps `AuthProvider` outputs, caching study history (`DailyLogEntry[]`), computing rollup metrics (`totalHours`, `avgFocus`, `avgProductivity`, `activeStreak`), maintaining `todayLog` and `isTodaySubmitted`, and providing optimistic submission updates for zero-latency UI responsiveness.

## 3. Caveats
- `window.firebase` is injected globally via external CDN scripts in `layout.tsx`. In offline or mock development modes without internet, the `waitForFirebaseAuth` helper will timeout gracefully (3000ms) and fallback seamlessly to direct email authentication.
- Timezone alignment: Daily log date checking uses `Asia/Colombo` standard time (`YYYY-MM-DD`) to match Sri Lankan exam accountability deadlines.

## 4. Conclusion
- The complete designs for `src/lib/auth.ts`, `src/context/AuthContext.tsx`, `src/context/AppContext.tsx`, and `src/components/auth/EmailSignInDialog.tsx` have been authored and documented in `plan_auth.md`.
- All contracts align with `PROJECT.md`, `SCOPE.md`, `ORIGINAL_REQUEST.md`, and test suites in `tests/`.

## 5. Verification Method
- Static type check: `npm run build` with zero TypeScript errors.
- Unit & E2E verification: `node tests/e2e-runner.js --tier 1` and `node tests/m2-backend-verify.test.js` validating Features 1-4 (Google sign-in, login routing, returning user fast-path, email binding) and Feature 21 (admin whitelist access gate).
