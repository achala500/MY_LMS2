# DISPATCH: m1_worker_redesign

## Working Directory
`c:/Users/alwis/Documents/antigravity/dazzling-bardeen/.agents/m1_worker_redesign`

## Authoritative User Request
Read `c:/Users/alwis/Documents/antigravity/dazzling-bardeen/.agents/ORIGINAL_REQUEST.md` (specifically section `## 2026-09-12T05:06:22Z`).
Read `c:/Users/alwis/Documents/antigravity/dazzling-bardeen/PROJECT.md`.
Read Explorer findings at `c:/Users/alwis/Documents/antigravity/dazzling-bardeen/.agents/survey_explorer_frontend/handoff.md` and `analysis.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 1 Scope & Assigned Files
You exclusively own and will modify:
1. `src/app/globals.css`:
   - Map `:root` (light) and `.dark` (dark) to strict authoritative tokens:
     - Dark mode: `#0F1114` bg, `#17191D` card, `#C24942` accent, `#5FAE74` success, `rgba(255,255,255,0.08)` hairline border, `#EDEDEA` primary text, `#8B8D93` secondary/muted text.
     - Light mode: `#F3F3F0` bg, `#FFFFFF` card, `#9E2F29` accent, `#2F7A45` success, `rgba(0,0,0,0.08)` hairline border, `#14171A` primary text, `#5B5E63` secondary/muted text.
     - Purge legacy dark-indigo and all rainbow accent variables (`--accent-indigo`, `--accent-purple`, `--accent-fuchsia`, `--accent-cyan`, `--accent-emerald`, `--accent-amber`, `--accent-rose`).
     - Set `html` and `body` to respect the background and foreground variables.
2. `tailwind.config.ts`:
   - Ensure color mappings and radius variables align with authoritative tokens.
3. `src/components/ui/card.tsx`:
   - Flat and opaque content cards: `rounded-xl`, `border border-black/[0.08] dark:border-white/[0.08]`, `bg-white dark:bg-[#17191D]`, text foreground. Remove `backdrop-blur-xl` and `bg-zinc-900/50`.
4. Content surfaces blur removal:
   - `src/components/ui/table.tsx`: remove `backdrop-blur-md` from container.
   - `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/select.tsx`: remove `backdrop-blur-md`.
   - `src/components/ai/WhatIfSimulator.tsx`, `src/components/ai/CognitiveAdvisorCard.tsx`, `src/components/ai/CognitiveFatigueRadar.tsx`, `src/components/ai/ZScoreVelocityGauge.tsx`, `src/components/dashboard/GamificationShelf.tsx`: remove `backdrop-blur-*` from content surfaces so cards remain flat and opaque.
5. Typography discipline:
   - Reserve editorial serif (`font-serif`) strictly for real measurements (hours, streak counts, Z-scores, test marks).
   - In `src/app/daily/page.tsx`, `src/app/tests/page.tsx`, `src/app/register/page.tsx`, and `src/components/calendar/GoogleStudyCalendar.tsx`, replace `font-serif` on buttons, form labels, and inputs with `font-sans`.
6. Top navigation bar confirmation:
   - Ensure top navigation bar in `src/components/layout/Header.tsx` remains mounted and visible on `/` with scoped Liquid Glass styling (`backdrop-blur-md`, 85% opacity, hairline border).

## Verification Requirements
You must execute:
1. `npm test` — verify that all 423 unit and integration tests pass (100% pass rate).
2. `node tests/e2e-runner.js` — verify that all 469 E2E tests pass across Tiers 1-5 (100% pass rate).
3. `npm run build` — verify that static export succeeds cleanly with zero TypeScript errors.
Document exact command outputs in your `handoff.md`.

## 2026-09-12T05:16:00Z
Execute the tasks assigned in your DISPATCH.md:
1. Update `src/app/globals.css` with authoritative tokens for :root and .dark, removing legacy indigo and rainbow variables.
2. Update `tailwind.config.ts` if needed to match tokens and radius.
3. Update `src/components/ui/card.tsx` to be flat and opaque (rounded-xl, bg-white dark:bg-[#17191D], border-border, no backdrop-blur).
4. Remove `backdrop-blur-*` from `table.tsx`, form inputs, and AI analytics widgets.
5. Replace `font-serif` on buttons and labels with `font-sans` in `daily/page.tsx`, `tests/page.tsx`, `register/page.tsx`, and `calendar/GoogleStudyCalendar.tsx`.
6. Confirm top nav bar in `Header.tsx` is mounted and styled with scoped Liquid Glass chrome.

Run verification:
- `npm test` (must pass 423/423)
- `node tests/e2e-runner.js` (must pass 469/469)
- `npm run build` (must succeed with static export to out/)
