---
name: StudySync Design System & Architectural Specification
version: 2.1.0
project_id: '17731982023503885199'
target_platform: 'Next.js 14 App Router / Google Stitch Text-to-UI'

# ==============================================================================
# CONFIGURATION SWITCHES (Adjust these to customize the entire app in seconds)
# ==============================================================================
configuration:
  active_color_mode: DARK              # Options: DARK | LIGHT
  active_palette_preset: EDITORIAL_CLAY # Options: EDITORIAL_CLAY | OBSIDIAN_FOCUS | IVORY_ATELIER | MINIMAL_MONO
  active_density: SPACIOUS              # Options: SPACIOUS | COMFORTABLE | COMPACT
  surface_treatment: FLAT_OPAQUE        # Options: FLAT_OPAQUE | SUBTLE_ELEVATED | LIQUID_GLASS
  measurement_font_mode: EDITORIAL_SERIF # Options: EDITORIAL_SERIF | MODERN_SANS | TECHNICAL_MONO
  touch_target_baseline: 48px           # Minimum interactive touch target height (44px - 48px)
  corner_radius_scale: ROUND_TWELVE     # Options: ROUND_FOUR | ROUND_EIGHT | ROUND_TWELVE | ROUND_FULL

# ==============================================================================
# THEME CONFIGURATION FOR GOOGLE STITCH MCP
# ==============================================================================
theme:
  colorMode: DARK
  font: PLUS_JAKARTA_SANS
  headlineFont: NEWSREADER
  bodyFont: PLUS_JAKARTA_SANS
  labelFont: PLUS_JAKARTA_SANS
  roundness: ROUND_TWELVE
  customColor: '#C24942'
  colorVariant: FIDELITY
  overridePrimaryColor: '#C24942'
  overrideSecondaryColor: '#5FAE74'
  overrideNeutralColor: '#0F1114'

# ==============================================================================
# MATERIAL 3 / STITCH SEMANTIC TOKEN PALETTE
# ==============================================================================
colors:
  # Base Canvas & Surfaces (Dark Mode Authority)
  background: '#0F1114'
  on-background: '#EDEDEA'
  surface: '#17191D'
  on-surface: '#EDEDEA'
  surface-dim: '#0F1114'
  surface-bright: '#24282E'
  surface-container-lowest: '#0B0C0E'
  surface-container-low: '#121417'
  surface-container: '#17191D'
  surface-container-high: '#1F2227'
  surface-container-highest: '#24282E'
  surface-variant: '#1F2227'
  on-surface-variant: '#8B8D93'
  inverse-surface: '#EDEDEA'
  inverse-on-surface: '#14171A'

  # Primary (Editorial Clay Red / Urgency & Key Actions)
  primary: '#C24942'
  on-primary: '#FFFFFF'
  primary-container: '#3D1513'
  on-primary-container: '#FFDAD6'
  primary-fixed: '#FFDAD6'
  primary-fixed-dim: '#FFB4AB'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#881F1B'
  inverse-primary: '#9E2F29'

  # Secondary (Muted Sage Emerald / Equilibrium & Active Streaks)
  secondary: '#5FAE74'
  on-secondary: '#003816'
  secondary-container: '#183822'
  on-secondary-container: '#C5ECC8'
  secondary-fixed: '#C5ECC8'
  secondary-fixed-dim: '#5FAE74'
  on-secondary-fixed: '#00210B'
  on-secondary-fixed-variant: '#1B522B'

  # Tertiary & Stream Accents
  tertiary: '#06B6D4'                  # Physical Science Cyan
  on-tertiary: '#00363F'
  tertiary-container: '#004F5C'
  on-tertiary-container: '#A6EEFC'
  accent-maths: '#06B6D4'              # Combined Maths / Physical Science
  accent-bio: '#10B981'                # Biology / Biological Science
  accent-chem: '#F59E0B'               # Chemistry
  accent-physics: '#3B82F6'            # Physics

  # Borders, Dividers & Chrome
  outline: 'rgba(255, 255, 255, 0.08)' # Standard hairline border
  outline-variant: 'rgba(255, 255, 255, 0.12)' # Hover / Focus border
  border-glass: 'rgba(255, 255, 255, 0.14)'    # Floating chrome boundary
  surface-tint: '#C24942'

  # Utility & Alerts
  error: '#FF5449'
  on-error: '#690005'
  error-container: '#93000A'
  on-error-container: '#FFDAD6'
  warning: '#F59E0B'
  success: '#5FAE74'

  # Daylight Mode Equivalents (For 1-click Light Theme Switching)
  light-background: '#F3F3F0'
  light-surface: '#FFFFFF'
  light-surface-container: '#FFFFFF'
  light-surface-container-high: '#EBEBE6'
  light-outline: 'rgba(0, 0, 0, 0.08)'
  light-primary: '#9E2F29'
  light-secondary: '#2F7A45'
  light-text-primary: '#14171A'
  light-text-muted: '#5B5E63'

# ==============================================================================
# TYPOGRAPHY SCALE & FONT ROLES
# ==============================================================================
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 62px
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  measurement-score:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  measurement-digit:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.015em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  code-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em

# ==============================================================================
# GEOMETRY & SPACING GRIDS
# ==============================================================================
rounded:
  none: 0px
  sm: 4px
  md: 8px                              # Standard control elements (buttons, inputs)
  lg: 10px
  xl: 12px                             # Content card containers
  2xl: 16px                            # Modal dialogs & hero modules
  full: 9999px                         # Status pills & icon badges

spacing:
  base: 4px
  space-xs: 4px
  space-sm: 8px
  space-md: 12px
  space-lg: 16px
  space-xl: 24px
  space-2xl: 32px
  space-3xl: 48px
  space-4xl: 64px
  gutter: 24px
  gutter-mobile: 16px
  margin-desktop: 48px
  margin-tablet: 32px
  margin-mobile: 16px
  max-width: 1280px
  section-gap: 80px

# ==============================================================================
# DYNAMIC DATA PLACEHOLDERS (Data bindings for UI screens)
# ==============================================================================
placeholders:
  # Identity & Student Records
  user_name: 'Achala Anurada de Alwis'
  user_email: 'student@studysync.lk'
  user_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  study_id: 'AL-2026-0842'
  school_name: 'Royal College, Colombo'
  academic_stream: 'Physical Science (Maths)'
  exam_target_year: '2026'
  telegram_handle: '@achala_alwis'
  verification_status: 'VERIFIED SCHOLAR'
  verification_date: '2026-08-15'

  # Core Accountability & Daily Stats
  exam_countdown_days: '412'
  exam_countdown_weeks: '58'
  streak_count: '24'
  total_study_hours: '348.5'
  weekly_study_hours: '35.0'
  weekly_target_hours: '35.0'
  daily_logged_hours: '5.5'
  daily_goal_hours: '5.0'
  avg_focus_score: '8.8'
  avg_productivity_score: '8.5'

  # Examination Intelligence & Distribution Modeling
  composite_z_score: '+1.8420'
  predicted_island_rank: 'Top 150 District / Top 450 Island'
  subject_balance_index: '92%'
  subject_balance_label: 'Optimal Equilibrium'
  subject_1_name: 'Combined Mathematics'
  subject_1_hours: '12.0'
  subject_1_percentage: '34%'
  subject_2_name: 'Physics'
  subject_2_hours: '11.5'
  subject_2_percentage: '33%'
  subject_3_name: 'Chemistry'
  subject_3_hours: '11.5'
  subject_3_percentage: '33%'

  # Multi-Session Logging
  session_count: '3'
  session_1_subject: 'Combined Mathematics'
  session_1_duration: '2.5'
  session_1_time: '08:00 - 10:30'
  session_1_focus: '9'
  session_1_notes: 'Integration by parts and differential equations past paper drill'
  session_2_subject: 'Physics'
  session_2_duration: '2.0'
  session_2_time: '14:00 - 16:00'
  session_2_focus: '8'
  session_2_notes: 'Rotational dynamics: Moment of inertia calculations'
  session_3_subject: 'Chemistry'
  session_3_duration: '1.0'
  session_3_time: '19:30 - 20:30'
  session_3_focus: '9'
  session_3_notes: 'Chemical equilibrium: Le Chatelier numerical problems'

  # Cohort & Admin Metrics
  group_total_scholars: '1,420'
  group_active_scholars: '1,180'
  group_total_hours: '84,290'
  group_avg_daily_hours: '4.8'
  group_avg_focus: '8.4'
---

# StudySync — Design System & Architectural Specification

## 1. Architectural Principles & Ergonomics

StudySync is an editorial academic platform designed for Sri Lankan G.C.E. Advanced Level (A/L) candidates. The interface balances high accountability with psychological calm, avoiding chaotic gamification ribbons and cognitive overload.

### The Four Foundational Directives
1. **Material Separation (Scoped Chrome)**:
   - Floating Chrome (Top Navigation, Command Palette, Dialogs, FAB): Allowed `backdrop-blur-xl`, `90%` opacity, and subtle translucent borders.
   - Content Containers (Cards, Data Tables, Calendars, Charts, Forms): **Strictly flat, opaque, and grounded** (`bg-[#17191D]` in dark mode, `bg-white` in light mode). No content-level blur.
2. **Typography Split**:
   - Measurement Numerals (Hours, Streaks, Z-Scores, Exam Days): Editorial Serif (`Newsreader`) for dignified academic authority.
   - User Interface Controls (Buttons, Inputs, Navigation, Labels): Modern Sans (`Plus Jakarta Sans`) for clarity and speed.
   - Technical Strings (Study IDs, Hashes, Code): Monospace (`JetBrains Mono`).
3. **Ergonomic Touch-First Standards**:
   - Primary buttons and key interactive elements enforce a minimum height of **48px** (`h-12`) with `rounded-xl` corners.
   - Micro-interaction feedback: `active:scale-[0.98]` and smooth transitions (`200ms cubic-bezier(0.16, 1, 0.3, 1)`).
4. **Conversational Human Tone**:
   - Supportive, everyday language ("Log today's study", "Make every study hour count") replacing cold administrative jargon.

---

## 2. Configurable Presets & Adjustment Matrix

Easily adjust the visual identity of StudySync by selecting or modifying these presets in the YAML frontmatter:

| Preset Name | Canvas Base | Card Fill | Primary Accent | Secondary Accent | Vibe / Emotional Tone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`EDITORIAL_CLAY`** *(Default)* | `#0F1114` | `#17191D` | `#C24942` *(Clay Red)* | `#5FAE74` *(Sage Emerald)* | Warm academic sanctuary, dignified discipline |
| **`OBSIDIAN_FOCUS`** | `#08090C` | `#111318` | `#06B6D4` *(Cyan Focus)*| `#10B981` *(Vibrant Green)* | Modern dark developer-grade precision |
| **`IVORY_ATELIER`** *(Daylight)*| `#F3F3F0` | `#FFFFFF` | `#9E2F29` *(Terracotta)* | `#2F7A45` *(Forest Green)* | Natural unbleached archival paper, warm scholarly |
| **`MINIMAL_MONO`** | `#121214` | `#1A1A1E` | `#EDEDEA` *(High White)*| `#8B8D93` *(Neutral Gray)* | Swiss modernist restraint, high-contrast monochrome |

### How to Adjust Key Design Variables
- **To Change Accent Color**: Modify `customColor` and `overridePrimaryColor` in the frontmatter. All primary buttons, focus rings, active slider fills, and streak indicators will automatically align.
- **To Adjust Roundness**: Change `roundness` to `ROUND_FOUR` (architectural/boxy), `ROUND_EIGHT` (classic macOS/iOS), `ROUND_TWELVE` (modern soft), or `ROUND_FULL` (pill-based).
- **To Toggle Theme**: Set `active_color_mode: LIGHT` to instantly swap all canvas and surface roles to the daylight specification.

---

## 3. Atomic Component Specifications

### 3.1 Buttons
| Variant | Dimensions | Visual Styling (Tailwind Recipe) | Role / Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `h-12 px-7 rounded-xl` | `bg-[#C24942] text-white font-medium hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#C24942]/20` | Key conversion (Log Study, Sign In) |
| **Secondary**| `h-12 px-5 rounded-xl` | `border border-white/[0.08] bg-[#17191D] text-[#EDEDEA] hover:bg-[#1F2227] active:scale-[0.98]` | Supporting actions (Security, Reports) |
| **Outline**  | `h-11 px-4 rounded-xl` | `border border-white/[0.12] bg-transparent text-[#EDEDEA] hover:bg-white/[0.04]` | Secondary builders (+ Add Session) |
| **Ghost**    | `h-10 px-3 rounded-lg` | `text-[#8B8D93] hover:text-white hover:bg-white/[0.05]` | Navigation links, table row actions |
| **Danger**   | `h-11 px-4 rounded-xl` | `bg-[#FF5449]/15 text-[#FF5449] border border-[#FF5449]/30 hover:bg-[#FF5449]/25` | Deletions, session discards |

### 3.2 Cards & Surfaces
| Surface Type | Fill & Border | Internal Padding | Elevation / Behavior |
| :--- | :--- | :--- | :--- |
| **Standard Card** | `bg-[#17191D] border border-white/[0.08]` | `p-6` (`space-xl`) | Flat, completely opaque, static content container |
| **Interactive Card** | `bg-[#17191D] border border-white/[0.08]` | `p-6` | Hover border `border-white/[0.16]`, subtle 1px translate up |
| **Nested Sub-Card** | `bg-[#1F2227] border border-white/[0.06]` | `p-4` (`space-lg`) | Multi-session builder blocks, timeline entries |
| **Floating Chrome** | `bg-[#08090A]/90 backdrop-blur-xl border-b` | `px-6 h-16` | Top navigation bar, sticky action dock |

### 3.3 Form Controls & Interactive Inputs
- **Text Inputs**: `h-11 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm text-[#EDEDEA] focus:outline-none focus:ring-2 focus:ring-[#C24942]`
- **Interactive Dual Sliders**: Track height `8px` (`h-2 rounded-full bg-[#24282E]`) with active terracotta fill (`bg-[#C24942]`) and accessible thumb (`h-5 w-5 rounded-full bg-white shadow-md cursor-pointer`).
- **Pill Selectors**: `px-3 py-1 text-xs rounded-lg font-medium transition-all` (Active: `bg-[#C24942] text-white`, Inactive: `text-[#8B8D93] hover:bg-white/[0.04]`).

---

## 4. Screen-by-Screen Architectural Catalog

Each screen specification below provides the exact component hierarchy, bound placeholder variables, and Google Stitch prompt directives.

---

### Screen 01: Landing Page & Visual Routes Showcase
- **Route**: `/` | **Layout**: Single-column vertical flow (`max-w-5xl mx-auto`) | **Device**: Responsive Desktop & Mobile

#### Component Slot Tree
```
├── [CHROME] Header (Sticky Top Nav: Brand Logo, Home, Dashboard, Daily, Calendar, Tests, ID Card, Sign In CTA)
├── [HERO] Hero Section
│   ├── Context Badge: "StudySync · G.C.E. Advanced Level"
│   ├── Headline: "Your A/L exam is {{exam_countdown_days}} days away. Make every study hour count."
│   ├── Subtitle: "StudySync helps Sri Lankan A/L students track daily sessions, forecast Z-Scores, and stay accountable..."
│   └── Actions: [Sign in with Google Button (h-12)] [Biometric Security Button]
├── [METRIC BAR] 4-Column Live Statistics Strip
│   ├── Col 1: Exam Proximity (`{{exam_countdown_days}} days`, `{{exam_countdown_weeks}} weeks remaining`)
│   ├── Col 2: Student Census (`{{group_total_scholars}} registered scholars`)
│   ├── Col 3: Aggregate Effort (`{{group_total_hours}} logged hours`)
│   └── Col 4: Examination Cycle Picker (`[2026] [2027] [2028] [2029]`)
├── [SHOWCASE] 3 Editorial Visual Route Cards
│   ├── Route 01: "The Atelier" (Warm academic, terracotta circular arc gesture, fractional grid)
│   ├── Route 02: "The Reading Room" (Quiet scholarly depth, watermark serif 'A', tall typography)
│   └── Route 03: "The Studio Index" (Modernist precision, geometric line-art box, mono details)
├── [STREAMS] Two Streams Comparison Module
│   ├── Card 1: Physical Science (Maths, Physics, Chem/ICT · Target 35h/wk · Cyan accent)
│   └── Card 2: Biological Science (Bio, Chem, Physics · Target 35h/wk · Emerald accent)
└── [FOOTER] Brand Horizon, Verification Links, Security Notes, Copyright
```

#### Stitch Generation Directive
> *Render a high-craft landing page for StudySync. Dark canvas (#0F1114), flat opaque cards (#17191D) with hairline borders. Prominent hero showing {{exam_countdown_days}} days in Newsreader serif and clay-red (#C24942). Divided 4-column live stats strip below hero. Three visual route cards showing Atelier, Reading Room, and Studio Index with minimalist line art gestures. Scoped glass top nav.*

---

### Screen 02: Scholar Registration Flow
- **Route**: `/register` | **Layout**: Centered Card (`max-w-2xl mx-auto py-12`) | **Device**: Desktop & Mobile

#### Component Slot Tree
```
├── [CHROME] Header
└── [ONBOARDING CARD] "Complete Your Scholar Registration"
    ├── Header: Title, subtitle, and Google Account linkage indicator
    ├── Field 1: Full Legal Name (`Input: {{user_name}}`)
    ├── Field 2: Email (`Input readonly: {{user_email}}`)
    ├── Field 3: Gender Selection (`Radio Group: Male / Female`)
    ├── Field 4: Telegram Handle (`Input: {{telegram_handle}}` for automated study reminders)
    ├── Field 5: School Autocomplete (`Command Palette: 400+ Sri Lankan National & Provincial Schools`)
    ├── Field 6: Academic Stream (`Select: Physical Science | Biological Science`)
    ├── Field 7: Optional 3rd Subject (`Select: Chemistry | ICT | Agriculture`)
    ├── Field 8: Target Exam Cycle (`Segmented Pills: 2026 | 2027 | 2028 | 2029`)
    └── Action: [Primary CTA: "Complete Registration & Issue Student Pass" (h-12, full-width)]
```

#### Stitch Generation Directive
> *Render a focused scholar onboarding form in a centered card (#17191D) on a dark canvas (#0F1114). Inputs use 44px height with subtle dark fills and clay-red focus rings. Clean school search input with dropdown autocomplete results list. Full-width primary registration button at bottom.*

---

### Screen 03: Student Dashboard & Accountability Hub
- **Route**: `/dashboard` | **Layout**: 12-Column Responsive Dashboard Grid | **Device**: Responsive Desktop & Mobile

#### Component Slot Tree
```
├── [CHROME] Header (With Live Streak Badge: "🔥 {{streak_count}} Days")
├── [HORIZON] Welcome Horizon: Greeting, student stream badge, [Log Today's Study (h-12)], [Academic Report Modal]
├── [KPI ROW] 4 Metric Summary Cards
│   ├── Card 1: Consecutive Streak (`🔥 {{streak_count}} days`)
│   ├── Card 2: Cumulative Hours (`{{total_study_hours}} hrs`)
│   ├── Card 3: Weekly Target Progress (`{{weekly_study_hours}} / 35.0 hrs` with progress bar)
│   └── Card 4: Exam Countdown (`{{exam_countdown_days}} days to A/L`)
├── [ANALYTICS] Dual Intelligence Suite (6-6 Grid)
│   ├── Left Card: Subject Equilibrium Index (`{{subject_balance_index}} - {{subject_balance_label}}`)
│   │   ├── Progress meter for {{subject_1_name}} ({{subject_1_hours}}h)
│   │   ├── Progress meter for {{subject_2_name}} ({{subject_2_hours}}h)
│   │   └── Progress meter for {{subject_3_name}} ({{subject_3_hours}}h)
│   └── Right Card: 7/14-Day Study Volume Trend (`StudyTrendChart`)
│       └── SVG Area Chart with daily hour bars and stream benchmark line
└── [TABLE] Recent Study Log Ledger (Expandable Table)
    ├── Columns: Date | Multi-Session Badges | Total Hours | Focus Rating | Proof Thumbnail | Actions
    └── Row Example: `Today | [Math: 2.5h] [Phys: 2.0h] [Chem: 1.0h] | 5.5 hrs | 9/10 | [Photo] | [Details]`
```

#### Stitch Generation Directive
> *Render the primary student dashboard for StudySync. Dark theme with 4 metric cards across top. Left column shows Subject Balance Card with 3 colored progress bars; right column shows 7-day study volume area chart. Below, an expandable study history table featuring pill badges for each session.*

---

### Screen 04: Multi-Session Daily Study Logger
- **Route**: `/daily` | **Layout**: Centered Form Container (`max-w-3xl mx-auto py-8`) | **Device**: Mobile & Desktop

#### Component Slot Tree
```
├── [CHROME] Header
└── [LOGGER CARD] "Daily Study Logger · {{date_today}}"
    ├── Description: "Record individual study bouts with real-time automatic summation"
    ├── [SESSION LIST] Dynamic Session Builder
    │   ├── Session Block 1 (Nested `#1F2227` Sub-Card)
    │   │   ├── Row 1: Subject Selector (`{{session_1_subject}}`) & Duration (`2.5 hrs`)
    │   │   ├── Row 2: Focus Slider (`Rating: 9/10`)
    │   │   └── Row 3: Session Notes (`{{session_1_notes}}`)
    │   ├── Session Block 2 (Nested Sub-Card)
    │   │   ├── Row 1: Subject Selector (`{{session_2_subject}}`) & Duration (`2.0 hrs`)
    │   │   └── Row 2: Focus Slider (`Rating: 8/10`)
    │   └── Action: [+ Add Another Study Session (Outline Button)]
    ├── [TOTALS PANEL] Automatic Aggregation & Override Switch
    │   ├── Summary: "Total Calculated: {{daily_logged_hours}} hrs across {{session_count}} sessions"
    │   └── Manual Override Toggle: [Off] (Allows direct numeric hours input if preferred)
    ├── [PROOF UPLOAD] Handwritten Notes / Tuition Tutorial Photo Upload (Drag & Drop zone)
    └── [SUBMIT] Full-Width Primary Button: "Submit Daily Study Log" (h-12)
```

#### Stitch Generation Directive
> *Render a multi-session study logging interface. Inside a main dark card, show two nested session cards with subject dropdowns, decimal hour inputs, custom sliders, and textareas. Below sessions, show a live total hours summary with manual override toggle, photo upload dropzone, and a prominent submit button.*

---

### Screen 05: Google Study Suite & Calendar
- **Route**: `/calendar` | **Layout**: Full-Width Calendar Stage | **Device**: Desktop & Tablet

#### Component Slot Tree
```
├── [CHROME] Header
├── [CALENDAR CONTROLS] Header Horizon
│   ├── Navigation: [< Month Selector (September 2026) >]
│   ├── View Switcher: [Month | Week | Day]
│   └── Quick Actions: [Smart 35h AI Timetable] [Create Meet Room] [Export .ics]
├── [CALENDAR GRID] 7-Day Week Schedule View
│   ├── Mon - Sun columns with hourly slots (06:00 - 22:00)
│   ├── Subject-Colored Study Blocks:
│   │   ├── Combined Maths: Blue tint card (`08:00 - 10:30 · 2.5h`)
│   │   ├── Physics: Cyan tint card (`14:00 - 16:00 · 2.0h`)
│   │   └── Chemistry: Amber tint card (`19:30 - 20:30 · 1.0h`)
│   └── Day Totals Footer: Each day shows exact 5.0h total (Weekly target: 35.0h stream-balanced)
└── [DRAWER] Assignment & Tuition Homework Checklist (Bottom Collapsible Sheet)
```

#### Stitch Generation Directive
> *Render an interactive Google Calendar-inspired study schedule for students in dark mode. 7-column week view with color-coded study session blocks. Header features month navigation and a 'Smart 35h AI Timetable' action button. Clean, low-density layout with 5.0 hours allocated per day.*

---

### Screen 06: Examination Intelligence & Z-Scores
- **Route**: `/tests` | **Layout**: Two-Column Intelligence Grid (`max-w-5xl mx-auto`) | **Device**: Desktop & Mobile

#### Component Slot Tree
```
├── [CHROME] Header
├── [Z-SCORE HEADLINE] Official Composite Z-Score Banner Card
│   ├── Headline: "Official Estimated A/L Composite Z-Score"
│   ├── Hero Metric: `{{composite_z_score}}` (+1.8420 rendered in Newsreader serif 44px)
│   └── Rank Projection: `{{predicted_island_rank}}` (University of Moratuwa / Colombo Engineering band)
├── [SIMULATION & COGNITION] Two-Column Grid (6-6)
│   ├── Left Card: What-If Marks Simulator
│   │   ├── Sliders for Maths, Physics, Chemistry test marks
│   │   └── Live Projected Z-Score recalculation with difference delta (+0.1420)
│   └── Right Card: Cognitive Fatigue Radar
│       └── Multi-axis radar diagram displaying session fatigue, recovery, and focus stability
└── [TEST MARKS LEDGER] Recorded Model Paper & School Term Tests Table
    └── Columns: Test Name | Date | Maths | Physics | Chemistry | Resulting Z-Score | Action
```

#### Stitch Generation Directive
> *Render an academic examination intelligence view. Top card features an authoritative single composite Z-Score (+1.8420) in elegant serif typography. Two cards below display an interactive What-If score simulator with sliders and a cognitive fatigue radar. Bottom table records test marks.*

---

### Screen 07: Digital Student Pass & QR Verification
- **Route**: `/id-card` | **Layout**: Centered Perspective Viewport | **Device**: Mobile & Desktop

#### Component Slot Tree
```
├── [CHROME] Header
├── [PASS CONTAINER] 3D Perspective Card Stage (Perspective: 1000px)
│   └── Apple Wallet Style Digital Credential (ID-1 Format 1.586 : 1 Aspect Ratio)
│       ├── Top Header: "STUDYSYNC SRI LANKA · G.C.E. ADVANCED LEVEL CREDENTIAL"
│       ├── Hardware Chips: Gold EMV Micro-Chip & Multi-Color Holographic Security Seal
│       ├── Student Metadata: Photo, Name (`{{user_name}}`), ID (`{{study_id}}`), Stream (`{{academic_stream}}`), School (`{{school_name}}`)
│       └── Scannable QR Matrix: Clean ISO/IEC 18004 2D barcode encoding `https://studysync-al-2026.web.app/verify.html?id={{study_id}}`
└── [ACTIONS] [Download High-Res 300 DPI Pass (PNG) (h-12)] [Copy Verification HTTPS Link]
```

#### Stitch Generation Directive
> *Render an Apple Wallet-style digital student pass. Deep navy/charcoal gradient background with realistic gold EMV chip, subtle hologram badge, student portrait, clean metadata, and a high-contrast scannable QR code matrix on the bottom left. 300 DPI download button below.*

---

### Screen 08: Administrator Command Console
- **Route**: `/admin` | **Layout**: Full-Width Admin Dashboard | **Device**: Desktop (1280px+)

#### Component Slot Tree
```
├── [CHROME] Header (Admin Badge Highlighted)
├── [SECURITY] Firebase Auth Guard (Redirects unauthenticated visitors to sign-in)
├── [KPI STRIP] Group Cohort Metrics (Scholars: {{group_total_scholars}} | Active: 83% | Hours: {{group_total_hours}})
├── [VOLUME CHART] 7-Day Group Study Volume SVG Area Chart (Aggregates real multi-session student logs)
└── [REGISTRY] Student Directory Data Table
    ├── Filters: Search by Name/ID, Stream Filter (All / Maths / Bio), Exam Year (2026-2029)
    ├── Columns: ID | Name | Email | Stream | Streak | Lifetime Hours | Edit Dialog
    └── Export Actions: [Export CSV] [Export JSON] [Export SQL Dump]
```

#### Stitch Generation Directive
> *Render a powerful administrator command center. Clean dark metrics strip at top. SVG area chart showing 7-day study volume across all students. Searchable student directory table with edit dialogs and multi-format data export buttons.*

---

### Screen 09: Public QR Pass Verification
- **Route**: `/verify?id={{study_id}}` | **Layout**: Centered Mobile Card (`max-w-md mx-auto py-12`) | **Device**: Mobile Viewport

#### Component Slot Tree
```
└── [CLEARANCE CARD] "Verified Student Credential · StudySync Sri Lanka"
    ├── Verification Badge: Large Emerald Shield Icon (`#5FAE74`)
    ├── Status Banner: "OFFICIAL ACTIVE SCHOLAR"
    ├── Metadata Grid:
    │   ├── Student: `{{user_name}}` | Pass ID: `{{study_id}}`
    │   ├── Stream: `{{academic_stream}}` | School: `{{school_name}}`
    │   └── Verified Study Hours: `{{total_study_hours}} hrs` | Streak: `{{streak_count}} days`
    └── Cryptographic Hash: SHA-256 validation seal anchored in institutional ledger
```

#### Stitch Generation Directive
> *Render a mobile-friendly public identity verification screen. High contrast card showing a glowing green verified shield, student details, verified study hours, and an authentic security seal.*

---

## 5. Google Stitch Execution Instructions

To generate or edit screens using Google Stitch, follow these exact prompt instructions:

```text
Stitch Project: StudySync A/L LMS (17731982023503885199)
Target Screen: [Insert Screen Title from Section 4]
Color Mode: DARK (#0F1114 canvas, #17191D cards, #C24942 terracotta primary)
Materiality: Flat opaque cards with hairline borders (rgba(255,255,255,0.08)). Liquid glass chrome strictly on top navigation.
Typography: Plus Jakarta Sans for all UI labels/controls; Newsreader serif for metrics and countdown digits.
Placeholders: Populate all dynamic values using the exact {{variable_names}} from Section 4.
```

---

*Authored for the StudySync Platform Architecture · Project ID `17731982023503885199` · Deployed at https://studysync-al-2026.web.app*
