# Plan: StudySync 9-Page Google Stitch Rebuild & Harmonization

## Project Overview
Harmonize and rebuild all 9 pages of StudySync Sri Lankan A/L web app (`/`, `/register`, `/dashboard`, `/daily`, `/calendar`, `/tests`, `/id-card`, `/admin`, `/verify`) using Google Stitch project `5007748334507611824` (Kinfolk Academic design tokens), ensuring 100% button interactivity, Gen-Z copy, 60fps animations, monolinear illustrations, hybrid IndexedDB PDF vault, dynamic subject builder, and 100% test pass with zero-error build.

## Phase 0: Survey & Scope Mapping
- **Objective**: Survey codebase, current test status, and Stitch project `5007748334507611824` screens/tokens.
- **Tasks**:
  1. Survey Explorer 1 (Stitch & UI): Inspect Stitch design tokens, Kinfolk Academic theme, typography, header navigation, and mobile 375px responsive containment.
  2. Survey Explorer 2 (Interactivity & Backend): Audit every button, modal, form across all 9 pages, Academic Resource Vault (IndexedDB + GAS), and dynamic subject builder.
  3. Survey Explorer 3 (Copy, Animations & Tests): Audit Gen-Z phrasing, placeholders, Framer Motion/CSS scroll animations, monolinear illustrations, and baseline test suite status.
- **Output**: Detailed survey reports synthesized into updated `PROJECT.md` Feature Inventory & Architecture.

## Milestone Decomposition (Target Milestones)
- **Milestone 1 (M1)**: Stitch Design System Tokens, Scoped Top Navigation & Mobile 375px Responsive Containment
  - Tokens: Kinfolk Academic (`#fef8f4` canvas, `#ffffff` card, `#9f3c16`/`#c85a32` terracotta primary, `#6b8e68` sage, `#d98e32` amber, `#242220` espresso text, `Newsreader` + `Plus Jakarta Sans`).
  - Top Navigation active across all 9 routes with active indicators and responsive mobile drawer.
  - Overflow fixes: eliminate streak pill clipping and horizontal scroll on 375px+.
- **Milestone 2 (M2)**: 9-Page Layout Rebuild & Stitch Screen Alignment
  - Harmonize all 9 views (`/`, `/register`, `/dashboard`, `/daily`, `/calendar`, `/tests`, `/id-card`, `/admin`, `/verify`) with Stitch project screens.
  - Apply monolinear Claude/Notion-style illustrations for subjects, empty states, and milestones.
- **Milestone 3 (M3)**: End-to-End Interactivity, PDF Academic Resource Vault & Dynamic Subject Builder
  - Implement full button functionality for every button, modal, form, and tab.
  - Admin tools: verify, edit, delete, bulk actions, 7-day volume date aggregation, form builder, study room generator, countdown sync.
  - Academic Resource Vault: PDF uploads, downloads, in-browser preview with hybrid IndexedDB + GAS sync.
  - Dynamic Subject Builder: customize subject tracks, nested modal dialogs.
- **Milestone 4 (M4)**: Natural Gen-Z Conversational English, Dynamic Placeholders & 60fps Scroll Animations
  - Audit and replace all robotic jargon with warm, supportive, everyday Gen-Z phrasing.
  - Enforce dynamic placeholders (`{{user_name}}`, `{{streak_count}}`, `{{exam_countdown_days}}`, `{{composite_z_score}}`).
  - Smooth 60fps GPU-accelerated reveals, parallax, and micro-interactions.
- **Milestone 5 (M5)**: Full Verification, E2E Test Suite & Zero-Error Static Export
  - `npm run build` with zero TypeScript errors.
  - `npm test` and `node tests/e2e-runner.js` passing 100% across all tiers.
  - Verification across all acceptance criteria.

## Governance & Quality Gates
- Iteration loop: 3 Explorers -> 1 Worker -> 2 Reviewers -> 2 Challengers -> 1 Forensic Auditor per milestone.
- Gate pass criteria: Build passes, all tests pass, all Reviewers APPROVE, all Challengers approve, Forensic Auditor reports CLEAN.
