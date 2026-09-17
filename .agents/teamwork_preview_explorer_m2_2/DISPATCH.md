## 2026-08-26T09:41:36Z
You are an Explorer investigating Firebase Auth & Global State for Milestone 2.
Your working directory is: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m2_2`
Project root: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
Must read:
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\sub_orch_m2\SCOPE.md`
- `src/js/auth.js`
- `src/js/state.js`

Tasks:
1. Design `src/lib/auth.ts` and `src/context/AuthContext.tsx` integrating Firebase Auth compat SDK (`window.firebase`) loaded in `layout.tsx`.
2. Implement Google Sign-In popup with fallback email login modal for resilience.
3. Implement `onAuthStateChanged` subscriber, persisting auth session and automatically calling `apiClient.checkUser(user.email)` to fetch or verify member profile.
4. Implement admin status determination (`alwisachalaanurada@gmail.com` + whitelist).
5. Design `src/context/AppContext.tsx` providing global state for user profile, history, today's submission status, loading indicators, and refresh helpers.
6. Write your plan and code specs to `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m2_2\plan_auth.md` and write `handoff.md`.
7. Send a message to caller with a summary.
