# Comprehensive Survey of Test Suites, Verification Tooling, and Regression Guards for StudySync

## 1. Executive Summary and Verification Baseline

StudySync possesses a multi-layered verification system spanning unit tests, integration harnesses, stress suites, adversarial penetration tests, TypeScript static analysis, and static Next.js production export validation. As of the current baseline, all verification gates pass with a clean record:

The standard test command `npm test` executes the Node.js built-in test runner across 27 test files, successfully passing 472 out of 472 tests in 82.8 seconds. In parallel, `npm run test:e2e` executes the custom runner across Tiers 1 through 5, completing 469 test cases in approximately 0.20 seconds with zero failures. TypeScript strict static analysis via `npx tsc --noEmit` exits with status code 0 and zero type errors. Finally, `npm run build` compiles and statically exports 11 out of 11 production routes into the `out` directory without errors.

This survey establishes the authoritative boundaries of the verification tooling. Crucially, it resolves the architectural relationship between legacy SPA test targets in `src/js/` and the Next.js App Router frontend in `src/app/` and `src/components/`, providing incoming worker agents with a playbook to implement animated monoline vector illustrations and Lucide icon sets without causing regressions.

---

## 2. Package Scripts and Tooling Infrastructure

The root `package.json` specifies several critical scripts and configurations that govern application development, testing, and production builds:

| Script | Command Line | Primary Purpose | Execution Profile |
|---|---|---|---|
| `test` | `node --test --test-concurrency=1 tests/*.test.js` | Executes all 27 automated test files sequentially | 472 tests passing, 86 suites, ~82s duration |
| `test:e2e` | `node tests/e2e-runner.js` | Runs Tiers 1–5 using the custom opaque-box runner | 469 tests passing, ~0.20s duration |
| `build` | `next build` | Next.js 14 production compilation and static export | 11 static pages generated in `out/`, ~45s duration |
| `lint` | `next lint` | ESLint static checking | Configured in Next.js pipeline |
| `dev` | `next dev` | Local development server | App Router on port 3000 |
| `dev:mock` | `node server/mock-server.js` | Standalone mock Google Apps Script backend | Express server on port 3001 with live API actions |
| `serve` | `npx serve -l 3000 out` | Serves exported static files locally | Validates production bundle locally |

The project relies on Node.js native ESM (`"type": "module"`). Key production dependencies include Next.js `14.2.24`, React `18.3.1`, Tailwind CSS `3.4.10`, Framer Motion `11.5.4`, Lucide React `0.441.0`, Radix UI primitives, `class-variance-authority` (`cva`), `tailwind-merge`, and `qrcode`.

Notice that `test-concurrency=1` is enforced in `npm test`. This single-threaded execution ensures that in-memory state simulations, mock server port bindings, and sliding-window rate limiters do not collide or experience race conditions during automated test runs.

---

## 3. Test Suites Taxonomy across the Codebase

The `tests/` directory contains 29 files structured into four major architectural categories:

### 3.1 Custom Test Framework and Domain Engine
1. `tests/e2e-runner.js`: Implements the custom singleton test runner providing `describe`, `it`, `test`, and custom assertion matchers (`toBe`, `toEqual`, `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`, `toBeGreaterThan`, `toBeLessThan`, `toContain`, `toMatch`, `toThrow`, `toHaveLength`, `toHaveProperty`). It supports filtering by tier via `--tier <number>` or executing all tiers in sequence.
2. `tests/test-harness.js`: A comprehensive 2,370-line domain engine providing reference datasets (such as 260+ Sri Lankan national schools, university cutoffs, and national exam norms), the in-memory database simulation `StudySyncDatabase`, binary magic byte inspectors, rate limiters, cryptographic nonce generators, idempotency envelopes, anti-XSS and CSV sanitizers, and mathematical algorithms for Z-score calculation, Hastings polynomial CDF, cognitive fatigue index, and Shannon entropy equilibrium.

### 3.2 Tiered Opaque-Box Suites (Tiers 1 to 5)
1. `tier1-feature.test.js` (176 tests): Feature isolation coverage verifying all 27 core platform features in isolation (Google Auth, Registration, Dashboard, Daily Logger, Digital ID, Admin Desk, Telegram sync, and Cognitive AI).
2. `tier2-boundary.test.js` (175 tests): Boundary conditions, numerical extremes, empty payloads, and edge cases across the same 27 features.
3. `tier3-pairwise.test.js` (72 tests): Combinatorial cross-feature interactions (for example, stream subject selection coupled with high-volume sessions and binary uploads).
4. `tier4-application.test.js` and `tier4-scenarios.test.js` (5 tests): Real-world end-to-end user workflows spanning complete Biological Science and Physical Science journeys, administrative exports, and public QR verification.
5. `tier5-adversarial.test.js` (41 tests): High-concurrency ID allocation, monotonic stream isolation, extreme study hour validation, broken streak recovery, leap year transitions, polyglot binary rejection, anti-replay nonces, LockService race defense, and CSV formula injection neutralization.

### 3.3 Milestone Verification Suites (M1 to M9)
1. `m1-verification.test.js`: Zero `alert()` audit, 260+ schools coverage across all 9 provinces, custom slider math, and utility validation.
2. `m1-multisession-badges.test.js`: Session duration math, overnight/midnight rollover calculations, friendly hour formatting, and subject badge configurations.
3. `m2-backend-verify.test.js`: Google Apps Script API client integration, doPost actions (`checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`), and mock server parity.
4. `m3-verification.test.js`: QR code matrix generation, Apple Wallet card specifications (1x and 3x 1440x906 at 300 DPI), and authentication lifecycle.
5. `m4-verification.test.js`: Stream subject dynamic resolution, decimal hour inputs, custom slider gradient tiers, canvas image compression under 400KB, duplicate log lockout, and subject icon resolution.
6. `m5-verification.test.js`: Student dashboard calculations, admin whitelist security gate, KPI aggregation, streak leaderboard tie-breakers, and CSV exports.
7. `m6-core-engines-adversarial.test.js`: ISO/IEC 18004 QR scannability, timezone and DST resilience, leap-year calculations, and 2D canvas drawing.
8. `m6-challenger2-stress.test.js`: Subject balance entropy calculation, fatigue radar, and recommendation generation.
9. `m7-telegram.test.js`: Telegram bot webhook commands (`/start`, `/status`, `/log`, `/leaderboard`, `/remind`), markdown escaping, and digest broadcasting.
10. `m8-security-resilience.test.js`: 12-byte structural magic byte validation, masquerade rejection, rate limiting, and timestamp drift.
11. `m9-cognitive-ai-zscore.test.js`: Empirical Bayes shrinkage, Hastings CDF polynomial approximation, dynamic Z-score velocity, and target gap analysis.

### 3.4 Challenger and Empirical Stress Suites
1. `m1-challenger-component-stress.test.js`: Statically verifies file existence and symbol exports for 19 shadcn primitives in `src/components/ui/`, 3 layout components in `src/components/layout/`, CVA button and badge variants, CSS variables in `globals.css`, and keyframes.
2. `m1-challenger-empirical-layout-stress.test.js`: Header.tsx viewport width calculations, mobile 375px zero horizontal scrollbar verification, buttonVariants and badgeVariants Cartesian matrix testing, CardTitle editorial Newsreader styling, and design token invariants.
3. `m1-challenger-adversarial-stress.test.js`: Invariant verification of 20 CSS tokens in `:root` and `.dark`, WCAG AAA contrast ratios, GPU-accelerated keyframe transforms, font stylesheet imports, and static export settings.
4. `m1-challenger-empirical.test.js` and `m1-challenger2-empirical.test.js`: Auto-calculation and manual override synchronization, history table drawers, and subject balance mathematics.
5. `challenger-adversarial.test.js`: Image dimensions, formatBytes, slider value clamping, qualitative score tier labels, and mock DOM element events.
6. `challenger-frontend-gamification-stress.test.js`: XP math, level thresholds across 7 tiers, and badge evaluation predicates.
7. `challenger2-empirical-stress.test.js`: Multi-format data exports (CSV, JSON, Excel XML, raw SQL dump), formula injection escaping, and emoji character preservation.
8. `gamification-export-remediation.test.js`: Gamification state consistency and export compliance.
9. `qr-iso-boundary.test.js`: ISO/IEC 18004 Reed-Solomon polynomial math and quiet zone verification.

---

## 4. Deep Dive into Test Assertions

### 4.1 Exact Text, Heading, and Button Assertions
The test suites assert exact text in specific scenarios:
1. Slider qualitative tiers in `tests/challenger-adversarial.test.js`: Values 1–3 must return `'Distracted / Low'`, values 4–6 must return `'Moderate / Steady'`, values 7–8 must return `'High / Productive'`, and values 9–10 must return `'Deep Flow State 🔥'`.
2. Forbidden screen in `tests/m5-verification.test.js`: The unauthorized admin screen must include `'403 FORBIDDEN'`, `'Restricted Admin Console'`, and `'Return to Student Dashboard'`.
3. Metric headings in `tests/m5-verification.test.js`: Analytics tab must include `'Total Members'`, `'Active Ratio'`, `'100%'`, `'Biological Science'`, `'Physical Science'`, and `'50% of cohort'`.
4. Rank titles in `tests/challenger-frontend-gamification-stress.test.js`: Levels 1 through 7 must map exactly to `'Novice'`, `'Apprentice'`, `'Scholar'`, `'Achiever'`, `'Expert'`, `'Master'`, and `'Grandmaster'`.
5. Badge titles in `tests/challenger-frontend-gamification-stress.test.js`: Evaluates badges with exact IDs and titles: `'7-Day Streak'`, `'14-Day Streak'`, `'30-Day Master'`, `'50h Club'`, `'100h Club'`, `'Subject Equilibrium Master'`, `'Early Bird'`, and `'Night Owl'`.
6. Subject badge abbreviations in `tests/m1-multisession-badges.test.js`: Biology must have abbreviation `'Bio'`, Combined Maths must have `'Maths'`, Physics must have `'Phys'`, Chemistry must have `'Chem'`, and ICT must have `'ICT'`.

### 4.2 Raw Emoji Assertions in Tests
Several tests assert exact unicode emojis:
1. `tests/m4-verification.test.js` (lines 134–139): Directly tests `getSubjectIcon` imported from `../src/js/views/dailyFormView.js`:
   `Biology` -> `🧬`
   `Chemistry` -> `⚗️`
   `Physics` -> `⚛️`
   `Agriculture` -> `🌱`
   `Combined Maths` -> `📐`
   `ICT` -> `💻`
2. `tests/challenger-adversarial.test.js` (line 328): Asserts that `CustomSlider.getScoreTier(9)` from `../src/js/slider.js` returns `status: 'Deep Flow State 🔥'`.
3. `tests/m5-verification.test.js` (lines 355–356 and 393–395): Asserts that `adminView._renderAnalyticsTab` and `adminView._renderLeaderboardRow` from `../src/js/views/adminView.js` contain `🥇` for 1st place and `🥈` for 2nd place.
4. `tests/m7-telegram.test.js` (lines 361–362): Asserts that `formatTelegramDigest` in `tests/test-harness.js` contains regex matches for `/🥇 1\.\s*\*Supun Silva\*/` and `/🔥 \*14 Days\*/`.
5. `tests/challenger2-empirical-stress.test.js` (line 188): Asserts that student full names containing emojis such as `'🌟 📚'` are preserved without truncation in XML spreadsheet exports.

### 4.3 Component File, Symbol, and DOM Assertions
The test suites strictly enforce component existence and exact exports:
1. `src/components/ui/` must contain all 19 primitives: `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `command.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `navigation-menu.tsx`, `popover.tsx`, `progress.tsx`, `select.tsx`, `separator.tsx`, `skeleton.tsx`, `sonner.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, and `tooltip.tsx`.
2. Each primitive must export its exact required symbols. For instance, `button.tsx` must export both `Button` and `buttonVariants`, while `card.tsx` must export `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, and `CardContent`.
3. `src/components/layout/` must contain `AuroraBackground.tsx`, `Header.tsx`, and `Footer.tsx`.
4. `buttonVariants` must include variants `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `indigo`, `emerald`, `glass`, and `terracotta`, and sizes `default` (h-11 = 44px), `sm` (h-9), `lg` (h-12 = 48px), and `icon` (h-11 w-11 = 44px x 44px). The base classes must contain `rounded-full`.
5. `badgeVariants` must include variants `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `cyan`, `purple`, `terracotta`, `sage`, `amber`, and `sand`. The base classes must contain `rounded-full` and `border`.
6. `CardTitle` in `src/components/ui/card.tsx` must include `text-foreground` and `font-serif`, and must not contain `text-zinc-100`. The `Card` container must include `rounded-xl`, `bg-card`, `text-card-foreground`, and `border-border`.
7. `Header.tsx` must contain specific responsive containment classes: `px-3 sm:px-6 lg:px-8`, `hidden sm:inline-flex` for secondary items, `hidden ... md:flex` for desktop navigation, `md:hidden` for mobile menu toggle, `w-full max-w-xs` for drawer width, `fixed inset-0`, and `overflow-y-auto`.
8. Zero `alert()` rule: A regular expression `/(?<![.\w])alert\s*\(/g` audits all files in `src/js`, `src/js/views`, and root HTML files. Any call to `alert(...)` fails the build immediately.

---

## 5. The Raw Emoji vs Lucide and Monoline Vector Boundary

There is an important architectural nuance between the legacy SPA files and the modern Next.js application:
The latest user requirement in `ORIGINAL_REQUEST.md` (under `2026-09-13T06:17:34Z`) mandates:
*"Zero raw emoji usage across all pages, strictly using monoline vector assets and Lucide icon sets."*

An inspection reveals that the Next.js App Router application (`src/app/` and `src/components/`) already adheres strictly to this requirement: there are zero raw emojis in any page or component. However, legacy JavaScript files in `src/js/` (`dailyFormView.js`, `slider.js`, `adminView.js`) and `tests/test-harness.js` still define emoji return values (`🧬`, `⚗️`, `⚛️`, `🌱`, `📐`, `💻`, `🔥`, `🥇`, `🥈`, `🥉`). These files exist specifically to satisfy the historical Milestone test suites (`m4-verification.test.js`, `m5-verification.test.js`, `challenger-adversarial.test.js`).

### Architectural Rule for Worker Iterations:
Workers must observe a strict boundary:
1. Do not modify or delete files in `src/js/` (especially `dailyFormView.js`, `slider.js`, `adminView.js`, and `schools.js`). Touching these files or removing their emojis will cause `m4-verification.test.js` or `challenger-adversarial.test.js` to fail.
2. All new animated monoline vector assets and Lucide icon replacements belong exclusively within the Next.js React application (`src/components/` and `src/app/`).
3. Across all Next.js TSX components in `src/app/` and `src/components/`, workers must ensure that no raw emojis are used. Instead, use `lucide-react` icons (e.g., `Flame`, `Zap`, `Award`, `Trophy`, `BookOpen`, `Atom`, `Dna`, `Compass`) or custom inline SVG vector illustrations with appropriate `aria-hidden="true"` or descriptive `aria-label`.

---

## 6. TypeScript Configuration and Vector Component Strictness

The TypeScript configuration in `tsconfig.json` enforces full strictness:
1. `"strict": true`: Activates `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, and `alwaysStrict`.
2. `"noEmit": true`: TypeScript performs type checking only, while Next.js handles transpilation via SWC.
3. `"target": "ES2022"`, `"moduleResolution": "bundler"`, and `"jsx": "preserve"`.
4. Path alias: `@/*` resolves directly to `./src/*`.
5. Excluded directories: `node_modules`, `out`, `backend`, `tests`, `server`, and `.agents`.

### Potential Typing Traps When Adding Vector Components:
When workers introduce new inline SVG vector illustrations or Framer Motion SVG wrappers, they must adhere to the following patterns:
1. Props Interface: Custom SVG components should explicitly extend `React.SVGProps<SVGSVGElement>` rather than defining untyped or loose props. Example:
   ```typescript
   export interface VectorIllustrationProps extends React.SVGProps<SVGSVGElement> {
     spotColor?: string;
     animated?: boolean;
   }
   ```
2. Framer Motion SVG Attributes: Passing standard SVG attributes to `motion.path` or `motion.svg` must not conflict with Framer Motion's reserved motion value types. Use `initial`, `animate`, `transition`, and `variants` with typed `Variants` from `'framer-motion'`.
3. DOM Reference Null Checks: With `strictNullChecks`, any `useRef<SVGSVGElement>(null)` must guard against `null` prior to invoking DOM methods.
4. CSS Variables in Style Objects: Custom CSS variables passed in inline styles (for example, `{ '--spot-fill': '#fa7268' }`) are not recognized by TypeScript's `React.CSSProperties` without explicit casting (`as React.CSSProperties`).
5. Next.js Build Strictness: `next.config.mjs` sets `typescript: { ignoreBuildErrors: false }`. Any TypeScript error will immediately abort `npm run build`.

---

## 7. Next.js Static Export Constraints

The static export configuration in `next.config.mjs` sets:
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};
```

Coupled with `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "/verify/**",
        "destination": "/verify.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate, max-age=0" },
          { "key": "Pragma", "value": "no-cache" },
          { "key": "Expires", "value": "0" }
        ]
      }
    ]
  }
}
```

### Static Export Constraints to Respect:
1. No Dynamic Server Runtimes: Pages cannot use server-only features like `getServerSideProps`, dynamic server headers, or Node.js backend logic in App Router page files. Every route must export cleanly to static HTML in `out/`.
2. Client Component Boundaries: All interactive routes and animated vector widgets must declare `'use client'` at the top of the file and safely handle client-side rendering (such as checking `typeof window !== 'undefined'` when accessing local storage or canvas APIs).
3. Image Optimization: `next/image` requires `unoptimized: true` in static export mode. Inline SVG vector components are preferable because they scale losslessly without runtime image server optimization.
4. Zero-Cache Header Enforcement: The hosting configuration serves static files with `no-cache, no-store, must-revalidate`, ensuring client browsers immediately receive updated illustrations upon deployment.

---

## 8. Verification Checklist and Regression Guard Playbook

Incoming workers must follow this checklist and playbook throughout their implementation turns:

### 8.1 Pre-Flight Commands
Before proposing any pull request or finishing a task, run the four core verification commands:
1. `npx tsc --noEmit` — must exit with 0 errors.
2. `npm run test:e2e` — executes 469 tests across Tiers 1–5 in ~0.20s; must pass 100%.
3. `npm test` — executes all 472 tests across all 27 files in ~82s; must pass 100%.
4. `npm run build` — must complete static page generation for all 11 routes into `out/`.

### 8.2 The 10 Invariable Regression Guards

| Guard | Requirement | Invalidation Condition |
|---|---|---|
| **Guard 1: Legacy Isolation** | Leave all files in `src/js/` untouched | Editing `src/js/views/dailyFormView.js`, `src/js/slider.js`, or `src/js/views/adminView.js` breaks `m4-verification.test.js` or `challenger-adversarial.test.js`. |
| **Guard 2: Zero alert()** | Never use `window.alert()` or `alert()` | Adding `alert(...)` triggers the regex audit in `m1-verification.test.js` and fails the test. |
| **Guard 3: Token Invariants** | Preserve exact Kinfolk tokens in `globals.css` | Modifying `:root` (`#fef8f4`, `#ffffff`, `#c85a32`, `#456644`, `#854f00`, `#1d1b19`, `#e6e4dd`) or `.dark` (`#0F1114`, `#17191D`, `#c85a32`, `#6b8e68`, `#d98e32`, `#f6f0ec`) fails `m1-challenger-adversarial-stress.test.js`. |
| **Guard 4: Shimmer & Aurora** | Retain keyframes with `translate3d` | Removing `@keyframes aurora-1` through `aurora-4`, `pulseGlow`, or `shimmer` fails `m1-challenger-adversarial-stress.test.js`. |
| **Guard 5: Reduced Motion** | Respect `prefers-reduced-motion` | Ambient loops must halt under `prefers-reduced-motion: reduce`. The media query in `globals.css` must remain intact. |
| **Guard 6: Primitive Inventory** | Keep all 19 shadcn primitives and their exported symbols | Deleting or renaming exports in `src/components/ui/` fails `m1-challenger-component-stress.test.js`. |
| **Guard 7: CVA Variants** | Keep all variants and sizes in `buttonVariants` and `badgeVariants` | Altering variant keys (like `terracotta`, `indigo`, `emerald`, `glass`, `default`) fails variant stress tests. |
| **Guard 8: Card Typography** | `CardTitle` must use `font-serif` and `text-foreground` | Introducing `text-zinc-100` or removing `font-serif` fails `m1-challenger-empirical-layout-stress.test.js`. |
| **Guard 9: Mobile Containment** | Maintain `Header.tsx` layout containment classes | Removing `px-3 sm:px-6 lg:px-8`, `hidden sm:inline-flex`, or `w-full max-w-xs` causes horizontal scrollbar on 320px/375px screens. |
| **Guard 10: Zero Raw Emojis in React** | Use only Lucide icons and monoline SVGs in `src/app/` and `src/components/` | Adding raw emojis to Next.js components violates requirement R3 of the design specification. |
