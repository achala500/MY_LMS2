# Scope: Milestone 1 - Project Scaffolding & Foundation

## Architecture
- Next.js 14 App Router (src/app/) with TypeScript and Tailwind CSS setup
- Static Export (output: export, distDir: out, images: unoptimized in next.config.mjs)
- Firebase Hosting (firebase.json pointing public to out)
- shadcn/ui base primitives (Button, Card, Dialog, Table, Tabs, Select, Input, Textarea, Progress, Badge, Sonner, NavigationMenu, Popover, Avatar, Skeleton, Separator, Label, Tooltip)
- src/app/layout.tsx with font, dark theme, Firebase compat Script tag, and Sonner Toaster
- src/app/globals.css with dark zinc/slate theme variables, aurora mesh keyframe animations
- src/components/layout/Header.tsx, Footer.tsx, AuroraBackground.tsx

## Feature Inventory Scope
- Feature 1: Static Export Build Setup
- Feature 2: Visual Theme & Design Tokens
- Feature 3: Animated Aurora Background
- Feature 4: Global Navigation & Toaster

## Milestone Details
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | M1: Project Scaffolding & Foundation | Next.js 14, TypeScript, Tailwind, shadcn components, static export config, layout, nav, theme | none | IN_PROGRESS |

## Interface Contracts
- Target build output: out/ with zero TypeScript errors on npm run build
- firebase.json public: out
- Existing backend/ and tests/ left untouched

## Code Layout
- package.json, next.config.mjs, tsconfig.json, tailwind.config.ts, postcss.config.mjs, components.json, firebase.json
- src/app/layout.tsx, src/app/page.tsx, src/app/globals.css
- src/components/ui/ (shadcn components)
- src/components/layout/ (Header, Footer, AuroraBackground)
- src/lib/utils.ts (cn helper)
