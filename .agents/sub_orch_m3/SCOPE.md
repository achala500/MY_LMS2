# Scope: Milestone M3 — Authentication, Member Registration & Apple Wallet Digital ID Pass

## Architecture & Scope
Implement the Firebase Auth integration, Google Sign-In flow with local mock controller, unified API client, one-time stream-aware registration flow with school autocomplete, Apple Wallet Digital ID card canvas generator, dual-payload QR code engine, 3x high-res PNG export, and public verification page.

## Deliverables
- `src/js/auth.js`: Firebase Authentication service with GoogleAuthProvider, auth state listener, and local mock login controller (Bio student, Maths student, New student, Admin).
- `src/js/api.js`: Unified API client connecting to `server/mock-server.js` or live Apps Script Web App `Code.gs` for all 7 actions (`checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`, `verifyMember`, `getAdminData`, `getAnalytics`).
- `src/js/qr.js`: QR code matrix generator rendering 2D canvas QR code encoding offline JSON metadata + live verification URL.
- `src/js/idcard.js`: Apple Wallet-style Digital ID Card Canvas 2D renderer and 3x high-resolution PNG exporter (`1440x906px` / 300DPI) with metallic multi-stop gradient, gold EMV chip, crisp Inter typography, active status badge, and embedded QR code.
- `src/js/views/landingView.js`: Landing view with Apple-inspired hero, feature bento grid, Google Sign-In button, and quick demo role switcher.
- `src/js/views/registerView.js`: One-time registration modal/view with pre-filled read-only Google email, school autocomplete, stream selection (Bio / Maths), dynamic optional subject picker (Physics/Ag or Chem/ICT), and ID generation.
- `src/js/views/verifyView.js`: Standalone public ID verification page component with verified badge, student details card, and invalid ID handling.

## Rules & Quality Criteria
- Zero `alert()` calls (use `Toast`).
- Enforce 1:1 Google account mapping with read-only email.
- High-res PNG export at 3x scale (1440x906px).
- QR code encodes dual payload (JSON + verification URL).
