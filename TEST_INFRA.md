# E2E Test Infra: StudySync Sri Lankan A/L Accountability App

## Test Philosophy
- Opaque-box, requirement-driven testing validating all user-facing workflows, data integrity, and error states.
- Master test runner: 	ests/e2e-runner.js with comprehensive 5-tier methodology.

## Feature Inventory & Test Coverage
| # | Feature | Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | API Protocol & Payload Validation | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ | ✓ |
| 2 | Member Registration & Unique Email | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 3 | Stream & Subject Rules | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 4 | Atomic Study ID Allocation | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 5 | Daily Log Submission & Duplicates | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 6 | 1-10 Dual Sliders & Tiers | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 7 | Apple Wallet ID Card & Canvas 2D | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 8 | QR Code Matrix & Verification URL | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 9 | High-Res PNG 3x Export | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 10 | Student Dashboard & Stats | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 11 | Admin Protected Whitelist & 403 | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 12 | Admin Directory, Edit & Analytics | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 13 | Public Member Verification | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ | ✓ |
| 14 | Client-side Image Compression | Codebase survey | 5 | 5 | ✓ | ✓ | ✓ |
| 15 | School Dataset & Autocomplete | Codebase survey | 5 | 5 | ✓ | ✓ | ✓ |
| 16 | Dark Theme & UI Responsiveness | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ | ✓ |

## Test Architecture
- Runner: 
ode tests/e2e-runner.js
- Current Baseline: 327/327 tests passing
- Test Tiers:
  - Tier 1: Feature Coverage (135 tests)
  - Tier 2: Boundary & Corner Cases (135 tests)
  - Tier 3: Pairwise Cross-Feature Combinations (28 tests)
  - Tier 4: Real-World Workload Scenarios (5 tests)
  - Tier 5: Adversarial Edge Cases & Coverage Hardening (24 tests)

## Acceptance Thresholds
- 100% of tests must pass (0 failures)
- Static export (
pm run build) must build with 0 TypeScript errors and output to out/
- Forensic integrity audit must report CLEAN with 0 violations
