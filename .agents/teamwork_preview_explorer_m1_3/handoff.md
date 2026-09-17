# Handoff Report: UI Component Primitives & Layout Specification (Milestone 1)

## 1. Observation
- Project root contains a legacy vanilla JS SPA in `src/js/` and `src/css/` alongside an active test suite with 327 passing tests (`tests/e2e-runner.js` and `tests/m1-verification.test.js`).
- `PROJECT.md` lines 7-8 and `SCOPE.md` lines 7-10 mandate 19 shadcn/ui component primitives: `Button`, `Card`, `Dialog`, `Table`, `Tabs`, `Select`, `Input`, `Textarea`, `Progress`, `Badge`, `Sonner/Toaster`, `NavigationMenu`, `Popover`, `Avatar`, `Skeleton`, `Separator`, `Label`, `Tooltip`, `Command`.
- The user instruction updates specified Apple/Google showcase grade aesthetics, SF Pro Display / Product Sans / JetBrains Mono typography, dark zinc/slate glass cards (`bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/60`), subtle aurora (opacity 0.3-0.4), and 60fps micro-interactions with cubic-bezier(0.16, 1, 0.3, 1).
- `index.html` lines 48-63 demonstrated the exact Firebase v10 compat SDK script URLs (`firebase-app-compat.js`, `firebase-auth-compat.js`) and initialization config for project `studysync-al-2026`.
- `plan_components.md` has been created in `.agents/teamwork_preview_explorer_m1_3/plan_components.md` containing complete, fully typed TypeScript code for `src/lib/utils.ts`, all 19 UI component primitives in `src/components/ui/`, `src/app/layout.tsx`, and `src/types/global.d.ts`.

## 2. Logic Chain
1. Step 1: `src/lib/utils.ts` is the foundational utility required by all shadcn/ui components. Using `clsx` and `tailwind-merge` in `cn()` guarantees that class overrides, conditional styling, and Tailwind class collisions are correctly handled across the component tree without runtime overhead.
2. Step 2: By analyzing the view requirements across M1 to M5 (Landing hero, Registration 306-school combobox, Student Dashboard bento grid, Daily log stream-aware inputs and sliders, Apple Wallet ID card preview, and Admin members DataTable/analytics dialogs), each of the 19 components was specified with complete Radix UI backing, accessible ARIA attributes, forwardRef bindings, and dark zinc/slate theme styling.
3. Step 3: Next.js 14 App Router static export (`output: 'export'`) requires font definitions via `next/font/google` with `display: 'swap'` and `<link>` stylesheets for CDN fonts, combined with `dark` class pre-applied to `<html>` to completely prevent flash of unstyled content (FOUC).
4. Step 4: Firebase compat SDK scripts require `strategy="beforeInteractive"` in `layout.tsx` so that `window.firebase` is guaranteed to be available when React mounts and `AuthContext` initializes.
5. Step 5: Encapsulating the complete specifications into `plan_components.md` enables the implementer agent (`worker_m1_1`) to instantiate all components directly with zero ambiguity.

## 3. Caveats
- Peer explorer `teamwork_preview_explorer_m1_1` is responsible for `package.json`, `next.config.mjs`, `tsconfig.json`, and `components.json`. Ensure the Radix UI dependencies specified in `plan_components.md` section 2 are included in `package.json`.
- Peer explorer `teamwork_preview_explorer_m1_2` is designing `src/app/globals.css`, `tailwind.config.ts`, `AuroraBackground.tsx`, `Header.tsx`, and `Footer.tsx`. The CSS custom variables defined there (e.g. `--background`, `--primary`, `--ring`, `--radius`) are aligned with the shadcn/ui primitives specified herein.
- Firebase compat SDK is used for Google Sign-In and Auth persistence; TypeScript definitions for `window.firebase` are provided in `src/types/global.d.ts`.

## 4. Conclusion
The specification for `src/lib/utils.ts`, the full suite of 19 shadcn/ui component primitives, `src/app/layout.tsx`, and supporting TypeScript declarations is fully completed and documented in `plan_components.md`. The design fulfills all visual quality, accessibility, performance, and backend integration requirements.

## 5. Verification Method
1. Inspect `.agents/teamwork_preview_explorer_m1_3/plan_components.md` to review the exact code implementations for `src/lib/utils.ts`, the 19 UI primitives in `src/components/ui/`, `src/app/layout.tsx`, and `src/types/global.d.ts`.
2. Once the worker writes these files to `src/`, verify TypeScript type-checking and Next.js build:
   - Command: `npm run build`
   - Expected result: Static export generates `out/` directory with zero TypeScript compilation errors.
3. Verify test suite compatibility:
   - Command: `node tests/e2e-runner.js`
   - Expected result: 327+ passing tests across all test suites.
