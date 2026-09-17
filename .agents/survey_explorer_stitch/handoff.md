# Handoff Report: Google Stitch Project 5007748334507611824 Design System & 9-Page UI Alignment

**Agent**: `survey_explorer_stitch`  
**Date**: 2026-09-12  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\survey_explorer_stitch`  
**Authoritative Reference**: Google Stitch Project `5007748334507611824` (Kinfolk Academic Design System)  

---

## 1. Observation

### 1.1 Stitch Project 5007748334507611824 Authoritative Specifications
Querying StitchMCP tool `get_project` for `projects/5007748334507611824` revealed the authoritative design system definition (`Kinfolk Academic`):

- **Color Tokens**:
  - `background` / `surface`: `#fef8f4` (Light ambient ivory canvas) / `#F3F3F0` (Soft cream)
  - `surface-container-lowest`: `#ffffff` (Crisp warm white card surface)
  - `surface-container`: `#f3ede9` / `surface-container-low`: `#f8f2ef` / `surface-container-high`: `#ede7e3`
  - `primary`: `#9f3c16` / overridePrimaryColor: `#c85a32` (Terracotta / Rust)
  - `on-primary`: `#ffffff`
  - `primary-container`: `#bf542c` / `#c85a32`
  - `secondary`: `#456644` / overrideSecondaryColor: `#6b8e68` (Sage Olive)
  - `on-secondary`: `#ffffff`
  - `secondary-container`: `#c6edc1`
  - `tertiary`: `#854f00` / overrideTertiaryColor: `#d98e32` (Muted Amber / Ochre)
  - `on-surface` / `text-primary`: `#1d1b19` / overrideNeutralColor: `#242220` (Espresso Charcoal)
  - `on-surface-variant` / `text-muted`: `#57423b` / `#6e6a63` (Warm Slate)
  - `outline`: `#8a726a` / `outline-variant`: `#dec0b7` / `#e6e4dd` (Delicate warm stone)
  - `sand`: `#efece6` (Subdued pill fills, search inputs)

- **Typography**:
  - Headlines & Display: `Newsreader` (optical sizes 6..72, weights 400, 500, 600, natural italic accents)
  - Functional UI & Navigation: `Plus Jakarta Sans` (weights 400, 500, 600, 700)
  - Numbers & Metrics: `Plus Jakarta Sans` with `font-variant-numeric: lining-nums tabular-nums`

- **Geometry & Elevation**:
  - Cards & Workspace Panels: `rounded-xl` (20px–24px) or `rounded-lg` (16px), pure warm white (`#ffffff`) with 1px border in delicate stone (`#e6e4dd`), ambient shadow warmed with raw umber: `box-shadow: 0 4px 20px -2px rgba(36, 34, 32, 0.04), 0 2px 6px -1px rgba(36, 34, 32, 0.02)`.
  - Buttons, Badges, Chips: `rounded-full` (capsules), `padding: 0.625rem 1.5rem` for primary CTA, `px-3 py-1` for badges.
  - Zero neon glows or heavy glassmorphism over opaque content.

- **Stitch Project Screens**:
  - `5667cd3b86454c5fbbc52bd36ee9a8e5`: "StudySync — Mindful Academic Landing Page" (`/`)
  - `5550384364374bbaa0f3f86f8d13c874`: "StudySync — Scholar Login & Secure Access" (`/register`)
  - `ac1f07a290d34b05abd7d5b5ed7c6147` & `bd5af87757d94fbc948a4dc5df49e10d`: "StudySync — Overview (Kinfolk Academic)" (`/dashboard`)
  - `39e98483378d46a7855590c5e517e80d` & `9d3ae8f03059483aa49e27c9a1578097`: "StudySync — Today's Log (Kinfolk Academic)" (`/daily`)
  - `73a8250563134cc5bc1cfc929b4e30b9` & `24d1fc9c1f6c4d92bc23a9947a5f964d`: "StudySync — Study Planner & Rhythm Calendar" (`/calendar`)
  - `d7f958cc40474a589bb02946baf922fe`: "StudySync — Tests & Forecast (Kinfolk Academic)" (`/tests`)
  - `8daf3a9c02c345cb99b0991f171e7610`: "StudySync — Official Digital Student Pass" (`/id-card`)
  - `da12086b32b5490e963accef144e8a8f` & `db7fb0b7ac1e4dd384cb3871f5213492`: "StudySync — Mentor & Admin Portal" (`/admin`)
  - `0a05c09e082045c397a1a74b4a264d44` & `3755f32596f946788ca77bdb5f33f45c`: "StudySync — Subject Hub & Subtopics Architecture"

### 1.2 Inspection of Existing Global Styles and UI Primitives

1. **`src/app/globals.css`**:
   - Lines 1–3: Font imports include Plus Jakarta Sans, Inter, JetBrains Mono, SF Pro Display, and Product Sans. **Newsreader font is missing from the CSS `@import` declaration**.
   - Lines 20, 29, 32, 37: Primary in `:root` is set to legacy `#9E2F29` instead of Terracotta `#C85A32` / `#9f3c16`.
   - Lines 23–24: Secondary is `#EBEBE6`, missing Sage Olive `#456644` / `#6b8e68`.
   - Lines 237–262: Legacy `.apple-btn-primary` uses indigo gradients (`#6366f1` to `#8b5cf6`).

2. **`tailwind.config.ts`**:
   - Lines 102–116: `fontFamily.sans` prioritizes SF Pro Display rather than Plus Jakarta Sans. `fontFamily.serif` includes Newsreader, but `fontFamily.display` maps to Product Sans instead of Newsreader.
   - Missing first-class Stitch named color tokens (`terracotta`, `sage`, `amber`, `sand`, `stone`, `charcoal`).

3. **`src/components/layout/Header.tsx`**:
   - Lines 115–270: Header is rendered with brand logo (166px min-width) and right action items:
     - Streak pill: 66px
     - Biometric button: 32px
     - Inbox button: 32px
     - ThemeToggle: 32px
     - SignOut button: 32px
     - Mobile menu hamburger: 32px
     - 5 x 8px gaps: 40px
     - Total right actions width: 266px.
     - **Total Header width = 166px + 266px = 432px**.
     - **375px Viewport Width Available**: `375px - 32px (px-4) = 343px`.
     - **432px > 343px**: Header items exceed viewport width by **89px**, causing horizontal layout overflow and icon squishing on mobile.
   - Line 186: Streak badge uses `rounded-lg border border-black/[0.08] px-2.5 py-1 text-xs font-mono` instead of Stitch `rounded-full` pill.

4. **`src/components/ui/card.tsx`**:
   - Line 38: `CardTitle` hardcodes `text-zinc-100 font-sans`. On white cards in light mode (`bg-white`), this renders light grey on white (contrast ratio < 1.3:1), making card titles unreadable!
   - Line 52: `CardDescription` hardcodes `text-zinc-400`.

5. **`src/components/ui/button.tsx`**:
   - Line 7: `focus-visible:ring-indigo-500`.
   - Line 12: `bg-indigo-600 text-white hover:bg-indigo-500`.
   - Line 16: `border border-zinc-800 bg-zinc-900/40 text-zinc-200` (breaks in light mode).

6. **`src/components/ui/badge.tsx`**:
   - Line 11: `bg-indigo-600/90 text-white`.
   - Missing Kinfolk semantic badge variants (`terracotta`, `sage`, `amber`, `sand`).

### 1.3 Inspection of All 9 Routes

1. **`src/app/page.tsx` (`/`)**:
   - Line 356: Renders an internal `<footer>`, causing duplicate footers because `src/app/layout.tsx` (line 96) already mounts `<Footer />`.
   - Buttons use `rounded-xl` instead of Stitch `rounded-full` pills.
   - Hero and route showcase lack the monoline vector desk illustration from screen `5667cd3b86454c5fbbc52bd36ee9a8e5`.

2. **`src/app/register/page.tsx` (`/register`)**:
   - Lines 207–325: Hardcoded legacy Atelier colors (`#F5F1E9`, `#E5DDD0`, `#132219`, `#2D5A43`).
   - Does not use Stitch token classes (`bg-surface-container`, `text-on-surface`, `primary`).

3. **`src/app/dashboard/page.tsx` (`/dashboard`)**:
   - Lines 347, 377, 388, 399: Indigo references (`text-indigo-400`, `bg-indigo-500/20`).
   - Lines 375–415: Header action buttons wrap into 4 clunky rows on 375px mobile screens.
   - Line 660: Hardcoded `bg-zinc-900/50 backdrop-blur-xl border-zinc-800/80` turns the history card dark in light mode.

4. **`src/app/daily/page.tsx` (`/daily`)**:
   - Lines 463, 495, 506: Hardcoded `#E5DDD0`, `#F5F1E9`, `#132219`.
   - Subject summary grid (`grid grid-cols-3 gap-3`) on line 506 clips long subject names ("Combined Maths") on 375px mobile screens.

5. **`src/app/calendar/page.tsx` (`/calendar`)**:
   - Toolbar in `GoogleStudyCalendar.tsx` (lines 500–557) stacks 6 action buttons into 5 rows on 375px mobile screens.
   - 7-column month grid allocates only 49px per day cell on 375px screens, causing event badge truncation if not properly scoped.

6. **`src/app/tests/page.tsx` (`/tests`)**:
   - Quick action buttons (lines 218–249) overflow flex wrap on mobile.
   - Requires alignment with Stitch screen `d7f958cc40474a589bb02946baf922fe` (Kinfolk Academic forecast cards).

7. **`src/app/id-card/page.tsx` (`/id-card`)**:
   - Lines 37, 77: Hardcoded `bg-zinc-900/60 backdrop-blur-xl border-zinc-800` cards create black boxes in light mode.
   - Buttons use `bg-indigo-600`.

8. **`src/app/admin/page.tsx` (`/admin`)**:
   - Lines 947, 972, 996, 1006, 1034: Hardcoded `bg-zinc-900/60`, `bg-zinc-950/80`, `border-zinc-800`, `bg-indigo-600`.
   - In light mode, the admin console renders as dark zinc instead of Stitch screen `db7fb0b7ac1e4dd384cb3871f5213492` (`#fef8f4` surface, `#ffffff` table cards).

9. **`src/app/verify/page.tsx` (`/verify`)**:
   - Line 118: Hardcoded `bg-zinc-900/60 backdrop-blur-xl border-zinc-800/80` and `bg-indigo-600`.

---

## 2. Logic Chain

1. **Token Inconsistency**:
   - *Observation*: `globals.css` and `tailwind.config.ts` configure legacy crimson (`#9E2F29`), indigo (`#6366f1`), and dark zinc variables, whereas Stitch project `5007748334507611824` mandates Kinfolk Academic tokens (`#fef8f4` canvas, `#c85a32` Terracotta primary, `#6b8e68` Sage Olive, `#d98e32` Muted Amber, Newsreader display font).
   - *Inference*: Any page relying on theme variables or component primitives inherits discordant styling and broken light mode contrast.

2. **Mobile Overflow Root Cause**:
   - *Observation*: On 375px screens, `Header.tsx` renders 7 distinct interactive children totaling 432px inside a 343px available container width (`px-4` padding).
   - *Inference*: This causes a forced 89px horizontal scroll or icon clipping. Mobile ergonomics require collapsing secondary controls (Biometrics, Inbox, Sign out) into the mobile drawer menu, showing only Brand logo, compact streak pill, ThemeToggle, and Hamburger button on viewports `<640px`.

3. **Component Inversion Bug**:
   - *Observation*: `CardTitle` in `src/components/ui/card.tsx:38` specifies `text-zinc-100`.
   - *Inference*: On light mode cards with background `#ffffff`, `text-zinc-100` produces near-zero contrast. It must be refactored to `text-foreground font-serif` to guarantee high legibility across dark and light modes.

4. **Button & Badge Ergonomics**:
   - *Observation*: `button.tsx` and `badge.tsx` have default indigo styling and standard rectangular radiuses.
   - *Inference*: Aligning with Stitch specifications requires pill-shaped `rounded-full` badges and buttons, with Terracotta primary, Soft Sand secondary, and delicate stone outlines.

---

## 3. Caveats

1. **Live Backend Preservation**: All Google Apps Script API endpoints, parameter serialization, and Firebase Auth methods must remain untouched during UI re-theming.
2. **Automated Test Compatibility**: Existing tests in `tests/` check DOM elements, text strings, and attributes. Refactoring classes must not alter element IDs, data attributes (`data-path`), or form input names.
3. **No Direct Code Modifications Performed**: Per investigator role constraints, no source code was written or modified. All proposals in Section 4 are concrete implementation blueprints.

---

## 4. Conclusion & Concrete Code Diff Proposals

### 4.1 Global Tokens & Typography

#### `src/app/globals.css`
```diff
--- a/src/app/globals.css
+++ b/src/app/globals.css
@@ -1,3 +1,4 @@
+@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap');
 @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
 
 @layer base {
   :root {
-    --background: #F3F3F0;
-    --foreground: #14171A;
+    --background: #fef8f4;
+    --foreground: #1d1b19;
 
     --card: #FFFFFF;
-    --card-foreground: #14171A;
+    --card-foreground: #1d1b19;
 
-    --primary: #9E2F29;
+    --primary: #c85a32;
     --primary-foreground: #FFFFFF;
 
-    --secondary: #EBEBE6;
-    --secondary-foreground: #14171A;
+    --secondary: #456644;
+    --secondary-foreground: #FFFFFF;
 
-    --muted: #E4E4DF;
-    --muted-foreground: #5B5E63;
+    --muted: #f3ede9;
+    --muted-foreground: #57423b;
 
-    --accent: #9E2F29;
+    --accent: #c85a32;
     --accent-foreground: #FFFFFF;
+    --tertiary: #854f00;
 
-    --border: rgba(0, 0, 0, 0.08);
-    --input: rgba(0, 0, 0, 0.08);
-    --ring: #9E2F29;
+    --border: #e6e4dd;
+    --input: #e6e4dd;
+    --ring: #c85a32;
 
     --radius: 0.75rem;
-    --success: #2F7A45;
+    --success: #456644;
   }
 
   .dark {
     --background: #0F1114;
-    --foreground: #EDEDEA;
+    --foreground: #f6f0ec;
 
     --card: #17191D;
-    --card-foreground: #EDEDEA;
+    --card-foreground: #f6f0ec;
 
-    --primary: #C24942;
+    --primary: #c85a32;
     --primary-foreground: #FFFFFF;
 
-    --secondary: #1F2227;
-    --secondary-foreground: #EDEDEA;
+    --secondary: #6b8e68;
+    --secondary-foreground: #FFFFFF;
 
-    --muted: #24282E;
-    --muted-foreground: #8B8D93;
+    --muted: #1F2227;
+    --muted-foreground: #a69f98;
 
-    --accent: #C24942;
+    --accent: #c85a32;
     --accent-foreground: #FFFFFF;
+    --tertiary: #d98e32;
 
     --border: rgba(255, 255, 255, 0.08);
     --input: rgba(255, 255, 255, 0.08);
-    --ring: #C24942;
+    --ring: #c85a32;
   }
 }
```

#### `tailwind.config.ts`
```diff
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -19,6 +19,14 @@
       colors: {
+        terracotta: {
+          DEFAULT: "#c85a32",
+          dark: "#9f3c16",
+          light: "#f8efea",
+        },
+        sage: {
+          DEFAULT: "#6b8e68",
+          dark: "#456644",
+          light: "#eef3ed",
+        },
+        amber: {
+          DEFAULT: "#d98e32",
+          dark: "#854f00",
+          light: "#fbf4e8",
+        },
+        sand: "#efece6",
+        stone: {
+          DEFAULT: "#e6e4dd",
+          border: "#dec0b7",
+        },
       },
       fontFamily: {
         sans: [
+          '"Plus Jakarta Sans"',
           '"SF Pro Display"',
           "Inter",
           "sans-serif",
         ],
-        display: ['"Product Sans"', '"SF Pro Display"', '"Google Sans"', "sans-serif"],
+        display: ['"Newsreader"', '"Playfair Display"', "Georgia", "serif"],
         serif: ['"Newsreader"', '"Playfair Display"', "Georgia", "serif"],
       },
```

### 4.2 UI Primitives (`card.tsx`, `button.tsx`, `badge.tsx`)

#### `src/components/ui/card.tsx`
```diff
--- a/src/components/ui/card.tsx
+++ b/src/components/ui/card.tsx
@@ -11,3 +11,3 @@
-      "rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#17191D] text-foreground shadow-sm transition-all duration-300",
+      "rounded-2xl border border-[#e6e4dd] dark:border-white/[0.08] bg-white dark:bg-[#17191D] text-foreground shadow-[0_4px_20px_-2px_rgba(36,34,32,0.04)] transition-all duration-300",
@@ -38,3 +38,3 @@
-      "text-xl font-semibold leading-none tracking-tight text-zinc-100 font-sans",
+      "text-xl font-medium leading-tight tracking-tight text-foreground font-serif",
@@ -52,3 +52,3 @@
-      "text-sm text-zinc-400 leading-relaxed",
+      "text-sm text-muted-foreground leading-relaxed",
```

#### `src/components/ui/button.tsx`
```diff
--- a/src/components/ui/button.tsx
+++ b/src/components/ui/button.tsx
@@ -7,3 +7,3 @@
-  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
+  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
   {
     variants: {
       variant: {
         default:
-          "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500",
+          "bg-[#c85a32] text-white shadow-sm hover:bg-[#b64e28]",
         destructive:
-          "bg-rose-600 text-white shadow-md shadow-rose-600/25 hover:bg-rose-500",
+          "bg-[#ba1a1a] text-white shadow-sm hover:bg-[#93000a]",
         outline:
-          "border border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-200 hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700",
+          "border border-[#dec0b7] dark:border-white/10 bg-transparent text-foreground hover:bg-[#efece6]/60 dark:hover:bg-white/5",
         secondary:
-          "bg-zinc-800/90 text-zinc-100 shadow-sm hover:bg-zinc-700/90",
+          "bg-[#efece6] dark:bg-white/10 text-foreground shadow-sm hover:bg-[#e6e4dd] dark:hover:bg-white/15",
         ghost:
-          "text-zinc-300 hover:bg-zinc-800/60 hover:text-white",
+          "text-muted-foreground hover:bg-[#efece6]/50 dark:hover:bg-white/5 hover:text-foreground",
```

#### `src/components/ui/badge.tsx`
```diff
--- a/src/components/ui/badge.tsx
+++ b/src/components/ui/badge.tsx
@@ -9,16 +9,16 @@
       variant: {
         default:
-          "border-transparent bg-indigo-600/90 text-white shadow-sm hover:bg-indigo-600",
+          "border-transparent bg-[#c85a32] text-white shadow-sm",
         secondary:
-          "border-zinc-700/80 bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700/90",
+          "border-[#dec0b7]/40 bg-[#efece6] dark:bg-white/10 text-foreground",
         terracotta:
+          "border-[#dec0b7] bg-[#f8efea] dark:bg-[#c85a32]/20 text-[#a24220] dark:text-[#ffb59c]",
         sage:
+          "border-[#abd0a6] bg-[#eef3ed] dark:bg-[#456644]/20 text-[#405b3e] dark:text-[#abd0a6]",
         amber:
+          "border-[#ffb86a] bg-[#fbf4e8] dark:bg-[#854f00]/20 text-[#8c5919] dark:text-[#ffb86a]",
       },
```

### 4.3 Top Navigation Bar Responsive Containment (`Header.tsx`)

```diff
--- a/src/components/layout/Header.tsx
+++ b/src/components/layout/Header.tsx
@@ -115,3 +115,3 @@
-    <header className="sticky top-0 z-40 w-full border-b border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#08090A]/90 backdrop-blur-xl transition-colors">
-      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
+    <header className="sticky top-0 z-40 w-full border-b border-[#e6e4dd] dark:border-white/[0.08] bg-[#fef8f4]/95 dark:bg-[#0F1114]/95 backdrop-blur-xl transition-colors">
+      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
@@ -143,15 +143,15 @@
-        <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
+        <nav className="hidden items-center gap-1 lg:flex bg-[#f3ede9] dark:bg-white/[0.04] p-1 rounded-full border border-[#e6e4dd] dark:border-white/[0.08]" aria-label="Main Navigation">
           <Link
             href="/"
             className={cn(
-              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
+              'flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-150',
               pathname === '/'
-                ? 'border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
-                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
+                ? 'bg-[#1d1b19] dark:bg-white text-white dark:text-[#1d1b19] font-medium shadow-sm'
+                : 'text-[#57423b] dark:text-zinc-300 hover:text-foreground'
             )}
@@ -184,8 +184,8 @@
           {/* Active Streak Pill — Responsive & Compact */}
           {effectiveStreak > 0 && (
-            <div className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] px-2.5 py-1 text-xs font-mono font-medium text-zinc-900 dark:text-white">
-              <Flame className="h-3.5 w-3.5 text-[#C24942]" />
+            <div className="flex items-center gap-1 rounded-full border border-[#dec0b7] dark:border-white/[0.12] bg-[#f8efea] dark:bg-[#c85a32]/20 px-2 py-0.5 text-xs font-sans font-semibold text-[#a24220] dark:text-[#ffb59c]">
+              <Flame className="h-3 w-3 text-[#c85a32]" />
               <span>{effectiveStreak}</span>
-              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">d</span>
+              <span className="text-[10px] opacity-80">d</span>
             </div>
           )}
@@ -194,15 +194,15 @@
-          {/* Biometric & Windows Hello Security Lock */}
+          {/* Desktop Only Extra Tools (Hidden on mobile <sm to prevent 89px header overflow) */}
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setSecurityModalOpen(true)}
-            className="h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
+            className="hidden sm:inline-flex h-8 w-8 rounded-full border border-[#e6e4dd] dark:border-white/[0.12] p-0 text-foreground cursor-pointer"
             title="App Lock & Windows Hello / Biometric Security"
           >
             <Fingerprint className="h-4 w-4" />
           </Button>
 
-          {/* Student Inbox & Surveys */}
+          {/* Student Inbox */}
           {user && (
             <Button
               variant="ghost"
               size="sm"
               onClick={() => setInboxModalOpen(true)}
-              className="relative h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
+              className="hidden sm:inline-flex relative h-8 w-8 rounded-full border border-[#e6e4dd] dark:border-white/[0.12] p-0 text-foreground cursor-pointer"
```

### 4.4 9-Page Route Implementation Blueprint

| Route | Key Findings | Recommended Code Alignment |
|---|---|---|
| **`/` (Landing)** | Duplicate footer; standard buttons; missing Kinfolk monoline vector art desk illustration. | Remove inner `<footer>` tag; apply Newsreader headline ("A quiet, steady companion for your A/L journey."); render Stitch monoline desk SVG with Combined Maths derivation and AC resonance curve; use `rounded-full` pill buttons. |
| **`/register`** | Hardcoded legacy Atelier colors (`#F5F1E9`, `#E5DDD0`, `#132219`); multi-step form container. | Map authentication cards to `bg-surface-container-lowest` (`#ffffff`), `border-[#e6e4dd]`, `text-on-surface` (`#1d1b19`), and `#c85a32` primary accents matching Stitch screen `5550384364374bbaa0f3f86f8d13c874`. |
| **`/dashboard`** | 4-row button wrap on 375px; hardcoded dark zinc cards; unreadable `CardTitle` in light mode; legacy indigo accents. | Refactor header action buttons to `grid grid-cols-2 sm:flex`; remove hardcoded `bg-zinc-900/50`; use `rounded-2xl border-[#e6e4dd] bg-white dark:bg-[#17191D]`; replace indigo with `#c85a32` Terracotta and `#456644` Sage Olive; ensure all metric counts use `font-sans font-semibold tabular-nums`. |
| **`/daily`** | 3-column subject hours block clips subject labels on 375px; hardcoded legacy greens/creams. | Add `truncate` and `min-w-0` to subject headings in the logged summary card; use `rounded-full` pill buttons; apply `#f8efea` active session badge; ensure Start/End time inputs stack cleanly on mobile. |
| **`/calendar`** | Top toolbar with 6 buttons creates 5 stacked rows on 375px; 7-day grid cells are 49px wide on mobile. | Implement responsive icon-button collapse for secondary actions (export/import/colors) on `<sm`; in month grid, ensure event indicators render as compact colored dots with short labels (`truncate`). |
| **`/tests`** | Header buttons wrap awkwardly on mobile; chart containers need flexible containment. | Wrap action buttons with `flex-wrap gap-2 w-full sm:w-auto`; format Z-score hero card with Newsreader display numbers and Plus Jakarta Sans metric labels. |
| **`/id-card`** | Hardcoded dark cards (`bg-zinc-900/60`) and indigo buttons make light mode card locked state dark zinc. | Replace hardcoded zinc with standard `Card` class; update unlock/export buttons to Terracotta `#c85a32`. |
| **`/admin`** | 3,100-line file contains extensive hardcoded dark zinc backgrounds (`bg-zinc-900/60`, `bg-zinc-950/80`, `border-zinc-800`) and indigo buttons. | Refactor base card and dialog surfaces to responsive theme variables (`bg-card`, `border-border`); replace all instances of `bg-indigo-600` with `bg-primary` / `#c85a32`; ensure super-admin table wrappers have `overflow-x-auto w-full`. |
| **`/verify`** | Hardcoded dark zinc card and indigo buttons. | Update verification container to use `bg-card border-border`; replace rainbow gradient stripe with subtle terracotta hairline accent. |

---

## 5. Verification Method

To independently verify these findings and validate any subsequent implementation:

1. **Stitch Project Schema Verification**:
   ```bash
   # Call StitchMCP get_project tool to inspect authoritative tokens
   call_mcp_tool ServerName="StitchMCP" ToolName="get_project" Arguments='{"name":"projects/5007748334507611824"}'
   ```

2. **Automated Unit & Scenario Tests**:
   ```bash
   # Run full test suite across Tiers 1-5 (334+ automated tests)
   npm test
   ```

3. **End-to-End Test Runner**:
   ```bash
   # Execute full E2E runner (469+ test assertions)
   node tests/e2e-runner.js
   ```

4. **Production Build Compilation**:
   ```bash
   # Confirm Next.js 14 static export builds with zero TypeScript errors
   npm run build
   ```

5. **375px Mobile Viewport Inspection**:
   - Inspect the DOM at `window.innerWidth = 375` on `/`, `/dashboard`, `/daily`, `/calendar`, and `/admin`.
   - Verify `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (zero horizontal overflow).
   - Invalidation condition: If `scrollWidth > 375px`, an uncontained container or fixed-width child is causing layout expansion.
