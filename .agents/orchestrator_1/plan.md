# Orchestrator Plan: StudySync Next.js Rebuild

## Objectives
Rebuild the StudySync Sri Lankan A/L study accountability web app as a production-grade Next.js 14 App Router + TypeScript + shadcn/ui + Tailwind CSS static export web app, keeping all backend integrations (Google Apps Script, Firebase Auth, Google Sheets) intact.

## Step-by-Step Plan
1. **Phase 0: Comprehensive Survey (3 Parallel Explorers/Spec Miners)**
   - Explorer 1 (Existing Codebase & Business Logic): Deep analysis of src/js/ (api.js, auth.js, state.js, qr.js, idcard.js, slider.js, schools.js, views), HTML/CSS, assets, firebase.json.
   - Explorer 2 (Requirements & Spec Mining): Mine complete feature specs, data contracts, validation rules, page states, UI/UX requirements from ORIGINAL_REQUEST.md.
   - Explorer 3 (Next.js 14 + shadcn/ui + Static Export Architecture): Map dependencies, Tailwind CSS configuration, shadcn/ui component inventory, static export requirements (output: 'export'), routing structure, test harness architecture.
2. **Phase 1: Project Blueprint & Test Infrastructure Planning**
   - Synthesize survey findings into PROJECT.md (Architecture, Feature Inventory, Milestones, Interface Contracts, Code Layout).
   - Create TEST_INFRA.md defining 4-tier E2E testing criteria.
3. **Phase 2: Dual-Track Execution**
   - **E2E Testing Track**: Spawn E2E Testing Orchestrator to build opaque-box test harness and test suites for Tiers 1-4, publishing TEST_READY.md.
   - **Implementation Track**: Spawn Sub-Orchestrators for decomposed implementation milestones (e.g. M1: Project Scaffold & Core Setup, M2: Auth & State & API Client, M3: Components & Design System, M4: Core Student Pages & Forms & ID Card, M5: Admin Dashboard & Verification).
4. **Phase 3: Final Integration & Coverage Hardening**
   - Pass 100% of Tiers 1-4 tests.
   - Phase 2 Coverage Hardening: Tier 5 adversarial testing with Challengers, Workers, Reviewers, and Auditors.
5. **Phase 4: Final Verification & Delivery Report**
   - Verify zero TS errors, successful build & export to out/, clean audit report, complete feature verification.
   - Deliver comprehensive final report back to caller.
