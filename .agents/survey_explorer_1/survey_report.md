# Comprehensive Frontend Codebase & UI Ergonomics Survey Report

**Project:** StudySync Sri Lanka A/L Study Accountability Web Application  
**Explorer Agent:** survey_explorer_1  
**Target Milestone:** Frontend Architecture, Ergonomics & Requirements Mapping (R1, R3, R4)  
**Date:** 2026-08-27  

---

## 1. Executive Summary

A comprehensive read-only investigation of the StudySync frontend codebase was conducted across Next.js 14 App Router routes, shadcn/ui components, design system tokens, layout ergonomics, and data display structures. The application is built with modern Next.js 14 static export capabilities (`output: 'export'`), Tailwind CSS v3.4, Radix UI primitives, Framer Motion, and dual light/dark themes.

While core daily logging and student dashboard features exist, critical functional and ergonomic gaps must be addressed to fulfill requirements R1, R3, and R4:
1. **Button Ergonomics (R1):** The default button height in `src/components/ui/button.tsx` is `h-10` (40px) and small buttons are `h-9` (36px) or `h-8` (32px), falling short of the required 44–48px thumb-friendly touch target standard.
2. **Human Language & Copywriting (R1):** While landing page copy is clean and welcoming, AI advisory components (`studyAdvisor.ts`, `CognitiveAdvisorCard.tsx`, `ZScoreVelocityGauge.tsx`, `AcademicReportModal.tsx`) still display academic/statistical jargon (e.g., "Error Taxonomy Log", "Forgetting curve decay", "Empirical Bayes shrinkage", "Concept fragmentation in mechanics").
3. **Manual Total Hours Override (R3):** In `src/app/daily/page.tsx`, multi-session addition and duration calculations are implemented, but the manual override state (`manualOverrideTotal`) lacks an active UI toggle and input mechanism, preventing students from manually overriding calculated daily totals.
4. **Session Badges & History Drawer (R4):** In `src/app/dashboard/page.tsx`, the study history table renders rigid separate subject numeric columns. It lacks compact colored session badges (`[Bio: 2.0h]`, `[Phys: 1.5h]`) inside table rows and does not provide an expandable row or drawer to inspect session breakdown, start/end timestamps, topics, and notes.

---

## 2. Frontend Architecture & Component Directory Map

### 2.1 Routing & App Directory Structure (`src/app/`)

The application implements Next.js 14 App Router with static HTML export for Firebase Hosting:

| Route / File | Component Purpose & Features | Key Dependencies |
|---|---|---|
| `src/app/layout.tsx` | Global HTML shell, font declarations, Firebase Compat SDK scripts, `ThemeProvider`, `TooltipProvider`, `AuthProvider`, `AppProvider`, `ConnectedHeader`, `Footer`, `Toaster`. | `next-themes`, `sonner`, `@/context/*` |
| `src/app/page.tsx` | High-conversion landing page with claymorphic cards, live group telemetry KPIs from Google Sheets, stream selectors, interactive Z-Score sandbox calculator, and Google OAuth CTA. | `framer-motion`, `lucide-react`, `dataEngineering.ts` |
| `src/app/daily/page.tsx` | Daily study logging portal featuring multi-session builder, direct hours mode, dual focus/productivity sliders, client-side image compression, and magic bytes security validation. | `DualSlider.tsx`, `security.ts`, `confetti.ts`, `audio.ts` |
| `src/app/dashboard/page.tsx` | Student command center featuring stats Bento grid, gamification shelf, cognitive AI gauge, volume trends chart, balance index card, and study history table. | `StudyTrendChart.tsx`, `SubjectBalanceCard.tsx`, `GamificationShelf.tsx` |
| `src/app/tests/page.tsx` | Examination marks & test score logger with weighted EMA trend analysis, grade prediction, and what-if simulation engine. | `AddTestMarkModal.tsx`, `TestAnalyticsTrends.tsx`, `TestMarksTable.tsx` |
| `src/app/id-card/page.tsx` | Apple Wallet-style 3D tilt student ID card with specular glare, canvas-rendered QR verification code, and 300 DPI high-res PNG export. | `AppleWalletCard.tsx`, `idcard.ts`, `qr.ts` |
| `src/app/admin/page.tsx` | Protected administrator dashboard for `alwisachalaanurada@gmail.com` with member directory, inline modal editor, CSV/JSON/XLSX/SQL exports, and study logs monitor. | `Dialog`, `DataTable`, `dataEngineering.ts` |
| `src/app/verify/page.tsx` | Public student ID verification registry resolving `?id=STUDY_ID` directly against live backend data. | `api.ts` |
| `src/app/globals.css` | Design system variables, HSL color tokens for light and dark modes, custom scrollbars, aurora mesh animations, claymorphism and glassmorphism utility classes. | Tailwind CSS base & utilities |

### 2.2 Component Hierarchy (`src/components/`)

```
src/components/
├── ai/
│   ├── CognitiveAdvisorCard.tsx   # Categorized study advice cards with severity badges
│   ├── CognitiveFatigueRadar.tsx  # SVG radar chart for cognitive fatigue vs study streaks
│   ├── StudyAdvisorCard.tsx       # Stream-tailored prescription list on /tests
│   ├── WhatIfSimulator.tsx        # Dynamic mark simulation slider widget
│   └── ZScoreVelocityGauge.tsx    # Semi-circle gauge for estimated Z-score & university tier
├── dashboard/
│   ├── AcademicReportModal.tsx    # Parent/teacher PDF report with QR code and CSV export
│   ├── EditProfileModal.tsx       # Student profile & school/stream updater with email verify
│   ├── GamificationShelf.tsx      # XP progression bar and 8 milestone achievement badges
│   ├── StudyTrendChart.tsx        # 7-day and 14-day SVG Bezier study volume trends
│   └── SubjectBalanceCard.tsx     # 0-100% Subject Equilibrium & Balance Index score
├── form/
│   └── DualSlider.tsx             # Interactive 1-10 slider for focus & productivity
├── idcard/
│   └── AppleWalletCard.tsx        # 3D interactive canvas-rendered student pass
├── layout/
│   ├── AuroraBackground.tsx       # 4-orb CSS ambient animated background
│   ├── Footer.tsx                 # Responsive bottom navigation and cloud sync status
│   ├── Header.tsx                 # Navigation bar with active streak pill and theme toggle
│   ├── ThemeProvider.tsx          # Next-themes wrapper for dark/light mode switching
│   └── ThemeToggle.tsx            # Sun/Moon animated mode toggle button
├── tests/
│   ├── AddTestMarkModal.tsx       # Test score & exam paper entry dialog
│   ├── TestAnalyticsTrends.tsx    # Subject performance trend charts
│   └── TestMarksTable.tsx         # Test marks listing table with delete actions
└── ui/                            # Shadcn / Radix UI component library primitives
    ├── button.tsx, card.tsx, input.tsx, label.tsx, dialog.tsx, popover.tsx, progress.tsx,
    ├── select.tsx, separator.tsx, skeleton.tsx, slider.tsx, sonner.tsx, table.tsx,
    └── tabs.tsx, textarea.tsx, tooltip.tsx, navigation-menu.tsx, avatar.tsx, badge.tsx
```

---

## 3. In-Depth Analysis: `/daily` Page & Study Logger

### 3.1 Architecture of `src/app/daily/page.tsx`

The `/daily` page manages daily study submission with stream-aware subject adaptation (Physical Science vs. Biological Science).

#### Key Implemented Capabilities:
- **Stream Subject Determination (Lines 61–65):** Dynamically computes `sub1Name` (Biology or Combined Maths), `sub2Name` (Chemistry or Physics), and `sub3Name` (Optional subject or Physics/Chemistry).
- **Multiple Sessions State (Lines 67–79):** Maintains `sessions` array conforming to `StudySession` interface (`id`, `subject`, `hours`, `startTime`, `endTime`, `focus`, `productivity`, `notes`, `topic`).
- **Time Duration Calculation (Lines 173–180):** `calculateDurationFromTimes(start, end)` converts `HH:MM` start and end inputs into exact decimal hours with midnight-wrap protection.
- **Real-Time Auto-Summing (Lines 108–143):** An active `useEffect` listener sums subject hours and calculates average focus and productivity scores whenever sessions are added or modified.
- **Quick Delta Buttons (Lines 583–601):** Ergonomic `+30m` and `+1h` incremental adjustments available on both session cards and manual subject inputs.
- **Proof Photo Hardening (Lines 243–286):** Dual security verification via 12-byte magic byte binary sniffing (`validateImageFile`) and polyglot string scan (`scanBase64Payload`) with client-side canvas compression down to under 380KB.
- **Rate Limiting & Duplicate Lockout (Lines 288–306):** Sliding-window rate limiter prevents burst abuse, and existing submissions for the selected date lock the form with a summary card.

#### Critical Gaps in `/daily`:
1. **Missing Manual Override UI Control:**  
   Line 85 initializes `const [manualOverrideTotal, setManualOverrideTotal] = useState<number | null>(null);` and Line 146 checks `displayTotalHours = manualOverrideTotal !== null ? manualOverrideTotal : calculatedTotal;`. However, `setManualOverrideTotal` is **never rendered or wired up in JSX**. When students add 3 sessions totaling 4.5 hours but wish to adjust their total to 4.0 hours, they currently have no direct input or toggle to do so in sessions mode.
2. **Session Card Density & Spacing:**  
   Session cards inside the list use compact `p-4` with small text labels (`text-[11px]`). On mobile viewports (375px), start/end time inputs and hours adjustment buttons get cramped.

---

## 4. In-Depth Analysis: `/dashboard` Page & Data Display

### 4.1 Architecture of `src/app/dashboard/page.tsx`

The dashboard synthesizes student study data into actionable KPIs and widgets:
- **Stats Bento Grid (Lines 380–488):** Displays Active Streak (days), Total Hours, Study Quality (Focus/Productivity), and Subject Distribution progress bars.
- **Gamification Shelf (Lines 490–496):** Integrates XP Level, rank title (Novice to Study Grandmaster), and 8 achievement badges.
- **Cognitive AI & Trends (Lines 498–539):** Renders dynamic Z-Score velocity gauge, stream-tailored prescriptions, cognitive fatigue radar, 7/14-day study volume curve, and subject equilibrium balance index.
- **History Table (Lines 570–709):** Renders table rows for submitted logs with search filtering and photo proof viewing.

#### Critical Gaps in `/dashboard`:
1. **Absence of Compact Session Badges:**  
   Lines 669–677 display plain numeric strings (e.g. `2.0h`, `1.5h`) under separate subject columns. The table does not parse or render modern, colored session pills (e.g. `[Bio: 2.0h]`, `[Phys: 1.5h]`, `[Chem: 1.0h]`) with subject-coded accents.
2. **Missing Expandable Row / Session Detail Drawer (R4):**  
   Table rows in `src/app/dashboard/page.tsx` are static and non-interactive. When a student logs multiple sessions in a day, there is no expandable drawer or modal to inspect:
   - Specific session start and end times (`08:30 – 10:00`)
   - Session topics (e.g., "Mechanics Part B Past Papers")
   - Individual session focus/productivity ratings
   - Individual session notes

---

## 5. UI Ergonomics, Typography & Mobile Usability Audit

### 5.1 Touch Target & Button Sizing Audit

| Component / Location | Current Height / Dimensions | Target Standard | Assessment & Remediation |
|---|---|---|---|
| `Button` default (`src/components/ui/button.tsx:31`) | `h-10 px-4 py-2` (40px) | `min-h-[44px]` – `h-12` (48px) | **Non-Compliant.** Below 44px standard. Must increase default to `h-11` (44px) or `h-12` (48px) with generous touch padding. |
| `Button` sm (`src/components/ui/button.tsx:32`) | `h-9 rounded-lg px-3` (36px) | `min-h-[40px]` touch area | **Marginal.** Too small for thumb taps on mobile. Needs `min-h-[40px]` with larger active tap box. |
| `Button` icon (`src/components/ui/button.tsx:34`) | `h-10 w-10` (40px) | `h-11 w-11` (44px) | **Non-Compliant.** Needs minimum 44px bounding box. |
| Dashboard action buttons (`src/app/dashboard/page.tsx:282-328`) | `h-10 px-3.5` (40px) | `h-11` (44px) | **Non-Compliant.** Update to `h-11` with `px-4`. |
| Header Nav Links (`src/components/layout/Header.tsx:131-150`) | `py-1.5 px-3.5` (~32px) | `min-h-[44px]` | **Non-Compliant.** Increase desktop and mobile tap targets. |
| Quick Delta Buttons (`src/app/daily/page.tsx:583-601`) | `h-11 px-3` (44px) | `h-11` – `h-12` | **Compliant.** Good tactile height (44px). |
| Daily Submit CTA (`src/app/daily/page.tsx:962`) | `h-14` (56px) | `h-14` (56px) | **Exemplary.** Spacious 56px height, rounded-2xl with gradient shadow. |

### 5.2 Natural Human Language vs. Academic Jargon Audit

The system requirements strictly prohibit robotic, intimidating academic terminology in favor of warm, everyday conversational English:

| Jargon Term in Current Code | Location | Recommended Human-Friendly Replacement |
|---|---|---|
| "Empirical Bayes shrinkage kappa=2.0 / Hastings CDF" | `ZScoreVelocityGauge.tsx`, `dataEngineering.ts` | "Smart Grade Prediction model" |
| "Entropy Equilibrium Variance" | `SubjectBalanceCard.tsx`, `dataEngineering.ts` | "Subject Study Balance" |
| "Error Taxonomy Log" | `studyAdvisor.ts:150` | "Mistake Notebook" / "Review List" |
| "Concept fragmentation in mechanics leading to lost marks" | `studyAdvisor.ts:192` | "You're doing great in physics, but reviewing basic mechanics steps will help boost your score." |
| "Forgetting curve affecting transition element oxidation states" | `studyAdvisor.ts:238` | "Quick daily reviews will help you remember chemistry reaction colors and equations easily." |
| "Qualitative recall decay" | `studyAdvisor.ts:237` | "Memory refresh needed" |
| "Structural gap in algebraic manipulation" | `studyAdvisor.ts:169` | "Practice algebra and integration problems in the morning to build speed." |
| "Unit Equilibrium Drills" | `studyAdvisor.ts:219` | "Chemistry practice problems" |
| "Dynamic Velocity Metric (EMA Velocity)" | `ZScoreVelocityGauge.tsx:21` | "Score Improvement Trend" |

### 5.3 Spacing, Padding & Low-Density Layouts

- **Card Padding:** Currently uses `p-4` to `p-6`. Elevating major dashboard and form cards to `p-6 sm:p-8` creates a light, relaxed atmosphere with ample breathing room.
- **Card Margins:** Spacing between sections is currently `space-y-6` to `space-y-8`. This provides good separation.
- **Responsive Flex Wraps:** All headers and badge containers utilize `flex-wrap` and `gap-2` to `gap-4`, preventing clipping on 375px screens.
- **Text Overflow Protections:** `truncate`, `max-w-[...]`, and `break-words` are present in most titles; table cells must ensure `whitespace-nowrap` on dates and `break-words` on notes.

---

## 6. Gap Analysis & Roadmap for R1, R3, R4 Requirements

```
+-----------------------------------------------------------------------------------------------+
| REQUIREMENTS GAP MATRIX                                                                       |
+---------------------+-----------------------------------+-------------------------------------+
| Requirement         | Current State                     | Required Implementation Target      |
+---------------------+-----------------------------------+-------------------------------------+
| R1: Ergonomics &    | Buttons at h-10/h-9 (40px/36px).  | - Update Button primitives to min   |
| Conversational Copy | Jargon in studyAdvisor & cards.   |   44-48px height.                   |
|                     |                                   | - Refactor all advisory messages    |
|                     |                                   |   to natural student language.      |
+---------------------+-----------------------------------+-------------------------------------+
| R3: Multi-Session   | Dynamic sessions builder exists,  | - Implement Manual Override toggle  |
| Logger & Override   | but manual override total hours   |   with direct hours input field.    |
|                     | UI is missing.                    | - Live dual-mode syncing.           |
+---------------------+-----------------------------------+-------------------------------------+
| R4: Session Badges  | Plain numeric columns in history. | - Colored session pill badges in    |
| & Details Drawer    | No row expansion or detail drawer.|   history rows.                     |
|                     |                                   | - Expandable SessionDetailDrawer    |
|                     |                                   |   showing times, topics, notes.     |
+---------------------+-----------------------------------+-------------------------------------+
```

### 6.1 Action Items for R1 (Button Ergonomics & Human Copy)
1. **Refactor `src/components/ui/button.tsx`:**
   - Update `size.default` to `h-11 px-5 py-2.5 text-sm` (44px minimum height).
   - Update `size.lg` to `h-13 px-8 text-base` (52px height).
   - Update `size.sm` to `h-10 px-3.5 text-xs` (40px with generous tap padding).
   - Ensure all buttons include `active:scale-[0.98]` tactile transitions.
2. **Rewrite Advisory Copy in `src/lib/ai/studyAdvisor.ts`:**
   - Replace complex mathematical phrasing with supportive, conversational guidance.
   - Maintain accurate underlying heuristics while humanizing student-facing messages.

### 6.2 Action Items for R3 (Multi-Session Logger & Manual Override)
1. **Enhance `src/app/daily/page.tsx`:**
   - Add a clean "Manual Override Total Hours" toggle switch next to the auto-calculated total.
   - When enabled, display a direct number input allowing students to enter custom total hours.
   - Retain individual session entries in the submission payload while honoring the manual override total.
   - Improve session card ergonomics with subject badges and clearer time interval pickers.

### 6.3 Action Items for R4 (Session Badges & History Details Drawer)
1. **Create `SessionBadges` Component (`src/components/dashboard/SessionBadges.tsx`):**
   - Parse `log.sessions` (or fallback to `log.subjects`).
   - Render colored badge pills: Emerald for Biology, Indigo for Combined Maths, Cyan for Physics, Amber for Chemistry, Purple for ICT/Agriculture.
2. **Create `SessionDetailDrawer` Component (`src/components/dashboard/SessionDetailDrawer.tsx`):**
   - Provide a slide-over drawer or dialog displaying complete session logs for any historical day.
   - Show start time, end time, computed duration, focus rating, topic, and notes for each session.
   - Wire table row click events to open the drawer smoothly.

---

## 7. Recommended Component Interface Contracts

### 7.1 `SessionBadges` Contract
```typescript
export interface SessionBadgesProps {
  sessions?: StudySession[];
  subjects?: SubjectLog[];
  className?: string;
  maxDisplay?: number;
}
```

### 7.2 `SessionDetailDrawer` Contract
```typescript
export interface SessionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DailyLogEntry | null;
  sub1Name: string;
  sub2Name: string;
  sub3Name: string;
}
```

### 7.3 Manual Override Payload Contract
```typescript
export interface DailyLogSubmissionPayload {
  studyId: string;
  fullName: string;
  email: string;
  stream: string;
  dateOfStudy: string;
  sessions: StudySession[];
  hoursSubject1: number;
  hoursSubject2: number;
  hoursSubject3: number;
  totalHours: number; // Either auto-calculated sum or manual override value
  manualOverride: boolean;
  focusScore: number;
  productivityScore: number;
  notes: string;
  telegramUsername: string;
  photoProofBase64?: string;
}
```

---

## 8. Conclusion

The StudySync frontend is well-structured and highly performant with static export capabilities. Implementing the ergonomic button enhancements, conversational copy revisions, manual total hour override controls, and session history drawers will fulfill all requirements (R1, R3, R4) with high fidelity and zero functional regression.
