# Handoff Report: Baseline Test Verification & Requirements R3/R4 Investigation

**Agent:** `survey_explorer_tests`  
**Working Directory:** `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\survey_explorer_tests`  
**Date & UTC Timestamp:** 2026-09-12T14:42:00Z  
**Target Recipient:** Parent Orchestrator (`fbd762c1-f59a-47c7-afc5-80d4a8447989`)  

---

## 1. Observation

### 1.1 Automated Baseline Test Execution Metrics
Direct verbatim test execution results recorded on Windows environment (`powershell`):

1. **Unit & Integration Suite (`npm test`)**:
   - Command: `npm test` -> `node --test --test-concurrency=1 tests/*.test.js`
   - Total Tests: **423**
   - Total Suites: **73**
   - Pass: **423** (100% pass rate)
   - Fail: **0**
   - Cancelled / Skipped / Todo: **0**
   - Duration: **50573.58 ms (~50.57s)**
   - Exit Code: **0**

2. **Master E2E Opaque-Box Runner (`node tests/e2e-runner.js`)**:
   - Command: `node tests/e2e-runner.js`
   - Tier Breakdown:
     - **Tier 1 (Feature Coverage)**: 176 passed / 176 total (`PASS`)
     - **Tier 2 (Boundary & Limits)**: 175 passed / 175 total (`PASS`)
     - **Tier 3 (Pairwise Interactions)**: 72 passed / 72 total (`PASS`)
     - **Tier 4 (Real-World Application Scenarios)**: 5 passed / 5 total (`PASS`)
     - **Tier 5 (Adversarial Edge Cases & Security)**: 41 passed / 41 total (`PASS`)
   - Total Tests: **469 passed / 469 total** (100% pass rate, 0 failures)
   - Duration: **0.15s**
   - Exit Code: **0**

3. **Production Static Export & TypeScript Compilation (`npm run build`)**:
   - Command: `npm run build` -> `next build` (Next.js 14.2.24)
   - TypeScript checking: **Zero type errors** (`tsc` passed cleanly)
   - Static Page Generation: **10/10 pages generated cleanly**:
     - `○ /` (10 kB / 163 kB)
     - `○ /_not-found` (138 B / 87.4 kB)
     - `○ /admin` (31.9 kB / 206 kB)
     - `○ /calendar` (11.9 kB / 176 kB)
     - `○ /daily` (9.95 kB / 174 kB)
     - `○ /dashboard` (26.8 kB / 240 kB)
     - `○ /id-card` (7.49 kB / 156 kB)
     - `○ /register` (6.64 kB / 174 kB)
     - `○ /tests` (15.6 kB / 203 kB)
     - `○ /verify` (3.59 kB / 138 kB)
   - Shared JS: **87.3 kB**
   - Exit Code: **0**

---

### 1.2 Requirement R3 Audit Observations: Robotic / Academic Jargon & Placeholders
Auditing all 9 routes (`/`, `/register`, `/dashboard`, `/daily`, `/calendar`, `/tests`, `/id-card`, `/admin`, `/verify`) revealed significant residual archaic, institutional, and academic jargon:

| Route / File | Line(s) | Current Robotic / Academic Jargon (Verbatim) | Severity / Tone Problem |
| :--- | :--- | :--- | :--- |
| `src/app/page.tsx` | 195 | `"Registered scholars"` | Victorian/archaic academic jargon; alienates A/L students |
| `src/app/page.tsx` | 204 | `"Logged across all members"` | Institutional census tone |
| `src/app/page.tsx` | 227 | `"A/L examination cycle"` | Bureaucratic exam board jargon |
| `src/app/page.tsx` | 285 | `"...holds you to 35 hours per week"` | Punitive, authoritarian framing |
| `src/app/page.tsx` | 335 | `"institutional Google Sheets ledger"` | High-finance / banking jargon |
| `src/app/page.tsx` | 342 | `"Anti-tampering photo inspection on every study log"` | Police / forensic surveillance framing |
| `src/app/register/page.tsx` | 212 | `"Enter The Archive"` | Archaic library / museum terminology |
| `src/app/register/page.tsx` | 216 | `"Verify your identity via institutional Google single sign-on..."` | Enterprise compliance jargon |
| `src/app/register/page.tsx` | 268 | `"Immediate verification for students, markers, and coordinators."` | Bureaucratic administration wording |
| `src/app/register/page.tsx` | 322 | `"Cryptographic hardware authenticator verification via WebAuthn."` | Overly technical cryptosecurity jargon |
| `src/app/register/page.tsx` | 340, 351 | `"Active Scholar Enrolled"`, `"Go to Scholar Desk"` | Medieval academic phrasing |
| `src/app/register/page.tsx` | 365, 371 | `"Scholar Registry"`, `"generate your digital Scholar Registry ID"` | Stiff registry jargon |
| `src/app/register/page.tsx` | 399 | `"Full Legal / Candidate Name *"` | Intimidating formal exam hall framing |
| `src/app/dashboard/page.tsx` | 427, 434 | `"Account Verification Notice"`, `"...To protect academic authenticity, digital ID cards and certificates will unlock immediately once an administrator approves your profile."` | Cold bureaucratic lockout tone |
| `src/app/dashboard/page.tsx` | 703 | `"No study logs yet."` | Blank, unmotivating, zero guidance |
| `src/app/daily/page.tsx` | 287 | `"Manual Override enabled: You can directly specify total hours."` | Hardware engineering command line jargon |
| `src/app/daily/page.tsx` | 355 | `"A daily log already exists for ... Duplicate submissions are blocked."` | Database constraint error phrasing |
| `src/app/daily/page.tsx` | 360 | `"Cannot log study hours for future dates."` | Cold robotic validation error |
| `src/app/calendar/page.tsx` | 747 | `"No study blocks scheduled for this day. Tap “Add Block” to plan your session."` | Generic, formal font-serif italic text |
| `src/app/calendar/page.tsx` | 281 | `"Smart AI weekly timetable generated and applied!"` | Robotic system notification |
| `src/app/tests/page.tsx` | 180 | `"...access your A/L Test Marks, Z-Score analytics, and study prescriptions."` | Medical / psychiatric clinical terminology |
| `src/app/tests/page.tsx` | 260 | `"No Test Marks Added Yet. Add your recent term tests or model papers to see your estimated A/L Z-Score and study advice."` | Dry, plain card with no encouragement |
| `src/app/id-card/page.tsx` | 44 | `"Please sign in and complete registration to generate your official Platform ID Card Student ID Pass."` | Redundant, repetitive robotic phrasing |
| `src/app/id-card/page.tsx` | 89 | `"...To protect academic authenticity, digital ID cards and certificates will unlock immediately once an administrator approves your profile."` | Stiff institutional justification |
| `src/app/admin/page.tsx` | Many | `"Enrolled Scholars"`, `"Purge Record"`, `"Revoke Authentication"`, `"Institutional Ledger"`, `"Surveillance Logs"` | Police/surveillance state vocabulary |
| `src/app/verify/page.tsx` | 79 | `"No registered member found for Study ID: ... Forgery or invalid ID."` | Aggressive false accusation ("forgery") |
| `src/app/verify/page.tsx` | 108, 114 | `"Official Public Verification Registry"`, `"Official Sri Lanka G.C.E. A/L StudySync Authentication Engine"` | Pompous, pseudo-governmental title |
| `src/app/verify/page.tsx` | 150 | `"Querying live Google Sheets authority..."` | Bizarre robotic phrasing |

#### Dynamic Template Variables Status:
- Currently, dynamic values are formatted via ad-hoc inline JS string concatenations (`${days}`, `{member.fullName.split(' ')[0]}`, `{stats.totalHours.toFixed(1)}`).
- There is **no centralized template parser** that supports the required standard placeholder syntax: `{{user_name}}`, `{{streak_count}}`, `{{exam_countdown_days}}`, `{{composite_z_score}}`.

---

### 1.3 Requirement R4 Audit Observations: Scroll Animations & Monolinear Illustrations

1. **Framer Motion Setup**:
   - `package.json` includes `"framer-motion": "^11.5.4"`.
   - **Grep search confirms 0 imports of `framer-motion` in any file in `src/`!**
   - No `motion.div`, `AnimatePresence`, `whileInView`, or hardware-accelerated scroll hooks are currently used.
   - All page transitions, section reveals, and list entrances are either completely instantaneous or rely solely on basic CSS hover classes (`hover:scale-[0.98]`, `transition-all duration-200`).

2. **CSS Animations**:
   - `globals.css` defines aurora keyframes (`aurora-1` to `aurora-4`), `pulseGlow`, and `shimmer`.
   - `tests/m1-challenger-component-stress.test.js` strictly asserts the existence of:
     - `@keyframes aurora-1` through `@keyframes aurora-4`
     - `@keyframes pulseGlow`
     - `@keyframes shimmer`
     - `@media (prefers-reduced-motion: reduce)` with `animation: none !important;`
     - `--radius: 0.75rem;`
     - Font imports for `sf-pro-display`, `product-sans`, `Plus+Jakarta+Sans`, `JetBrains+Mono`.

3. **Current Vector Illustrations**:
   - `src/components/brand/Illustrations.tsx` contains only 6 generic illustrations:
     `IllustrationStudy`, `IllustrationCountdown`, `IllustrationSecurity`, `IllustrationIdCard`, `IllustrationAnalytics`, `IllustrationStreak`.
   - **Gaps Identified**:
     - **Subject Streams**: No illustrations for Physical Science, Biological Science, Commerce, Arts, or Technology.
     - **Empty States**: No illustrations for Empty Study Logs Table (`/dashboard`), Empty Test Marks (`/tests`), Empty Schedule Day (`/calendar`), or Empty Search/Filter results (`/admin`).
     - **Milestone Achievements**: `src/components/dashboard/GamificationShelf.tsx` renders generic Lucide icon glyphs inside square boxes instead of hand-crafted Claude/Notion monolinear vector badge art (e.g. 7-Day Streak flame, 14-Day Consistency, 30-Day Master, 50h/100h Club, Subject Equilibrium Master, Z-Score Breakthrough).

---

## 2. Logic Chain

1. **Observation**: All 423 unit tests, 469 E2E tests, and static compilation build passed with 100% success rate on the current codebase.
   - **Inference**: The underlying data layer, Google Apps Script client API, security sanitizers, rate limiters, and algorithms are completely stable and sound. Any copy or visual upgrades must strictly preserve the existing exported component props, test regex contracts, and DOM selector anchors.

2. **Observation**: `tests/m7-telegram.test.js` tests exact regex matches on Telegram bot reply strings (e.g. `/Welcome to StudySync/i`, `/Study ID not found/i`, `/STUDY LOG RECORDED/i`, `/LEADERBOARD/i`, `STUDYSYNC DAILY ACCOUNTABILITY DIGEST`, `AI Prescription`).
   - **Inference**: While page copy can be converted to conversational Gen-Z English, the Telegram bot webhook responses in `src/lib/telegram.ts` and `mock-server.js` must maintain compatibility with these exact phrases.

3. **Observation**: `tests/m1-challenger-component-stress.test.js` checks for exact CSS keyframe identifiers (`aurora-1`, `pulseGlow`, etc.) and typography variables in `globals.css` and `tailwind.config.ts`.
   - **Inference**: Adding Framer Motion and 60fps GPU scroll transitions must be done additive to or layered over the existing CSS tokens without removing existing keyframes or CSS variables.

4. **Observation**: R3 requires structured template variables (`{{user_name}}`, `{{streak_count}}`, `{{exam_countdown_days}}`, `{{composite_z_score}}`).
   - **Inference**: A lightweight, zero-dependency string interpolator (`interpolateTemplate(str, vars)`) in `src/lib/templates.ts` with typed fallback defaults (`user_name: 'Student'`, `streak_count: 0`, etc.) provides a single authoritative engine. Page views and card headers can import this helper and define dynamic message dictionaries.

5. **Observation**: R4 requires 60fps scroll animations and Claude/Notion-style monolinear SVG illustrations.
   - **Inference**: Framer Motion is already in `package.json` (`^11.5.4`). By introducing a lightweight client animation wrapper (e.g. `ScrollReveal`, `StaggerContainer`, `StaggerItem`) with `whileInView`, `viewport={{ once: true, margin: '-40px' }}`, and cubic-bezier easing `[0.16, 1, 0.3, 1]`, sections will smoothly enter the viewport at 60fps with zero layout reflows (transform & opacity only).
   - **Inference**: Expanding `src/components/brand/Illustrations.tsx` to include dedicated vector SVGs with 1.5px monolinear geometry, transparent fills, and single warm accent strokes (`var(--primary, #C24942)`) will cleanly satisfy the Claude/Notion design language requirement without introducing heavy raster graphics.

---

## 3. Caveats

1. **Read-Only Scope**: In compliance with subagent instructions, no source files were modified during this investigation. All proposed changes and blueprint code are presented in this report for implementation.
2. **Telegram Bot Regex Rigidity**: As noted in the logic chain, Telegram bot test suites (`tests/m7-telegram.test.js`) enforce specific keywords (`STUDY LOG RECORDED`, `LEADERBOARD`, `AI Prescription`). Updating Telegram strings requires retaining these substrings.
3. **Framer Motion Static Export Compatibility**: In Next.js static export (`output: 'export'`), all components using Framer Motion hooks (`useScroll`, `useTransform`, `motion.*`) must be rendered inside client components (`'use client'`). All 9 pages in StudySync already carry the `'use client'` directive, making integration straightforward.
4. **Browser Hardware Acceleration**: To ensure strictly 60fps scroll animations on low-spec mobile devices (375px viewports), animations must strictly animate only composite properties (`transform`, `opacity`), avoiding animating `width`, `height`, `margin`, or `padding`.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Requirement R3: Comprehensive Copy Harmonization & Template Variable Engine

#### Recommended Centralized Interpolator (`src/lib/templates.ts`):
```typescript
export interface TemplateContext {
  user_name?: string;
  streak_count?: number | string;
  exam_countdown_days?: number | string;
  composite_z_score?: number | string;
  total_hours?: number | string;
  target_year?: string;
  stream?: string;
  school?: string;
  study_id?: string;
}

export function interpolateTemplate(
  template: string,
  context: TemplateContext
): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = context[key as keyof TemplateContext];
    if (val !== undefined && val !== null && val !== '') {
      return String(val);
    }
    switch (key) {
      case 'user_name': return 'Student';
      case 'streak_count': return '0';
      case 'exam_countdown_days': return '0';
      case 'composite_z_score': return '0.00';
      case 'total_hours': return '0';
      default: return `{{${key}}}`;
    }
  });
}
```

#### Proposed Warm, Supportive Gen-Z Copy Across All 9 Pages:

| Page | Location / Context | Current Robotic / Stiff Text | Proposed Warm Gen-Z Conversational Phrasing (with Placeholders) |
| :--- | :--- | :--- | :--- |
| **`/` Landing** | Hero Headline | `"Your A/L exam is {days} days away. Make every study hour count."` | `"{{exam_countdown_days}} days until A/L exams. Let's make every hour count."` |
| **`/` Landing** | Hero Greeting (Auth) | `"Go to Dashboard"` / `"Complete Registration"` | `"Hey {{user_name}}, jump right back into your dashboard 🚀"` |
| **`/` Landing** | Stats Bar | `"Registered scholars"`, `"Logged across all members"` | `"Students grinding together"`, `"Total study hours banked"` |
| **`/` Landing** | Streams Section | `"...holds you to 35 hours per week."` | `"...helps you hit your 35-hour weekly study goal without burnout."` |
| **`/` Landing** | Security Grid | `"Anti-tampering photo inspection on every study log."` | `"Snap your study notes or paper work to keep yourself honest."` |
| **`/register`** | Modal Gate Header | `"Enter The Archive"` | `"Welcome to StudySync"` |
| **`/register`** | Modal Gate Subtitle | `"Verify your identity via institutional Google single sign-on..."` | `"Sign in with Google, password, or fingerprint to get your student pass."` |
| **`/register`** | Biometric Button | `"Scan Windows Hello / Touch ID"` | `"Unlock with Touch ID or Face / Fingerprint"` |
| **`/register`** | Already Enrolled Card | `"Active Scholar Enrolled. You are enrolled as Kasun with Study ID..."` | `"You're all set, {{user_name}}! (Study ID: {{study_id}}). Your study space is ready."` |
| **`/register`** | Form Header | `"Scholar Registry"`, `"Create Your Study Account"` | `"Create Your Student Profile"` |
| **`/register`** | Name Input | `"Full Legal / Candidate Name *"` | `"Your Name * (as you'd like it on your ID card)"` |
| **`/dashboard`** | Header Greeting | `"Welcome back, Kasun"` | `"Hey {{user_name}}, welcome back! 🚀"` |
| **`/dashboard`** | Streak Subtext | `"Great discipline! You have an active 3-day unbroken streak."` | `"You're on fire, {{user_name}}! 🔥 {{streak_count}} days in a row. Keep this momentum rolling — daily consistency is how island ranks are made."` |
| **`/dashboard`** | Subject Balance Tip | `"Your lowest study volume is currently in Physics (18%)..."` | `"Hey {{user_name}}, Physics has been getting a bit less love lately (just 18% of your study time). Toss in an extra hour or two this week so you don't fall behind!"` |
| **`/dashboard`** | Pending Status Banner | `"Account Verification Notice: ...To protect academic authenticity, digital ID cards and certificates will unlock immediately..."` | `"Welcome aboard, {{user_name}}! Your profile is pending quick approval by an admin. You can log all your study sessions right away — your digital ID card will unlock shortly."` |
| **`/dashboard`** | Empty History Table | `"No study logs yet."` | `"No study sessions logged yet, {{user_name}}! Tap below to log today's hours and start your {{streak_count}}-day streak."` |
| **`/daily`** | Form Header | `"Daily Study Log"` | `"Log Today's Study Sessions"` |
| **`/daily`** | Form Subtitle | `"Record your hours per subject with proof photos. Track focus quality..."` | `"Hey {{user_name}}, what did you conquer today? Submit today's session to keep your {{streak_count}}-day streak alive."` |
| **`/daily`** | Manual Override Toast | `"Manual Override enabled: You can directly specify total hours."` | `"Manual edit on: Type your exact total study time directly."` |
| **`/daily`** | Future Date Error | `"Cannot log study hours for future dates."` | `"Can't log future dates yet — time travel hasn't been invented!"` |
| **`/daily`** | Duplicate Log Error | `"A daily log already exists for {date}. Duplicate submissions are blocked."` | `"You've already logged for today! Check your dashboard or edit your existing session."` |
| **`/daily`** | Focus Slider Label | `"Focus Rating (1-10)"` | `"How locked in were you? (Focus & Productivity)"` |
| **`/calendar`** | Empty Day View | `"No study blocks scheduled for this day. Tap “Add Block” to plan your session."` | `"Your schedule is clear for today! Tap + Add Block to schedule study time or let AI plan it for you."` |
| **`/calendar`** | AI Schedule Success | `"Smart AI weekly timetable generated and applied!"` | `"Your weekly study schedule is ready, {{user_name}}! Balanced across your 3 subjects with 35-hour weekly targets."` |
| **`/calendar`** | Countdown Widget | `"Mobile Lockscreen Countdown"` | `"Download Mobile Lockscreen Widget ({{exam_countdown_days}} days to go)"` |
| **`/tests`** | Empty Tests Notice | `"No Test Marks Added Yet. Add your recent term tests..."` | `"No test scores logged yet, {{user_name}}! Add your latest term test or tuition paper to unlock your projected Z-Score (aiming for that 2.0+ cutoff!)."` |
| **`/tests`** | Z-Score Headline | `"Estimated A/L Z-Score"` | `"Projected Island Z-Score: {{composite_z_score}}"` |
| **`/tests`** | AI Advisor Header | `"AI Prescriptions & Directives"` | `"Your Study Game Plan & Recommendations"` |
| **`/id-card`** | Restricted Banner | `"Digital ID Pass Restricted: To protect academic authenticity..."` | `"Almost there, {{user_name}}! Your student pass is waiting on admin verification. Once approved, your official scannable pass will unlock right here."` |
| **`/id-card`** | Locked Pass (Guest) | `"Digital Pass Locked: Please sign in and complete registration to generate your official Platform ID Card Student ID Pass."` | `"Your Student Pass is waiting! Sign in and finish registration to generate your digital A/L ID card."` |
| **`/admin`** | Member Directory | `"Enrolled Scholars"`, `"Purge Record"` | `"Registered Students"`, `"Remove Student"` |
| **`/admin`** | Telegram Broadcast Modal | `"Broadcast Template: Formatted template with real live stats..."` | `"Weekly Study Leaderboard: Shoutout to {{user_name}} with an incredible {{streak_count}}-day streak! Keep grinding everyone, {{exam_countdown_days}} days left until exams!"` |
| **`/verify`** | Header Titles | `"Official Public Verification Registry"`, `"...Authentication Engine"` | `"Student ID Verification • Instant verification for tuition classes & study groups"` |
| **`/verify`** | Search Status | `"Querying live Google Sheets authority..."` | `"Checking official student records..."` |
| **`/verify`** | Not Found Error | `"No registered member found for Study ID: ... Forgery or invalid ID."` | `"We couldn't find a student with ID {{study_id}}. Double-check the ID or try scanning the QR code again."` |
| **`/verify`** | Verified Badge | `"Verified: Kasun Perera (SG-BIO-0001)"` | `"Verified Student: {{user_name}} • Active {{stream}} student at {{school}}"` |

---

### 4.2 Requirement R4: 60fps Scroll Animations & Framer Motion Architecture

#### Recommended Animation Architecture:
Create a reusable, lightweight animation utility in `src/components/animation/MotionWrappers.tsx`:
```typescript
'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Hardware-accelerated transitions: opacity and transform only (60fps guaranteed)
export const transitionStandard = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1],
};

export const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const itemFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionStandard,
  },
};

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...transitionStandard, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

#### Application Points:
1. **Hero & Top Sections** on `/` and `/dashboard`: Wrap hero titles, live stats, and stat cards in `<StaggerList>` with `<motion.div variants={itemFadeUp}>`.
2. **Scroll-Driven Sections**: On `/`, `/daily`, `/tests`, wrap each major section in `<ScrollReveal>`.
3. **Buttons and Touch Targets**: Add `whileTap={{ scale: 0.98 }}` and `whileHover={{ translateY: -1 }}` to primary buttons for butter-smooth tactile feedback.

---

### 4.3 Requirement R4: Claude/Notion Monolinear SVG Illustration Catalog

Expand `src/components/brand/Illustrations.tsx` with hand-crafted 1.5px monolinear vector SVGs:

```
src/components/brand/Illustrations.tsx
├── Existing (Preserved):
│   ├── IllustrationStudy
│   ├── IllustrationCountdown
│   ├── IllustrationSecurity
│   ├── IllustrationIdCard
│   ├── IllustrationAnalytics
│   └── IllustrationStreak
│
├── Subject Stream Illustrations (Claude/Notion Style):
│   ├── IllustrationStreamPhysicalScience (Drafting compass, Cartesian coordinate grid, calculus integral curve, ruler)
│   ├── IllustrationStreamBiologicalScience (DNA double helix spiral, botanical leaf with veins, Erlenmeyer flask)
│   ├── IllustrationStreamCommerce (Clean balance scale, ledger spreadsheet, rising bar chart, calculator)
│   ├── IllustrationStreamTechnology (Silicon microchip, circuit logic traces, mechanical gear)
│   └── IllustrationStreamArts (Parchment manuscript scroll, quill pen, classical Greek arch)
│
├── Empty State Illustrations (Claude/Notion Style):
│   ├── IllustrationEmptyLogs (Notion-style wooden desk with open spiral notebook, sharp pencil, and warm coffee mug)
│   ├── IllustrationEmptyTests (Monolinear exam paper with checkmark boxes, compass, target bullseye)
│   ├── IllustrationEmptyCalendar (Desktop calendar tear-off page with sunbeam and clock showing open day)
│   ├── IllustrationEmptyVault (Open document revision folder with dashed lines and paperclip)
│   └── IllustrationEmptyInbox (Minimalist mailbox with open flag and floating origami paper bird)
│
└── Milestone Achievement Badges (Claude/Notion Style):
    ├── IllustrationMilestoneStreak7 (Monolinear flame on geometric 7-point pedestal)
    ├── IllustrationMilestoneStreak14 (Double-flame crest with calendar page and laurel ribbon)
    ├── IllustrationMilestoneStreak30 (Star trophy cup with Roman numerals XXX and diamond sparkles)
    ├── IllustrationMilestoneHours50 & IllustrationMilestoneHours100 (Hourglass with layered sand lines and clock halo)
    ├── IllustrationMilestoneEquilibrium (Precision beam balance scale leveled with 3 equal weights)
    └── IllustrationMilestoneZScore (Normal distribution bell curve with ascending trajectory breaking peak percentile)
```

---

## 5. Verification Method

To independently verify these findings and confirm the integrity of the proposed implementation plan:

1. **Verify Baseline Test Suite Execution**:
   ```powershell
   npm test
   ```
   *Pass Criteria*: All 423 tests pass across 73 suites, 0 failures.

2. **Verify Master E2E Runner (Tiers 1–5)**:
   ```powershell
   node tests/e2e-runner.js
   ```
   *Pass Criteria*: All 469 tests pass across Tiers 1 through 5, 0 failures.

3. **Verify Next.js Static Export & TypeScript Compilation**:
   ```powershell
   npm run build
   ```
   *Pass Criteria*: Clean zero-error compilation with 10 static pages produced in `out/`.

4. **Verify Copy Compatibility**:
   Ensure that modifying frontend page copy does not alter Telegram bot response assertions in `tests/m7-telegram.test.js` or XP rank assertions in `tests/gamification-export-remediation.test.js`.

5. **Verify Reduced Motion Accessibility**:
   Confirm that CSS media query `@media (prefers-reduced-motion: reduce)` in `globals.css` continues to disable all Framer Motion and CSS transitions.
