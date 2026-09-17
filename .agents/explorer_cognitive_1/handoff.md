# Comprehensive Investigation & Architectural Specification: Cognitive AI Study Bot & Dynamic Z-Score Velocity Tracking Engine

**Date:** 2026-08-27  
**Author:** Explorer Subagent (`explorer_cognitive_1`)  
**Mission:** Design of Cognitive AI Study Advisor, Stream-Tailored Heuristic Engine, Dynamic Z-Score Velocity Tracking, Bottleneck Remediation, and Dashboard/Telegram Integration for StudySync.

---

## 1. Observation

Direct observations from the current StudySync codebase:

1. **Stream & Subject Models (`src/lib/constants.ts:35-56`, `src/types/member.ts:6-14`)**:
   - Supported Streams:
     - `Physical Science`: Mandatory: `['Combined Maths', 'Physics']`, Optional Choices: `['Chemistry', 'ICT']`.
     - `Biological Science`: Mandatory: `['Biology', 'Chemistry']`, Optional Choices: `['Physics', 'Agriculture']`.
   - Exam Batches: `2026`, `2027`, `2028`, `2029`.

2. **Statistical Foundations & Analytics (`src/lib/analytics/dataEngineering.ts:25-378`)**:
   - `NATIONAL_SUBJECT_STATS`: Empirical national norms (Combined Maths: $\mu=42.5, \sigma=18.2$; Physics: $\mu=46.0, \sigma=17.5$; Chemistry: $\mu=48.2, \sigma=16.8$; Biology: $\mu=49.5, \sigma=16.2$; ICT: $\mu=52.0, \sigma=15.5$; Agriculture: $\mu=54.0, \sigma=14.8$).
   - `SUBJECT_CORRELATIONS`: Empirical covariance matrix capturing inter-subject correlation (e.g. Combined Maths $\leftrightarrow$ Physics: $0.64$, Biology $\leftrightarrow$ Chemistry: $0.68$).
   - `calculateSubjectZScore`: Empirical Bayes posterior shrinkage formula $\hat{\theta} = \frac{n}{n+\kappa} \bar{X} + \frac{\kappa}{n+\kappa}\mu_0$ with $\kappa=2.0$.
   - `calculatePercentileFromZ`: Standard Normal Hastings rational polynomial CDF approximation with $|\epsilon(z)| < 7.5 \times 10^{-8}$.
   - `calculateSubjectEma`: Dual Exponential Moving Averages ($\alpha_3 = 0.5$, $\alpha_5 = 0.333$) with linear slope velocity calculation.
   - `calculateStudyRoi`: Marks per 10 study hours ($R = \frac{\bar{X}}{H/10 + 1}$).
   - `calculateSubjectEntropyEquilibrium`: Shannon entropy $\mathcal{H} = -\sum p_i \ln p_i$ normalized against maximum 3-subject entropy $\ln 3 \approx 1.0986$.

3. **Current AI Recommendation Implementation (`src/lib/ai/studyAdvisor.ts:1-143`, `src/components/ai/StudyAdvisorCard.tsx:1-99`)**:
   - Generates initial diagnostic rules: Asymmetric Drag ($\Delta Z \ge 0.55$), Low Yield Alert ($H \ge 10\text{h}, \bar{X} < 50\%$), Positive Momentum ($\text{velocity} \ge 6\%$), and Focus/Fatigue warnings ($\bar{F} < 5.5, \bar{P} < 5.5$).
   - Currently provides general text suggestions without deep stream-specific pedagogical differentiation (e.g., distinguishing Physical Chemistry math from Inorganic memory recall or Combined Maths Applied Dynamics vs Pure Calculus).

4. **Student Dashboard & Examination Views (`src/app/dashboard/page.tsx`, `src/app/tests/page.tsx`)**:
   - Main dashboard contains Bento grid (Streak, Total Hours, Focus/Prod, Subject Distribution), `StudyTrendChart` (7/14 day SVG Bezier volume chart), `SubjectBalanceCard` (0-100% equilibrium), and `AcademicReportModal` (PDF/CSV export).
   - `/tests` page contains test marks table, Z-score cards, and What-If slider simulator (`src/components/ai/WhatIfSimulator.tsx`).
   - The main dashboard currently links to `/tests` via a banner card rather than embedding inline cognitive diagnostic widgets.

5. **Backend Database & Telegram Architecture (`backend/Code.gs:1-1694`)**:
   - Google Apps Script backend manages 4 sheets: `Members`, `DailyLogs`, `Analytics`, `TestMarks`.
   - `TestMarks` sheet schema: `[Test ID, Study ID, Email, Test Date, Exam Type, Subject, Paper Title, Score, Rank, Difficulty, Notes, Timestamp]`.
   - Backend contains helper functions `handleLogTestMark`, `handleGetTestMarks`, `handleDeleteTestMark`, but lacks:
     - `telegramWebhook` action handler in `doPost(e)`.
     - Direct member lookup by Telegram username or Telegram user ID.
     - Automated group digest broadcast generator.

---

## 2. Logic Chain & Mathematical Formulations

### 2.1 Mathematical Formulation of Sri Lankan A/L Z-Score & Dynamic Velocity

#### 1. Standardization with Empirical Bayes Shrinkage
For a student $i$ taking subject $j \in \{1, 2, 3\}$ with $n_j$ logged test assessments:
$$\bar{X}_{i,j} = \frac{\sum_{k=1}^{n_j} w_k X_{i,j,k}}{\sum_{k=1}^{n_j} w_k} \quad \text{where } w_k = 1.15^{k} \text{ (recency weighting)}$$

To prevent small sample distortion ($n_j = 1$ or $2$), the posterior mean estimate $\hat{\theta}_{i,j}$ shrinks towards the national norm $\mu_{0,j}$:
$$\hat{\theta}_{i,j} = \left(\frac{n_j}{n_j + \kappa}\right) \bar{X}_{i,j} + \left(\frac{\kappa}{n_j + \kappa}\right) \mu_{0,j} \quad (\kappa = 2.0)$$

The standardized subject Z-score $Z_{i,j}$ is:
$$Z_{i,j} = \frac{\hat{\theta}_{i,j} - \mu_{0,j}}{\sigma_{0,j}}$$

The Composite Z-Score $Z_i$ across the 3 stream subjects is:
$$Z_i = \frac{1}{3} \sum_{j=1}^3 Z_{i,j}$$

#### 2. Confidence Metric
Confidence $\mathcal{C}(n_j) \in [0, 1]$ increases asymptotically with test sample size:
$$\mathcal{C}(n_j) = 1 - \exp(-\lambda n_j) \quad (\lambda = 0.55)$$
- $n=1 \implies \mathcal{C} = 42.3\%$
- $n=3 \implies \mathcal{C} = 80.8\%$
- $n=6 \implies \mathcal{C} = 96.3\%$

#### 3. Dynamic Z-Score Velocity ($\mathcal{V}_Z$) and Momentum ($\mathcal{M}_Z$)
Let $t$ index consecutive assessment epochs (e.g. 14-day intervals or rolling 3-test windows).
- **Z-Score Velocity**:
  $$\mathcal{V}_Z(t) = \frac{Z(t) - Z(t - \Delta t)}{\Delta t} \quad [\Delta Z \text{ per month}]$$
- **Dual Exponential Moving Averages**:
  $$\text{EMA}_3(t) = 0.50 \cdot X(t) + 0.50 \cdot \text{EMA}_3(t-1)$$
  $$\text{EMA}_5(t) = 0.333 \cdot X(t) + 0.667 \cdot \text{EMA}_5(t-1)$$
- **Momentum Indicator**:
  $$\mathcal{M}_{i,j}(t) = \text{EMA}_3(t) - \text{EMA}_5(t)$$
  - $\mathcal{M}_{i,j} > +2.5 \implies$ **Accelerating Momentum 🔥** (retention compounding)
  - $-2.5 \le \mathcal{M}_{i,j} \le +2.5 \implies$ **Stable / Steady Cadence ⚡**
  - $\mathcal{M}_{i,j} < -2.5 \implies$ **Decaying Velocity ⚠️** (performance deceleration)

#### 4. University Cutoff Gap Analysis & Target Sensitivity
Let $Z_{\text{target}}$ represent the minimum target cutoff for the student's desired university faculty:
- **Tier 1 (Engineering / Medicine - Colombo, Gampaha, Kandy)**: $Z_{\text{target}} \approx 2.05 - 2.15$
- **Tier 2 (Engineering / Medicine - Regional / Merit)**: $Z_{\text{target}} \approx 1.80 - 1.95$
- **Tier 3 (Physical / Bio Applied Sciences, IT / Computing)**: $Z_{\text{target}} \approx 1.35 - 1.55$
- **Tier 4 (National University General Admission)**: $Z_{\text{target}} \approx 0.85 - 1.10$

The Z-score Deficit is:
$$\Delta Z = \max(0, Z_{\text{target}} - Z_{\text{current}})$$

Because $Z = \frac{1}{3} \left(\frac{X_1 - \mu_1}{\sigma_1} + \frac{X_2 - \mu_2}{\sigma_2} + \frac{X_3 - \mu_3}{\sigma_3}\right)$, the partial derivative with respect to raw score $X_j$ is:
$$\frac{\partial Z}{\partial X_j} = \frac{1}{3 \sigma_j}$$

Thus, gaining $+1.0$ mark in:
- Combined Maths ($\sigma = 18.2$) yields $\Delta Z = +0.0183$
- Physics ($\sigma = 17.5$) yields $\Delta Z = +0.0190$
- Chemistry ($\sigma = 16.8$) yields $\Delta Z = +0.0198$
- Biology ($\sigma = 16.2$) yields $\Delta Z = +0.0206$

---

### 2.2 Stream-Tailored Heuristic Rule Engines

#### A. Physical Science Stream Heuristics (Combined Maths, Physics, Chemistry / ICT)

| Rule ID | Trigger Condition | Diagnostic Assessment | Actionable Prescriptive Intervention | Projected $\Delta Z$ |
|---|---|---|---|---|
| `MATH-DYN-01` | Combined Maths $\text{velocity} < 0\%$ OR (Hours $> 15\text{h}$ & Score $< 60\%$) | **Applied Mathematics / Dynamics Bottleneck**: High study hours spent reading theory rather than solving timed step-by-step mechanics & vector proofs. | **Timed Section B Past Paper Sprints**: Complete 2 full Section B Dynamics/Statics questions under strict 45-minute exam limits. Maintain an "Error Taxonomy Log" classifying calculation vs conceptual errors. | $+0.24$ |
| `MATH-CALC-02` | Combined Maths score $< 50\%$ & Test Count $\ge 2$ | **Pure Maths Calculus & Trigonometry Deficit**: Structural gap in algebraic manipulation and integration techniques. | **Foundational 30-Minute Problem Sets**: Dedicate first 30 minutes of each morning to 5 integration/differentiation problems from 2015–2024 past papers before attempting full model papers. | $+0.20$ |
| `PHYS-NUM-01` | Physics score $< 55\%$ & Hours $< 8\text{h/wk}$ | **Physics Mechanics / Rotational Motion Deficit**: Under-allocation of deep-work hours leading to concept fragmentation in mechanics and oscillations. | **Free-Body Diagram (FBD) First Protocol**: Re-solve past paper Part II questions by strictly writing 3-step structured solutions: (1) System isolation & FBD, (2) Coordinate equations, (3) Dimensional unit check. | $+0.22$ |
| `CHEM-PHYS-01` | Chemistry score $< 60\%$ while Combined Maths $> 75\%$ | **Physical Chemistry Calculation Disconnect**: Strong mathematical capability is not being effectively transferred to chemical thermodynamics & equilibrium problem solving. | **Unit Equilibrium Drills**: Practice 10 multi-step equilibrium ($K_p, K_c, \text{pH}$) and electrochemistry calculation problems. Focus on tabular ICE (Initial, Change, Equilibrium) method. | $+0.18$ |
| `CHEM-INORG-02` | Chemistry EMA velocity decaying ($<-4\%$) | **Inorganic Qualitative Recall Decay**: Forgetting curve affecting transition element colors, precipitations, and gas tests. | **Active Recall Flash Matrix**: Build a 1-page synthetic summary sheet of group chemistry reactions and test recall daily via 15-minute active quizzing before sleep. | $+0.16$ |
| `ICT-ALG-01` | ICT score $< 65\%$ & optional subject is ICT | **Programming & Algorithm Logic Bottleneck**: Weakness in Section B structured Python programming and database normalization (2NF/3NF). | **Code Trace & SQL Sprint**: Write out dry-run trace tables for recursive algorithms and normalize 3 database schema scenarios from provincial past papers weekly. | $+0.20$ |

#### B. Biological Science Stream Heuristics (Biology, Chemistry, Physics / Agriculture)

| Rule ID | Trigger Condition | Diagnostic Assessment | Actionable Prescriptive Intervention | Projected $\Delta Z$ |
|---|---|---|---|---|
| `BIO-RES-01` | Biology score $< 65\%$ & Test Count $\ge 2$ | **Resource Book Phrasing Imprecision**: Inability to match official National Institute of Education (NIE) Resource Book marking keywords in structured essays. | **NIE Keyword Cloze Drills**: Convert Resource Book Unit summaries into active fill-in-the-blank cloze tests. Practice writing 1 full essay question weekly and self-evaluate strictly against Department of Examinations marking schemes. | $+0.28$ |
| `BIO-SPACED-02` | Biology Hours $> 18\text{h}$ & score plateaus ($60-70\%$) | **Passive Reading Satiation & Ebbinghaus Decay**: Excessive passive highlighting with diminishing retention returns. | **2-3-7 Spaced Retrieval Protocol**: Implement 2-day, 3-day, and 7-day spaced active recall cycles for high-volume units (Plant Physiology, Genetics, Molecular Biology). | $+0.22$ |
| `BIO-CHEM-ORG-01`| Chemistry score $< 55\%$ in Bio stream | **Organic Chemistry Mechanism Synthesis Deficit**: Chemistry is the primary gating subject for medical faculty admission. Failure to memorize multi-step conversion pathways. | **Organic Conversion Roadmap Sprint**: Draw the complete aliphatic and aromatic reaction conversion map from memory twice weekly. Practice 5 conversion problems (e.g. alcohol to amine via Grignard) per session. | $+0.30$ |
| `BIO-PHYS-MATH-01`| Physics (Optional) score $< 50\%$ in Bio stream | **Mathematical Anxiety / Physics Vector Bottleneck**: Biological science students often experience high cognitive friction with physics trigonometric components. | **Structured Physics Template Method**: Use standardized calculation templates for Optics, Waves, and Current Electricity. Focus on structured Part I MCQs first to build speed. | $+0.25$ |
| `AGRI-AGRON-01` | Agriculture score $< 60\%$ | **Agro-Climatic & Soil Science Integration Gap**: Deficit in quantitative agronomy questions (fertilizer ratio calculations, water requirement formulas). | **Calculation & Practical Field Sheet Practice**: Solve 5 numerical agronomy problems and memorize diagnostic plant deficiency tables. | $+0.18$ |

---

### 2.3 Bottleneck Remediation & Cognitive Fatigue Algorithms

#### 1. Multi-Factor Cognitive Fatigue Index ($\mathcal{F}_{\text{cog}}$)
Let $\bar{F}_7$ and $\bar{P}_7$ be the rolling 7-day average focus and productivity ratings ($1-10$), $\bar{H}_7$ the total 7-day study hours, and $\mathcal{S}_{\text{streak}}$ the current streak days:

$$\mathcal{F}_{\text{cog}} = 0.35 \cdot (10 - \bar{F}_7) + 0.35 \cdot (10 - \bar{P}_7) + 0.20 \cdot \max\left(0, \frac{\bar{H}_7}{42} - 1\right) \times 10 + 0.10 \cdot \min\left(10, \frac{\mathcal{S}_{\text{streak}}}{14}\right)$$

- **Fatigue Tiers**:
  - $\mathcal{F}_{\text{cog}} < 3.5 \implies$ **Optimal Flow State ⚡** (Peak cognitive efficiency).
  - $3.5 \le \mathcal{F}_{\text{cog}} < 5.5 \implies$ **Mild Cognitive Strain ⚠️** (Maintain normal load).
  - $5.5 \le \mathcal{F}_{\text{cog}} < 7.5 \implies$ **High Fatigue & Saturation Alert 🚨** (Prescribe 50/10 Pomodoro blocks, front-load high friction subjects in morning, zero screens 1h before sleep).
  - $\mathcal{F}_{\text{cog}} \ge 7.5 \implies$ **Acute Burnout Risk 🛑** (Prescribe a 24-hour tactical recovery day: 50% study volume reduction, restorative sleep protocol).

#### 2. Shannon Entropy Subject Equilibrium ($\mathcal{E}_{\text{norm}}$)
$$p_j = \frac{H_j}{\sum_{k=1}^3 H_k}, \quad \mathcal{H} = -\sum_{j=1}^3 p_j \ln p_j, \quad \mathcal{E}_{\text{norm}} = \left(\frac{\mathcal{H}}{\ln 3}\right) \times 100\%$$
- If $\mathcal{E}_{\text{norm}} < 70\%$, trigger **Asymmetric Subject Neglect Alert**:
  $$\text{Reallocation Target: } \Delta H_{\text{weak}} = \frac{1}{3}\left(H_{\text{strongest}} - H_{\text{weakest}}\right)$$

---

## 3. Integration & Component Architecture

### 3.1 Student Dashboard Integration

```
src/
├── components/
│   ├── ai/
│   │   ├── CognitiveAdvisorCard.tsx      # Multi-tiered stream-tailored prescriptions
│   │   ├── ZScoreVelocityGauge.tsx       # Real-time Z-score velocity & momentum gauge
│   │   ├── CognitiveFatigueRadar.tsx     # 7-day flow & cognitive fatigue tracker
│   │   └── WhatIfSimulator.tsx           # Interactive Monte Carlo target simulator
│   └── dashboard/
│       ├── StudyTrendChart.tsx           # Existing Bezier volume chart
│       ├── SubjectBalanceCard.tsx        # Shannon entropy equilibrium card
│       └── AcademicReportModal.tsx       # Exportable PDF/Print report
```

#### New UI Component Specifications:
1. **`ZScoreVelocityGauge.tsx`**:
   - Displays: Composite Z-Score ($Z = 1.8420$), 30-day velocity ($\mathcal{V}_Z = +0.18 / \text{mo}$), Momentum pill (`Accelerating 🔥`), Confidence meter ($88\%$), and Faculty Cutoff Gap bar (e.g. $0.21$ away from Colombo Engineering / Medicine).
   - Micro-breakdown chips for all 3 subjects with empirical $\sigma$ and national percentile $\Phi(Z)$.

2. **`CognitiveAdvisorCard.tsx`**:
   - Displays prioritized prescriptive cards categorized by severity (`urgent`, `alert`, `mastery`, `focus`).
   - Each prescription includes: Diagnostic reason, Concrete Action Protocol (e.g. "Do 2 Section B Past Paper questions under 45m"), Target Subject tag, and Estimated Z-Gain badge (`+0.28 Est. Z Gain`).

---

### 3.2 Telegram Bot Integration Architecture

#### 1. Communication Flow Diagram
```
Telegram Client (Student)
       │  (e.g. /status, /zscore, /log, /prescriptions)
       ▼
Telegram Bot API (api.telegram.org)
       │  Webhook POST (with X-Telegram-Bot-Api-Secret-Token)
       ▼
Google Apps Script (backend/Code.gs -> doPost)
       │  action: "telegramWebhook"
       ├── 1. Validate Secret Token & parse update
       ├── 2. Match Telegram Username / Chat ID to Members Sheet (Col E / Col L)
       ├── 3. Fetch Student Logs & Test Marks from Sheets
       ├── 4. Run Cognitive Advisor Engine & Z-Score Calculus
       └── 5. Format MarkdownV2 payload -> Telegram sendMessage API
```

#### 2. Telegram Bot Command Specifications

| Command | Parameters | Description | Response Content |
|---|---|---|---|
| `/start` | `[studyId]` | Welcome message & account linking | Prompts student to link their account via `/link <StudyID>` or auto-links if studyId parameter is passed. |
| `/link` | `<StudyID>` | Link Telegram user ID to StudySync ID | Verifies Study ID in `Members` sheet, records Telegram Chat ID & `@username` in Col E/L, and sends confirmation. |
| `/status` | None | Instant accountability snapshot | Current Streak, Today's logged hours, Focus/Prod rating, and Today's submission status (✅ Completed / ⏳ Pending). |
| `/zscore` | None | Comprehensive Z-score & velocity report | Composite Z-score, national percentile, per-subject Z-scores with grades, 30-day velocity $\mathcal{V}_Z$, and target faculty gap. |
| `/prescriptions` | None | Cognitive AI study prescriptions | Top 2 actionable study prescriptions tailored to their stream and current bottleneck subject. |
| `/log` | `[sub1] [sub2] [sub3] [notes]` | Quick study logging shortcut | Submits quick daily hours for the student's 3 stream subjects with instant backend confirmation. |
| `/leaderboard` | None | Group top 10 streak & hours leaderboard | Shows top 10 ranked peers across the accountability study circle. |

#### 3. Telegram Message Template: `/zscore` Output
```markdown
📊 *STUDYSYNC COGNITIVE INTELLIGENCE REPORT*
👤 *Student:* Kasun Perera (`SG-MATH-0042`)
🎯 *Stream:* Physical Science (2026 A/L)
━━━━━━━━━━━━━━━━━━━━━
🌟 *Composite Z-Score:* `1.8420` *(Top 3.3% Islandwide)*
📈 *30-Day Velocity:* `+0.18 Z / month` (Accelerating 🔥)
🎯 *Target Benchmark:* Colombo Engineering (`2.0500`)
📉 *Z-Score Gap:* `0.2080` (Requires +3.8 marks in Physics)

*Subject Breakdown:*
1️⃣ *Combined Maths:* `78.5%` | *Z:* `+1.98` *(Grade A)* | *EMA:* 76.2%
2️⃣ *Physics:* `62.0%` | *Z:* `+0.91` *(Grade B)* | *EMA:* 58.4% ⚠️
3️⃣ *Chemistry:* `81.0%` | *Z:* `+1.95` *(Grade A)* | *EMA:* 80.1%

💡 *Top AI Prescription:*
*Physics Mechanics Deficit:* Shift 3.5h/week into Part II Mechanics & Free-Body Diagram drills.
Est. Z-Gain: *+0.22*
━━━━━━━━━━━━━━━━━━━━━
_Powered by StudySync Cognitive Engine_
```

#### 4. Automated Daily Group Broadcast Generator (10:00 PM SLST)
```markdown
🔥 *STUDYSYNC DAILY COHORT ACCOUNTABILITY DIGEST*
📅 *Date:* Wednesday, August 27, 2026

📊 *Cohort Summary:*
• Active Students: *48 / 52* (92.3% Submission Rate)
• Total Deep Work: *264.5 Hours* (Avg: 5.51 hrs/student)
• Group Flow Index: *8.4 / 10* ⚡

🏆 *Top 5 Streak Leaders:*
1. 🥇 Nuwan S. (`SG-BIO-0012`) — *42 Days* (312.5 hrs)
2. 🥈 Dilshan K. (`SG-MATH-0008`) — *38 Days* (284.0 hrs)
3. 🥉 Anuki R. (`SG-BIO-0019`) — *35 Days* (245.5 hrs)
4. 🏅 Chamath F. (`SG-MATH-0031`) — *29 Days* (210.0 hrs)
5. 🏅 Senali M. (`SG-BIO-0024`) — *28 Days* (198.5 hrs)

⚡ *Daily Subject Spotlight:*
Physical Science: *Combined Maths* (112.5 hrs logged today)
Biological Science: *Biology* (98.0 hrs logged today)

⏰ *Reminder:* Submit your daily logs before 11:59 PM to keep your streak active!
```

---

## 4. Caveats

1. **National Norms vs School-Specific Grading**: The empirical Bayes baseline uses national Department of Examinations statistics ($\mu, \sigma$). High-repute school term test papers (e.g. Royal College, Ananda, Visakha, Dharmaraja) may have a lower mean ($\mu \approx 35$) and higher difficulty rating compared to national exams. The engine should incorporate the `difficultyRating` field (1 to 5) when normalizing term test raw scores.
2. **Telegram Bot Webhook Latency**: Google Apps Script web app cold starts typically introduce a 1.5–3.0 second latency on webhook execution. The webhook handler must return HTTP 200 immediately or execute synchronous Telegram Bot API `UrlFetchApp.fetch` within the 5-second Telegram timeout window.
3. **Data Privacy on Telegram**: Telegram user IDs and chat IDs must be stored securely in the private `Members` sheet and never returned in public client verification endpoints (`/verify`).

---

## 5. Conclusion

1. The existing StudySync statistical engine provides a solid foundation with Empirical Bayes shrinkage, Hastings rational polynomial CDF approximation, dual EMAs, and Shannon entropy.
2. The cognitive recommendation engine can be expanded into a domain-specific diagnostic system tailored to Sri Lankan Physical Science (Combined Maths, Physics, Chemistry/ICT) and Biological Science (Biology, Chemistry, Physics/Agriculture) curricula.
3. Integrating the Z-Score Velocity Widget, Cognitive Advisor Card, and Cognitive Fatigue Radar into the Student Dashboard alongside the Telegram Bot webhook will provide an end-to-end, multi-channel accountability platform.

---

## 6. Verification Method

To independently verify all formulas, rule engines, and data schemas:

1. **Unit Test Suite**:
   - Run `npm test` to verify `src/lib/analytics/dataEngineering.ts` and `src/lib/ai/studyAdvisor.ts` formulas against test cases.
2. **E2E & TypeScript Build Verification**:
   - Run `npm run build` to ensure all type contracts, static export rules, and Next.js 14 App Router configurations pass with zero errors.
3. **Inspect Implementation Files**:
   - Check `src/types/testMarks.ts` for all interface definitions.
   - Check `src/lib/analytics/dataEngineering.ts` for mathematical implementations.
   - Check `src/lib/ai/studyAdvisor.ts` for diagnostic heuristics.
   - Check `backend/Code.gs` for Google Sheets backend handlers.
