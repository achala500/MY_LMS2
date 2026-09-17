# StudySync — Jules Autonomous Engineering & Repository Care Guide

> **Directive for Google Jules**: StudySync is an advanced, high-performance Advanced Level (A/L) examination preparation platform engineered with Apple HIG aesthetics, warm Kinfolk design tokens, and strict NIST SP 800-53 Rev. 5 security controls. 
> Jules operates as the continuous repository maintainer, code hygiene guardian, and test reliability engineer.

---

## 1. Core Principles & Non-Negotiables

### A. Strict Identity & Kinfolk Aesthetic Preservation
- **Never alter or break the Kinfolk warm paper color palette**:
  - Warm Canvas: `#fef8f4` / `#fdfcfb`
  - Deep Ink / Slate: `#1d1b19` / `#2d2825` / `#4a4440`
  - Terracotta Crimson (Accent / Primary): `#c85a32` / `#b44c26`
  - Sage Olive (Success / Focus): `#456644` / `#365235`
  - Amber Gold (Warning / Milestones): `#d97706` / `#fcd34d`
  - Muted Borders: `#ede3da` / `#e2d5c8`
- **Zero Emojis**: Do NOT introduce unicode emojis anywhere in code, comments, UI text, or commit messages. Use 2px Lucide stroke icons or monoline SVG graphics.
- **Typography Hierarchy**:
  - Editorial Serifs: `font-serif` (`Newsreader`, italic accents).
  - Modern Sans: `font-sans` (`Plus Jakarta Sans` / `Geist Sans`).
  - Monospace Data / Formulas: `font-mono` (`JetBrains Mono`).
- **No Heavy SVG Filters**: Never use SVG `filter="drop-shadow(...)"`, multi-pass Gaussian blur filters, or unconstrained CSS `backdrop-filter` in loop components. These cause Chromium Direct3D/Skia hardware rasterization halts and GPU memory crashes on Windows.

---

## 2. NIST SP 800-53 Access Control (AC-3)

- **Admin Study ID & Identity Shielding**:
  - Administrator identities and Study IDs (`ADM-xxxxxx`, or users with `role: 'admin'`) must NEVER be exposed, searchable, or verifiable by standard student accounts or unauthenticated guests.
  - In `src/lib/api.ts` (`verifyMember`), if the query targets an administrative account and `isRequesterAdmin` is false, the system MUST reject the lookup with an AC-3 access denial.
  - Jules must inspect all pull requests and code modifications to ensure no public lookup endpoint leaks administrative emails, names, or identification numbers.

---

## 3. Feedback System Architecture

- **Student Ingestion & Admin Resolution**:
  - Feedback categories: `curriculum`, `platform_bug`, `performance_issue`, `feature_request`, `exam_content`, `general`.
  - Storage: Ingested through `src/lib/storage/localDb.ts` (`saveFeedback`), synced to cloud backend.
  - Admin Resolution: Resolving tickets must record timestamp, admin identifier, and resolution notes, dispatching `studysync_feedback_updated`.

---

## 4. Verification & Testing Requirements

Before proposing or finalizing any PR or change, Jules MUST run and pass:
1. **Type Safety**: `npx tsc --noEmit` must report `0 errors`.
2. **Unit & Component Tests**: `npm test` must run all Vitest suites and maintain 100% pass rate.
3. **Production Build**: `npm run build` must generate static production outputs in `out/` with zero missing exports or static generation failures.

---

## 5. Jules Maintenance Checklist

When invoked via `jules new "<prompt>"`, execute following sequence:
1. **Audit Dependencies & Vulnerabilities**: Run `npm audit` and ensure zero critical CVEs.
2. **Dead Code & Type Drift Elimination**: Remove unused imports and ensure all interfaces in `src/types/` are strictly synchronized.
3. **Performance Profiling**: Ensure all interactive lists implement virtual scrolling or pagination to prevent DOM node spikes.
4. **Preserve Cloud Multi-Host Configurations**: Ensure `firebase.json`, Supabase database schema migrations, and Cloudflare R2 configurations remain uncorrupted.
