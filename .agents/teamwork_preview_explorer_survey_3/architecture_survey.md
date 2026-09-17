# StudySync Next.js 14 App Router Architecture & Tech Stack Survey

## 1. Executive Summary & Core Objectives

StudySync is a production-grade daily study accountability and member management web application tailored for Sri Lankan G.C.E. Advanced Level (A/L) students. The application combines student onboarding, stream-specific study logging, focus and productivity metric tracking, Apple Wallet-style digital ID card generation with dual-payload QR codes, personal streak algorithms, and an administrative oversight console.

The goal of this architectural survey is to establish the blueprint for migrating the existing vanilla JavaScript single-page application (SPA) to a modern, type-safe, and component-driven architecture powered by **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**, configured for **static export (`output: 'export'`)** deploying to Firebase Hosting.

### Preserved Infrastructure & Backend Contracts

All live cloud services and backend integrations must remain intact and functional without breaking changes:

| Component | Identifier / Endpoint | Configuration Details |
|---|---|---|
| **Firebase Project** | `studysync-al-2026` | Hosting URL: `https://studysync-al-2026.web.app` |
| **Firebase Auth** | Google Sign-In Provider | Compat SDK v10 loaded via CDN `<Script>` in `app/layout.tsx` |
| **Backend API** | Google Apps Script Web App | `https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec` |
| **Google Sheets Database** | 3-Sheet Normalized DB | `1CI8KbQU-XJ_HvqEv2yu-d1oRf0focH9cdozo0YIhhY0` (`Members`, `DailyLogs`, `Analytics`) |
| **Admin Whitelist** | Authorized Superadmin | `alwisachalaanurada@gmail.com` |
| **API Request Protocol** | Unified POST Dispatcher | All API calls use HTTP POST with `Content-Type: text/plain;charset=utf-8` to bypass CORS and redirect preflight constraints |
| **Local Dev Mock Server** | Node.js Express Server | `server/mock-server.js` running on `http://localhost:3000` |
| **Preserved Directories** | Core System Assets | `backend/` (`Code.gs`), `server/` (`mock-server.js`), and `tests/` (`e2e-runner.js`, 327 tests) |

---

## 2. Environment & Tooling Survey

An audit of the runtime environment at `c:\Users\alwis\Documents\antigravity\dazzling-bardeen` confirms the following system specifications:

```
Node.js Runtime:    v25.2.0
NPM Version:        11.6.2
Operating System:   Windows 11
Module System:      ECMAScript Modules (type: module)
Current Dev Server: Express mock backend server (server/mock-server.js)
Current Test Suite: Node.js test runner (tests/e2e-runner.js - 327 tests across 5 tiers)
```

### Dependency Modernization Strategy

The existing `package.json` contains minimal dependencies (`cors`, `express`). To support Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui primitives, and testing tools, the package dependencies are structured into production runtime and development tooling:

#### Production Dependencies (`dependencies`)
- `next`: `^14.2.25` — Core React framework with App Router support
- `react`: `^18.3.1` — UI rendering library
- `react-dom`: `^18.3.1` — DOM renderer for React
- `clsx`: `^2.1.1` — Utility for constructing className strings conditionally
- `tailwind-merge`: `^2.3.0` — Merge Tailwind CSS classes without style conflicts
- `class-variance-authority`: `^0.7.0` — Component variant styling engine
- `lucide-react`: `^0.395.0` — Clean, modern icon set for UI elements
- `sonner`: `^1.5.0` — Toast notification manager replacing vanilla toast
- `next-themes`: `^0.3.0` — Dark/light theme management
- `cmdk`: `^1.0.0` — Fast, accessible command menu for school autocomplete
- `@radix-ui/react-dialog`: `^1.0.5` — Accessible modal dialog primitive
- `@radix-ui/react-tabs`: `^1.0.4` — Accessible tabbed interface primitive
- `@radix-ui/react-select`: `^2.0.0` — Accessible select dropdown primitive
- `@radix-ui/react-popover`: `^1.0.7` — Accessible popover container primitive
- `@radix-ui/react-progress`: `^1.0.3` — Accessible progress bar primitive
- `@radix-ui/react-separator`: `^1.0.3` — Visual separator primitive
- `@radix-ui/react-avatar`: `^1.0.4` — User avatar container primitive
- `@radix-ui/react-slot`: `^1.0.2` — Radix composability primitive
- `@radix-ui/react-label`: `^2.0.2` — Accessible form label primitive
- `@radix-ui/react-slider`: `^1.1.2` — Accessible slider primitive
- `@radix-ui/react-dropdown-menu`: `^2.0.6` — User profile dropdown primitive
- `framer-motion`: `^11.2.10` — Smooth physics-based UI transitions and 3D card tilt
- `canvas-confetti`: `^1.9.3` — Celebration animations for streaks and registrations
- `express`: `^4.19.2` — Local mock development server (preserved)
- `cors`: `^2.8.5` — CORS middleware for local mock server (preserved)

#### Development Tooling (`devDependencies`)
- `typescript`: `^5.5.0` — Type checking and compilation
- `@types/node`: `^20.14.0` — Node.js standard library type definitions
- `@types/react`: `^18.3.3` — React type definitions
- `@types/react-dom`: `^18.3.0` — React DOM type definitions
- `@types/canvas-confetti`: `^1.9.0` — Typings for canvas-confetti
- `tailwindcss`: `^3.4.4` — Utility-first CSS framework
- `postcss`: `^8.4.38` — CSS transformation tool
- `autoprefixer`: `^10.4.19` — Vendor prefixer for CSS
- `tailwindcss-animate`: `^1.0.7` — Tailwind CSS animation plugin for shadcn/ui

---

## 3. Next.js 14 Static Export Architecture

### Configuration File: `next.config.mjs`

To deploy the Next.js 14 App Router application to Firebase Hosting, Next.js must be configured for pure static HTML/JS/CSS generation via `output: 'export'`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

### Static Export Considerations & Best Practices
1. **Zero Server Runtime**: In static export mode, Next.js does not execute Node.js server routes at runtime. All dynamic API communication occurs directly on the client via `ApiClient` to Google Apps Script or the local mock server.
2. **Suspense Boundaries for Search Parameters**: In Next.js 14 App Router static export, any page or component invoking `useSearchParams()` (such as `/verify?id=SG-BIO-0001`) must be wrapped inside a `<Suspense>` boundary. Failing to wrap `useSearchParams()` triggers Next.js build errors during static generation.
3. **Image Optimization**: Static hosting platforms like Firebase Hosting cannot run the dynamic Node.js image optimization service. Specifying `images: { unoptimized: true }` ensures `next/image` operates smoothly without requiring an external image CDN.
4. **Client-Side Navigation**: Pages use `'use client'` where interactive state, canvas rendering, form controls, or Firebase Auth hooks are utilized.

### Firebase Hosting Configuration: `firebase.json`

The `firebase.json` configuration is updated to point its public root to `out/` while preserving SPA rewrites, static caching headers, and public verification endpoints:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "backend/**",
      "server/**",
      "tests/**",
      ".agents/**"
    ],
    "rewrites": [
      {
        "source": "/verify/**",
        "destination": "/verify.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(html|htm)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|png|webp|svg|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400, public"
          }
        ]
      }
    ]
  }
}
```

---

## 4. Firebase Auth Compat Script Loading Strategy

### Architectural Rationale

The StudySync platform relies on Firebase Auth with Google Sign-In (project `studysync-al-2026`). In the existing vanilla JS application, Firebase v10 compat SDK scripts (`firebase-app-compat.js` and `firebase-auth-compat.js`) are loaded from `https://www.gstatic.com/firebasejs/10.8.0/` and initialized on the window.

To maintain seamless compatibility with existing Google OAuth credentials, avoid bundle size bloat, and comply with Requirement R4, the compat scripts are loaded in `src/app/layout.tsx` via Next.js `<Script>` tags with `strategy="beforeInteractive"`.

### Layout Script Implementation (`src/app/layout.tsx`)

```tsx
import Script from 'next/script';
import { AuthProvider } from '@/context/auth-context';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuroraBackground } from '@/components/layout/aurora-background';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"
          strategy="beforeInteractive"
        />
        <Script id="firebase-config-init" strategy="afterInteractive">
          {`
            const firebaseConfig = {
              apiKey: "AIzaSyAjK2y49ia3YnDY3L1bMhwasAQGRikvAHA",
              authDomain: "studysync-al-2026.firebaseapp.com",
              projectId: "studysync-al-2026",
              storageBucket: "studysync-al-2026.firebasestorage.app",
              messagingSenderId: "99176264496",
              appId: "1:99176264496:web:1a6a69567c0f7619a98ef5"
            };
            if (typeof window !== 'undefined' && window.firebase && !window.firebase.apps?.length) {
              window.firebase.initializeApp(firebaseConfig);
            }
          `}
        </Script>
      </head>
      <body className="bg-[#07090E] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>
          <AppProvider>
            <AuroraBackground />
            <div className="noise-overlay" aria-hidden="true" />
            <Header />
            <main className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" richColors />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### TypeScript Global Augmentation (`src/types/firebase.d.ts`)

```typescript
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface FirebaseAuthInstance {
  currentUser: FirebaseUser | null;
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => () => void;
  signInWithPopup: (provider: any) => Promise<{ user: FirebaseUser }>;
  signInWithRedirect: (provider: any) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface FirebaseGlobal {
  apps: any[];
  initializeApp: (config: Record<string, string>) => any;
  auth: {
    (): FirebaseAuthInstance;
    GoogleAuthProvider: new () => {
      setCustomParameters: (params: Record<string, string>) => void;
    };
  };
}

declare global {
  interface Window {
    firebase?: FirebaseGlobal;
    STUDYSYNC_API_URL?: string;
  }
}
```

### AuthContext State Management Architecture

`src/context/auth-context.tsx` provides:
1. **Silent Session Persistence**: Listens to `firebase.auth().onAuthStateChanged` to restore logged-in students across page refreshes without re-prompting.
2. **Backend Profile Synchronization**: Automatically invokes `ApiClient.checkUser(user.email)` upon authentication to synchronize member records, today's submission state, and historical study statistics.
3. **Route Guards & Role Resolution**: Identifies administrators via the email whitelist (`ADMIN_EMAILS`) and automatically routes new users to registration or registered members to their dashboard.
4. **Fallback Direct Email Modal**: Provides local mock authentication and handles mobile popup blocker fallbacks seamlessly.

---

## 5. Design System & shadcn/ui Component Inventory

### Visual Design System Specifications

The application adheres to an Apple-inspired dark aesthetic featuring a dark zinc/slate neutral base, subtle glassmorphism cards, and purposeful semantic accent colors:

```
Neutral Base:       #07090E (Midnight Canvas) / #0D111A (Surface Glass) / #131B2A (Card Glass)
Primary Action:     Indigo (#6366F1 / #818CF8) — CTAs, focus rings, active highlights
Success Accent:     Emerald (#10B981) — Streak counters, verified badges, active tags
Warning Accent:     Amber (#F59E0B) — Productivity alerts, admin badges, attention states
Destructive Accent: Rose (#EF4444) — Danger states, delete dialogs, inactive badges
Secondary Accents:  Cyan (#06B6D4) & Purple (#8B5CF6) — Stream badges, flow state highlights
Border Radius:      0.75rem (shadcn default --radius: 0.75rem)
Card Styling:       bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 shadow-2xl
Typography:         Inter / Geist Sans with JetBrains Mono for Study IDs and timestamps
```

### Tailwind Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          indigo: '#6366F1',
          purple: '#8B5CF6',
          fuchsia: '#D946EF',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        midnight: '#07090E',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        auroraFloat1: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(80px, 60px) scale(1.1)' },
          '100%': { transform: 'translate(-40px, 90px) scale(0.95)' },
        },
        auroraFloat2: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-70px, -50px) scale(1.15)' },
          '100%': { transform: 'translate(50px, -80px) scale(0.9)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'aurora-1': 'auroraFloat1 22s ease-in-out infinite alternate',
        'aurora-2': 'auroraFloat2 25s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### shadcn/ui Component Inventory Mapping

Each user-facing view is mapped to its primitive shadcn/ui components:

| Page / Feature | shadcn/ui Components Used | Purpose & Responsibilities |
|---|---|---|
| **Landing Page** | `Button`, `Card`, `Badge`, `Separator`, `Avatar`, `Skeleton` | Hero showcase, "Continue with Google" action, Bento feature grid, live ID pass preview |
| **Registration Form** | `Card`, `Input`, `Label`, `Select`, `Command`, `Popover`, `Button` | 1-time onboarding: locked Google email, 270+ Sri Lankan school searchable combobox, stream selector |
| **Student Dashboard** | `Card`, `Progress`, `Table`, `Badge`, `Dialog`, `Button`, `Skeleton` | Personal stats grid, study streak counter, subject distribution bars, interactive history table with photo viewer modal |
| **Daily Study Form** | `Card`, `Input`, `Slider`, `Textarea`, `Button`, `Badge` | Stream-aware 3-subject inputs, quick hour buttons, custom gradient focus/productivity sliders, client photo compression |
| **Apple Wallet ID Pass** | Custom Canvas 2D, `Button`, `Badge`, `Dialog` | 3D CSS tilt interactive card, QR code rendering, 3x high-resolution PNG exporter (1440x906px) |
| **Admin Dashboard** | `Tabs`, `Table`, `Dialog`, `Select`, `Input`, `Progress`, `Badge`, `Button` | Whitelist-gated hub: Group Analytics, Member Directory with inline editor & CSV export, Global Logs with full photo previews |
| **Verify Endpoint** | `Card`, `Input`, `Button`, `Badge`, `Skeleton` | Public `#verify/:id` and `/verify?id=...` anti-counterfeit record verification |
| **Global Layout** | `NavigationMenu`, `DropdownMenu`, `Sonner`, `Avatar`, `Separator` | Sticky navigation header with user profile pill & streak display, footer with live cloud sync badge |

---

## 6. Domain Modules & Canvas Rendering Porting Strategy

### 1. `src/lib/api.ts` — Typed ApiClient Engine
Port `src/js/api.js` to a strongly typed TypeScript singleton `ApiClient`:
- **Interface Contract**: Implements all 7 authoritative endpoints: `checkUser`, `registerUser`, `submitDailyLog`, `getStudentHistory`, `verifyMember`, `getAdminData`, `getAnalytics`, plus profile update methods.
- **Request Strategy**: Uses `fetch` with `options.headers['Content-Type'] = 'text/plain;charset=utf-8'` when communicating with `script.google.com` (avoiding CORS options preflights and Apps Script redirect limitations).
- **Mock Fallback**: Uses `application/json` when targeting local mock servers or custom endpoints.
- **Timeout & Abort**: Built-in 30-second `AbortController` timeout for resilient network error handling.

### 2. `src/lib/schools.ts` — 270+ Schools Dataset
Port `src/js/schools.js` into typed structures:
- `SRI_LANKAN_SCHOOLS`: Comprehensive array of school objects `{ id, name, district, province, gender, type }` covering all 9 Provinces and 25 Districts.
- Search algorithm: Fuzzy keyword and substring matcher for the shadcn `Command` palette.

### 3. `src/lib/qr.ts` — Pure TypeScript QR Engine
Port `src/js/qr.js` into modular TypeScript utilities:
- `generateQrMatrix(text, errorCorrectionLevel)`: Computes QR matrix byte array.
- `generateQrPayload(member)`: Creates dual-payload encoding:
  - Payload 1: Live public verification URL (`https://studysync-al-2026.web.app/verify.html?id=STUDY_ID`)
  - Payload 2: Embedded offline cryptographic JSON metadata for offline scanning.

### 4. `src/lib/idcard.ts` & `src/components/idcard/id-card-preview.tsx` — Apple Wallet Canvas Renderer
Port `src/js/idcard.js` to a React canvas component:
- **Card Dimensions**: `480x302px` at 1x for interactive UI preview; `1440x906px` at 3x scale (300 DPI) for crisp image downloads.
- **Visual Features**: Metallic dark gradient background, gold EMV smart chip graphic, contactless NFC emblem, high-contrast QR code container, anti-counterfeit microtext ribbon, and glowing active status pill.
- **Interactive 3D Tilt**: Framer Motion pointer-tracking tilt physics with subtle specular glare overlay.
- **Export Pipeline**: Canvas 2D `toBlob()` generating high-resolution PNG files (`StudySync_ID_STUDY_ID.png`).

### 5. `src/lib/utils.ts` — Analytics & Image Pipeline
- **Streak Calculation Algorithm**: `calculateStreak(logs)` traversing unique study dates backward with yesterday grace period support and longest streak calculation.
- **Personal Metrics Rollup**: `calculateStats(logs)` aggregating total hours, subject breakdowns, average focus, and average productivity.
- **Client-Side Image Compression**: `compressImage(file, maxDimension=1600, quality=0.75)` using off-screen HTML5 Canvas to downscale and compress proof photos to JPEG (< 400KB base64) before transmission.
- **RFC 4180 CSV Engine**: `generateCsvString(headers, rows)` and `downloadCsvFile(filename, content)` for member directory and daily log data exports.

### 6. `src/components/forms/gradient-slider.tsx` — Custom Dual Slider
Port `src/js/slider.js` to a controlled React slider component:
- Continuous 1 to 10 integer slider for Focus and Productivity.
- Dynamic color transitions: Danger Red (1-3) -> Warning Yellow (4-6) -> Success Emerald (7-8) -> Deep Flow State Purple/Cyan (9-10).
- Dynamic tier badge display with contextual emoji indicators.

---

## 7. Project Directory Layout

The Next.js 14 App Router project structure is organized under `src/`:

```
c:\Users\alwis\Documents\antigravity\dazzling-bardeen\
├── package.json                      # Project dependencies & npm scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── next.config.mjs                   # Next.js static export configuration
├── tailwind.config.ts                # Tailwind CSS v3/v4 design tokens
├── postcss.config.mjs                # PostCSS configuration
├── components.json                   # shadcn/ui configuration schema
├── firebase.json                     # Firebase Hosting static routing & headers
├── .firebaserc                       # Firebase project binding (studysync-al-2026)
├── public/                           # Static public assets (favicons, icons, manifest)
│   ├── favicon.ico
│   └── verify.html                   # Static fallback entry for verify QR codes
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with <Script> Firebase CDN & AuthProvider
│   │   ├── page.tsx                  # Root landing page (Hero, Sign-In, Bento grid)
│   │   ├── globals.css               # Theme variables, aurora keyframes, noise overlay
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Student Dashboard route
│   │   ├── daily/
│   │   │   └── page.tsx              # Daily Study Logging Form route
│   │   ├── register/
│   │   │   └── page.tsx              # Member Registration route
│   │   ├── admin/
│   │   │   └── page.tsx              # Whitelist-gated Admin Dashboard route
│   │   └── verify/
│   │       └── page.tsx              # Public Member Verification route (Suspense wrapped)
│   ├── components/
│   │   ├── ui/                       # shadcn/ui component primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── command.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── label.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── slider.tsx
│   │   ├── layout/                   # Layout wrappers
│   │   │   ├── header.tsx            # Sticky header with user profile & streak pill
│   │   │   ├── footer.tsx            # Application footer with cloud status
│   │   │   └── aurora-background.tsx # 4-orb animated gradient background
│   │   ├── idcard/                   # ID Pass components
│   │   │   ├── id-card-preview.tsx   # Canvas 2D Apple Wallet pass with 3D tilt
│   │   │   └── qr-code-canvas.tsx    # Dual-payload canvas QR renderer
│   │   ├── forms/                    # Specialized form components
│   │   │   ├── gradient-slider.tsx   # 1-10 Focus & Productivity dual slider
│   │   │   ├── school-combobox.tsx   # 270+ school searchable Command autocomplete
│   │   │   └── photo-uploader.tsx    # Canvas-compressed photo upload component
│   │   ├── dashboard/                # Dashboard subcomponents
│   │   │   ├── stats-bento-grid.tsx  # Personal KPIs & streak card
│   │   │   ├── history-table.tsx     # Past daily study submissions table
│   │   │   └── today-status-card.tsx # Today's study CTA / read-only summary
│   │   └── admin/                    # Admin subcomponents
│   │       ├── analytics-tab.tsx     # Group KPIs, stream breakdown, leaderboard
│   │       ├── members-tab.tsx       # Member directory with search & CSV export
│   │       └── logs-tab.tsx          # Global daily logs with photo preview modal
│   ├── context/
│   │   ├── auth-context.tsx          # Firebase Auth state & session persistence
│   │   └── app-context.tsx           # Global state store (member, todayLog, history)
│   ├── hooks/
│   │   ├── use-auth.ts               # Custom hook for auth operations
│   │   ├── use-app-state.ts          # Custom hook for app data
│   │   └── use-id-card.ts            # Custom hook for ID card canvas export
│   ├── lib/
│   │   ├── utils.ts                  # cn(), date helpers, streak math, image compression
│   │   ├── api.ts                    # Strongly typed ApiClient engine
│   │   ├── schools.ts                # 270+ Sri Lankan schools dataset
│   │   ├── qr.ts                     # TypeScript QR code matrix generator
│   │   └── idcard.ts                 # Canvas 2D ID card drawing engine
│   └── types/
│       ├── index.ts                  # Domain models (Member, DailyLog, Stats, Leaderboard)
│       ├── api.ts                    # API payload and response envelope types
│       └── firebase.d.ts             # Global Firebase window augmentation
├── backend/                          # Google Apps Script Web App (Preserved)
│   ├── Code.gs
│   └── appsscript.json
├── server/                           # Node.js Express Mock Server (Preserved)
│   └── mock-server.js
└── tests/                            # Master E2E Test Suite (Preserved, 327 tests)
    ├── e2e-runner.js
    ├── test-harness.js
    ├── tier1-feature.test.js
    ├── tier2-boundary.test.js
    ├── tier3-pairwise.test.js
    ├── tier4-scenarios.test.js
    └── tier5-adversarial.test.js
```

---

## 8. Test Infrastructure & Verification Architecture

The test infrastructure employs a 4-layer verification hierarchy to guarantee both backward compatibility with existing business logic and high visual/functional quality in the Next.js rebuild:

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: Domain Invariants & E2E Master Test Suite     │
│ (tests/e2e-runner.js: 327 tests across Tiers 1 to 5)   │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: Next.js Static Export & TypeScript Validation │
│ (npm run build -> next build + tsc --noEmit)           │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: Component & Hook Unit Testing                 │
│ (Vitest + React Testing Library)                       │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: Live Deployment Verification                  │
│ (firebase deploy --only hosting -> Live URL smoke test)│
└────────────────────────────────────────────────────────┘
```

### Verification Commands & Pass Criteria

1. **Existing Master Test Runner**:
   ```bash
   node tests/e2e-runner.js
   ```
   - Criteria: **327/327 tests passing (100%)**, zero failures across Tiers 1-5.

2. **TypeScript & Static Build Gate**:
   ```bash
   npm run build
   ```
   - Criteria: `next build` compiles with **0 TypeScript errors**, generates static assets in `out/`, and exports static HTML for all routes (`/`, `/dashboard`, `/daily`, `/register`, `/admin`, `/verify`).

3. **Firebase Hosting Preview & Verification**:
   ```bash
   npx firebase-tools serve --only hosting
   ```
   - Criteria: All routes load cleanly from `out/` with zero layout shift (CLS = 0) and working client navigation.

---

## 9. Phased Implementation Roadmap

| Phase | Milestone Name | Key Deliverables | Verification Gate |
|---|---|---|---|
| **Phase 1** | Scaffolding & Config | `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `components.json`, `globals.css` | `npm install` clean, PostCSS config passes |
| **Phase 2** | shadcn/ui & Libs Port | Install shadcn/ui components (`button`, `card`, `dialog`, `table`, `tabs`, `command`, `select`, `input`, `textarea`, `progress`, `badge`, `sonner`, `avatar`, `skeleton`), port `api.ts`, `schools.ts`, `qr.ts`, `idcard.ts`, `utils.ts` | Typecheck passes, unit tests verify ported helpers |
| **Phase 3** | Contexts & Shell | `auth-context.tsx`, `app-context.tsx`, `layout.tsx` with `<Script>` Firebase compat tags, `header.tsx`, `footer.tsx`, `aurora-background.tsx` | Firebase Auth initialization and silent session restore validated |
| **Phase 4** | Feature Pages Rebuild | Rebuild Landing, Register (with School Combobox), Student Dashboard, Daily Study Form (with dual sliders & canvas photo compression), Admin Dashboard (with Tabs & CSV export), and Verify page | Manual interactive flow & scenario testing |
| **Phase 5** | Static Export & E2E Validation | Run `next build` (`output: 'export'`), verify `out/` static bundle, execute `node tests/e2e-runner.js` (327 tests) | 327/327 tests pass, zero TypeScript build errors |
| **Phase 6** | Firebase Deploy & Live Verification | Update `firebase.json` (`public: "out"`), run `firebase deploy --only hosting`, verify live URL `https://studysync-al-2026.web.app` | Live Google Sign-In, Apps Script sync, and QR scanning verified |

---

## 10. Conclusion & Recommendations

The architecture survey confirms that rebuilding StudySync with **Next.js 14 App Router (Static Export)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** is completely feasible, highly performant, and fully compatible with the existing Firebase Auth and Google Apps Script infrastructure.

Key recommendations for the implementation phase:
1. **Preserve exact API payload structures and `Content-Type: text/plain;charset=utf-8`** in `src/lib/api.ts` to ensure flawless communication with Google Apps Script.
2. **Wrap `/verify` in `<Suspense>`** to accommodate `useSearchParams()` during static generation without build errors.
3. **Use `strategy="beforeInteractive"`** for Firebase compat scripts in `layout.tsx` alongside an async readiness check in `AuthContext` to prevent race conditions during cold page loads.
4. **Maintain the Apple Wallet ID Card canvas coordinate math exactly** (`480x302` base, `1440x906` 3x export) to guarantee crisp, scannable QR passes.
