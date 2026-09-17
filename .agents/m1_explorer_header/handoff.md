# Handoff Report: Top Navigation & 375px Mobile Overflow Fix (Milestone 1)

**Agent**: `m1_explorer_header`  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\m1_explorer_header`  
**Target Milestone**: Milestone 1 (Top Navigation & 375px Mobile Overflow Fix)  
**Date**: 2026-09-12  

---

## 1. Observation

### 1.1 Root Cause Analysis of the 432px vs 343px Mobile Header Overflow
Direct inspection of `src/components/layout/Header.tsx` (lines 114–270) reveals the structural cause of the mobile horizontal overflow on 375px viewports:

```tsx
// src/components/layout/Header.tsx:116
<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
```

1. **Available Geometry**:
   On mobile viewports `<640px` (specifically standard 375px screens such as iPhone SE / mini), the container sets `px-4` padding (16px left + 16px right = 32px). The net usable horizontal width is:
   $$\text{Usable Width} = 375\text{px} - 32\text{px} = 343\text{px}$$

2. **Existing Rendered Element Widths**:
   - **Brand Logo cluster** (lines 119–139):
     - `StudySyncLogo size={36}`: 36px
     - `gap-3`: 12px
     - "StudySync" title + "A/L" badge: 118px
     - Total logo cluster width = 166px.
   - **Right Header Actions cluster** (lines 182–269):
     - Streak badge (lines 185–191): `px-2.5 py-1 text-xs font-mono` with Flame icon: ~66px
     - Biometric AppLock button (lines 194–202): `h-8 w-8` button: 32px
     - Student Inbox button (lines 206–220): `h-8 w-8` button with notification pip: 32px
     - ThemeToggle button (line 223): `h-9 w-9` button: 36px
     - Auth action (lines 226–257): Sign Out `h-8 w-8` (32px) or Sign In button (78px): ~32px to 78px
     - Mobile hamburger trigger (lines 260–268): `h-8 w-8` button: 32px
     - Gap spacing between 6 elements (`gap-2` = 8px): 5 gaps × 8px = 40px
     - Total right actions width = $66 + 32 + 32 + 36 + 32 + 32 + 40 = 270\text{px}$.
   - **Total Top Bar Width**:
     $$\text{Total Width} = 166\text{px} + 270\text{px} = 436\text{px} \approx 432\text{px}$$
   - **Layout Overflow**:
     $$\text{Horizontal Overflow} = 432\text{px} - 343\text{px} = +89\text{px}$$
   This 89px excess forces horizontal scrolling, squishes icon touch targets, and causes visual clipping on all mobile devices narrower than 432px.

### 1.2 Top Navigation Route Coverage Verification
Inspection of `src/app/layout.tsx` (lines 87–97) confirms that `<ConnectedHeader />` is mounted at the root level inside `<AppProvider>`:

```tsx
// src/app/layout.tsx:87-97
<AuthProvider>
  <AppProvider>
    <AuroraBackground>
      {/* Global Navigation Header (<Header />) */}
      <ConnectedHeader />

      {/* Main Application Content */}
      <main className="flex-1 relative z-10 flex flex-col">{children}</main>

      {/* Global Footer */}
      <Footer />
    </AuroraBackground>
    <Toaster position="top-right" richColors />
  </AppProvider>
</AuthProvider>
```

All 9 application routes (`/`, `/register`, `/dashboard`, `/daily`, `/calendar`, `/tests`, `/id-card`, `/admin`, and `/verify`) are direct children of this root layout. Top navigation is mounted unconditionally across all 9 routes, with zero route-suppression logic (`pathname === '/'` check only controls active pill styling).

### 1.3 Test Suite & Invariant Constraints
Analysis of `tests/m1-challenger-component-stress.test.js` (lines 264–272) identifies four strict string assertions on `Header.tsx`:
- `alwisachalaanurada@gmail.com`: Admin email constant for whitelist evaluation
- `mobileMenuOpen`: Mobile navigation menu state handler variable
- `effectiveStreak`: Calculated streak display variable
- `navLinks`: Navigation array defining items

All four identifiers must be strictly preserved during worker implementation. Furthermore, baseline verification executed on the repository confirmed:
- `npm test`: 423/423 tests passing (100%)
- `node tests/e2e-runner.js`: 469/469 tests passing across Tiers 1–5 (100%)
- `npm run build`: Static export compiles cleanly, generating 10/10 static pages (`/`, `/_not-found`, `/admin`, `/calendar`, `/daily`, `/dashboard`, `/id-card`, `/register`, `/tests`, `/verify`).

---

## 2. Logic Chain

1. **Mobile Top Bar Containment**:
   - By retaining only the compact brand logo on the left (~136px) and restricting right top bar elements on `<640px` viewports to three components—the streak pill (~62px), ThemeToggle (32px), and Hamburger menu trigger (32px) separated by 8px gaps (16px total gaps)—the right cluster width becomes exactly 142px.
   - Total mobile top bar width evaluates to $136\text{px} + 142\text{px} = 278\text{px}$, which fits comfortably within the 343px available width with 65px of buffer space. This completely eliminates the 89px horizontal overflow.

2. **Drawer Architecture for Secondary Actions**:
   - Secondary desktop actions (Biometric AppLock trigger, Inbox notification badge, and Sign Out/Sign In profile controls) are transferred into the slide-out mobile navigation drawer (`Sheet` / drawer menu).
   - In the drawer, these controls gain dedicated full-width rows with explicit labels and larger touch targets (minimum 44px touch height adhering to mobile accessibility standards), enhancing usability while decluttering the compact top bar.

3. **Streak Badge Kinfolk Pill Geometry**:
   - Reformatting the streak badge from `rounded-lg border border-black/[0.08] px-2.5 py-1 text-xs font-mono` to the authoritative Kinfolk pill `rounded-full px-3 py-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold` brings the badge into strict alignment with Google Stitch Project 5007748334507611824 and Section R1 of the specification.

4. **Zero Cumulative Layout Shift (CLS = 0)**:
   - Header container height is locked to `h-16` (64px).
   - Right action items share standardized heights (`h-8 w-8` icon buttons and `h-7` pill badge).
   - Moving auth-dependent elements (user name and sign-in/sign-out buttons) out of the mobile top bar ensures that authentication state hydration does not trigger any DOM reflow or shifting of mobile header elements.
   - `ThemeToggle` already includes a pre-hydration placeholder button of identical dimensions, preventing theme-shift CLS.

---

## 3. Caveats

1. **Desktop Breakpoint**:
   The secondary actions are hidden on mobile viewports using `hidden sm:inline-flex` and `hidden sm:flex` (`sm:` = 640px in Tailwind). On viewports between 640px and 768px (`sm` to `md`), desktop navigation links remain collapsed while secondary action buttons become visible in the header bar. On screens 768px and above (`md:`), the full desktop navigation menu renders.
2. **Modal Management**:
   The `AppLockModal` and `UserInboxModal` triggers in the mobile drawer must close the drawer (`setMobileMenuOpen(false)`) immediately before opening their respective modal dialogs to prevent z-index collision or stacking context conflicts.

---

## 4. Conclusion & Exact Worker Implementation Specifications

To implement this change, `src/components/layout/Header.tsx` should be modified as specified below.

### 4.1 Target File: `src/components/layout/Header.tsx`

#### Chunk 1: Streak Badge Kinfolk Pill Reformatting
**Target Lines**: 184–191 in `src/components/layout/Header.tsx`

*Before*:
```tsx
          {/* Active Streak Pill */}
          {effectiveStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] px-2.5 py-1 text-xs font-mono font-medium text-zinc-900 dark:text-white">
              <Flame className="h-3.5 w-3.5 text-[#C24942]" />
              <span>{effectiveStreak}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">d</span>
            </div>
          )}
```

*After*:
```tsx
          {/* Active Streak Pill (Kinfolk Academic Pill) */}
          {effectiveStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold select-none">
              <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{effectiveStreak}</span>
              <span className="text-[10px] font-mono opacity-80">d</span>
            </div>
          )}
```

---

#### Chunk 2: Secondary Desktop Actions Responsive Hiding
**Target Lines**: 193–258 in `src/components/layout/Header.tsx`

*Before*:
```tsx
          {/* Biometric & Windows Hello Security Lock */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSecurityModalOpen(true)}
            className="h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="App Lock & Windows Hello / Biometric Security"
          >
            <Fingerprint className="h-4 w-4" />
          </Button>

          {/* Student Inbox & Surveys */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInboxModalOpen(true)}
              className="relative h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Student Inbox & Admin Surveys"
            >
              <Inbox className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C24942] text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          )}

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* User Profile & Auth Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-medium text-zinc-900 dark:text-white leading-tight">
                  {user.displayName || member?.fullName || 'Student'}
                </span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 leading-none">
                  {member?.studyId || 'Member'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-[#C24942] transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#C24942] hover:bg-[#A93832] text-white rounded-lg px-3.5 h-8 font-medium text-xs transition-colors shadow-sm"
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
```

*After*:
```tsx
          {/* Biometric & Windows Hello Security Lock (Desktop Only) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSecurityModalOpen(true)}
            className="hidden sm:inline-flex h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="App Lock & Windows Hello / Biometric Security"
          >
            <Fingerprint className="h-4 w-4" />
          </Button>

          {/* Student Inbox & Surveys (Desktop Only) */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInboxModalOpen(true)}
              className="relative hidden sm:inline-flex h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Student Inbox & Admin Surveys"
            >
              <Inbox className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C24942] text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          )}

          {/* Theme Toggle (Dark / Light) - Visible on all viewports */}
          <ThemeToggle />

          {/* User Profile & Auth Controls (Desktop Only) */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-zinc-900 dark:text-white leading-tight">
                  {user.displayName || member?.fullName || 'Student'}
                </span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 leading-none">
                  {member?.studyId || 'Member'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="h-8 w-8 rounded-lg border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#121418] p-0 text-zinc-600 dark:text-zinc-300 hover:text-[#C24942] transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link href="/register" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className="bg-[#C24942] hover:bg-[#A93832] text-white rounded-lg px-3.5 h-8 font-medium text-xs transition-colors shadow-sm"
              >
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
```

---

#### Chunk 3: Slide-Out Mobile Navigation Drawer (Sheet) Implementation
**Target Lines**: 272–327 in `src/components/layout/Header.tsx`

*Before*:
```tsx
      {/* 4. Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#08090A] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                pathname === '/'
                  ? 'border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              <span>Home</span>
            </Link>
            {navLinks
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      isActive
                        ? item.adminOnly
                          ? 'border border-[#C24942]/40 bg-[#C24942]/15 text-[#C24942] dark:text-[#FFA39E] font-semibold'
                          : 'border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                        : item.adminOnly
                        ? 'text-[#C24942] dark:text-[#FFA39E] hover:bg-[#C24942]/10'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            {user && (
              <div className="mt-2 border-t border-black/[0.08] dark:border-white/[0.08] pt-2">
                <div className="flex items-center justify-between px-3 py-1 text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Signed in as:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {user.displayName || member?.fullName || user.email}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
```

*After*:
```tsx
      {/* 4. Slide-Out Mobile Navigation Drawer (Sheet) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content Panel (Slide in from Right) */}
          <div className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xs flex-col justify-between border-l border-black/[0.08] dark:border-white/[0.12] bg-white/98 dark:bg-[#0F1114]/98 p-5 shadow-2xl backdrop-blur-2xl transition-transform animate-in slide-in-from-right duration-200 overflow-y-auto">
            
            {/* Top Bar: Brand & Close Trigger */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <StudySyncLogo size={28} />
                <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                  StudySync
                </span>
                <span className="rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  A/L
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-full p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                aria-label="Close Navigation Menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable Body: User Profile, Actions & Navigation */}
            <div className="flex-1 py-4 space-y-5 overflow-y-auto">
              
              {/* User Identity Banner */}
              {user ? (
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {user.displayName || member?.fullName || 'Student'}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {member?.studyId || 'Member'}
                    </span>
                  </div>
                  {user.email && (
                    <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    StudySync Scholar Access
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Sign in to track streaks, study logs, and A/L forecasts.
                  </p>
                </div>
              )}

              {/* Secondary Action Controls (Transferred from Top Bar on Mobile) */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                  Security & Notifications
                </p>
                
                {/* Biometric AppLock Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSecurityModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>App Lock & Biometrics</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Manage</span>
                </button>

                {/* Student Inbox & Surveys */}
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setInboxModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-3.5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Inbox className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      <span>Student Inbox</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C24942] px-1.5 text-[9px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Primary Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                  Navigation
                </p>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                    pathname === '/'
                      ? 'border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                  )}
                >
                  <StudySyncLogo size={16} />
                  <span>Home</span>
                </Link>

                {navLinks
                  .filter((item) => item.show)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                          isActive
                            ? item.adminOnly
                              ? 'border border-[#C24942]/40 bg-[#C24942]/15 text-[#C24942] dark:text-[#FFA39E] font-semibold'
                              : 'border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                            : item.adminOnly
                            ? 'text-[#C24942] dark:text-[#FFA39E] hover:bg-[#C24942]/10'
                            : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Section: Authentication Actions */}
            <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-4">
              {user ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut?.();
                  }}
                  className="w-full justify-center gap-2 rounded-full border border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700 h-9 text-xs font-medium transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              ) : (
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block"
                >
                  <Button className="w-full justify-center gap-2 rounded-full bg-[#C24942] hover:bg-[#A93832] text-white h-9 text-xs font-medium shadow-sm transition-colors">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In to StudySync</span>
                  </Button>
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
```

---

## 5. Verification Method

To independently verify the implementation after the Worker applies these changes, execute the following commands in sequence:

1. **Verify Unit & Component Assertions**:
   ```powershell
   node --test tests/m1-challenger-component-stress.test.js
   ```
   *Expected Result*: All 18 tests in `m1-challenger-component-stress.test.js` pass, specifically verifying `alwisachalaanurada@gmail.com`, `mobileMenuOpen`, `effectiveStreak`, and `navLinks`.

2. **Verify Full Test Suite**:
   ```powershell
   npm test
   ```
   *Expected Result*: 423/423 tests pass (100%).

3. **Verify End-to-End Suite**:
   ```powershell
   node tests/e2e-runner.js
   ```
   *Expected Result*: 469/469 tests pass across Tiers 1–5 (100%).

4. **Verify Static Export Compilation**:
   ```powershell
   npm run build
   ```
   *Expected Result*: Zero TypeScript errors, zero lint warnings, and 10/10 static pages cleanly generated in `out/`.

5. **Visual Geometry Invalidation Check**:
   On a mobile viewport with width = 375px (or browser dev tools device emulation 375×667):
   - Measure `document.querySelector('header > div').scrollWidth`.
   - Invalidation Condition: If `scrollWidth > 375px`, the layout has regressed into horizontal overflow.
   - Successful Condition: `scrollWidth <= 343px` (exclusive of padding), demonstrating zero horizontal scroll.
