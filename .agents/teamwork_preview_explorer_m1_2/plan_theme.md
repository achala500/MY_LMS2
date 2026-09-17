# Milestone 1: Theme, Design Tokens & Layout Architecture Plan

**Target Application**: StudySync Sri Lankan A/L Accountability Web App Rebuild  
**Stack**: Next.js 14 App Router (Static Export `output: 'export'`) + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + Framer Motion  
**Design Grade**: Apple & Google Showcase Grade Dark Mode Aesthetics  
**Date**: 2026-08-26  

---

## 1. Executive Summary

This document specifies the exact visual theme, CSS design tokens, Tailwind configuration, GPU-accelerated animated Aurora background, and core layout components (`Header.tsx`, `Footer.tsx`, `AuroraBackground.tsx`) for Milestone 1.

### Key Architectural Principles
1. **Dark Zinc/Slate Canvas**: Primary canvas is deep `#07090e` (midnight), elevated surfaces use `zinc-900/50` to `zinc-900/80` with `backdrop-blur-xl` and subtle borders `border-zinc-800/60` (`rgba(255, 255, 255, 0.08)`).
2. **Intentional Accent Color Rule**:
   - **Indigo (`#6366f1`)**: Primary CTAs, active focus rings, key interactive elements.
   - **Emerald (`#10b981`)**: Active streaks, completed status, sync healthy indicator.
   - **Amber (`#f59e0b`)**: Pending daily log alerts, warning states, admin badges.
   - **Rose (`#ef4444`)**: Danger, delete, streak broken, missing submission alerts.
   - **Cyan (`#06b6d4`)**: Flow state (9-10/10 focus), technology badges, verify links.
   - **Purple (`#8b5cf6`) / Fuchsia (`#d946ef`)**: Brand logo gradient, Apple Wallet card accents.
3. **Typography Stack**:
   - Headings & Primary UI: `'SF Pro Display'`, `'Product Sans'`, `'Google Sans'`, `'Plus Jakarta Sans'`, `'Inter'`, `-apple-system`, `sans-serif`
   - Numeric & Code/IDs: `'JetBrains Mono'`, `monospace`
4. **Motion & Interaction Physics**:
   - 60fps hardware-accelerated animations using `translate3d` and `will-change: transform`.
   - Apple-style ease: `cubic-bezier(0.16, 1, 0.3, 1)` with 200ms-300ms micro-interactions.
   - Subtle Aurora mesh background dialed to 0.3-0.4 opacity with procedural noise grain overlay.

---

## 2. Design Token System & Mapping

| Semantic Role | Hex Code | HSL Representation | Tailwind Utility Class | CSS Custom Variable |
|---|---|---|---|---|
| Canvas Background | `#07090e` | `228 33% 4.1%` | `bg-midnight` / `bg-background` | `--background`, `--bg-canvas` |
| Foreground / Text | `#f8fafc` | `210 40% 98%` | `text-slate-50` / `text-foreground` | `--foreground` |
| Elevated Card Surface | `rgba(19, 27, 42, 0.65)` | `222 47% 11%` | `bg-card` / `bg-zinc-900/50` | `--card`, `--bg-card` |
| Surface Subtle | `rgba(13, 17, 26, 0.85)` | `222 40% 8%` | `bg-surface` | `--bg-surface` |
| Border Subtle | `rgba(255, 255, 255, 0.08)` | `217 33% 18%` | `border-border` / `border-zinc-800/60` | `--border`, `--border-subtle` |
| Primary (Indigo) | `#6366f1` | `239 84% 67%` | `bg-primary`, `text-primary`, `accent-indigo` | `--primary`, `--accent-indigo` |
| Primary Hover | `#4f46e5` | `243 75% 59%` | `hover:bg-indigo-600` | `--primary-hover` |
| Success (Emerald) | `#10b981` | `160 84% 39%` | `text-emerald-400`, `bg-emerald-500` | `--accent-emerald` |
| Warning (Amber) | `#f59e0b` | `38 92% 50%` | `text-amber-400`, `bg-amber-500` | `--accent-amber` |
| Destructive (Rose) | `#ef4444` | `350 89% 60%` | `bg-destructive`, `text-rose-400` | `--destructive`, `--accent-rose` |
| Focus / Flow (Cyan) | `#06b6d4` | `189 94% 43%` | `text-cyan-400`, `bg-cyan-500` | `--accent-cyan` |
| Creative (Purple) | `#8b5cf6` | `258 90% 66%` | `text-purple-400`, `bg-purple-500` | `--accent-purple` |
| Vibrant (Fuchsia) | `#d946ef` | `292 84% 61%` | `text-fuchsia-400`, `bg-fuchsia-500` | `--accent-fuchsia` |
| Default Radius | `0.75rem` (12px) | - | `rounded-lg` / `rounded-xl` | `--radius` |

---

## 3. Exact Code: `src/app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
@import url('https://fonts.cdnfonts.com/css/sf-pro-display');
@import url('https://fonts.cdnfonts.com/css/product-sans');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Shadcn/UI Base Design Tokens in HSL */
    --background: 228 33% 4.1%;       /* #07090e */
    --foreground: 210 40% 98%;        /* #f8fafc */

    --card: 222 47% 9%;               /* #0d121f */
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 9%;
    --popover-foreground: 210 40% 98%;

    --primary: 239 84% 67%;           /* #6366f1 Indigo 500 */
    --primary-foreground: 0 0% 100%;

    --secondary: 217 33% 15%;         /* #182234 */
    --secondary-foreground: 210 40% 98%;

    --muted: 217 33% 14%;
    --muted-foreground: 215 20% 65%;  /* #94a3b8 */

    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;

    --destructive: 350 89% 60%;       /* #ef4444 Rose 500 */
    --destructive-foreground: 0 0% 100%;

    --border: 217 33% 18%;            /* rgba(255, 255, 255, 0.08) */
    --input: 217 33% 18%;
    --ring: 239 84% 67%;              /* #6366f1 */

    --radius: 0.75rem;

    /* Direct Theme Tokens */
    --bg-canvas: #07090e;
    --bg-surface: rgba(13, 17, 26, 0.85);
    --bg-card: rgba(19, 27, 42, 0.65);
    --bg-elevated: rgba(24, 34, 54, 0.9);

    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-focus: rgba(99, 102, 241, 0.5);
    --border-glass: rgba(255, 255, 255, 0.12);

    --accent-indigo: #6366f1;
    --accent-purple: #8b5cf6;
    --accent-fuchsia: #d946ef;
    --accent-cyan: #06b6d4;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #ef4444;

    --font-sans: 'SF Pro Display', 'SF Pro Text', 'Product Sans', 'Google Sans', 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-display: 'Product Sans', 'SF Pro Display', 'Google Sans', sans-serif;
    --font-mono: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    background-color: #07090e;
    color: #f8fafc;
    font-family: var(--font-sans);
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body {
    min-height: 100vh;
    background-color: #07090e;
    overflow-x: hidden;
    position: relative;
    selection-background-color: rgba(99, 102, 241, 0.3);
    selection-color: #e0e7ff;
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

/* ==========================================================================
   Aurora 4-Orb Mesh Keyframes & Floating Animations
   ========================================================================== */
@keyframes aurora-1 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(80px, 60px, 0) scale(1.15); }
  100% { transform: translate3d(-60px, 120px, 0) scale(0.95); }
}

@keyframes aurora-2 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-100px, -50px, 0) scale(1.1); }
  100% { transform: translate3d(50px, 80px, 0) scale(0.9); }
}

@keyframes aurora-3 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(60px, -80px, 0) scale(1.2); }
  100% { transform: translate3d(-50px, -40px, 0) scale(1); }
}

@keyframes aurora-4 {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-70px, 50px, 0) scale(1.1); }
  100% { transform: translate3d(60px, -60px, 0) scale(0.95); }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ==========================================================================
   Glassmorphic & Apple Design System Utilities
   ========================================================================== */
.glass-panel {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}

.glass-card {
  background: rgba(19, 27, 42, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  border-radius: 0.75rem;
}

.glass-card-hover {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card-hover:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 16px 40px -10px rgba(99, 102, 241, 0.22);
}

.glass-input {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-input:focus {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 0 20px rgba(99, 102, 241, 0.2);
  outline: none;
}

.apple-gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.apple-gradient-accent {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.apple-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  font-weight: 600;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
}

.apple-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(99, 102, 241, 0.5);
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.apple-btn-primary:active {
  transform: translateY(0);
}

.apple-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  font-weight: 500;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
}

.apple-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* ==========================================================================
   Apple Wallet ID Card 3D Perspective & EMV Chip
   ========================================================================== */
.wallet-card-container {
  perspective: 1000px;
}

.wallet-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1.586 / 1;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #0a0e1a 0%, #1e1b4b 50%, #311042 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 50px -10px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
  transform-style: preserve-3d;
}

.wallet-card:hover {
  transform: translateY(-4px) rotateX(3deg) rotateY(-3deg);
  box-shadow: 0 30px 70px -10px rgba(139, 92, 246, 0.45), 0 0 30px rgba(99, 102, 241, 0.2);
}

.card-emv-chip {
  width: 44px;
  height: 34px;
  background: linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #d4af37 100%);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  position: relative;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 5px rgba(0, 0, 0, 0.4);
}

.card-emv-chip::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  background: repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 7px);
}

.card-hologram-seal {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(217, 70, 239, 0.3) 50%, rgba(245, 158, 11, 0.3) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
}
```

---

## 4. Exact Code: `tailwind.config.ts`

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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        midnight: "#07090E",
        surface: "rgba(13, 17, 26, 0.85)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "#4f46e5",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          indigo: "#6366F1",
          purple: "#8B5CF6",
          fuchsia: "#D946EF",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Product Sans"',
          '"Google Sans"',
          '"Plus Jakarta Sans"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: ['"Product Sans"', '"SF Pro Display"', '"Google Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "SFMono-Regular", "Menlo", "monospace"],
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
        "aurora-1": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(80px, 60px, 0) scale(1.15)" },
          "100%": { transform: "translate3d(-60px, 120px, 0) scale(0.95)" },
        },
        "aurora-2": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-100px, -50px, 0) scale(1.1)" },
          "100%": { transform: "translate3d(50px, 80px, 0) scale(0.9)" },
        },
        "aurora-3": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(60px, -80px, 0) scale(1.2)" },
          "100%": { transform: "translate3d(-50px, -40px, 0) scale(1)" },
        },
        "aurora-4": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-70px, 50px, 0) scale(1.1)" },
          "100%": { transform: "translate3d(60px, -60px, 0) scale(0.95)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora-1": "aurora-1 22s ease-in-out infinite alternate",
        "aurora-2": "aurora-2 26s ease-in-out infinite alternate",
        "aurora-3": "aurora-3 20s ease-in-out infinite alternate",
        "aurora-4": "aurora-4 28s ease-in-out infinite alternate-reverse",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "apple-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 5. Layout Component Specifications

### 5.1 `src/components/layout/AuroraBackground.tsx`

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showNoise?: boolean;
}

/**
 * AuroraBackground
 * High-performance 60fps GPU-accelerated animated 4-orb mesh gradient background
 * with procedural subtle grain noise overlay and Apple/Google showcase grade aesthetics.
 */
export function AuroraBackground({
  children,
  className,
  showNoise = true,
}: AuroraBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen w-full bg-[#07090E]', className)}>
      {/* 1. Aurora Background Mesh Layer */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none z-0"
        aria-hidden="true"
      >
        {/* Orb 1: Indigo / Blue-Violet */}
        <div
          className="absolute -top-[120px] -left-[100px] w-[550px] h-[550px] rounded-full blur-[80px] opacity-35 animate-aurora-1 will-change-transform"
          style={{
            background:
              'radial-gradient(circle, #6366f1 0%, #4338ca 60%, transparent 80%)',
          }}
        />

        {/* Orb 2: Purple / Violet */}
        <div
          className="absolute top-[30%] -right-[150px] w-[650px] h-[650px] rounded-full blur-[80px] opacity-35 animate-aurora-2 will-change-transform"
          style={{
            background:
              'radial-gradient(circle, #8b5cf6 0%, #6d28d9 60%, transparent 80%)',
          }}
        />

        {/* Orb 3: Cyan / Deep Sky */}
        <div
          className="absolute -bottom-[100px] left-[20%] w-[500px] h-[500px] rounded-full blur-[80px] opacity-30 animate-aurora-3 will-change-transform"
          style={{
            background:
              'radial-gradient(circle, #06b6d4 0%, #0369a1 60%, transparent 80%)',
          }}
        />

        {/* Orb 4: Fuchsia / Pink Accent */}
        <div
          className="absolute top-[60%] left-[50%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-25 animate-aurora-4 will-change-transform"
          style={{
            background:
              'radial-gradient(circle, #d946ef 0%, #a21caf 60%, transparent 80%)',
          }}
        />
      </div>

      {/* 2. Procedural Grain Noise Overlay */}
      {showNoise && (
        <div
          className="fixed inset-0 pointer-events-none z-[1] opacity-40 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:24px_24px]"
          aria-hidden="true"
        />
      )}

      {/* 3. Foreground Page Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}

export default AuroraBackground;
```

---

### 5.2 `src/components/layout/Header.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardPen,
  History,
  Shield,
  CreditCard,
  Flame,
  LogOut,
  LogIn,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface HeaderUserProps {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface HeaderMemberProps {
  studyId?: string;
  fullName?: string;
  streakCount?: number;
  role?: string;
}

interface HeaderProps {
  user?: HeaderUserProps | null;
  member?: HeaderMemberProps | null;
  streak?: number;
  isAdmin?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

const ADMIN_EMAIL = 'alwisachalaanurada@gmail.com';

export function Header({
  user,
  member,
  streak = 0,
  isAdmin: propIsAdmin,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isUserAdmin =
    propIsAdmin ||
    user?.email === ADMIN_EMAIL ||
    member?.role === 'admin';

  const effectiveStreak = streak || member?.streakCount || 0;

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: !!user,
    },
    {
      href: '/daily',
      label: 'Daily Log',
      icon: ClipboardPen,
      show: !!user,
    },
    {
      href: '/id-card',
      label: 'ID Card',
      icon: CreditCard,
      show: !!user,
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: Shield,
      show: isUserAdmin,
      adminOnly: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 1. Brand Logo */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="group flex items-center gap-3 focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-indigo-300">
                StudySync
              </span>
              <span className="rounded border border-indigo-500/30 bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                A/L
              </span>
            </div>
            <p className="hidden text-[11px] text-zinc-400 sm:block">
              Sri Lanka A/L Study Accountability
            </p>
          </div>
        </Link>

        {/* 2. Desktop Navigation Menu */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
            {navLinks
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? item.adminOnly
                          ? 'border border-amber-500/30 bg-amber-500/15 text-amber-200 shadow-sm'
                          : 'border border-indigo-500/30 bg-indigo-500/15 text-white shadow-sm'
                        : item.adminOnly
                        ? 'text-amber-300/80 hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-200'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive
                          ? item.adminOnly
                            ? 'text-amber-300'
                            : 'text-indigo-400'
                          : item.adminOnly
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        )}

        {/* 3. Right Header Actions */}
        <div className="flex items-center gap-3">
          
          {/* Active Streak Pill */}
          {user && effectiveStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 shadow-inner">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{effectiveStreak}</span>
              <span className="text-[10px] font-normal text-amber-400/80">days</span>
            </div>
          )}

          {/* User Profile & Auth Controls */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user.displayName || member?.fullName || 'Student'}
                </span>
                <span className="font-mono text-[10px] text-cyan-400 leading-none">
                  {member?.studyId || 'Member'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="h-8 w-8 rounded-lg border border-zinc-800 bg-zinc-900/60 p-0 text-zinc-400 hover:border-rose-500/30 hover:bg-rose-500/15 hover:text-rose-300"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={onSignIn}
              size="sm"
              className="apple-btn-secondary h-9 px-4 text-xs font-medium"
            >
              <LogIn className="h-4 w-4 text-indigo-400" />
              <span>Sign In</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 rounded-lg p-0 text-zinc-400 hover:text-white md:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* 4. Mobile Dropdown Menu */}
      {mobileMenuOpen && user && (
        <div className="border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1">
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
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? item.adminOnly
                          ? 'border border-amber-500/30 bg-amber-500/15 text-amber-200'
                          : 'border border-indigo-500/30 bg-indigo-500/15 text-white'
                        : item.adminOnly
                        ? 'text-amber-300/80 hover:bg-amber-500/10'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            <div className="mt-2 border-t border-zinc-800/60 pt-2">
              <div className="flex items-center justify-between px-3 py-1 text-xs">
                <span className="text-zinc-400">Signed in as:</span>
                <span className="font-semibold text-white">
                  {user.displayName || member?.fullName || user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
```

---

### 5.3 `src/components/layout/Footer.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cloud, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-zinc-800/80 bg-zinc-950/60 py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-400 sm:px-6 md:flex-row lg:px-8">
        
        {/* Brand & Description */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-center md:justify-start md:text-left">
          <span className="font-semibold text-zinc-200">StudySync Sri Lanka</span>
          <span className="text-zinc-600">•</span>
          <span>G.C.E. A/L Study Accountability & Analytics System</span>
        </div>

        {/* Action Links & Active Cloud Sync Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/verify"
            className="flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-indigo-400"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Verify Member ID</span>
          </Link>

          <span className="hidden text-zinc-700 sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400">Cloud Sync Active</span>
          </div>

          <span className="hidden text-zinc-700 sm:inline">|</span>

          <div className="flex items-center gap-1 text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>2026 Batch</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
```

---

## 6. Implementation Notes for Worker Agents

1. **shadcn/ui compatibility**:
   - `globals.css` uses HSL variable format (`--background: 228 33% 4.1%`) matching shadcn/ui conventions.
   - `tailwind.config.ts` configures standard shadcn color variables, font families, and `tailwindcss-animate`.
2. **Zero Layout Shifts (CLS = 0)**:
   - AuroraBackground is fixed with `pointer-events-none`, `inset-0`, and GPU-accelerated transforms.
   - Header is fixed/sticky at `h-16` (64px) with fixed height to eliminate page jump.
3. **Typography**:
   - Web fonts are imported directly at the top of `globals.css` with fallbacks in `tailwind.config.ts`.
4. **Static Export Alignment**:
   - All layout components use standard Next.js client component patterns compatible with `output: 'export'`.
