# Milestone 1: Project Scaffolding & Foundation Implementation Plan

## 1. Executive Summary & Architecture Overview

This implementation plan provides the complete, production-ready scaffolding blueprint for **Milestone 1: Project Scaffolding & Foundation** of the StudySync Sri Lankan A/L study accountability web app.

### Core Architecture
- **Framework**: Next.js 14 App Router (`src/app/`)
- **Language**: TypeScript (`strict: true`, ES2022) with `@/*` mapping to `./src/*`
- **Build Target**: Static Export (`output: 'export'`, `distDir: 'out'`, `images: { unoptimized: true }`)
- **Hosting Target**: Firebase Hosting (`firebase.json` with `"public": "out"`, preserving rewrites and headers)
- **Styling**: Tailwind CSS with custom dark zinc/slate tokens (`#07090e`, `bg-zinc-900/50`, `backdrop-blur-xl`, `border-zinc-800/60`)
- **Component Primitives**: shadcn/ui on top of Radix UI primitives, Lucide React icons, and Sonner notifications
- **Animation System**: Framer Motion + 60fps GPU-accelerated CSS keyframe aurora mesh gradients and `200ms cubic-bezier(0.16, 1, 0.3, 1)` micro-interactions
- **Typography**: SF Pro Display (`cdnfonts`), Product Sans (`cdnfonts`), JetBrains Mono, Plus Jakarta Sans, Inter
- **Integrity**: Preserves existing test runner (`node tests/e2e-runner.js`), backend mock server, and dependencies (`cors`, `express`)

---

## 2. Complete `package.json` Configuration

The `package.json` preserves existing dependencies (`cors`, `express`) and test scripts while adding Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui Radix primitives, Framer Motion, Lucide icons, and Sonner.

```json
{
  "name": "studysync-al",
  "version": "1.0.0",
  "description": "Sri Lankan A/L Daily Study Tracking & Member Management Web Application",
  "type": "module",
  "main": "src/js/app.js",
  "scripts": {
    "dev": "next dev",
    "dev:mock": "node server/mock-server.js",
    "build": "next build",
    "start": "next start",
    "start:mock": "node server/mock-server.js",
    "lint": "next lint",
    "test": "node --test tests/*.test.js",
    "test:e2e": "node tests/e2e-runner.js",
    "serve": "npx serve -l 3000 out"
  },
  "keywords": [
    "studysync",
    "sri-lanka",
    "al-exams",
    "study-tracker",
    "firebase",
    "apps-script",
    "apple-design"
  ],
  "author": "StudySync Team",
  "license": "MIT",
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "framer-motion": "^11.5.4",
    "lucide-react": "^0.441.0",
    "next": "14.2.24",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4"
  }
}
```

---

## 3. Next.js Configuration (`next.config.mjs`)

Configures Next.js 14 for static HTML/CSS/JS export to `out/` with unoptimized images (compatible with static hosting without Node.js runtime).

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

---

## 4. TypeScript Configuration (`tsconfig.json`)

Provides strict type-checking, JSX preservation for Next.js, and path mapping `@/*` to `./src/*`. Excludes non-Next directories (`backend`, `tests`, `server`, `.agents`, `out`) from compiler passes to ensure high build speeds and clean separation.

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "target": "ES2022"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out", "backend", "tests", "server", ".agents"]
}
```

---

## 5. Firebase Hosting Configuration (`firebase.json`)

Updates `public` to `"out"` to deploy static export artifacts generated by Next.js, while retaining all URL rewrites (such as `/verify/**` to `/verify.html` and SPA fallback `**` to `/index.html`) and cache-control security headers.

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

## 6. Tailwind CSS & PostCSS Configuration

### `postcss.config.mjs`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Product Sans"',
          '"Google Sans"',
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        display: [
          '"Product Sans"',
          '"SF Pro Display"',
          '"Google Sans"',
          '"Plus Jakarta Sans"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        midnight: "#07090E",
        surface: "rgba(13, 17, 26, 0.85)",
        card: {
          DEFAULT: "rgba(19, 27, 42, 0.65)",
          foreground: "hsl(var(--card-foreground))",
        },
        accent: {
          indigo: "#6366F1",
          purple: "#8B5CF6",
          fuchsia: "#D946EF",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        auroraFloat1: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(80px, 60px, 0) scale(1.15)" },
          "100%": { transform: "translate3d(-60px, 120px, 0) scale(0.95)" },
        },
        auroraFloat2: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-100px, -50px, 0) scale(1.1)" },
          "100%": { transform: "translate3d(50px, 80px, 0) scale(0.9)" },
        },
        auroraFloat3: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(60px, -80px, 0) scale(1.2)" },
          "100%": { transform: "translate3d(-50px, -40px, 0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora1: "auroraFloat1 22s ease-in-out infinite alternate",
        aurora2: "auroraFloat2 26s ease-in-out infinite alternate",
        aurora3: "auroraFloat3 20s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 7. shadcn/ui Configuration (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 8. Styling Tokens & Aurora Keyframes (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 224 71% 4%;
    --foreground: 210 40% 98%;

    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;

    --primary: 239 84% 67%;
    --primary-foreground: 210 40% 98%;

    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;

    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;

    --border: 217 33% 18%;
    --input: 217 33% 18%;
    --ring: 239 84% 67%;

    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    @apply bg-[#07090E] text-slate-100 antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
  body {
    @apply bg-[#07090E] text-slate-100 min-h-screen relative overflow-x-hidden;
  }
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(7, 9, 14, 0.7);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
  background-clip: content-box;
}

/* Aurora Mesh Background */
.aurora-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.aurora-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  opacity: 0.35;
  will-change: transform;
}

.aurora-orb-1 {
  width: 550px;
  height: 550px;
  top: -120px;
  left: -100px;
  background: radial-gradient(circle, #6366f1 0%, #4338ca 60%, transparent 80%);
  animation: auroraFloat1 22s ease-in-out infinite alternate;
}

.aurora-orb-2 {
  width: 650px;
  height: 650px;
  top: 30%;
  right: -150px;
  background: radial-gradient(circle, #8b5cf6 0%, #6d28d9 60%, transparent 80%);
  animation: auroraFloat2 26s ease-in-out infinite alternate;
}

.aurora-orb-3 {
  width: 500px;
  height: 500px;
  bottom: -100px;
  left: 20%;
  background: radial-gradient(circle, #06b6d4 0%, #0369a1 60%, transparent 80%);
  animation: auroraFloat3 20s ease-in-out infinite alternate;
}

.aurora-orb-4 {
  width: 400px;
  height: 400px;
  top: 60%;
  left: 50%;
  background: radial-gradient(circle, #d946ef 0%, #a21caf 60%, transparent 80%);
  animation: auroraFloat1 28s ease-in-out infinite alternate-reverse;
  opacity: 0.22;
}

/* Procedural Noise Overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}

/* Glassmorphism Classes */
.glass-card {
  background: rgba(19, 27, 42, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.glass-panel {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}

/* Reduced Motion Override */
@media (prefers-reduced-motion: reduce) {
  .aurora-orb {
    animation: none !important;
  }
}
```

---

## 9. Root Layout Architecture (`src/app/layout.tsx`)

Configures typography fonts, Firebase Auth compat scripts, metadata, Sonner Toaster, and global layout shell:

```tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySync — Sri Lanka A/L Study Accountability",
  description: "Sri Lanka G.C.E. Advanced Level (A/L) Daily Study Tracking & Member Accountability Web Application",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/product-sans" rel="stylesheet" />
      </head>
      <body className="bg-[#07090E] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200 relative">
        {/* Firebase Compat SDK */}
        <Script
          src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"
          strategy="beforeInteractive"
        />

        {/* Aurora Mesh Background */}
        <AuroraBackground />

        {/* Global Navigation Header */}
        <Header />

        {/* Main Application Content */}
        <main className="flex-1 relative z-10">{children}</main>

        {/* Global Footer */}
        <Footer />

        {/* Sonner Toast Notifications */}
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
```

---

## 10. Foundation Layout Components

### `src/components/layout/AuroraBackground.tsx`
```tsx
"use client";

import React from "react";

export function AuroraBackground() {
  return (
    <>
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        <div className="aurora-orb aurora-orb-4" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />
    </>
  );
}
```

### `src/components/layout/Header.tsx`
```tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, User, LogIn, Award } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              StudySync <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest ml-1">A/L</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium -mt-1">Sri Lanka 2026</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-white">
            Dashboard
          </Link>
          <Link href="/daily" className="transition-colors hover:text-white">
            Daily Log
          </Link>
          <Link href="/id-card" className="transition-colors hover:text-white">
            ID Card
          </Link>
          <Link href="/verify" className="transition-colors hover:text-white">
            Verify
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link href="/register">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 rounded-lg px-4 h-9 font-medium transition-all"
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### `src/components/layout/Footer.tsx`
```tsx
import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md py-8 text-xs text-zinc-500 relative z-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>StudySync Accountability Platform &copy; 2026</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <Link href="/verify" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> ID Verification Portal
          </Link>
          <span>&bull;</span>
          <span>Made with dedication for Sri Lankan A/L Students</span>
        </div>
      </div>
    </footer>
  );
}
```

---

## 11. Utilities (`src/lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 12. Landing Page Placeholder (`src/app/page.tsx`)

```tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, ShieldCheck, Flame, BookOpen, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8 max-w-6xl mx-auto py-24">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> G.C.E. Advanced Level 2026
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white font-display">
          Elevate Your A/L Study <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Accountability</span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Track daily study hours across Biological and Physical Science streams, maintain uninterrupted study streaks, and earn your digital Apple Wallet-grade student credential.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-xl shadow-indigo-600/30 rounded-xl px-6 h-12">
              Continue with Google <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/verify">
            <Button size="lg" variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 rounded-xl px-6 h-12">
              <ShieldCheck className="mr-2 h-4 w-4" /> Verify ID
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
        <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Flame className="h-5 w-5" />
            </div>
            <CardTitle className="text-white text-lg">Streak & Focus Tracking</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Log daily subject hours, focus and productivity ratings with instant streak calculations.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle className="text-white text-lg">Stream Specialization</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Tailored workflows for Biological and Physical Science streams with 306 Sri Lankan schools.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
              <Clock className="h-5 w-5" />
            </div>
            <CardTitle className="text-white text-lg">Apple Wallet Digital ID</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              High-resolution 3D holographic digital ID cards embedded with scannable QR verification.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
```

---

## 13. UI Component Primitives Registry (shadcn/ui)

The following components will be placed in `src/components/ui/`:
1. `button.tsx` (using `@radix-ui/react-slot` & `class-variance-authority`)
2. `card.tsx`
3. `dialog.tsx` (using `@radix-ui/react-dialog`)
4. `table.tsx`
5. `tabs.tsx` (using `@radix-ui/react-tabs`)
6. `select.tsx` (using `@radix-ui/react-select`)
7. `input.tsx`
8. `textarea.tsx`
9. `progress.tsx` (using `@radix-ui/react-progress`)
10. `badge.tsx` (using `class-variance-authority`)
11. `sonner.tsx` (using `sonner`)
12. `navigation-menu.tsx` (using `@radix-ui/react-navigation-menu`)
13. `popover.tsx` (using `@radix-ui/react-popover`)
14. `avatar.tsx` (using `@radix-ui/react-avatar`)
15. `skeleton.tsx`
16. `separator.tsx` (using `@radix-ui/react-separator`)
17. `label.tsx` (using `@radix-ui/react-label`)
18. `tooltip.tsx` (using `@radix-ui/react-tooltip`)
19. `command.tsx` (using `cmdk`)

---

## 14. Verification and Validation Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build & Static Export Validation
```bash
npm run build
```
Verification checks:
- Exits with returncode `0`
- Zero TypeScript compilation errors
- `out/` directory generated with static `.html`, `.js`, and `.css` bundles

### Step 3: Run Master E2E Test Suite
```bash
node tests/e2e-runner.js
```
Verification checks:
- 327/327 tests pass across Tiers 1-5
- Zero regressions in existing domain logic
