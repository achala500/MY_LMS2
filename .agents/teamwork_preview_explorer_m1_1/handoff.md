# Milestone 1: Scaffolding & Foundation Handoff Report

## 1. Observation

1. **Existing Baseline Configuration (`package.json`)**:
   - Location: `package.json:1-31`
   - Content: Currently includes `"type": "module"`, scripts `"start"`, `"dev"`, `"test": "node --test tests/*.test.js"`, `"test:e2e": "node tests/e2e-runner.js"`, and runtime dependencies `"cors": "^2.8.5"`, `"express": "^4.19.2"`.
2. **Existing Firebase Hosting Configuration (`firebase.json`)**:
   - Location: `firebase.json:1-54`
   - Content: `"public": "."` with rewrites for `/verify/**` to `/verify.html` and SPA fallback `**` to `/index.html`, along with Cache-Control headers for HTML, JS/CSS, and image assets.
3. **Automated Test Infrastructure (`tests/e2e-runner.js` & `TEST_INFRA.md`)**:
   - Master runner: `node tests/e2e-runner.js` executes 327 tests across Tiers 1-5.
   - Command execution result: `Total Tests: 327, Passed: 327, Failed: 0, Duration: 0.07s`.
4. **Design System & Visual Assets (`src/css/custom.css`)**:
   - Background canvas `#07090E`, glassmorphic cards `rgba(19, 27, 42, 0.65)`, 4 aurora mesh orbs with CSS keyframes (`auroraFloat1`, `auroraFloat2`, `auroraFloat3`), and font families `SF Pro Display`, `Product Sans`, `JetBrains Mono`.
5. **Critical User Requirements & Directives**:
   - Framework: Next.js 14 App Router with TypeScript and static export (`output: 'export'`, `distDir: 'out'`, `images: { unoptimized: true }`).
   - UI / Components: shadcn/ui primitives (`@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `sonner`, `lucide-react`).
   - Motion: Framer Motion support (`framer-motion`), 60fps animations, 3D card tilt/depth, `200ms cubic-bezier(0.16, 1, 0.3, 1)` micro-interactions.
   - Typography: SF Pro Display (`https://fonts.cdnfonts.com/css/sf-pro-display`), Product Sans (`https://fonts.cdnfonts.com/css/product-sans`), JetBrains Mono, Inter.
   - Design: Apple/Google showcase grade with dark zinc/slate theme and subtle aurora opacity (0.3-0.4).

---

## 2. Logic Chain

1. **Dependency Formulation (referencing Observation 1 & 5)**:
   - Next.js 14 (`14.2.24`), React 18 (`^18.3.1`), and TypeScript (`^5.5.4`) are added as core dependencies.
   - To preserve backward compatibility with existing tests and mock server, `"cors": "^2.8.5"`, `"express": "^4.19.2"`, `"test": "node --test tests/*.test.js"`, and `"test:e2e": "node tests/e2e-runner.js"` are preserved.
   - All 12 required Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-progress`, `@radix-ui/react-popover`, `@radix-ui/react-avatar`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-label`) plus `cmdk`, `sonner`, `lucide-react`, `framer-motion`, and `tailwindcss-animate` are specified in `package.json`.
2. **Next.js Static Export Configuration (referencing Observation 2 & 5)**:
   - Next.js static export requires `output: 'export'`, `distDir: 'out'`, and `images: { unoptimized: true }` in `next.config.mjs`.
   - Firebase Hosting (`firebase.json`) is updated so `"public": "out"` routes to the generated static artifacts, ensuring seamless deployment with `firebase deploy --only hosting`.
3. **TypeScript & Aliasing (referencing Observation 1 & 5)**:
   - `tsconfig.json` specifies `"paths": { "@/*": ["./src/*"] }` to support standard shadcn imports (`@/components/...`, `@/lib/...`).
   - By excluding `tests`, `backend`, `server`, and `.agents` in `tsconfig.json`, `tsc` validates strictly the Next.js App Router codebase without breaking external scripts or test runners.
4. **Theme & CSS System (referencing Observation 4 & 5)**:
   - `tailwind.config.ts` extends fonts with `'SF Pro Display'`, `'Product Sans'`, and `'JetBrains Mono'`.
   - `src/app/globals.css` injects dark zinc color tokens, scrollbar styling, glassmorphism utilities, and GPU-accelerated aurora keyframe animations with reduced-motion fallback.

---

## 3. Caveats

1. **Static Export Navigation**: In static export mode (`output: 'export'`), dynamic server-side runtime APIs (e.g. `getServerSideProps` or dynamic server Route Handlers) are not supported. All data fetching must be client-side via React hooks and `ApiClient`.
2. **Firebase Compat Script Timing**: Firebase Auth v10 compat SDK is loaded via `<Script strategy="beforeInteractive">` in `src/app/layout.tsx`. Components using `window.firebase` must guard against uninitialized window references during hydration.
3. **Trailing Slashes**: `trailingSlash: false` is configured to match Firebase rewrite conventions.

---

## 4. Conclusion

The scaffolding and foundation plan is complete, fully specified, and documented in `plan_scaffold.md`.
The implementation team can directly apply the configurations for:
- `package.json`
- `next.config.mjs`
- `tsconfig.json`
- `firebase.json`
- `tailwind.config.ts` & `postcss.config.mjs`
- `components.json`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/layout/` (Header, Footer, AuroraBackground)
- `src/app/page.tsx`

---

## 5. Verification Method

To verify the implementation once applied:
1. **Dependency Installation**:
   ```bash
   npm install
   ```
2. **Static Export Build**:
   ```bash
   npm run build
   ```
   *Expected Result*: Next.js builds successfully with 0 TypeScript errors, producing static output in `out/`.
3. **E2E Test Regression Check**:
   ```bash
   node tests/e2e-runner.js
   ```
   *Expected Result*: All 327/327 tests pass with 0 failures across Tiers 1-5.
