# Milestone 2 Exploration Report: Monolinear Vector Illustration System

**Agent**: `m2_explorer_illustrations`  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\m2_explorer_illustrations`  
**Target Milestone**: Milestone 2 (Kinfolk Academic 9-Page Layout Harmonization & Monolinear Vector Art)  
**Date**: 2026-09-12  

---

## 1. Observation

### 1.1 Existing Illustration Architecture
Inspection of `src/components/brand/Illustrations.tsx` (lines 1–139) revealed six legacy SVG components:
1. `IllustrationStudy` (lines 9–27)
2. `IllustrationCountdown` (lines 30–54)
3. `IllustrationSecurity` (lines 57–70)
4. `IllustrationIdCard` (lines 73–97)
5. `IllustrationAnalytics` (lines 100–121)
6. `IllustrationStreak` (lines 124–138)

Key observations of these legacy components:
- Hardcoded accent tokens: they reference `var(--primary, #C24942)` which was the pre-Stitch crimson token, rather than the authoritative Kinfolk Terracotta token (`#c85a32`).
- Fixed sizes: they accept only `size?: number` with a default of `120`, lacking independent `width` and `height` properties or responsive `viewBox` proportional scaling.
- Limited scope: none of the 5 Sri Lankan A/L subject streams, 5 empty state scenarios, or 6 achievement badges exist in the codebase.
- Codebase usage scan: ripgrep across `src` revealed zero current imports of `Illustrations.tsx`. All empty states and badges currently rely on basic text blocks or standard Lucide React icons.

### 1.2 Existing Gamification Shelf Audit
Inspection of `src/components/dashboard/GamificationShelf.tsx` (lines 1–187) and `src/lib/gamification.ts` (lines 151–251) revealed:
- `GamificationShelf.tsx` defines `BADGE_ICONS` (lines 31–40) mapping Lucide icon primitives (`Flame`, `Zap`, `Crown`, `Award`, `Trophy`, `Scale`, `Sun`, `Moon`) inside 36x36px boxes (`h-9 w-9`, line 131).
- The 8 evaluated badges in `src/lib/gamification.ts`:
  1. `streak-7`: 7-Day Streak
  2. `streak-14`: 14-Day Streak
  3. `streak-30`: 30-Day Master
  4. `hours-50`: 50h Club
  5. `hours-100`: 100h Club
  6. `equilibrium-master`: Subject Equilibrium Master
  7. `early-bird`: Early Bird
  8. `night-owl`: Night Owl
- The badges currently render as standard SaaS icon tiles without bespoke editorial character or visual hierarchy.

### 1.3 Existing Empty States Across Application Pages
Direct review of page templates revealed generic placeholder states:
1. **Student Dashboard (`src/app/dashboard/page.tsx`)**:
   - Lines 701–709: Study history table empty state displays a plain `<p className="text-sm text-zinc-400">No study logs yet.</p>` with an indigo button.
   - Lines 928–941: Test marks card displays a generic Lucide `BookOpen` icon in a 40x40 box with plain text.
2. **Exam Marks Tracking (`src/app/tests/page.tsx` & `src/components/tests/TestMarksTable.tsx`)**:
   - `page.tsx` lines 253–274: When `testMarks.length === 0`, renders a banner with a small `BookOpen` icon.
   - `TestMarksTable.tsx` lines 78–82: When filtered or empty, renders a plain text message: `No test marks logged yet.`
3. **Study Calendar (`src/app/calendar/page.tsx` & `src/components/calendar/GoogleStudyCalendar.tsx`)**:
   - Lines 746–748: In day view when `dayEvents.length === 0`, renders plain text: `No study blocks scheduled for this day.`
   - Line 690: In week view when empty, renders: `No study scheduled`.
4. **Daily Study Logger (`src/app/daily/page.tsx`)**:
   - Lines 493–540: When a study log is already recorded for the day, renders a flat text card. There is no visual representation of the student's curriculum stream.

### 1.4 Design Tokens & Theme Context
`src/app/globals.css` (lines 84–123) and `PROJECT.md` define the authoritative Kinfolk Academic token matrix:
- Canvas / Background: `#fef8f4` (Light) / `#0F1114` (Dark)
- Card / Workspace Surface: `#ffffff` (Light) / `#17191D` (Dark)
- Primary (Terracotta / Rust): `#c85a32`
- Secondary (Sage Olive): `#456644`
- Tertiary (Muted Amber / Ochre): `#854f00`
- Text Primary: `#1d1b19` (Light) / `#f6f0ec` (Dark)
- Text Muted: `#57423b` (Light) / `#a69f98` (Dark)
- Hairline Border: `#e6e4dd` (Light) / `rgba(255,255,255,0.08)` (Dark)

---

## 2. Logic Chain

1. **Aesthetic Intent**: The user request and Project Plan require a Claude/Notion-inspired monolinear vector illustration system. Claude and Anthropic editorial illustrations feature fine, uniform monolinear strokes (1.5px–2.0px), delicate translucent color washes, open geometric composition, and warm academic motifs.
2. **Subject Streams**: Sri Lankan A/L curriculum is divided into streams. Creating dedicated vector illustrations for each of the 5 streams establishes immediate subject recognition and scholarly pride:
   - `MathsStreamIllustration`: Coordinate geometry, sinusoidal calculus wave, drafting compass with thumbscrew and pivot needle.
   - `BioStreamIllustration`: DNA double helix with base-pair rungs, botanical leaf blade, and monolinear laboratory microscope.
   - `PhysicalScienceIllustration`: Rutherford-Bohr electron orbital tracks, optical dispersion prism with emerging spectrum, and Erlenmeyer flask with effervescent bubbles.
   - `CommerceStreamIllustration`: Balanced ledger scales of justice, economic growth curve, classical column podium.
   - `TechStreamIllustration`: Silicon microprocessor with dual-in-line pins, orthogonal PCB traces with solder pads, code syntax tags (`< >`), and terminal cursor.
3. **Empty States**: Empty states represent moments of pause or initial onboarding. Replacing sterile generic text with warm, mindful illustrations transforms anxiety into inspiration:
   - `EmptyLogsIllustration`: Scholar's wooden desk, open lined journal with ribbon bookmark, artisanal steaming cup, desk succulent.
   - `EmptyTestsIllustration`: Unrolled examination parchment with test questions, vintage sand hourglass, inkwell and quill.
   - `EmptyCalendarIllustration`: Standing spiral-bound desk planner with date grid, today marker, and drifting autumn ginkgo leaf.
   - `EmptySearchIllustration`: Scholarly magnifying glass focusing on an ancient codex with discovery sparkle stars.
   - `GeneralEmptyIllustration`: Minimalist wall archive shelf with standing folios, folded document, and bud vase with dried stem.
4. **Gamification Badges**: Replacing generic Lucide icons with bespoke monolinear medals elevates the achievement experience:
   - `Streak7DayBadge`: Laurel contour wreath with bottom ribbon bow and 7-day sacred flame emblem.
   - `Streak30DayBadge`: 30-tick celestial rim, lunar crescent, sweeping orbital ring with pearl satellite.
   - `TopRankBadge`: Regal academic heraldic shield, five-point star apex, crossed quills over open book.
   - `SubjectMasterBadge`: Triple interlocking Borromean rings (Maths, Science, Commerce) with ceremonial ribbon tails.
   - `NightOwlBadge`: Crescent moon arching over nocturnal open book with watchful owl silhouette.
   - `EarlyBirdBadge`: Radiant morning sun with 7 dawn rays rising over horizon study desk with steaming cup and soaring swallow.
5. **Responsiveness & Theming**:
   - All illustrations must accept `className`, `size`, `width`, `height`, and `strokeWidth`.
   - Strokes must use `currentColor` and `var(--muted-foreground, #57423b)` with `strokeLinecap="round"` and `strokeLinejoin="round"` to guarantee crisp lines that adapt automatically to both Light and Dark modes.
   - Accents must use CSS variables `var(--primary, #c85a32)`, `var(--secondary, #456644)`, and `var(--tertiary, #854f00)`.
   - Existing legacy exports must be preserved to guarantee zero functional regression.

---

## 3. Caveats

1. **Browser Sub-pixel Rendering**: On very small screens (e.g., 32px badge preview), lines thinner than 1.2px can blur on non-retina displays. To prevent this, the badges use a base `strokeWidth` of `1.75px` which scales down cleanly to `32px` while retaining clarity.
2. **Theme Transitions**: Because color washes use CSS variables (`var(--primary)`, `var(--secondary)`, etc.), when the user toggles between dark and light themes, the SVGs transition seamlessly without needing conditional JavaScript re-renders.
3. **Read-Only Scope**: This agent is operating under read-only exploration rules. The complete proposed replacement file has been written to `.agents/m2_explorer_illustrations/proposed_Illustrations.tsx` and `.agents/m2_explorer_illustrations/Illustrations.patch`. Source code files in `src/` have not been directly modified.

---

## 4. Conclusion & Integration Blueprints

### 4.1 Artifacts Created in Working Directory
1. `proposed_Illustrations.tsx`: Complete, production-grade TypeScript React file containing all 16 new illustrations + 6 upgraded legacy illustrations (100% verified, zero TypeScript errors).
2. `Illustrations.patch`: Unified git patch file ready to apply to `src/components/brand/Illustrations.tsx`.

### 4.2 Target Integration Blueprint: `src/components/brand/Illustrations.tsx`
Replace `src/components/brand/Illustrations.tsx` with the contents of `proposed_Illustrations.tsx`.

The complete inventory of exported components:
```typescript
// 5 Subject Streams
export function MathsStreamIllustration(props: IllustrationProps): JSX.Element;
export function BioStreamIllustration(props: IllustrationProps): JSX.Element;
export function PhysicalScienceIllustration(props: IllustrationProps): JSX.Element;
export function CommerceStreamIllustration(props: IllustrationProps): JSX.Element;
export function TechStreamIllustration(props: IllustrationProps): JSX.Element;

// 5 Empty State Illustrations
export function EmptyLogsIllustration(props: IllustrationProps): JSX.Element;
export function EmptyTestsIllustration(props: IllustrationProps): JSX.Element;
export function EmptyCalendarIllustration(props: IllustrationProps): JSX.Element;
export function EmptySearchIllustration(props: IllustrationProps): JSX.Element;
export function GeneralEmptyIllustration(props: IllustrationProps): JSX.Element;

// 6 Achievement / Milestone Badges
export function Streak7DayBadge(props: IllustrationProps): JSX.Element;
export function Streak30DayBadge(props: IllustrationProps): JSX.Element;
export function TopRankBadge(props: IllustrationProps): JSX.Element;
export function SubjectMasterBadge(props: IllustrationProps): JSX.Element;
export function NightOwlBadge(props: IllustrationProps): JSX.Element;
export function EarlyBirdBadge(props: IllustrationProps): JSX.Element;

// 6 Backward Compatibility Exports
export function IllustrationStudy(props: { className?: string; size?: number }): JSX.Element;
export function IllustrationCountdown(props: { className?: string; size?: number }): JSX.Element;
export function IllustrationSecurity(props: { className?: string; size?: number }): JSX.Element;
export function IllustrationIdCard(props: { className?: string; size?: number }): JSX.Element;
export function IllustrationAnalytics(props: { className?: string; size?: number }): JSX.Element;
export function IllustrationStreak(props: { className?: string; size?: number }): JSX.Element;
```

### 4.3 Target Integration Blueprint: `src/components/dashboard/GamificationShelf.tsx`

**Import Addition**:
```typescript
import {
  Streak7DayBadge,
  Streak30DayBadge,
  TopRankBadge,
  SubjectMasterBadge,
  NightOwlBadge,
  EarlyBirdBadge,
} from '@/components/brand/Illustrations';

const BADGE_ILLUSTRATIONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'streak-7': Streak7DayBadge,
  'streak-14': Streak7DayBadge,
  'streak-30': Streak30DayBadge,
  'hours-50': TopRankBadge,
  'hours-100': TopRankBadge,
  'equilibrium-master': SubjectMasterBadge,
  'early-bird': EarlyBirdBadge,
  'night-owl': NightOwlBadge,
};
```

**Component Replacement in Badge Shelf Card (around lines 130–140)**:
```tsx
const IllustrationComponent = BADGE_ILLUSTRATIONS[badge.id];

<div
  className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
    isUnlocked
      ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30'
      : 'bg-muted/50 text-muted-foreground border border-border/80 opacity-60 grayscale'
  }`}
>
  {IllustrationComponent ? (
    <IllustrationComponent
      size={34}
      className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}
    />
  ) : (
    <IconComponent className="h-5 w-5" />
  )}
</div>
```

**Tooltip Enhancement (around lines 170–176)**:
```tsx
<TooltipContent className="bg-popover border-border text-popover-foreground text-xs max-w-xs p-3 space-y-2">
  <div className="flex items-center gap-3">
    {IllustrationComponent && (
      <div className="shrink-0 p-1 rounded-lg bg-muted/40 border border-border/60">
        <IllustrationComponent size={36} />
      </div>
    )}
    <div>
      <p className="font-bold text-foreground flex items-center gap-1.5">
        <span>{badge.title}</span>
      </p>
      <p className="text-muted-foreground text-[11px] leading-tight mt-0.5">{badge.description}</p>
    </div>
  </div>
  <p className="text-[10px] font-mono text-primary pt-1 border-t border-border/50">
    Progress: {badge.currentValue} / {badge.targetValue} {badge.unit} ({badge.progress}%)
  </p>
</TooltipContent>
```

### 4.4 Target Integration Blueprint: `src/app/dashboard/page.tsx`

**Import Addition**:
```typescript
import {
  EmptyLogsIllustration,
  EmptySearchIllustration,
  EmptyTestsIllustration,
} from '@/components/brand/Illustrations';
```

**Study History Table Empty State (replacing lines 701–709)**:
```tsx
) : filteredLogs.length === 0 ? (
  <div className="p-10 sm:p-12 text-center space-y-4 max-w-md mx-auto">
    {searchQuery ? (
      <>
        <EmptySearchIllustration size={140} className="mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No matching study sessions</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No entries found for &ldquo;{searchQuery}&rdquo;. Try checking the date or clearing your query.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery('')}
          className="rounded-full text-xs h-9 px-4 cursor-pointer"
        >
          Clear Search
        </Button>
      </>
    ) : (
      <>
        <EmptyLogsIllustration size={160} className="mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-serif font-medium text-foreground">Your study journal is ready</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You haven&apos;t recorded any study sessions yet. Every hour logged brings you closer to your A/L target.
          </p>
        </div>
        <Link href="/daily">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs h-10 px-6 font-medium shadow-sm transition-all cursor-pointer">
            Log your first study session
          </Button>
        </Link>
      </>
    )}
  </div>
)
```

**Test Marks Empty State Card (replacing lines 928–941)**:
```tsx
{testMarks.length === 0 ? (
  <div className="py-8 text-center space-y-4 max-w-xs mx-auto">
    <EmptyTestsIllustration size={140} className="mx-auto text-muted-foreground" />
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">No test marks recorded</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Record your school term tests and model papers to evaluate your estimated A/L Z-Score and standing.
      </p>
    </div>
    <Link href="/tests">
      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs h-10 px-5 font-medium transition-all">
        Add Your First Mark
      </Button>
    </Link>
  </div>
)
```

### 4.5 Target Integration Blueprint: `src/app/tests/page.tsx` & `src/components/tests/TestMarksTable.tsx`

**In `src/app/tests/page.tsx` (replacing lines 253–274)**:
```tsx
import { EmptyTestsIllustration } from '@/components/brand/Illustrations';

{/* Empty State Notice when 0 tests are logged */}
{testMarks.length === 0 && (
  <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
      <EmptyTestsIllustration size={130} className="shrink-0 text-muted-foreground" />
      <div className="space-y-1">
        <h3 className="text-base font-serif font-medium text-foreground">No Test Marks Added Yet</h3>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          Add your recent term tests or model papers to evaluate your estimated A/L Z-Score and receive stream-tailored revision advice.
        </p>
      </div>
    </div>
    <Button
      onClick={() => setAddModalOpen(true)}
      size="sm"
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full text-xs h-10 px-6 shrink-0 transition-all cursor-pointer"
    >
      Add Your First Test
    </Button>
  </div>
)}
```

**In `src/components/tests/TestMarksTable.tsx` (replacing lines 78–82)**:
```tsx
import { EmptyTestsIllustration, EmptySearchIllustration } from '@/components/brand/Illustrations';

{filteredMarks.length === 0 ? (
  <div className="p-10 sm:p-12 text-center space-y-4 max-w-md mx-auto">
    {search || subjectFilter !== 'all' ? (
      <>
        <EmptySearchIllustration size={130} className="mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No matching test papers</p>
          <p className="text-xs text-muted-foreground">
            No assessments found matching your search criteria. Try clearing the filter or search query.
          </p>
        </div>
      </>
    ) : (
      <>
        <EmptyTestsIllustration size={130} className="mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No test marks logged yet</p>
          <p className="text-xs text-muted-foreground">
            Click &ldquo;Add Test Score&rdquo; to begin tracking your exam paper performance.
          </p>
        </div>
      </>
    )}
  </div>
)
```

### 4.6 Target Integration Blueprint: `src/components/calendar/GoogleStudyCalendar.tsx`

**Import Addition**:
```typescript
import { EmptyCalendarIllustration } from '@/components/brand/Illustrations';
```

**In Day View (replacing lines 746–748)**:
```tsx
{dayEvents.length === 0 && (
  <div className="text-center py-10 sm:py-12 space-y-4 bg-muted/20 rounded-2xl border border-dashed border-border/80 p-6">
    <EmptyCalendarIllustration size={150} className="mx-auto text-muted-foreground" />
    <div className="space-y-1">
      <p className="text-sm font-serif font-medium text-foreground">Quiet day on your study calendar</p>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
        No study blocks scheduled for this day. Tap &ldquo;Add Block&rdquo; to schedule a session, or generate an AI timetable.
      </p>
    </div>
    <Button
      size="sm"
      onClick={() => setIsAddModalOpen(true)}
      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs h-9 px-5 font-medium transition-all"
    >
      <Plus className="h-3.5 w-3.5 mr-1" />
      <span>Plan a study block</span>
    </Button>
  </div>
)}
```

**In Week View (replacing line 690)**:
```tsx
{day.events.length === 0 && (
  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-6 space-y-2">
    <EmptyCalendarIllustration size={72} className="opacity-40" />
    <span className="text-[11px] font-serif italic text-muted-foreground/80">No study scheduled</span>
  </div>
)}
```

### 4.7 Target Integration Blueprint: `src/app/daily/page.tsx`

**Import Addition**:
```typescript
import {
  MathsStreamIllustration,
  BioStreamIllustration,
  PhysicalScienceIllustration,
  CommerceStreamIllustration,
  TechStreamIllustration,
  EmptyLogsIllustration,
} from '@/components/brand/Illustrations';

function getStreamIllustration(streamName: string) {
  const s = (streamName || '').toLowerCase();
  if (s.includes('bio')) return BioStreamIllustration;
  if (s.includes('math') || s.includes('physical')) return MathsStreamIllustration;
  if (s.includes('commerce') || s.includes('accounting') || s.includes('business')) return CommerceStreamIllustration;
  if (s.includes('tech') || s.includes('ict') || s.includes('engineering')) return TechStreamIllustration;
  return PhysicalScienceIllustration;
}
```

**Curriculum Stream Watermark Header (around lines 463–475)**:
```tsx
const StreamIllustration = getStreamIllustration(member?.stream || '');

<div className="flex items-start justify-between gap-4 p-6 sm:p-8 pb-4 border-b border-border">
  <div className="space-y-2">
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium w-fit">
      <span>{member.stream}</span>
    </div>
    <h1 className="text-2xl sm:text-3xl font-serif text-foreground tracking-tight">
      Log Your Study Hours
    </h1>
    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
      Record what you studied today. Add individual study sessions with start and end times, or enter your subject hours directly. Everything calculates in real-time.
    </p>
  </div>
  <div className="hidden sm:block shrink-0 p-2 rounded-2xl bg-card border border-border/80 shadow-xs">
    <StreamIllustration size={80} className="text-muted-foreground" />
  </div>
</div>
```

---

## 5. Verification Method

To independently verify the illustration system, execute the following validation steps:

1. **Static Analysis & TypeScript Typecheck**:
   ```powershell
   npx tsc --noEmit --project tsconfig.json
   ```
   *Expected result*: Exit code 0, zero TypeScript errors or broken imports.

2. **Automated Unit & Integration Test Suites**:
   ```powershell
   npm test
   ```
   *Expected result*: 100% pass rate across all automated test suites.

3. **End-to-End Visual Route Verification**:
   ```powershell
   node tests/e2e-runner.js
   ```
   *Expected result*: All 5 tiers pass with 100% success rate.

4. **Component Inspection**:
   Inspect `.agents/m2_explorer_illustrations/proposed_Illustrations.tsx`:
   - Confirm all 16 illustrations and 6 legacy components are exported.
   - Confirm standard `viewBox="0 0 200 200"` for streams, `viewBox="0 0 200 160"` for empty states, `viewBox="0 0 100 100"` for badges.
   - Confirm all SVG element attributes use React JSX camelCase (`strokeWidth`, `strokeLinecap`, `strokeLinejoin`, `fillOpacity`, etc.).

5. **Conditions of Invalidation**:
   The design would be invalidated if:
   - Stroke colors hardcode external colors (e.g. blue or purple) rather than Kinfolk CSS variables.
   - SVG components fail to accept dynamic dimensions (`size`, `width`, `height`).
   - Any legacy illustration is removed, breaking existing code contracts.
