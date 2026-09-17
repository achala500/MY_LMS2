# Execution Plan: Full-Platform Monoline Vector Assets & Micro-Animations

## Mission Objective
Implement a complete, production-grade animated vector illustration and visual asset system across the entire StudySync LMS platform (Landing Hero, Dashboard, Daily Stopwatch, Tests & Z-Score, Calendar, Admin Desk, and Empty States) in the distinctive monoline style with fluid CSS micro-animations.

## Palette & Style Specification
- Card surfaces: pure white (#ffffff) or token-matched card surfaces
- Contours: dark blue-black contours (`#19202e`), uniform line weight (strokeWidth=1.5 to 2.0)
- Flat spot fills:
  - Salmon-pink (`#fa7268`)
  - Muted yellow (`#fcd34d`)
  - Soft orange (`#fb923c`)
- Rounded-corner container framing matching editorial aesthetic
- Continuous 60fps micro-animations (drifting stars, lamp glow, clouds, breath pulse) with CSS keyframes
- Tactile interactive states (hover/click/completion feedback)
- Zero layout shift, full hardware acceleration, prefers-reduced-motion support
- Strict AAA typography and contrast compliance
- Zero raw emojis across all pages (strict replacement with Lucide icons or monoline vectors)
- Clean mobile responsiveness (<380px)

## Milestones
1. **Phase 0: Architecture & Codebase Survey (3 Explorers in parallel)**
   - Explorer 1: Inspect route components (`src/app/page.tsx`, `dashboard/page.tsx`, `daily/page.tsx`, `calendar/page.tsx`, `tests/page.tsx`, `admin/page.tsx`, `id-card/page.tsx`, `verify/page.tsx`, `register/page.tsx`) to identify illustration mount points, existing vector/image/emoji usage, and component structure.
   - Explorer 2: Inspect existing styles, Tailwind configuration (`globals.css`, `tailwind.config.js`), animation classes, theme token mappings (dark/light), and prefers-reduced-motion handling.
   - Explorer 3: Inspect existing test suites (`tests/`, `npm test`, `npm run build`, `npx tsc --noEmit`) to identify all passing criteria, assertions, DOM selectors, and potential regression risks.

2. **Phase 1: Merge Survey Findings & Update PROJECT.md**
   - Synthesize all findings into `PROJECT.md` with full Feature Inventory.
   - Finalize module boundaries, write ownership, and file layout.

3. **Phase 2: Milestone Iteration Cycles**
   - **M1: Vector Component Library & Micro-Animation System**
     - Scalable inline SVG components with monoline contours (`#19202e`) and spot fills (`#fa7268`, `#fcd34d`, `#fb923c`).
     - CSS keyframes & classes in `globals.css` with prefers-reduced-motion overrides.
   - **M2: Route Integration — Landing Hero & Dashboard**
     - Dedicated hero illustration, study rhythm visuals, streak/milestone vectors.
   - **M3: Route Integration — Daily Stopwatch, Tests & Z-Score, Calendar, Admin Desk**
     - Stopwatch/timer vector, exam forecast/Z-score illustration, calendar rhythmic vector, admin desk vector.
   - **M4: Route Integration — Empty States, Modals & Raw Emoji Elimination**
     - Replace all raw emojis across the platform with Lucide icons or monoline vectors.
     - Empty state illustrations for zero logs, zero past papers, zero events, zero test scores.
   - **M5: Full Verification & Adversarial Hardening**
     - TypeScript check: `npx tsc --noEmit`.
     - Unit & E2E tests: `npm test`.
     - Static build: `npm run build`.
     - Challenger stress tests & Forensic Auditor verification.

4. **Phase 3: Synthesis & Handoff**
   - Compile handoff.md and report to parent Sentinel.
