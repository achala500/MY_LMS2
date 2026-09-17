# Orchestration Plan — StudySync Rebuild

## Strategy
Following the Project Pattern:
1. **Phase 0: Survey**:
   - Spawn 3 parallel Explorers to assess:
     - Explorer 1: Existing JS/HTML codebase (`src/js/`, `src/`, `backend/`, `firebase.json`, etc.)
     - Explorer 2: Existing Next.js/React setup if any, package.json, dependencies, build configuration, Tailwind setup, shadcn setup.
     - Explorer 3: Feature & specification breakdown from `ORIGINAL_REQUEST.md`, API contracts, Apps Script endpoints, and data schemas.
2. **Phase 1: Architecture & Decomposition**:
   - Aggregate survey reports into `PROJECT.md` with full feature inventory, milestone boundaries, code layout, and interface contracts.
3. **Phase 2: Milestone Execution (Dual Track)**:
   - Implementation Track (Next.js scaffold & config, Auth & API layer, Components & UI primitives, Views & Pages, Data Synthesis & ID Card).
   - E2E Testing Track (Test harness, unit & E2E tests, verifying all acceptance criteria).
4. **Phase 3: Hardening, Review & Forensic Audit**:
   - Reviewers, Challengers, and Forensic Auditor (`teamwork_preview_auditor`).
   - Zero tolerance integrity gating.
5. **Phase 4: Final Validation & Deliverables**:
   - Validate `npm run build` static export generating `out/`.
   - Comprehensive test suite pass.
