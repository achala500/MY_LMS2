## 2026-08-26T09:23:45Z
You are a Worker implementing Milestone 1: Project Scaffolding, Foundation, Theme & Components.
Your working directory is: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_worker_m1`
Project root: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen`
Must read:
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\sub_orch_m1\SCOPE.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m1_1\plan_scaffold.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m1_2\plan_theme.md`
- `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_m1_3\plan_components.md`

Exclusive Write Ownership:
- `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `firebase.json`
- `src/lib/utils.ts`
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- `src/components/ui/*`
- `src/components/layout/*`
Note: Do NOT modify existing `backend/` or `tests/` directories.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implementation Tasks:
1. Update `package.json` with all required dependencies (Next.js 14, React 18, React DOM, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Radix UI primitives, Sonner, clsx, tailwind-merge, class-variance-authority, cmdk) while preserving existing scripts (`test`, `test:e2e`) and dependencies (`cors`, `express`).
2. Run `npm install` (or `npm install --legacy-peer-deps` if needed) to install all packages.
3. Configure `next.config.mjs` with `output: 'export'`, `distDir: 'out'`, `images: { unoptimized: true }`.
4. Configure `tsconfig.json` with `@/*` path mapping to `./src/*` and strict mode.
5. Configure `tailwind.config.ts` and `postcss.config.mjs` matching the design tokens and keyframes from `plan_theme.md`.
6. Update `firebase.json` to point `"public": "out"` while keeping rewrites.
7. Implement `src/lib/utils.ts` (`cn` helper).
8. Implement all 19 shadcn/ui components in `src/components/ui/` (`button.tsx`, `card.tsx`, `dialog.tsx`, `table.tsx`, `tabs.tsx`, `select.tsx`, `input.tsx`, `textarea.tsx`, `progress.tsx`, `badge.tsx`, `sonner.tsx`, `navigation-menu.tsx`, `popover.tsx`, `avatar.tsx`, `skeleton.tsx`, `separator.tsx`, `label.tsx`, `tooltip.tsx`, `command.tsx`).
9. Implement `src/app/globals.css` with dark zinc/slate theme, font imports (SF Pro Display, Product Sans, JetBrains Mono), and animated aurora mesh gradient keyframes.
10. Implement `src/components/layout/AuroraBackground.tsx`, `Header.tsx`, `Footer.tsx`.
11. Implement `src/app/layout.tsx` (with dark HTML class, font styles, Firebase compat scripts, Header, Footer, and Toaster).
12. Implement initial placeholder `src/app/page.tsx`.
13. Run `npm run build` to verify static export generates `out/` with zero TypeScript errors.
14. Run `node tests/e2e-runner.js` to ensure the baseline 327 E2E tests continue to pass.
15. Write a comprehensive handoff report at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_worker_m1\handoff.md` and send a message to caller.
