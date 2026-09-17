## 2026-09-12T05:07:25Z

You are orchestrator_6, the Project Orchestrator for the StudySync platform redesign and visual routes alignment project.

Working directory: c:/Users/alwis/Documents/antigravity/dazzling-bardeen/.agents/orchestrator_6
Project root: c:/Users/alwis/Documents/antigravity/dazzling-bardeen

Read the authoritative user request at:
c:/Users/alwis/Documents/antigravity/dazzling-bardeen/.agents/ORIGINAL_REQUEST.md (specifically section ## 2026-09-12T05:06:22Z).

Key Objectives & Requirements:
1. R1: Exact Design Tokens & Scoped Liquid Glass Chrome
   - Strict color architecture: #0F1114 / #F3F3F0 (bg), #17191D / #FFFFFF (surface/cards), #C24942 / #9E2F29 (accent), #5FAE74 / #2F7A45 (success), hairline border rgba(255,255,255,0.08) / rgba(0,0,0,0.08). Zero external colors.
   - Restore top navigation bar on all pages including / (removing if (pathname === '/') return null;).
   - Scoped Liquid Glass material allowed ONLY on floating chrome above content (top nav, command palette, dialog sheets, floating mobile CTA). All content cards, tables, calendar, charts remain flat and opaque.
   - Editorial serif (Newsreader / Playfair Display) reserved strictly for real measurements (hours, streaks, Z-scores, test marks). Clean sans (Inter / Plus Jakarta Sans) for navigation and labels. Corners: 8px controls, 12px cards.
2. R2: Landing Page Visual Route Showcase (matching media_1789134809156.png)
   - Header: VISUAL ROUTES · PREMIUM WITHOUT THE PRODUCT-TEMPLATE FEEL
   - Headline: A learning space with a point of view.
   - Subtitle: Avoid the usual cheerful dashboard, floating gradient blobs, and course-card wallpaper. Give the LMS an editorial world: quiet structure, deliberate type, and one memorable visual gesture.
   - 3 Distinct Visual Route Cards:
     01 / The Atelier (Warm academic): Ivory paper, forest ink, clay-red emphasis, generous margins (FRACTIONAL GRID · SERIF DISPLAY · HAND-DRAWN MICRO-MARKS) with clay-red circular arc gesture.
     02 / The Reading Room (Quiet scholarly): Deep evergreen, faded sage, ivory text (DARK LIBRARY · TALL TYPOGRAPHY · BOOKMARK PROGRESS) with subtle watermark serif 'A'.
     03 / The Studio Index (Modernist precise): Monochrome learning archive, hairline rules, asymmetric layout (SWISS RESTRAINT · MONO DETAILS · OBJECT-LIKE CARDS) with geometric line-art gesture.
   - Retain Sri Lankan A/L exam countdown clock, Google Auth / Study ID login gate, and student verification access.
3. R3: Core Learner & Study Accountability Surfaces
   - Dashboard: Today's streak, study hours, subject balance, exam countdown, next action ("Log today's study").
   - Daily Log: Friction-free entry with real-time automatic calculation and manual override.
   - Calendar: Month, Week, Day views with past study history overlays, drag-and-drop rescheduling, .ics export.
   - Tests & AI: Recorded scores and single authoritative Estimated A/L Z-Score headline. AI assistance framed as direct actions without floating chatbot orbs.
   - Digital ID Card: 300 DPI high-resolution export with ISO/IEC 18004 QR verification matrix.
4. R4: Security & Functional Bug Remediation
   - Protect /admin with Firebase Authentication and role-based checks. Unauthenticated users redirected to sign-in.
   - Admin 7-Day Group Study Volume: Fix date mapping so real logged hours populate daily volume chart accurately instead of showing 0h.
   - Tests & AI Z-Scores: Harmonize dual numbers into single headline composite Z-score.
   - AI Study Timetable: Confirm and verify stream-balanced 35-hour allocation algorithm.
5. Testing & Verification:
   - npm test must pass with 100% success rate (423/423 tests passing).
   - node tests/e2e-runner.js must pass with 100% success rate (469/469 tests passing across Tiers 1–5).
   - npm run build succeeds cleanly with static export to out/.
   - Deploy to Firebase Hosting (https://studysync-al-2026.web.app).
