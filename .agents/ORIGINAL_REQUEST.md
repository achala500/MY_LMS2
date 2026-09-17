# Original User Request

## 2026-08-26T09:12:37Z

Rebuild the existing StudySync Sri Lankan A/L study accountability web app as a production-grade **Next.js 14 App Router + TypeScript + shadcn/ui + Tailwind CSS** application, replacing the current vanilla JS SPA while keeping all existing backend integrations intact. Every page must be rebuilt with shadcn/ui components, a clean professional dark zinc/slate aesthetic with tasteful accent colours, and smooth animations using Framer Motion or CSS transitions.

**Working directory:** `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
**Integrity mode:** development

---

## Context: Existing System (Do NOT break)

- **Firebase Project ID:** `studysync-al-2026`
- **Firebase Hosting URL:** `https://studysync-al-2026.web.app`
- **Firebase Auth:** Google Sign-In enabled (compat SDK v10)
- **Backend API:** Google Apps Script Web App — `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec`
- **Google Spreadsheet ID:** `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`
- **Admin email:** `alwisachalaanurada@gmail.com`
- **API call pattern:** All calls use POST with `Content-Type: text/plain;charset=utf-8` to the Apps Script URL (avoids CORS/redirect issues — do NOT change this)
- **Existing source files** in `src/js/` contain all business logic (auth, state, API client, QR generation, ID card canvas rendering, slider controls) — port the logic, replace the HTML template strings with React JSX

---

## Requirements

### R1. Next.js 14 Static Export Setup
Scaffold a Next.js 14 App Router project with TypeScript, Tailwind CSS v4, and shadcn/ui (`npx shadcn@latest init`) configured for `output: 'export'` (static export) so the built output (`out/`) deploys to Firebase Hosting. The `firebase.json` must point `public` to `out`. The existing `backend/` and `tests/` directories must be left untouched.

### R2. Full Page Rebuild with shadcn/ui
Rebuild every page/view using shadcn/ui components as the primitive layer:
- **Landing page** — Hero with animated gradient background (aurora orbs), "Continue with Google" button using shadcn `Button`, branding, feature highlights
- **Registration flow** — Multi-step `Card`-based form: Google account auto-fill, school searchable `Command` palette (from `schools.js` list), stream/subject `Select`, Telegram input. One submission per account enforced.
- **Student Dashboard** — shadcn `Card` stat grid (streak, total hours, avg focus), `Table` for study history, today's form CTA or read-only view if already submitted
- **Daily Study Form** — Per-subject hour inputs with shadcn `Input`, custom focus/productivity sliders (port from `slider.js`), `Textarea` for notes, file upload for proof photo
- **Digital ID Card** — Apple Wallet-style card with 3D CSS tilt hover, canvas-rendered QR code (port from `qr.js` + `idcard.js`), scannable QR encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`, downloadable as PNG
- **Admin Dashboard** — Protected route for `alwisachalaanurada@gmail.com`. shadcn `DataTable` with member list, inline edit `Dialog`, `Tabs` for Members/Analytics/Logs, SVG area chart for 7-day study volume, `Progress` bars for school/stream distribution, `Badge` for status, JSON + CSV export
- **Verify page** — Public `/verify` route (and keep `verify.html` working) showing member name, ID, status from QR scan
- **Global** — shadcn `NavigationMenu` header, `Toaster` (sonner), skeleton loaders, aurora background preserved as CSS animation, full dark mode

### R3. Visual Design System
Apply a **clean professional dark theme** — shadcn's zinc/slate neutral base with tasteful accent colours following UI/UX colour rules:
- Primary action: indigo (`#6366f1`) for CTAs and focus rings
- Success: emerald (`#10b981`) for streaks and active badges
- Warning: amber (`#f59e0b`) for productivity alerts
- Destructive: rose (`#ef4444`) for inactive/danger states
- All typography: `Inter` or `Geist` (Next.js default), weights 400/500/600/800
- Border-radius: `0.75rem` (shadcn default `--radius`)
- No rainbow gradients everywhere — accent colour used purposefully, not decoratively
- Cards: `bg-zinc-900/60 backdrop-blur-md border border-zinc-800` — subtle glassmorphism without overdoing it

### R4. Auth & State Management
Port `auth.js` + `state.js` to React Context + custom hooks. Firebase Auth Google Sign-In must work via the existing compat SDK loaded in `layout.tsx` via `<Script>` tag. Auth state must persist across page refreshes. Admin route must redirect non-admin users.

### R5. Backend Integration Preserved
Port `api.js` exactly — all `ApiClient` methods kept identical, same POST pattern to Apps Script URL. No mock/demo data. No hardcoded student records. All data must come from live Google Sheets via the Apps Script endpoint.

---

## Acceptance Criteria

### Build & Deploy
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `out/` directory produced by `next export` deploys to Firebase Hosting via `firebase deploy --only hosting`
- [ ] Live URL `https://studysync-al-2026.web.app` loads the Next.js app (no spinner stuck, no blank page)

### Auth
- [ ] "Continue with Google" button triggers Firebase Google Sign-In popup
- [ ] Signing in with `alwisachalaanurada@gmail.com` renders the Admin Dashboard tab/link
- [ ] Signing in with any non-admin Google account routes to Dashboard (if registered) or Registration (if new)

### Pages
- [ ] Landing page renders hero section with animated aurora background and Google Sign-In CTA
- [ ] Registration form collects all 7 fields (Name, Email readonly, Gender, Telegram, School with autocomplete, Stream, Optional Subject) and submits to Apps Script
- [ ] Student Dashboard shows real data from Google Sheets (no mock names/IDs)
- [ ] Daily Study Form shows only 3 relevant subjects based on user's stream
- [ ] Digital ID Card QR code encodes `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID` and is scannable with a phone camera
- [ ] Admin Dashboard loads member table from live Google Sheets data
- [ ] Verify page resolves member info from `?id=` URL parameter

### Visual Quality
- [ ] All pages use shadcn/ui components as the component primitive layer
- [ ] Dark zinc/slate theme with indigo/emerald/amber/rose accents applied consistently
- [ ] No visible layout shifts (CLS = 0) on page load
- [ ] Mobile responsive — all pages usable on 375px viewport

---

## Reference: Key Existing Files to Port

| File | What to port |
|------|--------------|
| `src/js/api.js` | All `ApiClient` methods, POST pattern, Apps Script URL |
| `src/js/auth.js` | `AuthService.signIn()`, `signOut()`, `onAuthStateChanged` Firebase logic |
| `src/js/state.js` | Global state shape → convert to React Context |
| `src/js/qr.js` | QR encoding + canvas rendering → use in ID card component |
| `src/js/idcard.js` | Canvas-based ID card drawing → port to React canvas component |
| `src/js/slider.js` | Custom drag slider → port to React controlled component |
| `src/js/schools.js` | 400-school list → use directly in Command palette component |
| `src/js/views/adminView.js` | Admin layout, analytics charts, member editor → port to React |
| `src/js/views/dashboardView.js` | Dashboard stats, history table → port to React |
| `firebase.json` | Update `public` to `out`, keep existing rewrites/headers |

## Follow-up — 2026-08-26T09:21:15Z

ADDITIONAL REQUIREMENTS FROM USER — please incorporate these into the implementation immediately:

## Critical Additions

### 1. Admin Panel — Must Be Fully Functional
The admin dashboard is currently broken. Priority fix alongside the rebuild:
- Admin email `alwisachalaanurada@gmail.com` must see the Admin tab/link in the nav upon sign-in
- All admin API calls (list members, update member, view logs, export CSV/JSON) must work against the live Google Sheets backend
- Member inline-edit Dialog must save changes back to Google Sheets via the Apps Script endpoint
- No mock/fake data anywhere

### 2. Premium Animations — Flagship Tier
Implement the following animation layers (must be 60fps, no scroll lag):
- **Scroll-driven parallax** on the hero section — elements move at different rates as user scrolls
- **Layered reveal effects** — content sections fade + translate-up as they enter the viewport (use Intersection Observer or Framer Motion `whileInView`)
- **3D depth scaling** on cards — subtle `rotateX/Y` on hover (CSS `perspective` + `transform-style: preserve-3d`)
- **Smooth page transitions** between routes using Framer Motion `AnimatePresence`
- **Staggered children** — list items, stat cards, table rows animate in with cascading delay
- **Buttery micro-interactions** on all buttons, inputs, badges — scale, glow, border-color transitions at 200ms cubic-bezier(0.16, 1, 0.3, 1)

### 3. Typography — SF Pro / Product Sans
- Load **SF Pro Display** via `https://fonts.cdnfonts.com/css/sf-pro-display` 
- Load **Product Sans** via `https://fonts.cdnfonts.com/css/product-sans`
- Fallback chain: `'SF Pro Display', 'Product Sans', 'Google Sans', 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif`
- Display headings: SF Pro Display, weight 700-800, letter-spacing -0.03em
- Body: Inter/Plus Jakarta Sans, weight 400-500
- Mono: JetBrains Mono (for IDs, stats, code)

### 4. Design Language — Apple/Google/Samsung Showcase Level
- Generous whitespace — section padding minimum `py-24` on desktop
- Subtle depth layers — use `z-index` layering with blurred background elements
- Every section must feel intentional — no filler, no empty space without purpose
- Aurora/mesh gradient background preserved but more subtle (opacity 0.3-0.4 max)
- Glass cards: `bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60` — refined, not heavy

### 5. Zero Functional Regression
- Do NOT remove any existing features: auth, API calls, form submissions, QR generation, ID card download, CSV/JSON export
- Keep all existing data models and component logic intact
- All interactive flows must work identically or better than before
- `npm run build` must pass with zero TypeScript errors

### 6. Strict Non-Negotiables
- 60fps scroll performance — no janky animations
- Mobile responsive — all pages on 375px viewport
- No mock data, no demo accounts, no hardcoded records
- QR code must encode ONLY `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`

## Follow-up — 2026-08-26T09:33:17Z

URGENT REQUIREMENT FOR ID CARD & QR CODE:
The user tested the Digital ID card and found the QR code was unreadable/unscannable and outdated.
Requirements:
1. QR Code must encode ONLY the direct verification HTTPS URL: `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID` (no bloated JSON strings or dual payload clutter).
2. Must use standard `qrcode` npm package or clean canvas rendering with standard quiet zone / padding (errorCorrectionLevel 'M' or 'L' so the matrix is clean, low density, and easily scanned by phone cameras).
3. The Digital ID card UI should be modern Apple Wallet style with high contrast, scannable QR box, clear typography, and 3D hover/tilt effects.

## 2026-08-26T16:33:49Z

Rebuild the existing StudySync Sri Lankan A/L study accountability web app as a production-grade **Next.js 14 App Router + TypeScript + shadcn/ui + Tailwind CSS** application, replacing the current vanilla JS SPA while keeping all existing backend integrations intact. Every page must be rebuilt with shadcn/ui components, a clean professional dark zinc/slate aesthetic with tasteful accent colours, and smooth animations using Framer Motion or CSS transitions.

**Working directory:** `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
**Integrity mode:** development

---

## Context: Existing System (Do NOT break)

- **Firebase Project ID:** `studysync-al-2026`
- **Firebase Hosting URL:** `https://studysync-al-2026.web.app`
- **Firebase Auth:** Google Sign-In enabled (compat SDK v10)
- **Backend API:** Google Apps Script Web App — `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec`
- **Google Spreadsheet ID:** `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0`
- **Admin email:** `alwisachalaanurada@gmail.com`
- **API call pattern:** All calls use POST with `Content-Type: text/plain;charset=utf-8` to the Apps Script URL (avoids CORS/redirect issues — do NOT change this)
- **Existing source files** in `src/js/` contain all business logic (auth, state, API client, QR generation, ID card canvas rendering, slider controls) — port the logic, replace the HTML template strings with React JSX

---

## Requirements

### R1. Next.js 14 Static Export Setup
Scaffold a Next.js 14 App Router project with TypeScript, Tailwind CSS v4, and shadcn/ui (`npx shadcn@latest init`) configured for `output: 'export'` (static export) so the built output (`out/`) deploys to Firebase Hosting. The `firebase.json` must point `public` to `out`. The existing `backend/` and `tests/` directories must be left untouched.

### R2. Full Page Rebuild with shadcn/ui & Data Synthesis
Rebuild every page/view using shadcn/ui components as the primitive layer:
- **Landing page** — Hero with animated gradient background (aurora orbs), "Continue with Google" button using shadcn `Button`, branding, feature highlights
- **Registration flow** — Multi-step `Card`-based form: Google account auto-fill, school searchable `Command` palette (from `schools.js` list), stream/subject `Select`, Telegram input, Exam Year select (2026-2029). One submission per account enforced.
- **Student Dashboard** — shadcn `Card` stat grid (streak, total hours, avg focus, exam year badge), `Table` for study history with subjects array parsing, today's form CTA or read-only view if already submitted. Advanced Data Synthesis: Interactive 7/14-day study volume & session trend chart (`StudyTrendChart`), Subject Equilibrium & Balance Index (`SubjectBalanceCard`, 0-100% score), and Downloadable Academic Performance Report modal (`AcademicReportModal` with Print/PDF and CSV export).
- **Daily Study Form** — Per-subject hour inputs with shadcn `Input`, custom focus/productivity sliders (port from `slider.js`), `Textarea` for notes, file upload for proof photo
- **Digital ID Card** — Apple Wallet-style card with 3D CSS tilt hover, canvas-rendered QR code using standard `qrcode` library (ISO/IEC 18004 specification compliant, 100% scannable by mobile cameras), scannable QR encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`, downloadable as 3x high-res PNG (1440x906)
- **Admin Dashboard** — Protected route for `alwisachalaanurada@gmail.com`. shadcn `DataTable` with member list, inline edit `Dialog` including Exam Year selector, `Tabs` for Members/Analytics/Logs, SVG area chart for 7-day study volume, `Progress` bars for school/stream distribution, `Badge` for status, JSON + CSV export
- **Verify page** — Public `verify.html`-equivalent route showing member name, ID, status from QR scan
- **Global** — shadcn `NavigationMenu` header, `Toaster` (sonner), skeleton loaders, aurora background preserved as CSS animation, full dark mode

### R3. Visual Design System
Apply a **clean professional dark theme** — shadcn's zinc/slate neutral base with tasteful accent colours following UI/UX colour rules:
- Primary action: indigo (`#6366f1`) for CTAs and focus rings
- Success: emerald (`#10b981`) for streaks and active badges
- Warning: amber (`#f59e0b`) for productivity alerts
- Destructive: rose (`#ef4444`) for inactive/danger states
- All typography: `Inter` or `Geist` (Next.js default), weights 400/500/600/800
- Border-radius: `0.75rem` (shadcn default `--radius`)
- No rainbow gradients everywhere — accent colour used purposefully, not decoratively
- Cards: `bg-zinc-900/60 backdrop-blur-md border border-zinc-800` — subtle glassmorphism without overdoing it

### R4. Auth & State Management
Port `auth.js` + `state.js` to React Context + custom hooks. Firebase Auth Google Sign-In must work via the existing compat SDK loaded in `layout.tsx` via `<Script>` tag. Auth state must persist across page refreshes. Admin route must redirect non-admin users.

### R5. Backend Integration Preserved
Port `api.js` exactly — all `ApiClient` methods kept identical, same POST pattern to Apps Script URL. No mock/demo data. No hardcoded student records. All data must come from live Google Sheets via the Apps Script endpoint.

---

## Acceptance Criteria

### Build & Deploy
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `out/` directory produced by `next export` deploys to Firebase Hosting via `firebase deploy --only hosting`
- [ ] Live URL `https://studysync-al-2026.web.app` loads the Next.js app (no spinner stuck, no blank page)

### Auth
- [ ] "Continue with Google" button triggers Firebase Google Sign-In popup
- [ ] Signing in with `alwisachalaanurada@gmail.com` renders the Admin Dashboard tab/link
- [ ] Signing in with any non-admin Google account routes to Dashboard (if registered) or Registration (if new)

### Pages
- [ ] Landing page renders hero section with animated aurora background and Google Sign-In CTA
- [ ] Registration form collects all 7 fields (Name, Email readonly, Gender, Telegram, School with autocomplete, Stream, Optional Subject, Exam Year) and submits to Apps Script
- [ ] Student Dashboard shows real data from Google Sheets (no mock names/IDs), interactive volume trends chart, subject equilibrium balance card, and downloadable academic performance report
- [ ] Daily Study Form shows only 3 relevant subjects based on user's stream
- [ ] Digital ID Card QR code encodes `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID` and is scannable with a phone camera
- [ ] Admin Dashboard loads member table from live Google Sheets data with exam year editor
- [ ] Verify page resolves member info from `?id=` URL parameter

### Visual Quality
- [ ] All pages use shadcn/ui components as the component primitive layer
- [ ] Dark zinc/slate theme with indigo/emerald/amber/rose accents applied consistently
- [ ] No visible layout shifts (CLS = 0) on page load
- [ ] Mobile responsive — all pages usable on 375px viewport

## 2026-08-27T01:47:05Z

Build a production-grade Telegram Bot integration, automated penetration QA resilience suite, and cognitive study intelligence system for StudySync (Sri Lankan A/L Academic Accountability & Examination Intelligence Platform).

Working directory: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
Integrity mode: benchmark

## Requirements

### R1. Telegram Bot Integration & Real-Time Sync
Implement bidirectional Telegram integration connected to the Google Apps Script web backend:
- Webhook endpoint (/doPost action: telegramWebhook) capable of receiving commands from Telegram bot users (/start, /status, /log, /leaderboard, /remind).
- Automated daily digest & streak leaderboard broadcast generator that pushes group summaries to the Telegram study channel.
- Direct member linkage matching Telegram handles (@username) to unique Study IDs.

### R2. Continuous Autonomous Security & Penetration Testing Suite
Build automated stress tests and penetration security suites covering:
- Binary magic bytes upload validation and polyglot executable payload rejection.
- Concurrency race conditions and replay attack defenses on daily logs and test marks.
- Input sanitization, anti-XSS encoding, and IDOR protection.

### R3. Cognitive AI Study Bot & Prescriptions
Provide automated study performance diagnoses:
- Real-time heuristic and cognitive study recommendations tailored to the student's stream (Physical Science / Biological Science).
- Dynamic Z-score velocity tracking and bottleneck remediation advice.

## Acceptance Criteria

### Telegram Integration
- [ ] Telegram webhook handler successfully processes /status and returns live member study stats
- [ ] Group broadcast generator formats clean markdown summaries with top streaks and daily hours
- [ ] Backend securely handles Telegram Bot API token without exposing keys in frontend code

### Security & Penetration QA
- [ ] All automated tests pass with 100% success rate across 5 tiers
- [ ] Magic bytes file inspector rejects non-image MIME masquerades
- [ ] Client sliding-window rate limiter throttles burst requests

### Build & Deployment
- [ ] npm run build completes with zero TypeScript errors
- [ ] Static export in out/ deploys cleanly to Firebase Hosting
- [ ] Live application operates without runtime errors

## 2026-08-27T09:16:50Z

Comprehensive UI/UX overhaul and full-stack bug remediation across the StudySync Sri Lankan A/L Accountability web application, introducing Google Material UI/UX design with Google fonts, animations, dark/light mode toggle, a gamification engine (achievement badges, XP levels, celebratory confetti & sound effects), parent/teacher monthly PDF study report generator, multi-format data export (CSV, JSON, Excel XLSX, raw SQL dump), cognitive AI analytics, Telegram bot integration, security hardening, and a 100% test pass rate across all tiers.

Working directory: c:/Users/alwis/Documents/antigravity/dazzling-bardeen
Integrity mode: development

## Requirements

### R1. Google Material UI/UX Design System & Theme Engine
- **Visual Design & Typography**: Implement a sleek Google Material design aesthetic using Google Fonts (Product Sans / Roboto / Plus Jakarta Sans), fluid elevation cards, glassmorphic accents, and smooth micro-animations.
- **Dark Mode / Light Mode Toggle**: Implement a seamless Dark / Light mode toggle switch in the global header with persistent theme state (powered by next-themes), ensuring flawless contrast and color tokens in both modes across all components.
- **Mobile Responsiveness & Micro-Interactions**: Ensure zero layout shifts (CLS = 0) and pristine responsive scaling down to 375px viewports. Add tactile micro-interactions on button clicks, form inputs, and tab switches.
- **Apple Wallet Digital ID Card**: Enhance the 3D tilt canvas card with metallic gradients, gold EMV chip, NFC wave badge, ISO/IEC 18004 QR code matrix, and 1-click 3x 300 DPI high-resolution PNG export.

### R2. Gamification Engine & Milestone Celebrations
- **Achievement Badges & XP System**: Implement an automated achievement badge system (7-Day Streak, 14-Day Streak, 30-Day Master, 50h & 100h Club, Subject Equilibrium Master, Early Bird, Night Owl) and an XP/Level progression bar computed from daily study hours and consistency.
- **Celebratory Animations & Auditory Feedback**: Add celebratory confetti bursts (via canvas-confetti or framer-motion) on daily log completion and streak extension, with subtle, toggleable audio chimes/sound effects for milestone achievements.

### R3. Automated Parent/Teacher PDF Study Report Generator
- **Monthly & Weekly Progress Reports**: Generate downloadable, formatted PDF performance reports designed for parent and teacher reviews.
- **Report Elements**: Include formal header, student profile, date range selector, total & daily average hours, subject breakdown pie/bar breakdown, streak analytics, cognitive AI remarks, and a verifiable verification QR code.

### R4. Multi-Format Analytics & Database Export Engine
- Support 1-click export of member directories, daily study logs, and analytics across 4 standardized formats:
  1. RFC 4180 compliant CSV
  2. Pretty-printed JSON
  3. Excel-compatible spreadsheet (.xlsx / XML spreadsheet format)
  4. Raw relational SQL dump (CREATE TABLE & INSERT INTO statements for PostgreSQL / MySQL / SQLite)

### R5. Cognitive AI & Z-Score Velocity Analytics Suite
- Complete the integration of the stream-tailored cognitive heuristic rule engine for Biological and Physical Science streams.
- Power the dynamic Z-score velocity gauge (Hastings CDF, Empirical Bayes shrinkage kappa=2.0), CognitiveAdvisorCard, CognitiveFatigueRadar, and What-If Simulator with live student study log data.

### R6. Telegram Bot Webhook & Real-Time Sync
- Fix and polish the Telegram bot webhook handler to reliably process /start, /status, /log, /leaderboard, and /remind commands.
- Ensure native Telegram update payloads and /api action payloads are both accurately parsed.
- Support automated daily digest and streak leaderboard markdown broadcasting.

### R7. Admin Dashboard & Member Management
- Provide interactive analytics KPI cards, study volume Bezier charts, and school breakdown progress bars.
- Ensure member directory DataTable supports search, stream/status filters, inline member edit modal with live sync, and bulk export actions.

### R8. Security Resilience & Concurrency Hardening
- Enforce 12-byte magic byte validation and polyglot rejection for proof photo uploads.
- Harden backend concurrency with LockService atomicity, 128-bit anti-replay nonces, timestamp drift checks (+-300s), CSV formula neutralization, and multi-tab sliding-window rate limiting.

### R9. Full-Stack Bug Squashing & 100% Test Pass Rate
- Resolve all failing tests in tests/m4-verification.test.js (duplicate submission lockout, history calculations) and tests/m7-telegram.test.js (webhook commands /start, /log, /status, and native update routing).
- Ensure 100% pass rate across all test suites (Tiers 1-5, 334+ automated tests) with zero errors.
- Ensure npm run build static export succeeds with zero compile or type errors into out/.

## Acceptance Criteria

### Automated Test Verification
- [ ] npm test passes with 100% success rate (0 failing tests out of 334+ tests).
- [ ] npm run build executes cleanly with zero TypeScript or static export errors.
- [ ] All API actions (checkUser, registerUser, submitDailyLog, getStudentHistory, telegramWebhook, broadcastDailyDigest, logTestMark, getTestMarks) pass all boundary, pairwise, and security stress tests.

### UI/UX, Data Export & Feature Verification
- [ ] Dark/Light mode toggle smoothly switches themes across all routes (/, /dashboard, /daily, /register, /id-card, /admin, /tests, /verify) with persistent localStorage preference.
- [ ] Gamification badges, XP progress bar, and celebratory confetti/sound animations render seamlessly on daily log submission.
- [ ] Parent/Teacher PDF study report modal opens, renders formatted preview, and triggers clean PDF print/export.
- [ ] Multi-format data export triggers valid downloads for CSV, JSON, Excel XLSX format, and SQL dump.
- [ ] All data visualization widgets (StudyTrendChart, SubjectBalanceCard, ZScoreVelocityGauge, CognitiveFatigueRadar, WhatIfSimulator) render without errors or clipping on mobile and desktop.
- [ ] Apple Wallet card renders 3D tilt effects, QR code matrix, and exports high-res 300 DPI PNG cleanly.

## 2026-08-27T11:15:52Z

Enhance StudySync with comfortable large tactile buttons, warm everyday conversational language across all components, clean low-density spacious layouts with maximum breathing room and zero text overflow, a complete Google Calendar-style Study Calendar & Scheduling Suite (Month, Week, Day views with past study history overlays, drag-and-drop session rescheduling, two-way Google Calendar event import/sync, study block scheduling, custom subject colors, 1-click Google Meet/Zoom study rooms, mobile lockscreen countdown widget generator, study start notifications, smart AI weekly study schedule generator, and assignment/homework tracker), a flexible Multiple Study Session Upload Facility across frontend and backend (with live automatic calculation, start/end time support, manual override options, and expandable session history drawers with badges), and zero-cache Firebase deployment.

Working directory: c:/Users/alwis/Documents/antigravity/dazzling-bardeen
Integrity mode: development

## Requirements

### R1. Button Ergonomics, Natural Human Language & Low Information Density
- **Comfortable Big Buttons**: Large, thumb-friendly buttons (minimum 44–48px height) with generous touch padding, clear readable labels, tactile active/hover states, and intuitive icons.
- **Simple, Everyday Human English**: Ban robotic or overly academic jargon across all pages, buttons, tooltips, cards, and AI advice. Use simple, supportive, everyday conversational words that real students and parents use.
- **Spacious Low-Density Layouts**: Never cram too much information into one card. Use generous whitespace, expansive padding (p-6 to p-10), clean card margins, large clear typography, and expandable accordions/drawers for extra details so the interface feels light, calm, and uncluttered.
- **Zero Text Clipping or Overflow**: Enforce break-words, truncate, and responsive flex wraps on all badges, tags, buttons, and containers across all screen sizes (375px+).

### R2. Google Calendar-Style Study Suite with Drag & Drop, AI Scheduler & Virtual Rooms
- **Interactive Calendar Views & Themes**: Provide a Google Calendar-inspired calendar view with smooth Month, Week, and Day navigation, styled with the official Google Calendar color palette and custom student subject color picker supporting dark and light themes.
- **Drag-and-Drop Rescheduling**: Support intuitive drag-and-drop rescheduling of study blocks across days and time slots with instant live schedule recalculation.
- **Virtual Study Room Links**: Enable 1-click generation of Google Meet and Jitsi/Zoom study room links attached to study blocks for group study sessions.
- **Past Study History Overlay**: Automatically display all past study logs as colored time blocks corresponding to subjects (Biology, Combined Maths, Physics, Chemistry, etc.) with hours, focus ratings, and notes.
- **Smart AI Study Schedule Generator**: 1-click generation of an optimized, balanced weekly study timetable tailored to the student's stream (Bio/Maths) and target exam year (2026–2029).
- **Homework & Assignment Tracker**: Track school/tuition assignments, model paper deadlines, and homework tasks with due date indicators on the calendar.
- **Two-Way Google Calendar Import & Sync**:
  - Ability to import Google Calendar .ics feeds or schedule links to view classes, school events, and tuition timetables directly on the StudySync calendar.
  - 1-click "Add to Google Calendar" links and RFC 5545 .ics export for planned study blocks.
- **A/L Exam Day Countdown & Mobile Lockscreen Widget Generator**:
  - Live countdown clock to the student's registered A/L exam year (2026–2029) and custom milestone targets (term test dates, model papers).
  - 1-click download of high-res mobile lockscreen countdown wallpaper / widget image.
- **Browser Study Session Notifications**: Optional browser notification reminders alerting students when a planned study block begins.

### R3. Dynamic Multi-Session Study Logger & Auto-Calculator
- **Dynamic Session Builder**: Provide an interactive session builder on /daily where students can add multiple study sessions (+ Add Session button) per day. Each session includes:
  - Subject selector (from the student's 3 registered stream subjects)
  - Duration in hours (or Start/End time picker with automatic decimal hour calculation)
  - Focus rating (1-10)
  - Optional session notes
- **Live Automatic Calculation & Manual Override Toggle**:
  - Live auto-summing of total hours per subject and overall daily study time as sessions are added or modified.
  - A clean toggle / input allowing students to directly enter or manually override their total hours and subject distribution whenever preferred.
- **Backend Schema & API Parity**:
  - Support sessions array in submitDailyLog in mock-server.js and Code.gs.
  - Store individual session details alongside aggregate subject hours, calculating overall focus and total hours automatically if not manually overridden.

### R4. Expandable History Table with Session Badges & Details Drawer
- Display compact, colored session badges (e.g. [Bio: 2.0h], [Phys: 1.5h]) directly inside history table rows.
- Support expanding rows or opening a detail drawer to inspect full session breakdown, exact timestamps, focus ratings, and individual session notes.

### R5. Zero-Cache Firebase Deployment
- Maintain zero-cache configuration (Cache-Control: no-cache, no-store, must-revalidate, max-age=0) in firebase.json so all deployments serve fresh static assets immediately.

### R6. Full Automated Test Suite Validation (100% Pass)
- Extend unit and E2E test suites (Tiers 1-5) to validate calendar views, drag-and-drop rescheduling, virtual study room generation, lockscreen widget generation, homework tracker, Google Calendar .ics exports, milestone countdowns, multi-session payloads, auto-calculation, and manual overrides.
- Ensure npm test and npm run test:e2e pass with 100% success rate, and npm run build succeeds cleanly.

## Acceptance Criteria

### Automated Verification
- [ ] Calendar schedule and .ics iCalendar generator produce valid RFC 5545 VCALENDAR payloads.
- [ ] AI Study Schedule generator computes balanced weekly allocations across the 3 stream subjects.
- [ ] Exam countdown engine accurately computes remaining days, hours, and milestones across 2026-2029 target years.
- [ ] submitDailyLog accepts and correctly stores multiple session objects in mock server and backend.
- [ ] Automatic summation calculates accurate subject and daily total hours from sessions.
- [ ] Manual override total hours are preserved when provided.
- [ ] npm test and node tests/e2e-runner.js pass with 100% success rate (0 failures).
- [ ] npm run build executes cleanly with zero compile or type errors.

### UI/UX & Functional Verification
- [ ] Buttons are large, comfortable, and easy to tap on mobile and desktop (minimum 44-48px touch target).
- [ ] Language across all pages is simple, friendly, and free of confusing jargon.
- [ ] Layout is spacious, low-density, and clean with zero text clipping or badge overflow on 375px+ screens.
- [ ] Full interactive Google Calendar view allows Month/Week/Day switching, drag-and-drop block movement, virtual meeting room creation, subject color personalization, and mobile countdown widget export.
- [ ] Smart AI schedule generator creates custom study blocks in 1-click.
- [ ] 1-click Google Calendar sync links and .ics file downloads work seamlessly.
- [ ] Daily log page allows adding, removing, and editing multiple sessions with real-time total updates.
- [ ] Session badges render on dashboard history rows with expandable session detail drawer.

## 2026-09-12T05:06:22Z

# StudySync — Authoritative Platform Redesign & Visual Routes Alignment

Comprehensive platform redesign of StudySync (Sri Lankan G.C.E. Advanced Level accountability LMS) using the single authoritative design system with exact dark/light tokens, restoring the top navigation bar with scoped Liquid Glass chrome, visual route alignment to the editorial showcase in reference image media_1789134809156.png, Firebase admin security, and functional bug remediation.

Working directory: c:/Users/alwis/Documents/antigravity/dazzling-bardeen
Integrity mode: development

## Requirements

### R1. Exact Design Tokens & Scoped Liquid Glass Chrome
- **Strict Color Architecture**: Dark mode (default) and Light mode (equal) must strictly adhere to the authoritative token table with zero external colors:
  - Page background: #0F1114 (Dark) / #F3F3F0 (Light)
  - Card / raised surface: #17191D (Dark) / #FFFFFF (Light)
  - Border (hairline): rgba(255,255,255,0.08) (Dark) / rgba(0,0,0,0.08) (Light)
  - Text primary: #EDEDEA (Dark) / #14171A (Light)
  - Text secondary / muted: #8B8D93 (Dark) / #5B5E63 (Light)
  - Accent (urgency, primary action): #C24942 (Dark) / #9E2F29 (Light)
  - Success (on-track): #5FAE74 (Dark) / #2F7A45 (Light)
- **Scoped Liquid Glass Chrome**: Restore the top navigation bar on all pages including / (removing if (pathname === '/') return null;). Liquid Glass material allowed ONLY on floating chrome above content (top nav, command palette, dialog sheets, and floating mobile CTA). All content surfaces (cards, tables, calendar, charts) remain completely flat and opaque.
- **Typography**: Editorial serif (Newsreader / Playfair Display) reserved strictly for real measurements (hours, streaks, Z-scores, test marks). Clean sans (Inter / Plus Jakarta Sans) for navigation and labels. Corners: 8px controls, 12px cards.

### R2. Landing Page Visual Route Showcase (media_1789134809156.png)
- Integrate the editorial showcase directly into the landing page hero:
  - Header: VISUAL ROUTES · PREMIUM WITHOUT THE PRODUCT-TEMPLATE FEEL
  - Headline: A learning space with a point of view.
  - Subtitle: Avoid the usual cheerful dashboard, floating gradient blobs, and course-card wallpaper. Give the LMS an editorial world: quiet structure, deliberate type, and one memorable visual gesture.
  - 3 Distinct Visual Route Cards:
    1. 01 / The Atelier (Warm academic): Ivory paper, forest ink, clay-red emphasis, generous margins (FRACTIONAL GRID · SERIF DISPLAY · HAND-DRAWN MICRO-MARKS) with clay-red circular arc gesture.
    2. 02 / The Reading Room (Quiet scholarly): Deep evergreen, faded sage, ivory text (DARK LIBRARY · TALL TYPOGRAPHY · BOOKMARK PROGRESS) with subtle watermark serif 'A'.
    3. 03 / The Studio Index (Modernist precise): Monochrome learning archive, hairline rules, asymmetric layout (SWISS RESTRAINT · MONO DETAILS · OBJECT-LIKE CARDS) with geometric line-art gesture.
  - Retain the Sri Lankan A/L exam countdown clock, Google Auth / Study ID login gate, and student verification access.

### R3. Core Learner & Study Accountability Surfaces
- Dashboard: Today's streak, study hours, subject balance, exam countdown, and one clear next action ("Log today's study").
- Daily Log: Fast, friction-free entry of study sessions per subject with real-time automatic calculation and manual override.
- Calendar: Month, Week, and Day views with past study history overlays, drag-and-drop rescheduling, and .ics export.
- Tests & AI: Recorded scores and single authoritative Estimated A/L Z-Score headline. AI assistance framed as direct actions ("Ask about this topic", "Turn this into notes") without floating chatbot orbs.
- Digital ID Card: 300 DPI high-resolution export with ISO/IEC 18004 QR verification matrix.

### R4. Security & Functional Bug Remediation
- Admin Authentication & Role Gate: Protect /admin with Firebase Authentication and role-based checks (custom claims / whitelist). Prevent unauthorized access and protect student data.
- Admin 7-Day Group Study Volume: Fix date mapping so real logged hours populate the daily volume chart accurately instead of showing 0h.
- Tests & AI Z-Scores: Harmonize the dual numbers so the single headline reflects the authoritative composite Z-score.
- AI Study Timetable: Confirm and verify the stream-balanced 35-hour allocation algorithm.

## Acceptance Criteria

### Visual & Architectural Integrity
- [ ] Top navigation bar is visible and fully functional on all routes including /.
- [ ] Base tokens strictly match #0F1114 / #F3F3F0, #17191D / #FFFFFF, #C24942 / #9E2F29, and #5FAE74 / #2F7A45.
- [ ] Landing page renders the 3-route architectural showcase matching media_1789134809156.png.
- [ ] Zero neon gradients, glassmorphic content cards, or floating chatbot orbs.
- [ ] Liquid Glass is strictly applied only to top chrome, modals, and floating action button.

### Functional & Security Verification
- [ ] Unauthenticated users are redirected from /admin to sign-in.
- [ ] Admin 7-Day study volume chart displays non-zero values for active study dates.
- [ ] Tests page displays one singular clearly labeled estimated A/L Z-score headline.
- [ ] All 6 LMS roles and mock API actions function without degradation.

### Automated Testing & Deployment
- [ ] npm test passes with 100% success rate (423/423 tests passing).
- [ ] node tests/e2e-runner.js passes with 100% success rate (469/469 tests passing across Tiers 1–5).
- [ ] npm run build succeeds cleanly with zero compile or type errors.
- [ ] Deployed to Firebase Hosting (https://studysync-al-2026.web.app).

## 2026-09-12T14:34:51Z

Rebuild and harmonize the entire StudySync Sri Lankan A/L web application across all 9 pages simultaneously using the Google Stitch design system and screen layouts from Stitch project `5007748334507611824`, equipping every UI element and button with live backend functionality, seamless top navigation across all routes, conversational Gen-Z friendly English, fluid scroll animations, Notion/Claude-style monolinear illustrations, dynamic subject builders, PDF past-paper resource management with hybrid local/cloud persistence, and robust responsive layout containment.

Working directory: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
Integrity mode: development

## Requirements

### R1. Complete 9-Page Google Stitch Design System & Responsive Overflow Fixes
Harmonize all 9 views (`/`, `/register`, `/dashboard`, `/daily`, `/calendar`, `/tests`, `/id-card`, `/admin`, `/verify`) with the authoritative Google Stitch design tokens and frontend layouts from Stitch project `5007748334507611824`. Ensure the top navigation bar is active across all routes with consistent active link states. Eliminate all clipping, text overflow, and horizontal scrolling across viewports (specifically fixing the streak pill badge and stat cards on mobile 375px screens).

### R2. End-to-End Interactivity & Full Button Functionality
Audit and implement live functionality for every button, modal, form, and tab across the application. Ensure all buttons in the Admin Dashboard (Verify, Edit, Delete, Bulk Actions, 7-Day Volume Chart date aggregation, Form Builder, Study Room Generator, and Countdown Sync) and student pages are completely functional with real data persistence.

### R3. Natural Gen-Z Conversational English & Dynamic Data Placeholders
Replace robotic and academic jargon with warm, supportive, and conversational everyday phrasing. Structure all displayed metrics around robust template variables (`{{user_name}}`, `{{streak_count}}`, `{{exam_countdown_days}}`, `{{composite_z_score}}`).

### R4. Premium Scroll Animations & Claude/Notion Monolinear Illustrations
Implement smooth, 60fps GPU-accelerated scroll-triggered reveals, micro-interactions, and custom vector monolinear illustrations (inspired by Claude, Anthropic, and Notion) for subject streams, empty states, and milestone achievements.

### R5. Academic Resource Vault (Hybrid Persistence) & Dynamic Subject Builder
Build a dedicated PDF and revision file management facility supporting document uploads, downloads, and interactive in-browser previews for past papers and tutorials, backed by a hybrid IndexedDB + Google Apps Script synchronization model. Provide nested modal dialogs allowing students to add and customize subject tracks.

## Acceptance Criteria

### Visual & Layout Integrity
- [ ] Top navigation bar renders consistently on all routes with active link indicators, streak badge, and security triggers.
- [ ] Mobile viewports (375px+) render without horizontal overflow, clipped text, or broken badges.
- [ ] Flat opaque content cards maintain high contrast with hairline borders and zero distracting glass blur over content.

### Functional Completeness
- [ ] 100% of buttons across the Admin Dashboard, Student Dashboard, Daily Logger, and Calendar trigger live, working flows.
- [ ] PDF and document vault allows uploading files, displaying formatted previews, and downloading revision notes.
- [ ] Dynamic subject manager allows creating, selecting, and editing custom curriculum subjects.
- [ ] Complete login, biometric PIN session lock, and logout lifecycle operates reliably.

### Build & Verification
- [ ] `npm run build` completes with zero TypeScript or compilation errors.
- [ ] `npm test` and end-to-end test runner pass with 100% success rate.

## 2026-09-13T06:17:34Z

Implement a complete, production-grade animated vector illustration and visual asset system across the entire StudySync LMS platform (Landing Hero, Dashboard, Daily Stopwatch, Tests & Z-Score, Calendar, Admin Desk, and Empty States) in the distinctive monoline style with fluid CSS micro-animations.

Working directory: c:\Users\alwis\Documents\antigravity\dazzling-bardeen
Integrity mode: development

## Requirements

### R1. Full-Platform Monoline Vector Assets
Deploy scalable, responsive inline SVG vector components across all core routes, establishing dedicated visuals for academic focus, milestone streaks, exam forecasts, calendar rhythms, and administrative oversight.
- Unified palette: pure white card surfaces, uniform-weight dark blue-black contours (`#19202e`), and flat spot fills in salmon-pink (`#fa7268`), muted yellow (`#fcd34d`), and soft orange (`#fb923c`).
- Clean, rounded-corner container framing matching the editorial aesthetic.

### R2. Subtle Ambient Micro-Animations & Tactile States
Incorporate smooth 60fps micro-animations:
- Gentle continuous ambient loops: drifting stars, soft lamp glows, floating clouds, and rhythmic breath pulses.
- Tactile interactive feedback: smooth hover scaling, click feedback, and completion reward pulses.
- Zero layout shift, full hardware acceleration, and `prefers-reduced-motion` compliance.

### R3. Accessibility & System Harmony
- Strict AAA typography and contrast compliance against card and page backgrounds.
- Zero raw emoji usage across all pages, strictly using monoline vector assets and Lucide icon sets.
- Complete mobile responsiveness ensuring illustrations scale cleanly without clipping or text collision on small viewports (<380px).

## Verification Resources
- Existing automated test suite: `npm test` (472 tests across Tiers 1–5).
- TypeScript static analysis: `npx tsc --noEmit`.
- Next.js production build: `npm run build`.

## Acceptance Criteria

### Visual Polish & Route Integration
- [ ] Every major platform route (Landing, Dashboard, Daily Focus, Tests & Z-Score, Calendar, Admin Desk, Empty States) features dedicated animated monoline vector assets.
- [ ] Visual assets render crisp vector contours without raster blur or scaling artifacts.

### Performance & Motion Standards
- [ ] All animations run at 60fps with zero layout shifts or touch interference on mobile devices.
- [ ] `prefers-reduced-motion` gracefully halts ambient motion while preserving layout integrity.

### Codebase & Quality Integrity
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm test` passes 100% across all 5 tiers without regressions.
- [ ] `npm run build` completes successfully with clean static page generation.

## 2026-09-17T03:27:09Z

Complete production-grade stabilization, offline digital pass verification, real-time camera QR scanning, dynamic weekly planner sync, and rigorous zero-defect build verification across the entire StudySync A/L portal.

Working directory: c:\Users\alwis\Documents\antigravity\dazzling-bardeen
Integrity mode: development

## Requirements

### R1. Offline Digital Pass & Route Mirroring
Deploy full offline pass caching and seamless route symmetry for `/pass` and `/id-card`. Ensure student credentials, verified state, and QR identity load immediately via `safeStorage` without requiring internet connectivity, with print and wallet export options preserved.

### R2. Camera QR Code Scanner & Admittance Verification
Provide live camera scanning and photo upload QR decoding using `jsqr` across administrative and public verification routes (`/verify` and `/admin`). Enable one-tap candidate verification and automatic archival for reviewed submissions into `safeStorage`.

### R3. Dynamic Weekly Planner & Syllabi Balance Sync
Connect `/calendar` to real session logs (`localDb.getLogs()`) to compute dynamic subject distributions, rest/recovery gauges, and exam sprint milestones. Replace any remaining direct `localStorage` calls with resilient `safeStorage`.

### R4. Complete Zero-Defect Build & Test Suite Verification
Resolve all TypeScript compilation issues, ensure 100% test pass rate across all tiers (`npm test`), and produce a clean, fully hydrated static production export (`npm run build`).

## Verification Resources
- TypeScript compiler static analysis: `npx tsc --noEmit`
- Automated test suites: `npm test` (multi-tier empirical, boundary, and unit suites)
- Production export build: `npm run build`

## Acceptance Criteria

### Code Quality & Static Analysis
- [ ] `npx tsc --noEmit` exits with status code 0 (zero TypeScript errors across the entire codebase).
- [ ] `npm run build` completes successfully with clean static page generation.
- [ ] All test suites in `npm test` pass with 100% success rate without regressions.

### Feature Deliverables
- [ ] Camera QR scanner operates smoothly in both live video feed and photo upload fallback modes.
- [ ] `/pass` route mirrors the official digital student pass and caches credentials for offline access.
- [ ] Admin submission review workflow moves approved student logs to the "Reviewed Archive" view.
- [ ] Weekly planner metrics reflect real recorded study hours from `localDb.getLogs()`.

## 2026-09-17T03:32:42Z

DIRECTIVE UPDATE FOR ALL SENTINELS, ORCHESTRATORS & WORKERS:
1. Omni Design Standards (C:\Users\alwis\.gemini\antigravity\skills\Omni):
   - Strict palette preservation: Keep existing light card surfaces (#fef8f4, #ffffff), dark contours & typography (#19202e, #1d1b19), and accents (#c85a32, #fcd34d, #fa7268, #456644, #fb923c).
   - Follow Apple HIG layout hierarchy, clean typography, and Material Design 3 tokens.
   - Fluid spring physics and tactile micro-interactions with zero layout shifts.

2. Accidental Data Loss Prevention (C:\Users\alwis\.gemini\config\skills\accidental-data-loss-prevention\SKILL.md):
   - STOP AND VERIFY before running any destructive commands or modifying production data. Never delete, drop, or truncate without explicit consent. Preserve backup repositories.

3. Backend & Full-System Architecture:
   - Ensure real backend/localDb synchronization works reliably without unhandled Firebase Auth race conditions or unhandled rejections during hydration.
   - Ensure all storage access is routed through safeStorage with in-memory fallback for private browsing.
   - Maintain 0 TypeScript static analysis errors (npx tsc --noEmit), pass automated tests (npm test), and verify clean static build export (npm run build).
