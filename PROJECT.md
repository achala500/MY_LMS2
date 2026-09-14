# Project: StudySync Monoline Vector Illustration & Visual Asset System

## Architecture
StudySync is a production-grade Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui application configured for static export (`output: 'export'`) deployed to Firebase Hosting (`studysync-al-2026.web.app`), backed by Google Apps Script / Google Sheets and local mock server (`server/mock-server.js`).

Authoritative Reference: `ORIGINAL_REQUEST.md` (Section `## 2026-09-13T06:17:34Z`).

### Visual Asset & Animation Architecture
1. **Monoline Palette & Contour Specification**:
   - Card/Illustration Surfaces: pure white (`#ffffff`) or token-matched card surfaces with high contrast plates.
   - Contours: uniform-weight dark blue-black contours (`#19202e`), strokeWidth 1.5 to 2.0 (standard 1.75), `vector-effect="non-scaling-stroke"`.
   - Spot Fills:
     - Salmon-pink (`#fa7268`)
     - Muted yellow (`#fcd34d`)
     - Soft orange (`#fb923c`)
   - Dual-theme support: High contrast 14.2:1 against light surfaces; encapsulated white plates or adaptive contour tokens against dark backgrounds (`#17191D`).
2. **60fps Micro-Animations & Motion Engine**:
   - Hardware-accelerated GPU transforms (`transform: translate3d(...)`, `opacity`, `will-change: transform`).
   - Ambient continuous loops:
     - Drifting stars (`@keyframes monoline-star-drift`)
     - Soft lamp glow (`@keyframes monoline-lamp-glow`)
     - Floating clouds (`@keyframes monoline-cloud-drift`)
     - Rhythmic breath pulses (`@keyframes monoline-breath-pulse`)
     - Subtle steam rise (`@keyframes monoline-steam-rise`)
   - Tactile interactive states: hover scaling, click feedback, completion reward pulses.
   - Accessibility: `@media (prefers-reduced-motion: reduce)` halts continuous animations, and each component supports an `animated?: boolean` prop defaulting to true.
   - Zero Layout Shift: Explicit `viewBox`, fixed aspect ratio, `contain: layout paint`, scalable down to <380px without clipping.
3. **Accessibility & Emoji Elimination**:
   - Zero raw emojis across all active frontend pages (`src/app/`, `src/components/`, `verify.html`).
   - Replaced strictly by Lucide icon sets or custom monoline vector illustrations.
   - Strict regression guard: `src/js/` legacy files remain untouched to protect test assertions in `tests/m4-verification.test.js` and `tests/m5-verification.test.js`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Monoline Tokens & Animation CSS Engine | Define `#19202e` contour and spot fills (`#fa7268`, `#fcd34d`, `#fb923c`), and append GPU-accelerated CSS keyframes with `prefers-reduced-motion` in `globals.css` | M1 | Survey Explorer 2 |
| 2 | Landing Hero Illustration Component | Scalable 600x450 vector illustration with Colombo morning desk, lamp glow, drifting stars, open notebook, and steam pulse | M1 | Survey Explorer 1 |
| 3 | Academic Rhythm & Streak Vector Assets | Scalable vector components for weekly study pace and streak milestone celebrations | M1 | Survey Explorer 1 |
| 4 | Study Clock / Stopwatch Vector Asset | Scalable circular focus clock vector with rhythmic breath pulse and timer controls | M1 | Survey Explorer 1 |
| 5 | Tests & Z-Score Forecast Vector Asset | Scalable examination forecast and performance curve vector with milestone targets | M1 | Survey Explorer 1 |
| 6 | Calendar Schedule Pace Vector Asset | Scalable weekly rhythm and calendar schedule pace vector | M1 | Survey Explorer 1 |
| 7 | Admin Verification Desk Vector Asset | Scalable administrative oversight and homework verification desk vector | M1 | Survey Explorer 1 |
| 8 | Empty States Vector Suite | 7 dedicated empty-state illustrations and reusable `EmptyState` component | M1 | Survey Explorer 1 |
| 9 | Landing Page Integration | Wire `LandingHeroIllustration` into `src/app/page.tsx:126–219` | M2 | Survey Explorer 1 |
| 10 | Dashboard Integration | Wire `AcademicRhythmIllustration`, `StreakMilestoneIllustration`, and `EmptyLogsIllustration` into `src/app/dashboard/page.tsx` | M2 | Survey Explorer 1 |
| 11 | Daily Stopwatch Integration | Wire `StudyClockIllustration` and `EmptyDailyBlocksIllustration` into `src/app/daily/page.tsx` | M2 | Survey Explorer 1 |
| 12 | Tests & Z-Score Page Integration | Wire `ZScoreForecastIllustration` and `EmptyTestScoresIllustration` into `src/app/tests/page.tsx` and `TestMarksTable.tsx` | M3 | Survey Explorer 1 |
| 13 | Calendar Page Integration | Wire `CalendarPaceIllustration` and `EmptyCalendarScheduleIllustration` into `src/app/calendar/page.tsx` | M3 | Survey Explorer 1 |
| 14 | Admin Desk Page Integration | Wire `AdminVerificationDeskIllustration` and verification queue empty states into `src/app/admin/page.tsx` | M3 | Survey Explorer 1 |
| 15 | Paper Vault & Search Empty States | Wire `EmptyPastPapersIllustration` and `EmptySearchResultsIllustration` into `VaultPanel.tsx` and `admin/page.tsx` | M3 | Survey Explorer 1 |
| 16 | Zero Raw Emoji Sanitization | Replace all raw emojis in `AcademicReportModal.tsx`, `utils.ts`, and `verify.html` with Lucide icons | M3 | Survey Explorer 1 |
| 17 | TypeScript Static Analysis Pass | Zero errors on `npx tsc --noEmit` | M4 | Survey Explorer 3 |
| 18 | Automated Unit & Integration Pass | 100% pass across all 472 tests in `npm test` | M4 | Survey Explorer 3 |
| 19 | E2E Regression Pass | 100% pass across all 469 tests in `npm run test:e2e` | M4 | Survey Explorer 3 |
| 20 | Static Export Build Verification | Clean Next.js static export via `npm run build` generating all 11 routes in `out/` | M4 | Survey Explorer 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Monoline Vector Component Library & CSS Animation Engine | Features 1, 2, 3, 4, 5, 6, 7, 8 (`src/components/illustrations/*`, `src/app/globals.css`) | none | DONE |
| M2 | Route Integration — Landing Hero, Dashboard & Daily Stopwatch | Features 9, 10, 11 (`src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/daily/page.tsx`) | M1 | IN_PROGRESS |
| M3 | Route Integration — Tests, Calendar, Admin Desk & Empty States & Emoji Elimination | Features 12, 13, 14, 15, 16 (`src/app/tests/page.tsx`, `src/app/calendar/page.tsx`, `src/app/admin/page.tsx`, `TestMarksTable.tsx`, `VaultPanel.tsx`, `AcademicReportModal.tsx`, `utils.ts`, `verify.html`) | M1, M2 | PLANNED |
| M4 | Final Verification, Adversarial Hardening & Production Build | Features 17, 18, 19, 20 (`npx tsc --noEmit`, `npm test`, `npm run test:e2e`, `npm run build`) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Monoline Tokens (`src/components/illustrations/tokens.ts`)
```ts
export const MONOLINE_COLORS = {
  contour: '#19202e',
  surface: '#ffffff',
  spotPink: '#fa7268',
  spotYellow: '#fcd34d',
  spotOrange: '#fb923c',
} as const;

export interface MonolineIllustrationProps {
  className?: string;
  size?: number | string;
  animated?: boolean;
}
```

### Micro-Animation Keyframes (`src/app/globals.css`)
```css
@keyframes monoline-star-drift {
  0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.4; }
  50% { transform: translate3d(2px, -3px, 0); opacity: 1; }
}
@keyframes monoline-lamp-glow {
  0%, 100% { opacity: 0.25; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(1.04); }
}
@keyframes monoline-cloud-drift {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(6px, 0, 0); }
}
@keyframes monoline-breath-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes monoline-steam-rise {
  0% { transform: translate3d(0, 0, 0); opacity: 0; }
  50% { opacity: 0.6; }
  100% { transform: translate3d(2px, -6px, 0); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-monoline-star,
  .animate-monoline-lamp,
  .animate-monoline-cloud,
  .animate-monoline-breath,
  .animate-monoline-steam {
    animation: none !important;
  }
}
```

## Code Layout
- `src/components/illustrations/tokens.ts`: Token constants and shared TypeScript interfaces.
- `src/components/illustrations/LandingHeroIllustration.tsx`: Landing hero desk vector.
- `src/components/illustrations/AcademicRhythmIllustration.tsx`: Dashboard study rhythm vector.
- `src/components/illustrations/StreakMilestoneIllustration.tsx`: Streak celebration vector.
- `src/components/illustrations/StudyClockIllustration.tsx`: Daily stopwatch focus clock vector.
- `src/components/illustrations/ZScoreForecastIllustration.tsx`: Examination forecast curve vector.
- `src/components/illustrations/CalendarPaceIllustration.tsx`: Calendar scheduling pace vector.
- `src/components/illustrations/AdminVerificationDeskIllustration.tsx`: Admin oversight desk vector.
- `src/components/illustrations/EmptyStates.tsx`: 7 empty state vectors and `<EmptyState>` wrapper.
- `src/components/illustrations/index.ts`: Unified barrel export.
- `src/app/globals.css`: Micro-animation keyframe classes and reduced-motion rules.
- `src/app/page.tsx`: Landing page integration.
- `src/app/dashboard/page.tsx`: Dashboard route integration.
- `src/app/daily/page.tsx`: Daily logger integration.
- `src/app/tests/page.tsx`: Tests route integration.
- `src/app/calendar/page.tsx`: Calendar route integration.
- `src/app/admin/page.tsx`: Admin desk route integration.
- `src/components/tests/TestMarksTable.tsx`: Empty state mount.
- `src/components/vault/VaultPanel.tsx`: Empty state mount.
- `src/components/dashboard/AcademicReportModal.tsx`: Emoji elimination.
- `src/lib/utils.ts`: Emoji elimination.
- `verify.html`: Emoji elimination.
- `tests/`: Existing regression test suites (read-only).
- `src/js/`: Legacy files (strictly untouched to preserve existing Node test assertions).
