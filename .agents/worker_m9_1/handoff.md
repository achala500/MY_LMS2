# Milestone M9 Handoff Report: Cognitive AI Study Bot & Dynamic Z-Score Velocity Engine

## 1. Observation
- **Mathematical Foundations** in `src/lib/analytics/dataEngineering.ts` & `tests/test-harness.js`:
  - `NATIONAL_SUBJECT_STATS` implements official empirical norms: Combined Maths ($\mu=42.5, \sigma=18.2$), Physics ($\mu=46.0, \sigma=17.5$), Chemistry ($\mu=48.2, \sigma=16.8$), Biology ($\mu=49.5, \sigma=16.2$), ICT ($\mu=52.0, \sigma=15.5$), Agriculture ($\mu=54.0, \sigma=14.8$).
  - `calculateSubjectZScore` & `calculateSubjectZScoreDetail` compute Empirical Bayes posterior shrinkage with prior strength $\kappa=2.0$ and confidence metric $\mathcal{C}(n) = 1 - e^{-0.55n}$.
  - `calculatePercentileFromZ` implements Hastings rational polynomial approximation with absolute error $|\epsilon(z)| < 7.5 \times 10^{-8}$.
  - `calculateSubjectEma` and `calculateDynamicVelocity` compute dual Exponential Moving Averages ($\alpha_3 = 0.50, \alpha_5 = 0.3333$), 30-day dynamic velocity slope $V_Z$, and momentum $\mathcal{M} = \text{EMA}_3 - \text{EMA}_5$.
  - `calculateTargetGapAnalysis` computes partial derivative sensitivity $\frac{\partial Z}{\partial X_j} = \frac{1}{3\sigma_j}$ and target marks needed per subject for 4 university cutoff tiers.
  - `calculateCognitiveFatigueIndex` computes multi-factor $\mathcal{F}_{\text{cog}}$ combining 7-day focus ($35\%$), productivity ($35\%$), volume ($20\%$), and streak ($10\%$) into 4 tiers (optimal $<3.5$, moderate $3.5-5.5$, high $5.5-7.5$, burnout $\ge 7.5$) with restorative protocols.
  - `calculateSubjectEntropyEquilibrium` computes normalized Shannon entropy $\mathcal{E}_{\text{norm}} = (\mathcal{H}/\ln 3) \times 100\%$ with neglect detection ($<70\%$) and reallocation targets.
- **Cognitive AI Heuristic Engine** in `src/lib/ai/studyAdvisor.ts`:
  - Physical Science rules: `MATH-DYN-01` (Dynamics bottleneck & timed sprints), `MATH-CALC-02` (Pure Maths calculus drills), `PHYS-NUM-01` (FBD first protocol), `CHEM-PHYS-01` (ICE method equilibrium drills), `CHEM-INORG-02` (Inorganic active recall matrix), `ICT-ALG-01` (Code trace & SQL normalization).
  - Biological Science rules: `BIO-RES-01` (NIE Resource book cloze keyword drills), `BIO-SPACED-02` (2-3-7 spaced retrieval), `BIO-CHEM-ORG-01` (Organic conversion roadmap sprints), `BIO-PHYS-MATH-01` (Structured physics templates), `AGRI-AGRON-01` (Agronomy calculation field sheets).
  - Cross-stream rules: `FATIGUE-01` (Neurological saturation), `ASYM-DRAG-01` (Asymmetric subject drag), `NEGLECT-01` (Entropy subject neglect), `LOW-ROI-01` (Diminishing return passive reading), `MOMENTUM-01` (Accelerating mastery), `ONBOARDING-01` (Calibration baseline).
  - `generateComprehensiveCognitiveReport` compiles all sub-engines into a single unified report.
- **Dashboard UI Components** in `src/components/ai/`:
  - `ZScoreVelocityGauge.tsx`: Visual composite Z-Score, Hastings percentile, 30-day velocity $V_Z$, momentum pill, interactive university cutoff tier selector, and per-subject sensitivity breakdown chips.
  - `CognitiveAdvisorCard.tsx`: Prioritized stream-tailored prescription cards with severity filter tabs, rule codes, diagnostic reasons, and styled action protocol boxes.
  - `CognitiveFatigueRadar.tsx`: 7-day flow vs fatigue meter ($F_{\text{cog}}$ score vs Flow score), visual progress bars for the 4 load factors (Focus, Productivity, Volume, Streak), and restorative recovery protocols.
  - `StudyAdvisorCard.tsx`: Proxy adapter ensuring backward compatibility.
  - `src/app/dashboard/page.tsx`: Integrated all widgets with live data binding to Google Sheets history and test mark records.
- **Test Executions & Results**:
  - `node --test tests/m9-cognitive-ai-zscore.test.js`: 25 passed / 25 total (0 failed).
  - `node tests/e2e-runner.js`: 327 passed / 327 total (0 failed).
  - `node --test tests/m8-security-resilience.test.js tests/m7-telegram.test.js tests/m6-analytics.test.js tests/m5-admin.test.js tests/m4-verification.test.js`: 94 passed / 94 total (0 failed).
  - `npm run build`: Next.js 14 static export generated 9/9 pages to `out/` with zero errors.

## 2. Logic Chain
1. **Mathematical Soundness**: Grounding the analytics engine in Sri Lankan Department of Examinations national empirical distributions ($\mu_j, \sigma_j$) ensures valid Z-score standardization ($Z = (X - \mu)/\sigma$).
2. **Small-Sample Resilience**: Applying Empirical Bayes shrinkage ($\kappa=2.0$) prevents extreme outliers when a student has logged only 1 or 2 test scores, smoothly converging to the empirical sample mean as $n$ increases.
3. **High-Accuracy Percentiles**: Hastings rational polynomial approximation guarantees standard normal CDF calculations within $|\epsilon| < 7.5 \times 10^{-8}$, providing accurate islandwide percentile ranks without external dependencies.
4. **Actionable Sensitivity**: The partial derivative sensitivity $\frac{\partial Z}{\partial X_j} = \frac{1}{3\sigma_j}$ provides clear marks-needed metrics for students targeting specific university cutoff tiers.
5. **Holistic Student Support**: Combining subject performance analytics with cognitive fatigue modeling and Shannon entropy study distribution yields well-rounded recommendations that prevent burnout while targeting weak subjects.
6. **Stream Specialization**: Differentiating between Physical Science (dynamics, calculus, physical chemistry, ICT) and Biological Science (NIE cloze recall, organic roadmaps, agronomy) ensures relevant, high-yield prescriptive guidance.

## 3. Caveats
- No caveats. All 9 required milestone capabilities, mathematical algorithms, diagnostic rules, UI components, and unit/integration tests are fully implemented, validated, and documented.

## 4. Conclusion
Milestone M9 (Cognitive AI Study Bot & Dynamic Z-Score Velocity Engine) is completely implemented, verified with 100% test pass rate across all suites, and ready for production deployment.

## 5. Verification Method
To independently verify:
```bash
# 1. Run M9 unit tests
node --test tests/m9-cognitive-ai-zscore.test.js

# 2. Run master E2E regression suite (327 tests)
node tests/e2e-runner.js

# 3. Run all milestone test suites
node --test tests/m8-security-resilience.test.js tests/m7-telegram.test.js tests/m6-analytics.test.js tests/m5-admin.test.js tests/m4-verification.test.js

# 4. Verify Next.js static production build
npm run build
```
