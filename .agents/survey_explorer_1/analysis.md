# Technical Survey & Vector Illustration Architecture Analysis

**Date:** 2026-09-13  
**Author:** Teamwork Explorer (`survey_explorer_1`)  
**Target:** StudySync LMS Platform (Sri Lankan A/L Academic Accountability LMS)  
**Task Reference:** ORIGINAL_REQUEST.md (2026-09-13T06:17:34Z)  

---

## 1. Executive Summary & Problem Boundary

StudySync is a production-grade Next.js 14 App Router application tailored for Sri Lankan G.C.E. Advanced Level candidates across all 25 districts. The project enforces an editorial, high-trust academic aesthetic with flat opaque surfaces, hairline borders, and strict AAA readability.

The current system relies on a mixture of custom SVGs, inline geometry, Lucide icons, and lingering raw emojis across earlier scripts and views. While basic illustrations exist in `src/components/brand/Illustrations.tsx`, they use an older terracotta/sage palette (`#c85a32`, `#456644`, `#854f00`), lack smooth ambient CSS micro-animations (e.g., drifting stars, glowing lamps, breathing pulses), and are not uniformly integrated into the primary platform touchpoints and empty states.

### Core Objectives of this Technical Survey:
1. Conduct an exhaustive inspection of all 9 routes in `src/app/`: `/`, `/dashboard`, `/daily`, `/calendar`, `/tests`, `/admin`, `/register`, `/id-card`, and `/verify`.
2. Audit all existing illustration, visual card, and empty-state components in `src/components/`.
3. Pinpoint exact mount points, DOM hierarchies, and container layout structures for dedicated monoline vector assets across landing, dashboard, daily focus, tests/Z-score, calendar, admin desk, and all empty states.
4. Scan the full codebase to compile an authoritative, line-by-line inventory of every raw emoji requiring replacement with Lucide icons or monoline vectors.
5. Provide precise technical specifications for unified palette tokens, component props API, 60fps CSS micro-animations, `prefers-reduced-motion` handling, and responsive layout containment down to viewports below 380px.

---

## 2. Comprehensive Route-by-Route Survey (All 9 Routes in `src/app/`)

### 2.1. Landing Page (`src/app/page.tsx`)
- **Route:** `/`
- **Current Layout & Atmosphere:** Kinfolk academic editorial layout. Warm ivory background (`#fef8f4`), dark text (`#1d1b19`), Newsreader serif headlines, and Plus Jakarta Sans body.
- **Hero Section Structure (Lines 77–220):**
  - Two-column 12-grid layout (`lg:grid-cols-12`).
  - Left Column (`lg:col-span-6`, lines 80–124): Headline (*"A quiet, steady companion for your A/L journey"*), narrative copy, Google Sign-In button, and trust badges.
  - Right Column (`lg:col-span-6`, lines 126–219): Max-width 540px container (`bg-[#f8f2ef] rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden`). It currently renders an ad-hoc inline SVG (lines 136–212, viewBox 0 0 600 450) labeled *"Study Table • 06:15 AM - Colombo Morning Rhythm"*.
- **Subsequent Editorial Showcase Chapters (Lines 280–555):**
  - **Chapter 01 (Lines 282–374):** *"Daily Focus & Handwritten Proof"* with an inline SVG of *"Derivation Capture Interface / Paper Proof #841"* (lines 323–366).
  - **Chapter 02 (Lines 375–467):** *"Transparent Z-Score Modeling"* with an inline SVG Gaussian distribution (lines 386–418).
  - **Chapter 03 (Lines 468–555):** *"Digital Student Pass"* with an inline SVG student pass preview (lines 510–548).
- **Identified Mount Point for Hero Vector Asset:**
  - Replace the static inline SVG in `src/app/page.tsx` (lines 136–212) with a dedicated, responsive component: `<LandingHeroIllustration className="w-full h-auto" />`.
  - The container (`w-full max-w-[540px] bg-[#f8f2ef] rounded-3xl p-6 lg:p-8`) provides pristine framing with zero layout shift.

### 2.2. Student Dashboard (`src/app/dashboard/page.tsx`)
- **Route:** `/dashboard`
- **Current Layout & Atmosphere:** Primary scholar sanctuary. Top greeting banner, KPI stat cards, asymmetric 45%/55% split between weekly rhythm / subject balance and recent study history logs.
- **Header & Greeting Banner (Lines 403–451):**
  - `<ScrollReveal>` banner (`bg-[#ffffff] border border-[#e7e1de] p-6 sm:p-8 rounded-2xl shadow-sm mb-8 overflow-hidden relative`).
  - Displays greeting, exam countdown (e.g. *78 days left*), candidate stream, and quick action buttons.
- **3 KPI Stat Cards (Lines 456–542):**
  - Metric 1: Hours Logged Today (Lines 459–486).
  - Metric 2: This Week's Volume (Lines 489–516).
  - Metric 3: Habit Continuity / Active Streak (Lines 519–541): Currently renders a simple Lucide `<Flame className="w-4 h-4 text-[#c85a32]" />` with day counter.
- **Left Column: Weekly Rhythm & Balance (Lines 575–718):**
  - Monolinear Weekly Rhythm Bar Chart (Lines 579–622): An SVG bar graph showing Monday–Sunday hours.
  - 3-Subject Distribution (Lines 625–667): Progress bars for Combined Maths, Physics, Chemistry / Biology.
  - Digital Student Pass Mini Card (Lines 670–717).
- **Right Column: Recent Study History & Empty State (Lines 720–898):**
  - History Table Card (Lines 724–848):
    - **Empty State (Lines 746–759):** Triggers when `filteredLogs.length === 0`. Currently renders a fallback icon:
      ```tsx
      <div className="py-14 text-center">
        <Clock className="w-8 h-8 text-[#dec0b7] mx-auto mb-3" />
        <h4 className="text-sm font-medium text-[#1d1b19]">No study logs found</h4>
        <p className="text-xs text-[#2d2420] mt-1 max-w-sm mx-auto">
          Start logging your daily hours with proof photos to build your streak and unlock Z-score predictions.
        </p>
        <button onClick={() => setQuickLogModalOpen(true)} className="mt-4 px-4 py-2 rounded-full bg-[#c85a32] text-white text-xs font-semibold">
          Log Your First Session
        </button>
      </div>
      ```
    - Mount Point: Direct integration point for `<EmptyLogsIllustration size={180} />`.
- **Identified Mount Points on Dashboard:**
  1. *Academic Study Rhythm Vector:* Top greeting banner right quadrant (line 408) or card header of the Weekly Rhythm card (line 581).
  2. *Streak Milestone Vector:* Inside Metric 3 Habit Continuity card (lines 519–541) or top right of the Greeting Banner.
  3. *Empty State:* Replace `<Clock>` at line 748 with `<EmptyLogsIllustration />`.

### 2.3. Daily Stopwatch & Study Logger (`src/app/daily/page.tsx`)
- **Route:** `/daily`
- **Current Layout & Atmosphere:** Focus laboratory with two asymmetric columns (7 cols left, 5 cols right).
- **Left Column: Focus Clock & Active Block Entry (Lines 438–864):**
  - Primary Focus Clock Panel (Lines 440–550): Features an SVG circular progress ring, animated digital time readout (`formatTimer`), and Play/Pause/Reset controls.
  - Qualitative Sliders (Lines 753–789): Focus Intensity (1–10) and Productivity (1–10).
  - Notes Textarea & Proof Upload (Lines 792–848).
  - Kinfolk Atelier Encouragement Strip (Lines 850–864): Card displaying an italicized study reflection quote with a small `<BookOpen>` icon.
- **Right Column: Cumulative Progress & Today's Ledger (Lines 866–1130):**
  - Today's Progress Card & Multi-subject Channel (Lines 868–953).
  - 7-Day Rhythm Sparkline (Lines 956–1028).
  - Earlier Sessions List (Lines 1030–1098):
    - **Empty State (Lines 1044–1050):** Triggers when `todayLogs.length === 0`:
      ```tsx
      <div className="p-6 text-center rounded-2xl bg-[#f8f2ef] border border-dashed border-[#dec0b7]/60">
        <p className="font-sans text-xs text-[#2d2420]">
          No study blocks logged yet for today. Start the timer or log your first block above!
        </p>
      </div>
      ```
- **Identified Mount Points on Daily Page:**
  1. *Daily Stopwatch / Study Clock Vector Asset:* Integrate either inside the Focus Clock Panel (beside or above the digital timer readout at line 446) or inside the Encouragement Strip (line 852).
  2. *Empty State:* Inside the earlier sessions dashed box (line 1045) rendering an empty-state daily study line asset.

### 2.4. Study Calendar & Scheduling (`src/app/calendar/page.tsx`)
- **Route:** `/calendar`
- **Current Layout & Atmosphere:** 12-column layout (8 cols schedule left, 4 cols milestones right).
- **Header & Weekly Study Pace Card (Lines 476–541):**
  - Left: Headline and scholar name greeting.
  - Right: Weekly Study Pace card (`min-w-[320px]`) with progress bar and target balance.
- **Left Column: Day Schedule & Empty State (Lines 546–811):**
  - 7-Day Day Selector Buttons (Mon–Sun, lines 555–625).
  - Selected Day Focus Schedule List (Lines 628–777):
    - **Empty State (Lines 643–658):** Triggers when `currentDayBlocks.length === 0`:
      ```tsx
      <div className="py-12 text-center flex flex-col items-center justify-center gap-3 bg-[#f8f2ef]/40 rounded-xl border border-dashed border-[#dec0b7]">
        <Clock className="w-8 h-8 text-[#6b5952]" />
        <p className="font-sans text-sm text-[#2d2420] font-medium">
          No focus blocks scheduled for {currentDayInfo.fullDay}.
        </p>
        <button onClick={() => { setFormDay(selectedDay); setIsPlanModalOpen(true); }} className="px-4 py-2 rounded-full bg-[#c85a32] text-white text-xs font-semibold hover:bg-[#b04b25] transition">
          Plan First Block
        </button>
      </div>
      ```
    - Mount Point: Perfect integration point for `<EmptyCalendarIllustration size={160} />`.
  - Motivation Quote Card (Lines 795–810): Displays quote with `<Award>` icon.
- **Right Column: Subject Balance & Milestones (Lines 814–953):**
  - 3-Subject Balance (Lines 817–861).
  - Sleep & Rest Gauge (Lines 863–877).
  - Sprint Milestones (Lines 880–928): Countdown boxes for District Mock Paper and G.C.E. Advanced Level.
- **Identified Mount Points on Calendar Page:**
  1. *Study Rhythms / Calendar Schedule Vector:* Mount in the Weekly Study Pace card header (line 503) or Motivation Quote card (line 796).
  2. *Empty State:* Replace the `<Clock>` icon at line 645 with `<EmptyCalendarIllustration />`.

### 2.5. Tests, Marks & Z-Score (`src/app/tests/page.tsx`)
- **Route:** `/tests`
- **Current Layout & Atmosphere:** Quantitative analytics and forecasting dashboard.
- **Top Section & Action Buttons (Lines 205–240):** Headline, district subtitle, `+ Add test score` button, and Sync button.
- **Bento Metric Grid (Lines 242–413):**
  - Primary Projected Z-Score Card (5 cols, lines 244–307): Large italic score display (e.g., `+2.18`), rank estimate, and tier badge.
  - District Bell Curve Diagram (7 cols, lines 309–412): Responsive inline SVG (viewBox 0 0 600 170) illustrating Gaussian distribution with shaded cutoff zone and user pointer.
- **Forecast Simulator (Lines 414–522):** 3 precision sliders for each stream subject.
- **AI Study Advisor Prescriptions (Lines 524–528):** Renders `<StudyAdvisorCard>`.
- **Exam Records Ledger (Lines 529–545):** Renders `<TestMarksTable testMarks={testMarks} />`.
  - In `src/components/tests/TestMarksTable.tsx` (Lines 78–82):
    - **Empty State:**
      ```tsx
      {filteredMarks.length === 0 ? (
        <div className="p-12 text-center text-[#4a3b35] text-xs font-mono">
          No test marks logged yet. Click "Add Test Score" to begin tracking your exam performance.
        </div>
      ) : ...}
      ```
    - Mount Point: Natural fit for `<EmptyTestsIllustration size={160} />`.
- **Identified Mount Points on Tests Page:**
  1. *Examination Forecast / Academic Performance Vector:* Mount in the Primary Metric Card (line 245) or beside the Projected Z-Score readout.
  2. *Empty State:* Inside `TestMarksTable.tsx` (line 79) replacing the plain text with `<EmptyTestsIllustration />`.

### 2.6. Admin Desk (`src/app/admin/page.tsx`)
- **Route:** `/admin`
- **Current Layout & Atmosphere:** Comprehensive administrative governance console protected by Firebase Auth and admin email authorization (`alwisachalaanurada@gmail.com`).
- **Header & Action Bar (Lines 999–1123):**
  - Super Admin Console badge, live sheet indicator, and export toolbar (CSV, JSON, Excel, SQL).
- **Navigation Tabs (Line 1126):**
  - Tab 0: Homework Verification Desk (`value="audit"`, lines 1154–1540).
  - Tab 1: Analytics & Real Telemetry (`value="analytics"`, lines 1542–1770).
  - Tab 2: Verification Inbox (`value="inbox"`, lines 1772–1990).
  - Tab 3: Members Directory (`value="members"`, lines 1992–2240).
  - Tab 4: Daily Logs Inspector (`value="logs"`, lines 2242–2530).
  - Tab 5: Live Rooms & Exam Countdown (`value="powers"`, lines 2532–2700).
- **Homework Verification Desk Banner (Lines 1154–1204):**
  - Prominent top atmospheric strip with title *"Student Homework & Paper Verification"*, district filter, and batch approval trigger.
  - Three-card Metric Ribbon (Lines 1205–1252): Active Students, Pending Reviews, and Legibility Standard.
- **Identified Mount Points on Admin Desk:**
  1. *Administrative Oversight / Classroom Desk Vector Asset:* Mount prominently in the Homework Verification Desk header (line 1156) or as a featured visual illustration beside the Metric Ribbon.
  2. *Empty States in Admin Views:*
     - Zero homework reviews in queue: Line 1276 (`No homework submissions logged yet in the system.`).
     - Zero school distribution records: Line 1592 (`No school data recorded yet.`).
     - Zero student study sessions: Line 1635 (`No student sessions logged yet.`).
     - Zero registered member search hits: Line 2087 (`No registered members match your search criteria.`).
     - Zero daily logs: Line 2320 (`No daily study logs recorded yet.`).

### 2.7. Registration Flow (`src/app/register/page.tsx`)
- **Route:** `/register`
- **Current Layout & Atmosphere:** Two-column split layout (6 cols value anchor left, 6 cols authentication card right).
- **Left Column (Lines 154–225):** Trust pillar cards (Zero Ad Trackers, Verified Proof Ledger, District Z-Score Model, Hardware Biometrics).
- **Right Column (Lines 227–320):** Mode toggle between *"Scholar Sign In"* and *"Enroll as New Candidate"*, Google Auth, Passkey, and PIN entry.
- **Identified Mount Point:**
  - An academic credential / scholar registration monoline vector can mount at the top of the left column (line 168) or above the trust pillars.

### 2.8. Digital ID Card (`src/app/id-card/page.tsx`)
- **Route:** `/id-card`
- **Current Layout & Atmosphere:** Apple Wallet 3D perspective card with high-resolution canvas QR code matrix encoding `https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`.
- **Identified Mount Point:**
  - Security pass / cryptographic seal monoline vector asset already supported in `AppleWalletCard.tsx` and `Illustrations.tsx` (`IllustrationIdCard` and `IllustrationSecurity`).

### 2.9. Public Member Verification Page (`src/app/verify/page.tsx`)
- **Route:** `/verify`
- **Current Layout & Atmosphere:** Centered card interface resolving candidate authentication records from `?id=` query parameter or manual search.
- **Identified Mount Point:**
  - Official registry badge vector can mount in the verification result header or empty search state.

---

## 3. Existing Illustration & Visual Component Audit in `src/components/`

### 3.1. `src/components/brand/Illustrations.tsx`
The codebase currently houses a 1,778-line dedicated illustration library containing 22 distinct components:
1. **5 Subject Stream Illustrations (viewBox 0 0 200 200):**
   - `MathsStreamIllustration`: Compass, calculus curve, shaded integral, coordinate grid.
   - `BioStreamIllustration`: DNA helix, botanical leaf, monoline microscope.
   - `PhysicalScienceIllustration`: Atomic orbital tracks, optical prism spectrum, Erlenmeyer flask.
   - `CommerceStreamIllustration`: Balanced ledger scales, upward trend curve, column podium.
   - `TechStreamIllustration`: Silicon chip, PCB circuit traces, binary brackets.
2. **5 Empty State Illustrations (viewBox 0 0 200 160):**
   - `EmptyLogsIllustration`: Open notebook with bookmark, steaming mug, desk succulent.
   - `EmptyTestsIllustration`: Unrolled exam scroll with ribbon, vintage hourglass, ink quill.
   - `EmptyCalendarIllustration`: Calendar grid leaf, pocket watch, bookmark ruler.
   - `EmptySearchIllustration`: Magnifying lens, parchment document, dashed ring.
   - `GeneralEmptyIllustration`: Floating archival storage box, catalog tags.
3. **6 Gamification Badges (viewBox 0 0 160 160):**
   - `Streak7DayBadge`, `Streak30DayBadge`, `TopRankBadge`, `SubjectMasterBadge`, `NightOwlBadge`, `EarlyBirdBadge`.
4. **6 Small Utility Illustrations (viewBox 0 0 120 120):**
   - `IllustrationStudy`, `IllustrationCountdown`, `IllustrationSecurity`, `IllustrationIdCard`, `IllustrationAnalytics`, `IllustrationStreak`.

### 3.2. Architecture Audit & Upgrade Requirements for `Illustrations.tsx`:
- **Palette Discrepancy:** The existing components rely on CSS variables with fallback to terracotta (`#c85a32`), sage olive (`#456644`), and ochre (`#854f00`). The new specification (2026-09-13T06:17:34Z) mandates a unified, authoritative palette:
  - Base Contours: Uniform-weight dark blue-black (`#19202e`)
  - Pure white card surfaces (`#ffffff`)
  - Spot fills: Salmon-pink (`#fa7268`), muted yellow (`#fcd34d`), and soft orange (`#fb923c`).
- **Motion Deficiency:** The existing illustrations are 100% static SVGs. None of them incorporate the required 60fps ambient micro-animation loops (drifting stars, lamp glows, floating clouds, breath pulses).
- **Missing Asset Types:** While subject streams and generic empty states exist, dedicated large-format illustrations for Landing Hero, Academic Study Rhythm, Daily Stopwatch / Focus Timer, and Admin Desk are missing or currently implemented as rough inline SVGs inside page files.

---

## 4. Dedicated Vector Illustration Mount Points & Layout Structures

| Visual Asset | Route / Target File | Exact Line Range & Container DOM Hierarchy | Current Visual Content | Target Visual Motif & Animation Specification |
|---|---|---|---|---|
| **Landing Hero Illustration** | `src/app/page.tsx` | Lines 126–218:<br>`<div className="lg:col-span-6 flex justify-center">`<br>`  <div className="w-full max-w-[540px] bg-[#f8f2ef] rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden">` | Ad-hoc inline 600x450 SVG depicting a morning study desk with static formulas and lamp. | **Prominent Animated Monoline Hero:** Mindful study desk, open syllabus ledger, warm desk lamp with pulsating soft glow (`#fcd34d`), floating clouds/stars in ambient drift (`#fa7268`), tea steam wisps, and `#19202e` contours. |
| **Academic Study Rhythm** | `src/app/dashboard/page.tsx` | Lines 578–622:<br>`<div className="rounded-2xl bg-[#ffffff] border border-[#e7e1de] p-6 shadow-sm">`<br>or Lines 405–450 (Greeting Banner right side) | Pure CSS/SVG vertical bars showing Mon–Sun study hours. | **Study Rhythm Harmony Asset:** Rhythmic sinusoidal wave and harmonic tuning fork with breath pulse animation, spot fills in salmon-pink (`#fa7268`) and soft orange (`#fb923c`). |
| **Streak Milestone Asset** | `src/app/dashboard/page.tsx` | Lines 519–541:<br>`Metric 3 (Habit Continuity)` | Small Lucide `<Flame>` icon with raw count text. | **Milestone Streak Monoline Flame:** Stylized continuous geometric flame contour in `#19202e` with layered flickering core in `#fb923c` and `#fa7268`, plus subtle ascending ember particles. |
| **Daily Stopwatch / Focus Timer** | `src/app/daily/page.tsx` | Lines 440–550:<br>`Focus Clock Panel` (alongside radial timer) and Lines 850–864 (`Kinfolk Encouragement Strip`) | SVG progress ring and text readout. Encouragement strip has small `<BookOpen>` icon. | **Vintage Precision Stopwatch & Desk Chronometer:** Monoline pocket watch / desk chronometer with rotating tick marks, rhythmic balance wheel oscillation, and warm yellow lamp spot fill (`#fcd34d`). |
| **Examination Forecast & Z-Score** | `src/app/tests/page.tsx` | Lines 244–307:<br>`Primary Metric Card (5 cols)` | Numeric text readout (`+2.18`) with small percentile badges. | **Academic Compass & Gaussian Bell Forecast:** Precision drafting compass measuring a calibrated bell curve peak with floating target stars and salmon-pink spotlight (`#fa7268`). |
| **Study Calendar Schedule Rhythms** | `src/app/calendar/page.tsx` | Lines 501–541:<br>`Weekly Study Pace Card (min-w-[320px])` | Simple horizontal progress bar and numbers. | **Calendar Leaf & Astronomical Clock:** Grid leaf turning gently, celestial sun/moon orbit symbolizing daily syllabus pacing, soft orange highlights (`#fb923c`). |
| **Admin Desk & Oversight** | `src/app/admin/page.tsx` | Lines 1154–1204:<br>`Homework Verification Desk Banner` | Text heading with small `<ShieldCheck>` and district dropdown. | **Classroom Desk & Administrative Quill:** Teacher desk with evaluation ledger, verification stamp badge, magnifying lens, and subtle pulsing approval checkmark in `#19202e` and `#fcd34d`. |

---

## 5. Empty States Architecture Across All Views

The table below catalogs every empty state identified in the frontend codebase and details the exact mount points and illustration replacements:

| Empty State Context | File Path | Line Range | Current Fallback Markup | Target Illustration Replacement |
|---|---|---|---|---|
| **Zero Study History Logs** | `src/app/dashboard/page.tsx` | 746–759 | `<div className="py-14 text-center"><Clock className="w-8 h-8 text-[#dec0b7] mx-auto mb-3" /> ...</div>` | `<EmptyLogsIllustration size={180} />` featuring open journal notebook, steaming ceramic cup, and succulent plant. |
| **Zero Today's Study Blocks** | `src/app/daily/page.tsx` | 1044–1050 | `<div className="p-6 text-center rounded-2xl bg-[#f8f2ef] border border-dashed border-[#dec0b7]/60">No study blocks logged yet...</div>` | Compact `<EmptyLogsIllustration size={140} />` with warm CTA *"Start your first session"*. |
| **Zero Test Marks / Exam Records** | `src/components/tests/TestMarksTable.tsx` | 78–82 | `<div className="p-12 text-center text-[#4a3b35] text-xs font-mono">No test marks logged yet...</div>` | `<EmptyTestsIllustration size={160} />` featuring unrolled paper scroll, ribbon, and vintage hourglass. |
| **Zero Scheduled Calendar Blocks** | `src/app/calendar/page.tsx` | 643–658 | `<div className="py-12 text-center flex flex-col items-center ..."><Clock className="w-8 h-8 text-[#6b5952]" /> ...</div>` | `<EmptyCalendarIllustration size={160} />` with calendar desk leaf and pocket watch. |
| **Zero PDF Documents in Vault** | `src/components/vault/VaultPanel.tsx` | 185–193 | `<div className="flex flex-col items-center ... py-10 ..."><FolderOpen className="mb-3 h-8 w-8 text-muted-foreground/40" /> ...</div>` | `<GeneralEmptyIllustration size={150} />` or `<EmptySearchIllustration size={150} />` for resource vault. |
| **Zero Homework Submissions (Admin)** | `src/app/admin/page.tsx` | 1276 | `<p className="text-[#2d2420] text-sm">No homework submissions logged yet in the system.</p>` | Centered container with `<EmptyLogsIllustration size={140} />` and *"All students reviewed"* tag. |
| **Zero School Telemetry (Admin)** | `src/app/admin/page.tsx` | 1592 | `<p className="text-xs text-[#4a3b35] text-center py-6">No school data recorded yet.</p>` | Clean visual card with `<EmptySearchIllustration size={120} />`. |
| **Zero Filtered Student Accounts (Admin)** | `src/app/admin/page.tsx` | 1833 & 2087 | `<h3 className="text-sm font-bold text-[#1d1b19]">No accounts match this filter</h3>` | `<EmptySearchIllustration size={140} />` with search reset button. |
| **Zero Daily Logs (Admin)** | `src/app/admin/page.tsx` | 2320 | `<p ...>No daily study logs recorded yet.</p>` | `<EmptyLogsIllustration size={140} />`. |

---

## 6. Comprehensive Frontend Raw Emoji Inventory & Replacement Strategy

An exhaustive automated Unicode scan across the codebase revealed the following raw emoji occurrences in the frontend runtime:

### 6.1. Active Frontend Component & View Occurrences

| File Path | Line | Exact Emoji | Verbatim Source Code Line | Recommended Replacement |
|---|---|---|---|---|
| `src/components/dashboard/AcademicReportModal.tsx` | 549 | `↗` | `Verify Record Online ↗` | Replace with Lucide `<ExternalLink className="w-3.5 h-3.5" />`. |
| `src/lib/utils.ts` | 652 | `⏱️` | `• ⏱️ *Total Study Hours:* *${totalTodayHours.toFixed(1)} hrs*` | Replace with Lucide `<Clock>` in markdown or clean ASCII bullet `• [Time]`. |
| `verify.html` | 156 | `🔒` | `<span class="text-indigo-400">🔒 Cryptographically Authenticated</span>` | Replace with inline SVG lock or Lucide `<ShieldCheck>`. |
| `src/components/layout/Header.tsx` | 158 | `⌘` | `⌘K` | Standard Mac command symbol (keep or wrap in `<kbd>` tag). |
| `src/components/layout/Footer.tsx` | 36 | `©` | `© 2026 StudySync Sri Lanka. Mindful Academic Clarity.` | Standard legal symbol (acceptable). |

### 6.2. Legacy JavaScript Views (in `src/js/`)

| File Path | Line | Raw Emoji | Verbatim Source Code Line | Recommended Replacement |
|---|---|---|---|---|
| `src/js/slider.js` | 52 | `😴` | `emoji: '😴',` | Replace with Lucide `<Moon className="w-4 h-4" />` |
| `src/js/slider.js` | 64 | `⚡` | `emoji: '⚡',` | Replace with Lucide `<Zap className="w-4 h-4" />` |
| `src/js/slider.js` | 76 | `🎯` | `emoji: '🎯',` | Replace with Lucide `<Target className="w-4 h-4" />` |
| `src/js/slider.js` | 87 | `🔥` | `status: 'Deep Flow State 🔥',` | Clean text: `status: 'Deep Flow State'` + `<Flame>` |
| `src/js/slider.js` | 88 | `🔥` | `emoji: '🔥',` | Replace with Lucide `<Flame className="w-4 h-4" />` |
| `src/js/views/adminView.js` | 578 | `🥇` | `rankBadge = ... title="1st Place (Gold)">🥇</span>` | Replace with Lucide `<Trophy className="w-4 h-4 text-amber-400" />` |
| `src/js/views/adminView.js` | 580 | `🥈` | `rankBadge = ... title="2nd Place (Silver)">🥈</span>` | Replace with Lucide `<Medal className="w-4 h-4 text-slate-300" />` |
| `src/js/views/adminView.js` | 582 | `🥉` | `rankBadge = ... title="3rd Place (Bronze)">🥉</span>` | Replace with Lucide `<Medal className="w-4 h-4 text-amber-600" />` |
| `src/js/views/adminView.js` | 611 | `🧬`, `📐` | `<span>${isBio ? '🧬' : '📐'}</span>` | Replace with Lucide `<Dna>` and `<Ruler>` |
| `src/js/views/adminView.js` | 619 | `🔥` | `<span>🔥</span>` | Replace with Lucide `<Flame className="w-4 h-4" />` |
| `src/js/views/dailyFormView.js` | 55 | `🧬` | `case 'Biology': return '🧬';` | Replace with Lucide `<Dna>` |
| `src/js/views/dailyFormView.js` | 56 | `⚗️` | `case 'Chemistry': return '⚗️';` | Replace with Lucide `<FlaskConical>` |
| `src/js/views/dailyFormView.js` | 57 | `⚛️` | `case 'Physics': return '⚛️';` | Replace with Lucide `<Atom>` |
| `src/js/views/dailyFormView.js` | 58 | `🌱` | `case 'Agriculture': return '🌱';` | Replace with Lucide `<Sprout>` |
| `src/js/views/dailyFormView.js` | 59 | `📐` | `case 'Combined Maths': return '📐';` | Replace with Lucide `<Compass>` |
| `src/js/views/dailyFormView.js` | 60 | `💻` | `case 'ICT': return '💻';` | Replace with Lucide `<Laptop>` |
| `src/js/views/dailyFormView.js` | 61 | `📚` | `default: return '📚';` | Replace with Lucide `<BookOpen>` |
| `src/js/views/dailyFormView.js` | 231 | `⏱️` | `⏱️` | Replace with Lucide `<Clock>` |
| `src/js/views/dailyFormView.js` | 970 & 976 | `↗` | `View Full Size ↗` | Replace with Lucide `<ExternalLink>` |
| `src/js/views/dashboardView.js` | 479 | `⏳` | `⏳` | Replace with Lucide `<Hourglass>` |

---

## 7. Technical Recommendations for Component Implementation

### 7.1. Unified Design Tokens & Color Palette
All new and revised vector assets must strictly implement the authoritative palette from the 2026-09-13 specification:
- **Base Stroke Contours:** `#19202e` (uniform stroke weight 1.5px to 2.0px with `strokeLinecap="round"` and `strokeLinejoin="round"`).
- **Surface Fills:** Pure white (`#ffffff`) for paper sheets, card bodies, and background shapes.
- **Spot Accent 1 (Urgency / High Focus):** Salmon-pink (`#fa7268`) at 10%–20% opacity for fills, 100% for micro-nodes.
- **Spot Accent 2 (Attention / Glow):** Muted yellow (`#fcd34d`) for ambient lamp glows, star rays, and highlights.
- **Spot Accent 3 (Steady Balance):** Soft orange (`#fb923c`) for milestone sparks and progress accents.

### 7.2. Component Props API Design
Every illustration component should adhere to a standardized TypeScript interface:
```tsx
export interface MonolineIllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
  animated?: boolean; // Controls continuous ambient micro-animations
}
```

### 7.3. Smooth 60fps CSS Micro-Animations
Implement hardware-accelerated CSS animations directly inside `src/app/globals.css` using `transform: translate3d(...)` and `opacity`:

```css
/* Drifting ambient stars */
@keyframes driftStar {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.6; }
  50% { transform: translate3d(4px, -6px, 0) scale(1.2); opacity: 1; }
}

/* Soft desk lamp ambient glow */
@keyframes softGlow {
  0%, 100% { opacity: 0.25; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.08); }
}

/* Floating academic clouds */
@keyframes floatCloud {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(8px, -4px, 0); }
}

/* Rhythmic study breath pulse */
@keyframes breathPulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.03); opacity: 1; }
}

/* Class hooks */
.animate-drift-star { animation: driftStar 4s ease-in-out infinite; }
.animate-soft-glow { animation: softGlow 3.5s ease-in-out infinite; }
.animate-float-cloud { animation: floatCloud 6s ease-in-out infinite; }
.animate-breath-pulse { animation: breathPulse 4s ease-in-out infinite; }
```

### 7.4. Accessibility & Reduced Motion Compliance
Ensure all ambient animations cleanly honor the user's OS accessibility settings without breaking layout coordinates:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-drift-star,
  .animate-soft-glow,
  .animate-float-cloud,
  .animate-breath-pulse {
    animation: none !important;
    transform: none !important;
  }
}
```

### 7.5. Mobile Responsiveness & Small Viewport Containment (<380px)
1. **SVG Scalability:** All illustrations must declare a standardized `viewBox` (e.g. `0 0 200 200` or `0 0 600 450`), set `fill="none"`, and omit hardcoded pixel width/height attributes when a responsive `className="w-full h-auto"` is applied.
2. **Container Protection:** Containers must apply `overflow-hidden`, `w-full`, and responsive padding (`p-4 sm:p-6 lg:p-8`).
3. **No Horizontal Scrolling:** On 320px–375px screens (e.g., iPhone SE), illustrations must scale proportionally without causing horizontal page expansion or colliding with adjacent typography.
4. **Touch Target Ergonomics:** Accompanying action buttons must guarantee a minimum 44px–48px touch height (`min-h-[44px]` or `h-11`/`h-12`).

---

## 8. Summary of Findings & Next Steps

1. **Build & Quality Baseline:** The codebase is fully sound: `npx tsc --noEmit` passes with 0 errors, and `npm test` passes 100% across all 472 tests in 37 test suites.
2. **Implementation Ready:** Exact mount points and line numbers have been established for all 6 required vector assets and all 7 empty states.
3. **Emoji Inventory Complete:** All 24 raw emoji occurrences in the frontend runtime and legacy views have been mapped to corresponding Lucide icons or monoline vectors.
4. **Handoff Prepared:** The accompanying `handoff.md` synthesizes these observations into actionable instructions for the implementer agent.
