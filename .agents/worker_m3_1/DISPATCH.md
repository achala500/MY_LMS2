# DISPATCH

You are worker_m3_1 (Worker for Milestone M3).
Working directory: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_m3_1\
Authoritative Requirements: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md
Project Blueprint: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md
Scope: c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\sub_orch_m3\SCOPE.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
Build and verify Milestone M3: Authentication, Member Registration Flow & Apple Wallet Digital ID Pass.

You own exclusively:
1. `src/js/auth.js`: Firebase Authentication service with GoogleAuthProvider, auth state listener, and local mock login controller (Bio student `kasun.bio@gmail.com`, Maths student `dineth.maths@gmail.com`, New student `new.student@gmail.com`, Admin `admin@studysync.lk`).
2. `src/js/api.js`: Unified API client connecting to `server/mock-server.js` or live Apps Script Web App `Code.gs` for all 7 actions (`checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`, `verifyMember`, `getAdminData`, `getAnalytics`).
3. `src/js/qr.js`: QR code generator engine creating 2D canvas QR matrix encoding offline JSON payload + live verification URL.
4. `src/js/idcard.js`: Apple Wallet-style Digital ID Card Canvas 2D renderer & 3x high-resolution PNG exporter (`1440x906px` / 300DPI) with metallic dark gradient, gold EMV chip, Inter font typography, status pill, and embedded QR code.
5. `src/js/views/landingView.js`: Landing view with Apple-inspired hero, Google Sign-In CTA, quick demo login bar, feature bento grid.
6. `src/js/views/registerView.js`: One-time registration modal/view with pre-filled read-only Google email, school autocomplete dropdown, stream radio cards (Bio / Maths), dynamic optional subject picker (Physics/Ag or Chem/ICT), and ID generation.
7. `src/js/views/verifyView.js`: Public ID verification view / modal with glowing green verified badge, student details, anti-counterfeit live timestamp.

Run verification:
- Verify all E2E tests (`node tests/e2e-runner.js`) and unit tests pass.
- Verify zero `alert(` calls in created files.
- Verify ID card generates 3x canvas blob and QR code properly formats JSON and verification URL.
- Document all implementation and test results in `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\worker_m3_1\handoff.md`.
